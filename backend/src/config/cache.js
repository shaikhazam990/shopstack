const Redis = require("ioredis");

let redis;

const connectRedis = () => {
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
  });

  redis.on("connect", () => console.log("✅ Redis connected"));
  redis.on("error", (err) => console.error("❌ Redis error:", err.message));
  redis.on("close", () => console.warn("⚠️  Redis disconnected"));

  return redis;
};

const getRedis = () => {
  if (!redis) throw new Error("Redis not initialized. Call connectRedis() first.");
  return redis;
};

// Helper wrappers
const cache = {
  get: async (key) => {
    const data = await getRedis().get(key);
    return data ? JSON.parse(data) : null;
  },
  set: async (key, value, ttlSeconds = 3600) => {
    await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
  },
  del: async (...keys) => {
    await getRedis().del(...keys);
  },
  delPattern: async (pattern) => {
    const keys = await getRedis().keys(pattern);
    if (keys.length) await getRedis().del(...keys);
  },
};

module.exports = { connectRedis, getRedis, cache };
