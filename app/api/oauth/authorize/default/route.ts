import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createAuthorizationCode, findClientByClientId } from "@/lib/database";
import { generateAuthorizationCode } from "@/lib/secret";
import { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 解构查询参数
  const client_id = request.nextUrl.searchParams.get("client_id");
  const redirect_uri = request.nextUrl.searchParams.get("redirect_uri");
  //  const state = request.nextUrl.searchParams.get("state") || "";
  let userId = request.nextUrl.searchParams.get("userId") || "";
  
  if(!userId){
    const session = await getServerSession(authOptions) as Session & { id: string, jwtToken: string };
    userId = session?.id;
  }

   // 参数校验
   if (!client_id) {
    return NextResponse.json(
      { message: "Client id missing" },
      { status: 400 }
    );
  }

  // 查询 client_id 对应的 client 信息
  const client = await findClientByClientId(client_id);

   // 验证 redirect_uri 是否有效
   if (!redirect_uri || !client?.redirect_uris?.includes(redirect_uri)) {
    return NextResponse.json(
      { message: "Invalid redirect_uri" },
      { status: 400 }
    );
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

  // 重定向到 redirect_uri
  return NextResponse.redirect(redirectUrl.toString(), 302);
}