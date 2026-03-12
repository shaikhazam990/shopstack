const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { cache } = require("../config/cache");

// GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const cacheKey = "dashboard:stats";
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders, monthOrders, lastMonthOrders,
      totalRevenue, monthRevenue, lastMonthRevenue,
      totalUsers, activeOrders,
      recentOrders, topProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Order.aggregate([{ $match: { "payment.status": "paid" } }, { $group: { _id: null, total: { $sum: "$pricing.total" } } }]),
      Order.aggregate([{ $match: { "payment.status": "paid", createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$pricing.total" } } }]),
      Order.aggregate([{ $match: { "payment.status": "paid", createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: "$pricing.total" } } }]),
      User.countDocuments({ role: "user" }),
      Order.countDocuments({ status: { $in: ["confirmed", "processing", "shipped"] } }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email"),
      Product.find({ isActive: true }).sort({ soldCount: -1 }).limit(5).select("name soldCount price images"),
    ]);

    const prevMonthOrders = lastMonthOrders || 1;
    const prevMonthRevenue = lastMonthRevenue[0]?.total || 1;

    const response = {
      success: true,
      data: {
        overview: {
          totalOrders: { value: totalOrders, change: (((monthOrders - prevMonthOrders) / prevMonthOrders) * 100).toFixed(1) },
          revenue: { value: totalRevenue[0]?.total || 0, change: (((monthRevenue[0]?.total - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1) },
          totalUsers,
          activeOrders,
          avgDelivery: "2.4", // Could be calculated from tracking
        },
        recentOrders,
        topProducts,
      },
    };

    await cache.set(cacheKey, response, 300);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/analytics/revenue - for charts
const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { period = "7d" } = req.query;
    const days = period === "30d" ? 30 : period === "90d" ? 90 : 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const data = await Order.aggregate([
      { $match: { "payment.status": "paid", createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$pricing.total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getRevenueAnalytics };
