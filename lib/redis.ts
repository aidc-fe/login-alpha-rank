import { createClient } from "redis";
import { toastApi } from "@/components/ui/toaster";

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.error("Redis Client Error", err));

// 确保 Redis 客户端在连接时已准备好
async function connectRedis() {
  await redis.connect();
}

connectRedis();

const redisPrefix = process.env.ENV;
// 限制参数
const DAILY_EMAIL_LIMIT = 10; // 每天每个邮箱最多 10 封邮件
const DAILY_WINDOW_IN_SECONDS = 24 * 60 * 60; // 24 小时
const MINUTE_REQUEST_LIMIT = 20; // 每分钟最大请求次数
const MINUTE_WINDOW_IN_SECONDS = 60; // 1 分钟

export async function rateLimiter(email: string, api: string) {
  const dailyEmailKey = `${redisPrefix}:daily:email:${email}`;
  const minuteRequestKey = `${redisPrefix}:minute:request:${api}`;

  // 每日邮箱限制
  const dailyEmailCount = await redis.get(dailyEmailKey);
  if (dailyEmailCount && parseInt(dailyEmailCount, 10) >= DAILY_EMAIL_LIMIT) {
    toastApi.error("Daily email limit reached. Try again tomorrow.");
    return false;
  }

  // 每分钟请求限制
  const minuteRequestCount = await redis.get(minuteRequestKey);
  if (
    minuteRequestCount &&
    parseInt(minuteRequestCount, 10) >= MINUTE_REQUEST_LIMIT
  ) {
    toastApi.error("Too many requests, please try again later.");
    return false;
  }

  // 增加计数
  await redis
    .multi()
    .incr(dailyEmailKey)
    .expire(dailyEmailKey, DAILY_WINDOW_IN_SECONDS)
    .incr(minuteRequestKey)
    .expire(minuteRequestKey, MINUTE_WINDOW_IN_SECONDS)
    .exec();

  return true; // 表示限流检查通过
}
