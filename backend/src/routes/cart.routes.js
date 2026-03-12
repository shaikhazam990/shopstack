const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart, applyCoupon } = require("../controllers/cart.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:itemId", updateCartItem);
router.delete("/:itemId", removeCartItem);
router.delete("/", clearCart);
router.post("/coupon", applyCoupon);

module.exports = router;
