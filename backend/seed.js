/**
 * Luminary Seed Script — v2
 * Fetches ALL products from DummyJSON (500+) across every category
 * Run: npm run seed
 */

require("dotenv").config();
const mongoose = require("mongoose");

// ─── Inline Models ─────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema(
  { name: String, slug: String, image: String, productCount: { type: Number, default: 0 } },
  { timestamps: true }
);
const Category = mongoose.model("Category", categorySchema);

const productSchema = new mongoose.Schema({
  name: String, slug: String, description: String, shortDescription: String,
  price: Number, comparePrice: Number,
  images: [{ url: String, alt: String, isPrimary: Boolean }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  stock: Number, badge: String, brand: String,
  ratings: { average: Number, count: Number },
  specs: [{ label: String, value: String }],
  tags: [String], isActive: Boolean, soldCount: Number, isFeatured: Boolean,
  viewCount: { type: Number, default: 0 },
}, { timestamps: true });
const Product = mongoose.model("Product", productSchema);

// ─── Helpers ───────────────────────────────────────────────────────────────
const slugify = (str, suffix = "") =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
  (suffix ? `-${suffix}` : "");

const BADGES = ["NEW ARRIVAL", "TRENDING", "BEST SELLER", "SALE", "", "", "", "", "", ""];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// DummyJSON category slug → display name mapping
const CAT_DISPLAY = {
  "smartphones":          "Smartphones",
  "laptops":              "Laptops",
  "fragrances":           "Fragrances",
  "skincare":             "Skincare",
  "groceries":            "Groceries",
  "home-decoration":      "Home Decoration",
  "furniture":            "Furniture",
  "tops":                 "Tops",
  "womens-dresses":       "Women's Dresses",
  "womens-shoes":         "Women's Shoes",
  "mens-shirts":          "Men's Shirts",
  "mens-shoes":           "Men's Shoes",
  "mens-watches":         "Men's Watches",
  "womens-watches":       "Women's Watches",
  "womens-bags":          "Women's Bags",
  "womens-jewellery":     "Women's Jewellery",
  "sunglasses":           "Sunglasses",
  "automotive":           "Automotive",
  "motorcycle":           "Motorcycle",
  "lighting":             "Lighting",
  "kitchen-accessories":  "Kitchen",
  "sports-accessories":   "Sports",
  "vehicle":              "Vehicles",
  "tablets":              "Tablets",
};

// ─── Main ──────────────────────────────────────────────────────────────────
async function seed() {
  console.log("\n🌱  Luminary Seed — starting...\n");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅  MongoDB connected");

  // 1. Clear old data
  await Product.deleteMany({});
  await Category.deleteMany({});
  console.log("🗑️   Cleared existing products & categories\n");

  // 2. Fetch all DummyJSON categories
  const catRes  = await fetch("https://dummyjson.com/products/categories");
  const rawCats = await catRes.json();

  // rawCats is array of { slug, name, url } in newer API versions
  // normalise to array of slugs
  const catSlugs = rawCats.map(c => (typeof c === "string" ? c : c.slug));
  console.log(`📂  Found ${catSlugs.length} categories on DummyJSON`);

  // 3. Insert categories into DB
  const catInsert = catSlugs.map(slug => ({
    slug,
    name: CAT_DISPLAY[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    image: `https://dummyjson.com/icon/${slug}/100`,
  }));
  const catDocs = await Category.insertMany(catInsert);

  // Build slug → ObjectId map
  const catMap = {};
  catDocs.forEach(c => { catMap[c.slug] = c._id; });
  console.log(`✅  Created ${catDocs.length} categories\n`);

  // 4. Fetch ALL products — DummyJSON max limit is 0 (returns all) with limit=0
  //    But to be safe, page through with limit=100
  let allProducts = [];
  let skip = 0;
  const LIMIT = 100;

  console.log("📦  Fetching products from DummyJSON...");
  while (true) {
    const res  = await fetch(`https://dummyjson.com/products?limit=${LIMIT}&skip=${skip}&select=id,title,description,price,discountPercentage,rating,stock,brand,category,images,thumbnail,tags,sku,weight,warrantyInformation,shippingInformation,returnPolicy`);
    const json = await res.json();
    const batch = json.products || [];
    allProducts = allProducts.concat(batch);
    console.log(`   fetched ${allProducts.length} / ${json.total}`);
    if (allProducts.length >= json.total || batch.length === 0) break;
    skip += LIMIT;
  }
  console.log(`\n✅  Total fetched: ${allProducts.length} products\n`);

  // 5. Map → DB shape
  const slugSeen = new Set();
  const seeded = allProducts.map((p, i) => {
    // unique slug
    let slug = slugify(p.title, p.id);
    if (slugSeen.has(slug)) slug = slug + "-" + i;
    slugSeen.add(slug);

    // category
    const catSlug = (p.category || "").toLowerCase().replace(/\s+/g, "-");
    const catId   = catMap[catSlug] || catDocs[i % catDocs.length]._id;

    // compare price (original before discount)
    const comparePrice = p.discountPercentage > 0
      ? Math.round(p.price * (100 / (100 - p.discountPercentage)))
      : null;

    // images — thumbnail first (isPrimary), then rest
    const imgs = [p.thumbnail, ...(p.images || []).filter(u => u !== p.thumbnail)]
      .filter(Boolean)
      .map((url, idx) => ({ url, alt: p.title, isPrimary: idx === 0 }));

    // specs
    const specs = [
      p.brand             && { label: "Brand",    value: p.brand },
      p.sku               && { label: "SKU",       value: p.sku },
      p.weight            && { label: "Weight",    value: `${p.weight}g` },
      p.warrantyInformation && { label: "Warranty", value: p.warrantyInformation },
      p.shippingInformation && { label: "Shipping", value: p.shippingInformation },
      p.returnPolicy      && { label: "Return",    value: p.returnPolicy },
    ].filter(Boolean);

    return {
      name:             p.title,
      slug,
      description:      p.description,
      shortDescription: p.description?.slice(0, 120),
      price:            parseFloat((p.price * 85).toFixed(0)),       // USD → INR approx
      comparePrice:     comparePrice ? parseFloat((comparePrice * 85).toFixed(0)) : null,
      images:           imgs,
      category:         catId,
      stock:            p.stock ?? rand(10, 200),
      brand:            p.brand || "Luminary",
      badge:            BADGES[i % BADGES.length],
      ratings: {
        average: parseFloat((p.rating || 4.0).toFixed(1)),
        count:   rand(20, 800),
      },
      specs,
      tags:       Array.isArray(p.tags) ? p.tags : [],
      isActive:   true,
      isFeatured: i % 15 === 0,                                      // every 15th = featured
      soldCount:  rand(50, 5000),
      viewCount:  rand(100, 10000),
    };
  });

  // 6. Bulk insert products
  await Product.insertMany(seeded, { ordered: false });
  console.log(`✅  Seeded ${seeded.length} products!\n`);

  // 7. Update category product counts
  for (const cat of catDocs) {
    const count = await Product.countDocuments({ category: cat._id });
    await Category.findByIdAndUpdate(cat._id, { productCount: count });
  }
  console.log("✅  Updated category product counts\n");

  // 8. Summary
  console.log("─".repeat(50));
  console.log("🎉  Seed complete!\n");
  console.log("📊  Summary:");
  for (const cat of catDocs) {
    const count = seeded.filter(p => p.category.toString() === cat._id.toString()).length;
    if (count > 0) console.log(`   ${cat.name.padEnd(24)} → ${count} products`);
  }
  console.log("─".repeat(50));
  console.log("\n🚀  Start your server: npm run dev\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error("\n❌  Seed failed:", err.message);
  console.error(err.stack);
  process.exit(1);
});