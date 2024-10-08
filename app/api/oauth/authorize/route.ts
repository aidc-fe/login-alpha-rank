import { createAuthorizationCode, findClientByClientId } from "@/lib/database";
import { generateAuthorizationCode, generateHmac } from "@/lib/secret";
import { NextRequest, NextResponse } from "next/server";

// 定义查询参数的类型
interface QueryParams {
  client_id: string;
  redirect_uri: string;
  state: string;
  userId: string;
  systemDomain: string;
}

export async function GET(request: NextRequest) {
  try {
    // 解构查询参数
    const {
      client_id = "",
      redirect_uri = "",
      state = "",
      userId = "",
      systemDomain = "",
    }: QueryParams = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    ) as unknown as QueryParams;

    if (!client_id) {
      throw new Error("Client id missing");
    }

    // 查询 client_id 对应的 client 信息
    const client = await findClientByClientId(client_id);

    // 验证 redirect_uri 是否有效
    if (!redirect_uri || !client?.redirect_uris?.includes(redirect_uri)) {
      throw new Error("Invalid redirect_uri");
    }

    // 生成授权码
    const code = generateAuthorizationCode();
    // 生成 HMAC
    const hmac = generateHmac(
      {
        code,
        state: decodeURIComponent(state),
        userId,
        systemDomain: decodeURIComponent(systemDomain),
        jumpFrom: "shoplazza",
      },
      client.client_secret
    );

    // 创建授权码记录
    const authorizationCode = await createAuthorizationCode({
      code,
      client_id,
      redirect_uri,
    });

    // 构建重定向 URL
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set("hmac", hmac);
    redirectUrl.searchParams.set("code", authorizationCode.code);
    redirectUrl.searchParams.set("state", state);
    redirectUrl.searchParams.set("userId", userId);
    redirectUrl.searchParams.set("systemDomain", systemDomain);
    redirectUrl.searchParams.set("jumpFrom", "shoplazza");

    // 重定向到 redirect_uri
    return NextResponse.redirect(redirectUrl.toString(), 302);
  } catch (e: any) {
    return NextResponse.json(
      { message: e.message || "AlphaRank Login Authorize failed" },
      { status: 401 }
    );
  }
}
