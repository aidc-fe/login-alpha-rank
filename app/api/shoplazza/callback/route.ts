import { ERROR_CONFIG } from "@/constants/errors";
import { setSessionTokenCookie } from "@/lib/auth";
import { createOrUpdateAccount, createOrUpdateUser } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    // todo:用这个做一下对称加密
    const state = request.nextUrl.searchParams.get("state");
    const shop = request.nextUrl.searchParams.get("shop");

    const hmac = request.nextUrl.searchParams.get("hmac");

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
        redirect_uri: `https://${process.env.BASE_DOMAIN}/api/auth/shoplazza/callback`,
      }),
    });

    const authData = (await authResponse.json()) as {
      access_token: string;
      refresh_token: string;
      expires_at: number;
      token_type: string;
    };
    console.log("Auth Response:", authData);

    if (authResponse.ok) {
      // Successful response, handle accordingly

      // 获取店铺信息
      const shopRsp = await fetch(`https://${shop}/openapi/2022-01/shop`, {
        headers: {
          accept: "application/json",
          "access-token": authData.access_token,
        },
      });
      const shopData = (await shopRsp.json()) as {
        shop: {
          account: string;
          name: string;
          email: string;
          id: number;
          domain: string;
          system_domain: string;
        };
      };
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
        shop: shopInfo.system_domain,
        domain: shopInfo.domain,
        userName: shopInfo.name,
      };
      // 创建或更新用户信息
      const user = await createOrUpdateUser({ ...userInfo, from: "shoplazza" });
      // 创建或更新oAuth账号信息
      const account = await createOrUpdateAccount({
        ...accountInfo,
        userId: user.id,
      });

      const response = NextResponse.redirect(
        `${process.env.DEFAULT_TARGET_URL}/web/api/auth/callback/login?userId=${user.id}&systemDomain=${shopInfo.system_domain}`,
        302
      );
      setSessionTokenCookie(userInfo, response);

      // 302到alpharank提供的接口
      return response;
    } else {
      // Handle error response
      console.error("Error during authentication:", authData);
      return NextResponse.json(
        { error: "Authentication failed", details: authData },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Request failed:", error);
    return NextResponse.json(ERROR_CONFIG.SERVER.ERROR_500);
  }
}
