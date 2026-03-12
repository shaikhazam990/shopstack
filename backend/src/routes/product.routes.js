const express = require("express");
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, askAssistant, getRecommendations } = require("../controllers/product.controller");
const { createProductValidator, updateProductValidator, reviewValidator, productQueryValidator } = require("../validators/product.validator");
const validate = require("../middlewares/validate.middleware");
const { protect, adminOnly, optionalAuth } = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/upload.middleware");

router.get("/", productQueryValidator, validate, getProducts);
router.get("/:slug", optionalAuth, getProduct);
router.get("/:id/recommendations", getRecommendations);
router.post("/:id/ask", askAssistant);
router.post("/:id/reviews", protect, reviewValidator, validate, addReview);

// Admin routes
router.post("/", protect, adminOnly, upload.array("images", 6), createProductValidator, validate, createProduct);
router.put("/:id", protect, adminOnly, updateProductValidator, validate, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
