import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwt } from "@/lib/secret";

// 新建client
export function POST(request: NextRequest) {
  const cookieStore = cookies();
  console.log(
    decodeJwt({
      token: cookieStore.get("next-auth.session-token")?.value,
      secret: process.env.NEXT_AUTH_SECRET!,
    })
  );
  return NextResponse.json({});
}

// 修改client
export function PUT(request: NextRequest) {
  return NextResponse.json({});
}

// 查询所有client列表
export function GET() {
  return NextResponse.json([]);
}
