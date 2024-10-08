import { setSessionTokenCookie } from "@/lib/auth";
import { createOrUpdateAccount, createOrUpdateUser } from "@/lib/database";
import { decryptState } from "@/lib/secret";
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

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state") || "";
    const shop = request.nextUrl.searchParams.get("shop");

    // 对称加密检验
    const stateData = decryptState(state);

    if (shop !== stateData?.shop) {
      throw { message: "State validate failed" };
    }

    // 获取shoplazza的accessToken
    const authResponse = await fetch(`https://${shop}/admin/oauth/token`, {
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

    const authData = (await authResponse.json()) as AuthDataType;

    if (authResponse.ok) {
      // 获取店铺信息
      const shopRsp = await fetch(`https://${shop}/openapi/2022-01/shop`, {
        headers: {
          accept: "application/json",
          "access-token": authData.access_token,
        },
      });
      const shopData = (await shopRsp.json()) as RawShopDataType;
      const shopInfo = shopData?.shop;

      // 提取用户信息
      const userInfo = { name: shopInfo.account, email: shopInfo.email };
      // 提取oAuth账号信息
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
      // // 创建或更新用户信息
      const user = await createOrUpdateUser({ ...userInfo, from: "shoplazza" });

      // // 创建或更新oAuth账号信息
      await createOrUpdateAccount({
        ...accountInfo,
        userId: user.id,
      });

      const response = NextResponse.redirect(
        `${process.env.DEFAULT_TARGET_URL}/web/api/auth/callback/login?userId=${user.id}&systemDomain=${shopInfo.system_domain}`,
        302
      );
      // 在登录前台种入cookie
      setSessionTokenCookie(userInfo, response);

      // 302到alphaRank提供的接口
      return response;
    } else {
      // Handle error response
      throw {
        message: "Shoplazza Authentication failed: Got accessToken failed",
      };
    }
  } catch (error) {
    return NextResponse.json(error, { status: 401 });
  }
}
