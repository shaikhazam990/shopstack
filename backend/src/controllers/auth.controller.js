const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/mail.service");

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "15m" });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" });
  return { accessToken, refreshToken };
};

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ success: false, message: "Email already registered" });

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({ name, email, password, emailVerifyToken: verifyToken });

    await sendVerificationEmail(user, verifyToken);

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: "Registered successfully. Please verify your email.",
      accessToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: "Account deactivated" });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    res.json({ success: true, accessToken, user });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, newRefreshToken);
    res.json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/verify-email/:token
const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ emailVerifyToken: req.params.token });
    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" });

    user.isVerified = true;
    user.emailVerifyToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ success: true, message: "If that email exists, a reset link was sent" });

    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user, token);
    res.json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, refreshToken, logout, verifyEmail, forgotPassword, resetPassword, getMe };
