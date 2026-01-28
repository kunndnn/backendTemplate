import rateLimit from "express-rate-limit";

const limiter = ({ time = 15, limit = 100 } = {}) =>
  rateLimit({
    windowMs: time * 60 * 1000, // 15 minutes
    max: limit, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

export default limiter;
