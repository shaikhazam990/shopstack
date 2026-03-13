require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app"); // ✅ Fixed: was "./src/app"

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("join:user", (userId) => socket.join(`user:${userId}`));
  socket.on("join:order", (orderId) => socket.join(`order:${orderId}`));

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

app.locals.emitOrderUpdate = (io, orderId, userId, data) => {
  io.to(`order:${orderId}`).emit("order:update", data);
  io.to(`user:${userId}`).emit("order:update", data);
};

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await app.initializeConnections();
    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
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