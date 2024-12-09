import { updateUserByEmail, validateMagicLink } from "@/lib/database";
import { ERROR_CONFIG } from "@/lib/errors";
import { formateError } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 获取当前请求的 host
  const host = request.headers.get('host') || request.headers.get(':authority');
  const baseUrl = `https://${host}`;
  
  const token = request.nextUrl.searchParams.get("token");
  const businessDomainId = request.nextUrl.searchParams.get("businessDomainId");
  const newToken = await validateMagicLink(token || "");

  if(!businessDomainId){
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.NEED_BUSINESS_DOMAIN_ID));
  }
  await updateUserByEmail(newToken.identifier, {
    password: newToken.password!,
    businessDomainId,
  });
  return NextResponse.redirect(baseUrl, {
    status: 302,
  });
}
