require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const connectDB = require("./config/database");
const { connectRedis } = require("./config/cache");
const { errorHandler, notFound } = require("./middlewares/error.middleware");

// Routes
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// ─── Middleware ───────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// Stripe webhook needs raw body — must be before express.json()
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", env: process.env.NODE_ENV }));

// ─── Error Handling ───────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Initialize Database & Cache ─────────────────────
app.initializeConnections = async () => {
  try {
    await connectDB();
    await connectRedis();
    console.log("✅ All connections initialized");
  } catch (error) {
    console.error("❌ Failed to initialize connections:", error.message);
    throw error;
  }
};

module.exports = app;