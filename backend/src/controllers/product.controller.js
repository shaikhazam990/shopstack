const Product = require("../models/Product");
const Category = require("../models/Category"); // ✅ Fix 1: Category import
const { cache } = require("../config/cache");
const { uploadToCloudinary } = require("../middlewares/upload.middleware");
const { generateEmbedding, cosineSimilarity, generateProductDescription, askProductAssistant, askProductAssistantStream } = require("../services/ai.service");

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, search, sort = "newest", minPrice, maxPrice, badge, featured } = req.query;

    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const filter = { isActive: true };

    // ✅ Fix 2: category string → ObjectId via slug or name lookup
    if (category) {
      const cat = await Category.findOne({
        $or: [
          { slug: category.toLowerCase() },
          { name: new RegExp(`^${category}$`, "i") },
        ],
      });
      if (cat) filter.category = cat._id;
      else filter.category = new mongoose.Types.ObjectId(); // no match → empty results
    }

    if (badge) filter.badge = badge;
    if (featured) filter.isFeatured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // ✅ Fix 3: regex search instead of $text (no index needed)
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { tags: new RegExp(search, "i") },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { "ratings.average": -1 },
      popular: { soldCount: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(Number(limit))
        .select("-embedding -reviews"),
      Product.countDocuments(filter),
    ]);

    const response = {
      success: true,
      data: { products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    };

    await cache.set(cacheKey, response, 300);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:slug
const getProduct = async (req, res, next) => {
  try {
    const cacheKey = `product:${req.params.slug}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate("category", "name slug")
      .populate("crossSells", "name price images ratings slug")
      .populate("relatedProducts", "name price images ratings slug")
      .populate("reviews.user", "name avatar");

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } }).exec();

    const response = { success: true, data: product };
    await cache.set(cacheKey, response, 600);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// POST /api/products (admin)
const createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };

    if (req.files?.length) {
      data.images = await Promise.all(
        req.files.map(async (file, i) => {
          const result = await uploadToCloudinary(file.buffer, "luminary/products");
          return { url: result.secure_url, alt: data.name, isPrimary: i === 0 };
        })
      );
    }

    if (!data.description && data.name) {
      data.description = await generateProductDescription(data);
    }

    const product = await Product.create(data);

    const embeddingText = `${product.name} ${product.description} ${product.tags?.join(" ")}`;
    const embedding = await generateEmbedding(embeddingText);
    await Product.findByIdAndUpdate(product._id, { embedding });

    await cache.delPattern("products:*");
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id (admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    await cache.delPattern("products:*");
    await cache.del(`product:${product.slug}`);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id (admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    await cache.delPattern("products:*");
    await cache.del(`product:${product.slug}`);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

// POST /api/products/:id/reviews
const addReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ success: false, message: "You already reviewed this product" });

    product.reviews.push({ user: req.user._id, name: req.user.name, avatar: req.user.avatar, ...req.body });
    product.updateRating?.();
    await product.save();

    await cache.del(`product:${product.slug}`);
    res.status(201).json({ success: true, message: "Review added", ratings: product.ratings });
  } catch (error) {
    next(error);
  }
};

// POST /api/products/:id/ask
const askAssistant = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const { question, messages } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await askProductAssistantStream(product, messages || [{ role: "user", content: question }], (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id/recommendations
const getRecommendations = async (req, res, next) => {
  try {
    const cacheKey = `recommendations:${req.params.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const product = await Product.findById(req.params.id).select("embedding name category");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (!product?.embedding?.length) {
      const fallback = await Product.find({ category: product.category, _id: { $ne: product._id }, isActive: true })
        .limit(4)
        .select("name price images ratings slug");
      return res.json({ success: true, data: fallback });
    }

    const allProducts = await Product.find({ _id: { $ne: product._id }, isActive: true })
      .select("name price images ratings slug embedding");

    const scored = allProducts
      .filter((p) => p.embedding?.length)
      .map((p) => ({ ...p.toObject(), score: cosineSimilarity(product.embedding, p.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ embedding, score, ...rest }) => rest);

    const response = { success: true, data: scored };
    await cache.set(cacheKey, response, 1800);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, askAssistant, getRecommendations };