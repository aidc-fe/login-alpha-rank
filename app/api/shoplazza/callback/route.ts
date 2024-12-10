import { setSessionTokenCookie } from "@/lib/auth";
import { createOrUpdateAccount, createOrUpdateUser } from "@/lib/database";
import { decryptState } from "@/lib/secret";
import { APP_DOMAIN } from "@/lib/url";
import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

type AuthDataType = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
};

type RawShopDataType = {
  shop: {
    account: string;
    name: string;
    email: string;
    id: number;
    domain: string;
    system_domain: string;
  };
};

// 辅助函数：获取Shoplazza的accessToken
async function getShoplazzaAccessToken(
  shop: string,
  code: string
): Promise<AuthDataType> {
  const response = await fetch(`https://${shop}/admin/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.SHOPLAZZA_CLIENT_ID,
      client_secret: process.env.SHOPLAZZA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_NEXT_AUTH_URL}/api/shoplazza/callback`,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch access token from Shoplazza");
  }

  return (await response.json()) as AuthDataType;
}

// 辅助函数：获取店铺信息
async function getShopInfo(
  shop: string,
  accessToken: string
): Promise<RawShopDataType> {
  const response = await fetch(`https://${shop}/openapi/2022-01/shop`, {
    headers: {
      accept: "application/json",
      "access-token": accessToken,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch shop information");
  }

  return (await response.json()) as RawShopDataType;
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state") || "";
    const shop = request.nextUrl.searchParams.get("shop");

    if (!code) {
      return NextResponse.json(
        { message: "Missing or invalid 'code' parameter" },
        { status: 400 }
      );
    }

    if (!shop) {
      return NextResponse.json(
        { message: "Missing or invalid 'shop' parameter" },
        { status: 400 }
      );
    }

    // 对称加密校验
    const stateData = decryptState(state);
    if (shop !== stateData?.shop) {
      return NextResponse.json(
        { message: "State validation failed" },
        { status: 400 }
      );
    }

    // 获取Shoplazza的accessToken
    const authData = await getShoplazzaAccessToken(shop, code);

    // 获取店铺信息
    const shopData = await getShopInfo(shop, authData.access_token);
    const shopInfo = shopData?.shop;

    if (!shopInfo) {
      return NextResponse.json(
        { message: "Failed to retrieve shop information" },
        { status: 500 }
      );
    }

    // 提取用户信息和oAuth账号信息
    const userInfo = { name: shopInfo.account, email: shopInfo.email };
    const accountInfo = {
      provider: "shoplazza",
      providerAccountId: String(shopInfo.id),
      refresh_token: authData.refresh_token,
      access_token: authData.access_token,
      expires_at: authData.expires_at,
      token_type: authData.token_type,
      shop_domain: shopInfo.system_domain,
      shop_domain_display: shopInfo.domain,
      user_name: shopInfo.name,
    };

    // 创建或更新用户信息和oAuth账号信息
    const user = await createOrUpdateUser({ ...userInfo, from: "shoplazza", businessDomainId: '13883979-d8ac-41db-a930-2a152f8b3c90	' });
    await createOrUpdateAccount({
      ...accountInfo,
      userId: user.id,
    });

    // 302 重定向到目标URL，并设置Cookie
    const redirectUrl = `${APP_DOMAIN}/web/api/auth/callback/login?userId=${user.id}&systemDomain=${shopInfo.system_domain}`;
    const response = NextResponse.redirect(redirectUrl, 302);
    setSessionTokenCookie(userInfo, response, request);

    return response;
  } catch (error: any) {
    console.error("Error during Shoplazza authentication:", error.message);
    return NextResponse.json(
      { message: error.message || "Authentication failed" },
      { status: 401 }
    );
  }
}
