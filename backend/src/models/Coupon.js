const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    discountType: { type: String, enum: ["percent", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date, default: Date.now },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function (orderAmount, userId) {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: "Coupon is inactive" };
  if (now < this.validFrom || now > this.validTo) return { valid: false, message: "Coupon expired" };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: "Coupon usage limit reached" };
  if (orderAmount < this.minOrderAmount) return { valid: false, message: `Minimum order ₹${this.minOrderAmount} required` };
  if (userId && this.usedBy.includes(userId)) return { valid: false, message: "You have already used this coupon" };
  return { valid: true };
};

module.exports = mongoose.model("Coupon", couponSchema);
