const { body } = require("express-validator");

const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters").matches(/\d/).withMessage("Password must contain a number"),
];

const loginValidator = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidator = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
];

const resetPasswordValidator = [
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters").matches(/\d/).withMessage("Password must contain a number"),
];

module.exports = { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator };
