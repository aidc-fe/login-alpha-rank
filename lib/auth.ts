import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { decodeJwt, encodeJwt } from "./secret";
import { ERROR_CONFIG } from "./errors";
import Redis from "ioredis";
import { toastApi } from "@/components/ui/toaster";

// 种植cookie的options
export const CookieOpt = {
  httpOnly: true, // 防止前端 JavaScript 访问
  secure: true, // 确保 cookie 仅在 HTTPS 上发送
  path: "/", // 在整个网站有效
  sameSite: "none" as "none",
};

// 往所有端种登录态cookie
export function thirdPartySignIn(jwt: string, shopDomain?: string | null) {
  const urls = process.env.NEXT_PUBLIC_THIRD_PARTY_SIGNIN_API?.split(",") || [];

  const fetchPromises = urls.map((url) => {
    return fetch(url, {
      method: "POST",
      credentials: "include", // 确保 cookie 被发送
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}` ?? "",
      },
      body: JSON.stringify({
        shopifyShopDomain: shopDomain,
      }),
    });
  });

  // 等待所有请求完成
  return Promise.all(fetchPromises);
}

// 往所有端种登录态cookie
export function thirdPartySignOut() {
  const urls =
    process.env.NEXT_PUBLIC_THIRD_PARTY_SIGNOUT_API?.split(",") || [];

  const fetchPromises = urls.map((url) => {
    return fetch(`${url}`, {
      method: "POST",
      credentials: "include", // 确保 cookie 被发送
      // 为了配合问己
      body: "{}",
      headers: {
        "Content-Type": "application/json",
        // 仅仅是为了blog产品，没有让问己新增接口，所以先保留这个
        Authorization: `Bearer`,
      },
    });
  });

  // 等待所有请求完成
  return Promise.all(fetchPromises);
}

// shoplazza HMAC Validator Middleware
export function shoplazzaHmacValidator(request: NextRequest): boolean {
  try {
    const url = new URL(request.url);
    const hmac = url.searchParams.get("hmac");
    const queryParams = new URLSearchParams(url.searchParams);
    queryParams.delete("hmac");

    const sortedKeys = Array.from(queryParams.keys()).sort();
    const message = sortedKeys
      .map((key) => `${key}=${queryParams.get(key)}`)
      .join("&");

    const generatedHash = createHmac(
      "sha256",
      process.env.SHOPLAZZA_CLIENT_SECRET!
    )
      .update(message)
      .digest("hex");

    const validate = timingSafeEqual(
      Buffer.from(generatedHash),
      Buffer.from(hmac!)
    );

    if (validate) {
      return true;
    } else {
      throw new Error();
    }
  } catch {
    throw ERROR_CONFIG.SHOPLAZZA.HMAC;
  }
}

// 用用户信息生成 JWT，并存入 cookie
export async function setSessionTokenCookie(
  tokenPayload: {
    [key: string]: string | Date | null; // 根据需要定义具体的字段类型
  },
  response: NextResponse,
  request: NextRequest
): Promise<NextResponse> {
  // 生成 JWT
  const sessionToken = await encodeJwt({
    token: tokenPayload,
    secret: process.env.NEXT_AUTH_SECRET!,
  });

  // 如果当前已经有登录态，并且登录的用户不是当前准备登录的用户，则先进行登出
  // if (request.cookies.get("next-auth.session-token")) {
  //   const userInfo = await decodeJwt({
  //     token: request.cookies.get("next-auth.session-token")?.value as string,
  //     secret: process.env.NEXT_AUTH_SECRET!,
  //   });

  //   if (userInfo?.email !== tokenPayload.email) {
  //   }
  // }

  // 设置 cookie
  response.cookies.set("next-auth.session-token", sessionToken, CookieOpt);

  return response;
}

// shoplazza的scope
export const SHOPLAZZA_SCOPES = [
  "read_product write_product",
  "read_collection",
  "write_collection",
  "read_script_tags",
  "write_script_tags",
  "read_app_proxy",
  "write_app_proxy",
  "read_data",
  "write_data",
  "read_shop",
  "read_comments",
  "write_comments",
  "read_shop_navigation",
  "write_shop_navigation",
  "read_search_api",
  "write_search_api",
  "read_themes",
  "unauthenticated_read_checkouts",
  "unauthenticated_write_checkouts",
  "unauthenticated_read_customers",
  "unauthenticated_write_customers",
  "unauthenticated_read_customer_tags",
  "unauthenticated_read_content",
  "unauthenticated_read_product_listings",
  "unauthenticated_read_product_tags",
  "unauthenticated_read_selling_plans",
];

const redis = new Redis(process.env.REDIS_URL!);
const redisPrefix = process.env.ENV;

// 限制参数
const DAILY_EMAIL_LIMIT = 1; // 每天每个邮箱最多 10 封邮件
const DAILY_WINDOW_IN_SECONDS = 24 * 60 * 60; // 24 小时
const MINUTE_REQUEST_LIMIT = 20; // 每分钟最大请求次数
const MINUTE_WINDOW_IN_SECONDS = 60; // 1 分钟

export async function rateLimiter(email: string, api: string) {
  // 生成键名
  const dailyEmailKey = `${redisPrefix}:daily:email:${email}`; // 每日邮箱限流键
  const minuteRequestKey = `${redisPrefix}:minute:request:${api}`; // 每分钟请求限流键

  // 检查每日发送邮件限制
  const dailyEmailCount = await redis.get(dailyEmailKey);
  if (dailyEmailCount && parseInt(dailyEmailCount, 10) >= DAILY_EMAIL_LIMIT) {
    throw new Error("Daily email limit reached. Try again tomorrow.");
  }

  // 检查每分钟请求限制
  const minuteRequestCount = await redis.get(minuteRequestKey);
  if (
    minuteRequestCount &&
    parseInt(minuteRequestCount, 10) >= MINUTE_REQUEST_LIMIT
  ) {
    toastApi.error("Too many requests, please try again later.");
    return false;
  } else {
    // 增加每日邮箱计数
    await redis
      .multi()
      .incr(dailyEmailKey)
      .expire(dailyEmailKey, DAILY_WINDOW_IN_SECONDS) // 每日过期时间
      .exec();

    // 增加每分钟请求计数
    await redis
      .multi()
      .incr(minuteRequestKey)
      .expire(minuteRequestKey, MINUTE_WINDOW_IN_SECONDS) // 每分钟过期时间
      .exec();

    return true; // 如果未超限则允许请求继续
  }
}
