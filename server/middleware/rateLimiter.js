const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../services/redis');

// General API rate limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
});

// Stricter limit for AI endpoints
exports.aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
});

// Very strict limit for authentication
exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 failed attempts per hour
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
});