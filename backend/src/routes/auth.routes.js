const express = require("express");
const router = express.Router();
const { register, login, refreshToken, logout, verifyEmail, forgotPassword, resetPassword, getMe } = require("../controllers/auth.controller");
const { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } = require("../validators/auth.validator");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/rateLimit.middleware");

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logout);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", authLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post("/reset-password/:token", resetPasswordValidator, validate, resetPassword);
router.get("/me", protect, getMe);

module.exports = router;
