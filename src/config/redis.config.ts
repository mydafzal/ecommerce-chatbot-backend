import { createClient } from "redis";

export const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    port: process.env.REDIS_PORT,
  },
});

redisClient.on("error", (error) => {
  console.log("Redis error: ", error);
});

export async function connectRedis() {
  await redisClient.connect();
}
