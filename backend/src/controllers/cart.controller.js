const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const { getUpsellSuggestions } = require("../services/ai.service");
const { cache } = require("../config/cache");

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 49;
const TAX_RATE = 0.18;

const calcPricing = (items, coupon = null, shippingOverride = null) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let discount = 0;
  if (coupon) {
    discount = coupon.discountType === "percent"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  }

  const shipping = shippingOverride ?? (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST);
  const taxable = subtotal - discount;
  const tax = Math.round(taxable * TAX_RATE);
  const total = Math.round(taxable + shipping + tax);

  return { subtotal, discount, shipping, tax, total, freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal) };
};

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "name price images stock isActive");

    if (!cart) return res.json({ success: true, data: { items: [], pricing: calcPricing([]) } });

    // Remove deleted/inactive products
    cart.items = cart.items.filter((i) => i.product?.isActive);
    await cart.save();

    // AI upsells
    const upsells = await getCartUpsells(cart.items);

    res.json({ success: true, data: { ...cart.toObject(), pricing: calcPricing(cart.items), upsells } });
  } catch (error) {
    next(error);
  }
};

const getCartUpsells = async (cartItems) => {
  try {
    const cacheKey = `upsells:${cartItems.map((i) => i.product._id).join(",")}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const cartProductNames = cartItems.map((i) => ({ name: i.product.name }));
    const allProducts = await Product.find({ isActive: true, _id: { $nin: cartItems.map((i) => i.product._id) } })
      .limit(20)
      .select("_id name price images ratings");

    const suggestedIds = await getUpsellSuggestions(cartProductNames, allProducts);
    const upsells = allProducts.filter((p) => suggestedIds.includes(p._id.toString())).slice(0, 3);

    await cache.set(cacheKey, upsells, 600);
    return upsells;
  } catch {
    return [];
  }
};

// POST /api/cart
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ success: false, message: "Product not found" });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: "Insufficient stock" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingIdx = cart.items.findIndex(
      (i) => i.product.toString() === productId && i.variant?.value === variant?.value
    );

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, variant, price: product.price });
    }

    await cart.save();
    await cart.populate("items.product", "name price images stock");

    res.json({ success: true, message: "Added to cart", data: { ...cart.toObject(), pricing: calcPricing(cart.items) } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/:itemId
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate("items.product", "name price images stock");

    res.json({ success: true, data: { ...cart.toObject(), pricing: calcPricing(cart.items) } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/:itemId
const removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
    await cart.save();
    await cart.populate("items.product", "name price images stock");

    res.json({ success: true, data: { ...cart.toObject(), pricing: calcPricing(cart.items) } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart
const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/coupon
const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "name price");
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon code" });

    const pricing = calcPricing(cart.items);
    const { valid, message } = coupon.isValid(pricing.subtotal, req.user._id);
    if (!valid) return res.status(400).json({ success: false, message });

    cart.coupon = { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue };
    await cart.save();

    res.json({ success: true, message: "Coupon applied!", data: { ...cart.toObject(), pricing: calcPricing(cart.items, coupon) } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart, applyCoupon };
