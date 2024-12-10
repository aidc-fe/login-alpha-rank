import { createAuthorizationCode, findClientByClientId } from "@/lib/database";
import { generateAuthorizationCode, generateHmac } from "@/lib/secret";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  let client_name;
  try {
    // 解构查询参数
    const client_id = request.nextUrl.searchParams.get("client_id");
    const redirect_uri = request.nextUrl.searchParams.get("redirect_uri");
    const state = request.nextUrl.searchParams.get("state") || "";
    const userId = request.nextUrl.searchParams.get("userId") || "";
    const systemDomain = request.nextUrl.searchParams.get("systemDomain") || "";

    // 参数校验
    if (!client_id) {
      return NextResponse.json(
        { message: "Client id missing" },
        { status: 400 }
      );
    }

    // 查询 client_id 对应的 client 信息
    const client = await findClientByClientId(client_id);
    client_name = client?.name ?? '';

    // 验证 redirect_uri 是否有效
    if (!redirect_uri || !client?.redirect_uris?.includes(redirect_uri)) {
      return NextResponse.json(
        { message: "Invalid redirect_uri" },
        { status: 400 }
      );
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
    console.error("Error during authorization:", e.message);
    return NextResponse.json(
      { message: e.message || `${client_name} Login Authorize failed` },
      { status: 401 }
    );
  }
}
