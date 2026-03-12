const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sendOrderConfirmationEmail } = require("../services/mail.service");
const { cache } = require("../config/cache");

// POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, payment } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || !cart.items.length) return res.status(400).json({ success: false, message: "Cart is empty" });

    // Validate stock
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.product.name}` });
      }
    }

    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal >= 500 ? 0 : 49;
    const tax = Math.round(subtotal * 0.18);
    const total = Math.round(subtotal + shipping + tax);

    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map((i) => ({
        product: i.product._id,
        name: i.product.name,
        image: i.product.images?.[0]?.url,
        price: i.price,
        quantity: i.quantity,
        variant: i.variant,
      })),
      shippingAddress: { ...shippingAddress, email: req.user.email },
      pricing: { subtotal, shipping, tax, total },
      payment: { method: payment.method },
    });

    // Deduct stock
    await Promise.all(
      cart.items.map((item) =>
        Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity, soldCount: item.quantity } })
      )
    );

    // Clear cart
    await Cart.findByIdAndDelete(cart._id);

    await sendOrderConfirmationEmail(req.user, order);

    // Invalidate admin dashboard cache
    await cache.delPattern("dashboard:*");

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders/payment-intent — Stripe
const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = "usd", orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // to cents
      currency,
      metadata: { orderId: orderId?.toString(), userId: req.user._id.toString() },
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders/webhook — Stripe webhook
const stripeWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).json({ message: "Webhook signature verification failed" });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    await Order.findByIdAndUpdate(pi.metadata.orderId, {
      "payment.status": "paid",
      "payment.stripePaymentIntentId": pi.id,
      "payment.paidAt": new Date(),
      status: "confirmed",
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;
    await Order.findByIdAndUpdate(pi.metadata.orderId, { "payment.status": "failed" });
  }

  res.json({ received: true });
};

// GET /api/orders — user's orders
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.json({ success: true, data: { orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({ success: false, message: "Order cannot be cancelled at this stage" });
    }

    order.status = "cancelled";
    order.cancelReason = req.body.reason || "Cancelled by user";
    await order.save();

    // Restore stock
    await Promise.all(
      order.items.map((item) =>
        Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, soldCount: -item.quantity } })
      )
    );

    res.json({ success: true, message: "Order cancelled", data: order });
  } catch (error) {
    next(error);
  }
};

// --- ADMIN ---

// GET /api/admin/orders
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter).populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, data: { orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, carrier } = req.body;
    const update = { status };
    if (trackingNumber) update["tracking.trackingNumber"] = trackingNumber;
    if (carrier) update["tracking.carrier"] = carrier;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, createPaymentIntent, stripeWebhook, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus };
