import { NextResponse } from "next/server";
import { encodeJwt } from "./secret";

// 用用户信息生成 JWT，并存入 cookie
export async function setSessionTokenCookie(
  tokenPayload: {
    [key: string]: string; // 根据需要定义具体的字段类型
  },
  response: NextResponse
): Promise<NextResponse> {
  // 生成 JWT
  const sessionToken = encodeJwt({
    token: tokenPayload,
    secret: process.env.NEXT_AUTH_SECRET!,
  });

  // 设置 cookie
  response.cookies.set("next-auth.session-token", sessionToken, {
    httpOnly: true, // 防止前端 JavaScript 访问
    secure: true, // 确保 cookie 仅在 HTTPS 上发送
    path: "/", // 在整个网站有效
    sameSite: "none",
  });

  return response;
}

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
        Authorization: `Bearer` ?? "",
      },
    });
  });

  // 等待所有请求完成
  return Promise.all(fetchPromises);
}
