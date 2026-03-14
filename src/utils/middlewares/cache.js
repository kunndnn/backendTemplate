import { redisClient } from "../../config/redis.js";

/**
 * Express middleware to cache responses in Redis
 * @param {number} duration - seconds to cache the response (default: 60)
 */
export const cacheMiddleware = (duration = 60) => {
  return async (req, res, next) => {
    // Generate a unique key based on the request URL and query string
    const key = `__express__${req.originalUrl || req.url}`;
    
    try {
      // Check if Redis has this key
      const cachedResponse = await redisClient.get(key);
      
      if (cachedResponse) {
        // Cache hit: parse the JSON and return it
        return res.json(JSON.parse(cachedResponse));
      }
      
      // Cache miss: We need to capture the response before it goes out
      // We override the res.json method temporarily
      const originalSend = res.json.bind(res);
      
      res.json = (body) => {
        // Asynchronously save the response in Redis with an expiration
        redisClient.setEx(key, duration, JSON.stringify(body))
          .catch(err => console.error("Redis setEx error:", err));
        
        // Call the original res.json to send the output to the client
        originalSend(body);
      };
      
      next();
    } catch (error) {
      console.warn("Cache Middleware Error:", error);
      // If there's an error with Redis, we gracefully fallback to normal processing
      next();
    }
  };
};
