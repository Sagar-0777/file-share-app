import rateLimit from "express-rate-limit";

// Limits upload requests to prevent spam or abuse
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,              // Allow only 5 uploads per minute
  message: {
    success: false,
    message: "Too many upload attempts. Try again after 1 minute.",
  },
});
