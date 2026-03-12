const express = require("express");
const router = express.Router();
const { createOrder, createPaymentIntent, stripeWebhook, getMyOrders, getOrder, cancelOrder } = require("../controllers/order.controller");
const { createOrderValidator } = require("../validators/order.validator");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");

// Stripe webhook needs raw body — registered before protect
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

router.use(protect);
router.post("/payment-intent", createPaymentIntent);
router.post("/", createOrderValidator, validate, createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrder);
router.put("/:id/cancel", cancelOrder);

module.exports = router;
