const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  variant: { name: String, value: String },
  price: Number, // snapshot at time of add
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    sessionId: { type: String },   // for guest carts
    items: [cartItemSchema],
    coupon: {
      code: String,
      discountType: { type: String, enum: ["percent", "fixed"] },
      discountValue: Number,
    },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

module.exports = mongoose.model("Cart", cartSchema);
