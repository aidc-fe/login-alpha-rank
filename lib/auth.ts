import { createHmac, timingSafeEqual } from "crypto";

import { NextRequest, NextResponse } from "next/server";

import { encodeJwt } from "./secret";
import { ERROR_CONFIG } from "./errors";

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

  const fetchPromises = urls.map(url => {
    return fetch(url, {
      method: "POST",
      credentials: "include", // 确保 cookie 被发送
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
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
  const urls = process.env.NEXT_PUBLIC_THIRD_PARTY_SIGNOUT_API?.split(",") || [];

  const fetchPromises = urls.map(url => {
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
    const message = sortedKeys.map(key => `${key}=${queryParams.get(key)}`).join("&");

    const generatedHash = createHmac("sha256", process.env.SHOPLAZZA_CLIENT_SECRET!)
      .update(message)
      .digest("hex");

    const validate = timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmac!));

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

// 验证turnstile token
export async function verifyToken(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY!;
  const verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const formData = new URLSearchParams();

  formData.append("secret", secretKey);
  formData.append("response", token);
  const response = await fetch(verifyUrl, {
    method: "POST",
    body: formData,
  });
  const result = await response.json();

  console.log(process.env.TURNSTILE_SECRET_KEY, result);

  return result.success;
}
