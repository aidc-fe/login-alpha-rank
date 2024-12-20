import { setSessionTokenCookie } from "@/lib/auth";
import {
  createOrUpdateUser,
  validateMagicLink,
} from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const _domain = `http${process.env.ENV==='development' ? '' : 's'}://${request.headers.get('host') || request.headers.get(':authority')}`
  

  try {
  
    const info = await validateMagicLink(token || "");
    const userInfo = {
      password: info.password!,
      email: info.identifier,
      name: info.name!,
      businessDomainId: info.businessDomainId,
    };
    const user = await createOrUpdateUser(userInfo);

    const response = NextResponse.redirect(
        `${_domain}${info.targetUrl}&userId=${user.id}`,
      {
        status: 302,
      }
    );
    await setSessionTokenCookie({ ...user, sub: user.id }, response, request);

    return response;
  } catch {
    return NextResponse.redirect(_domain, { status: 302 });
  }
}
