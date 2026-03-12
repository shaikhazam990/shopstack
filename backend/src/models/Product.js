const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    avatar: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const variantSchema = new mongoose.Schema({
  name: String,        // e.g. "Color", "Size"
  value: String,       // e.g. "Midnight Silver", "44mm"
  stock: { type: Number, default: 0 },
  priceModifier: { type: Number, default: 0 },
  sku: String,
});

const specSchema = new mongoose.Schema({
  label: String,       // e.g. "Resolution"
  value: String,       // e.g. "6K Retina"
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: String,

    price: { type: Number, required: true },
    comparePrice: { type: Number },          // original price for discount display
    costPrice: { type: Number },             // admin only

    images: [{ url: String, alt: String, isPrimary: { type: Boolean, default: false } }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [String],
    brand: String,

    variants: [variantSchema],
    specs: [specSchema],

    stock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },

    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    reviews: [reviewSchema],

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    badge: { type: String, enum: ["", "NEW ARRIVAL", "TRENDING", "BEST SELLER", "SALE"], default: "" },

    // For AI recommendations
    embedding: { type: [Number], select: false },

    viewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },

    // "Complete the look" cross-sells
    crossSells: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  next();
});

// Recalculate rating average when reviews change
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.ratings = { average: 0, count: 0 };
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.ratings = {
      average: Math.round((sum / this.reviews.length) * 10) / 10,
      count: this.reviews.length,
    };
  }
};

productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ "ratings.average": -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
