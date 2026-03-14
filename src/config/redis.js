import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("connect", () => console.warn("Redis connected successfully!"));

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.warn("Failed to connect to Redis:", error);
  }
};

export { redisClient, connectRedis };
