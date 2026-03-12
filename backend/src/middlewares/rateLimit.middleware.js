const { getRedis } = require("../config/cache");

// Simple Redis-based rate limiter
const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 100, message = "Too many requests" } = {}) => {
  return async (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const key = `rl:${req.path}:${ip}`;
      const redis = getRedis();

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }

      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, max - current));

      if (current > max) {
        return res.status(429).json({ success: false, message });
      }
      next();
    } catch {
      next(); // Don't block if Redis is down
    }
  };
};

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many auth attempts, try again in 15 minutes" });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

module.exports = { rateLimit, authLimiter, apiLimiter };
