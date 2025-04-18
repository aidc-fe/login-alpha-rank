import { User } from "@prisma/client";
import { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/authOptions";
import { createAuthorizationCode, findClientByClientId } from "@/lib/database";
import { generateAuthorizationCode } from "@/lib/secret";
import { is3Minutes } from "@/lib/utils";

export async function GET(request: NextRequest) {
  // 解构查询参数
  const client_id = request.nextUrl.searchParams.get("client_id");
  const redirect_uri = request.nextUrl.searchParams.get("redirect_uri");
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
  const auth_action = request.nextUrl.searchParams.get("auth_action");
  const invite = request.nextUrl.searchParams.get("invite");
  const loginReferral = request.nextUrl.searchParams.get("loginReferral");
  const utmSource = request.nextUrl.searchParams.get("utm_source");
  //  const state = request.nextUrl.searchParams.get("state") || "";
  const auth_type = request.nextUrl.searchParams.get("auth_type");
  let userId = request.nextUrl.searchParams.get("userId") || "";
  const session = (await getServerSession(authOptions)) as Session & {
    id: string;
    jwtToken: string;
    user: User;
  };

  if (!userId) {
    userId = session?.id;
  }

  // 参数校验
  if (!client_id) {
    return NextResponse.json({ message: "Client id missing" }, { status: 400 });
  }

  // 查询 client_id 对应的 client 信息
  const client = await findClientByClientId(client_id);

  // 验证 redirect_uri 是否有效
  if (!redirect_uri || !client?.redirect_uris?.includes(redirect_uri)) {
    return NextResponse.json({ message: "Invalid redirect_uri" }, { status: 400 });
  }

  // 生成授权码
  const code = generateAuthorizationCode();

  // 创建授权码记录
  const authorizationCode = await createAuthorizationCode({
    code,
    client_id,
    redirect_uri,
  });

  // 构建重定向 URL
  const redirectUrl = new URL(redirect_uri);

  // redirectUrl.searchParams.set("hmac", hmac);
  redirectUrl.searchParams.set("code", authorizationCode.code);
  // redirectUrl.searchParams.set("state", state);
  redirectUrl.searchParams.set("userId", userId);
  if (callbackUrl) {
    redirectUrl.searchParams.set("callbackUrl", callbackUrl);
  }
  if (invite) {
    redirectUrl.searchParams.set("invite", invite);
  }
  if (loginReferral) {
    redirectUrl.searchParams.set("loginReferral", loginReferral);
  }
  if (utmSource) {
    redirectUrl.searchParams.set("utm_source", utmSource);
  }
  // 添加auth_action
  if (auth_type !== "google" && auth_action) {
    redirectUrl.searchParams.set("authAction", auth_action);
  } else if (session.user?.created_at) {
    // 验证时间戳是否在当前时间3分钟范围内,判断是注册还是登录
    const authAction = is3Minutes(session.user.created_at);

    redirectUrl.searchParams.set("authAction", authAction);
  }

  // 重定向到 redirect_uri
  return NextResponse.redirect(redirectUrl.toString(), 302);
}
