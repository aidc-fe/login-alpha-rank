import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.error("Redis Client Error", err));

// 确保 Redis 客户端在连接时已准备好
async function connectRedis() {
  await redis.connect();
}

connectRedis();

// 限制参数
const DAILY_EMAIL_LIMIT = 20; // 每天每个邮箱最多 10 封邮件
const DAILY_WINDOW_IN_SECONDS = 24 * 60 * 60; // 24 小时

export async function emailRateLimiter(email: string) {
  const dailyEmailKey = `${process.env.ENV}:daily:email:${email}`;

  // 每日邮箱限制
  const dailyEmailCount = await redis.get(dailyEmailKey);
  if (dailyEmailCount && parseInt(dailyEmailCount, 10) >= DAILY_EMAIL_LIMIT) {
    return false;
  }

  // 增加计数
  await redis
    .multi()
    .incr(dailyEmailKey)
    .expire(dailyEmailKey, DAILY_WINDOW_IN_SECONDS)
    .exec();

  return true; // 表示限流检查通过
}
