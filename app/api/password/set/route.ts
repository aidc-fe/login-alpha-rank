import { NextRequest, NextResponse } from "next/server";

import { updateUserByEmail, validateMagicLink } from "@/lib/database";

export async function GET(request: NextRequest) {
  // 获取当前请求的 host
  const host = request.headers.get("host") || request.headers.get(":authority");
  const baseUrl = `https://${host}`;

  const token = request.nextUrl.searchParams.get("token");

  const newToken = await validateMagicLink(token || "");

  await updateUserByEmail(newToken.identifier, {
    password: newToken.password!,
    businessDomainId: newToken.businessDomainId || "",
  });

  return NextResponse.redirect(baseUrl, {
    status: 302,
  });
}
