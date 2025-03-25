import { NextRequest, NextResponse } from "next/server";

import { shoplazzaHmacValidator } from "@/lib/auth";
import { generateEncryptedState } from "@/lib/secret";
import { SHOPLAZZA_SCOPES } from "@/lib/auth";

export function GET(request: NextRequest) {
  try {
    // Validate HMAC
    shoplazzaHmacValidator(request);

    // 获取店铺
    const shop = request.nextUrl.searchParams.get("shop");

    if (!shop) {
      return NextResponse.json({ message: "Invalid shop parameter" }, { status: 400 });
    }

    // 确保环境变量已定义
    const clientId = process.env.SHOPLAZZA_CLIENT_ID;
    const redirectUriBase = process.env.NEXT_PUBLIC_NEXT_AUTH_URL;

    if (!clientId || !redirectUriBase) {
      return NextResponse.json({ message: "Missing environment variables" }, { status: 500 });
    }

    // 用shop生成一个随机state，用于防止csrf攻击
    const state = generateEncryptedState({ shop });

    // 构建重定向的URL并返回
    const redirectUri = `${redirectUriBase}/api/shoplazza/callback`;
    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${SHOPLAZZA_SCOPES.join(
      "+"
    )}&redirect_uri=${redirectUri}&response_type=code&state=${state}`;

    return NextResponse.redirect(authUrl, 302);
  } catch (e: any) {
    console.error("Error in GET /shoplazza/auth:", e);
    const errorMessage = e.message || "Unauthorized request";

    return NextResponse.json({ message: errorMessage }, { status: 401 });
  }
}
