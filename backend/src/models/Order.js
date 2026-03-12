const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: { name: String, value: String },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],

    shippingAddress: {
      fullName: String,
      email: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },

    pricing: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },

    coupon: {
      code: String,
      discount: Number,
    },

    payment: {
      method: { type: String, enum: ["stripe", "paypal", "cod"], default: "stripe" },
      status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
      stripePaymentIntentId: String,
      stripeChargeId: String,
      paidAt: Date,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },

    tracking: {
      carrier: String,
      trackingNumber: String,
      estimatedDelivery: Date,
      updates: [
        {
          status: String,
          message: String,
          location: String,
          timestamp: { type: Date, default: Date.now },
        },
      ],
    },

    notes: String,
    cancelReason: String,
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `LUM-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);
