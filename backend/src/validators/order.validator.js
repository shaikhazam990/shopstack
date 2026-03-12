const { body } = require("express-validator");

const createOrderValidator = [
  body("items").isArray({ min: 1 }).withMessage("Order must have at least one item"),
  body("items.*.product").isMongoId().withMessage("Valid product ID required"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("shippingAddress.fullName").trim().notEmpty().withMessage("Full name is required"),
  body("shippingAddress.email").isEmail().withMessage("Valid email is required"),
  body("shippingAddress.line1").trim().notEmpty().withMessage("Address is required"),
  body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
  body("shippingAddress.zip").trim().notEmpty().withMessage("ZIP code is required"),
  body("payment.method").isIn(["stripe", "paypal", "cod"]).withMessage("Invalid payment method"),
];

module.exports = { createOrderValidator };
