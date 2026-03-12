require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
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
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Attach io to app so controllers can use it
app.set("io", io);

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

// ─── Socket.io ───────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Join user-specific room for order updates
  socket.on("join:user", (userId) => {
    socket.join(`user:${userId}`);
  });

  // Join order tracking room
  socket.on("join:order", (orderId) => {
    socket.join(`order:${orderId}`);
  });

  // AI Assistant chat (streaming over socket)
  socket.on("assistant:message", async ({ productId, messages }) => {
    try {
      const Product = require("./models/Product");
      const { askProductAssistantStream } = require("./services/ai.service");
      const product = await Product.findById(productId).populate("category", "name");
      if (!product) return socket.emit("assistant:error", "Product not found");

      socket.emit("assistant:start");
      await askProductAssistantStream(product, messages, (chunk) => {
        socket.emit("assistant:chunk", { chunk });
      });
      socket.emit("assistant:done");
    } catch (err) {
      socket.emit("assistant:error", err.message);
    }
  });

  // Real-time inventory check
  socket.on("product:checkStock", async ({ productId }) => {
    try {
      const Product = require("./models/Product");
      const product = await Product.findById(productId).select("stock");
      socket.emit("product:stockUpdate", { productId, stock: product?.stock ?? 0 });
    } catch {}
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Helper to emit order updates from controllers
app.locals.emitOrderUpdate = (io, orderId, userId, data) => {
  io.to(`order:${orderId}`).emit("order:update", data);
  io.to(`user:${userId}`).emit("order:update", data);
};

// ─── Error Handling ───────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  connectRedis();
  server.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    console.log(`📡 Socket.io ready`);
  });
};

start();

module.exports = { app, io };
