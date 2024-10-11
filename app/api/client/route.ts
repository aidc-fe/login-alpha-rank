import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwt } from "@/lib/secret";
import { formateError, formatSuccess } from "@/lib/request";
import { createClient } from "@/lib/database";
import { APP_DOMAIN } from "@/lib/url";

// 新建client
export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const user = await decodeJwt({
    token: cookieStore.get("next-auth.session-token")?.value,
    secret: process.env.NEXT_AUTH_SECRET!,
  });

  if (!user?.email) {
    return NextResponse.json(formateError({}));
  }

  const data = await createClient({
    redirect_uris: [`${APP_DOMAIN}/web/api/auth/callback/authorize`], // 数组
    scope: ["email", "openid", "profile", "shopify", "shoplazza"], // 数组
    name: "app.alpha-rank",
    description: "app.alpha-rank",
    signout_uri: `${APP_DOMAIN}/web/api/auth/callback/logout`,
    owner_email: user.email, // 用户的email
  });
  console.log(data);
  return NextResponse.json(formatSuccess({ data }));
}

// 修改client
export function PUT(request: NextRequest) {
  return NextResponse.json({});
}

// 查询所有client列表
export function GET() {
  return NextResponse.json([]);
}
