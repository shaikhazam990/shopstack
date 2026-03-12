const express = require("express");
const router = express.Router();
const { getDashboardStats, getRevenueAnalytics } = require("../controllers/admin.controller");
const { getAllOrders, updateOrderStatus } = require("../controllers/order.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.use(protect, adminOnly);

router.get("/dashboard", getDashboardStats);
router.get("/analytics/revenue", getRevenueAnalytics);
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

module.exports = router;
