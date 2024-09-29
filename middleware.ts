import { NextRequest, NextResponse } from "next/server";

// 登录相关接口跨域的配置
const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export const config = {
  matcher: ["/((?!_next/|_static/|_vercel b|[\\w-]+\\.\\w+).*)"],
};

export default async function middleware(request: NextRequest) {
  return NextResponse.next();

  const url = request.nextUrl;
  const host = request.headers.get("host");
  let hostname = request.headers
    .get("host")!
    .replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_APP_ROOT_DOMAIN}`);

  /**
   * 下方是登录态检验逻辑
   */
  const origin = request.headers.get("origin") ?? "";

  if (request.method === "OPTIONS") {
    const preflightHeaders = {
      "Access-Control-Allow-Origin": origin,
      ...corsOptions,
    };

    return NextResponse.json({}, { headers: preflightHeaders });
  }

  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", origin);

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
