const { body, query } = require("express-validator");

const createProductValidator = [
  body("name").trim().notEmpty().withMessage("Product name is required").isLength({ max: 200 }),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("category").isMongoId().withMessage("Valid category ID is required"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("comparePrice").optional().isFloat({ min: 0 }).withMessage("Compare price must be a positive number"),
];

const updateProductValidator = [
  body("name").optional().trim().notEmpty().isLength({ max: 200 }),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("stock").optional().isInt({ min: 0 }),
];

const reviewValidator = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").trim().notEmpty().withMessage("Review comment is required").isLength({ min: 10, max: 500 }),
];

const productQueryValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
  query("sort").optional().isIn(["newest", "price_asc", "price_desc", "rating", "popular"]),
];

module.exports = { createProductValidator, updateProductValidator, reviewValidator, productQueryValidator };
