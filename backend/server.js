require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");

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
      const Product = require("./src/models/Product");
      const { askProductAssistantStream } = require("./src/services/ai.service");
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
      const Product = require("./src/models/Product");
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

// ─── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    // Initialize database and cache connections
    await app.initializeConnections();

    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
      console.log(`📡 Socket.io ready`);
      console.log(`🌍 Client URL: ${process.env.CLIENT_URL}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

start();

module.exports = { app, io };