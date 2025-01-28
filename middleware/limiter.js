import rateLimiter from "../utils/limiter_config.js";
export const rateLimiting = async (req, res, next) => {
  try {
    const { email} = req.user; // Ensure uid is extracted from authenticated user details
    await rateLimiter.consume(email); // Attempt to consume a point for the given UID
    next(); // Proceed to the next middleware or route if within the rate limit
  } catch (err) {
    // Handle rate limit exceeded
    if (err.msBeforeNext) {
      // Customize response for rate limiting
      return res.status(429).json({
        message: "Too many requests, please try again later.",
        retryAfter: Math.ceil(err.msBeforeNext / 1000), // Suggest retry time in seconds
      });
    }
    // Forward other unexpected errors
    next(err);
  }
};