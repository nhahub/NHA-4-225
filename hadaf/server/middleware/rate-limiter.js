const rateLimitMap = new Map();

// Cleanup memory interval: run every minute to purge expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000).unref(); // unref so it doesn't keep the process alive in tests/scripts

/**
 * Express middleware for rate limiting (100 req/min per user ID or IP address)
 */
module.exports = (req, res, next) => {
  const limit = 100;
  const windowMs = 60 * 1000; // 1 minute
  const now = Date.now();

  // Identify client by user ID (if authenticated) or IP address
  const clientKey = req.user ? req.user._id.toString() : req.ip;

  let record = rateLimitMap.get(clientKey);

  if (!record) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(clientKey, record);
    return next();
  }

  // If window expired, reset the counter
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return next();
  }

  // Increment requests
  record.count += 1;

  if (record.count > limit) {
    return res.status(429).json({
      success: false,
      errorCode: "RATE_LIMIT",
      error: "errors.rateLimitExceeded",
    });
  }

  next();
};
