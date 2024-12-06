import { setSessionTokenCookie } from "@/lib/auth";
import {
  createOrUpdateUser,
  getBusinessDomainById,
  getCurrentServerClient,
  validateMagicLink,
} from "@/lib/database";
import { ERROR_CONFIG } from "@/lib/errors";
import { formateError } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const businessDomainId = request.nextUrl.searchParams.get("businessDomainId");

  if (!businessDomainId) {
    return NextResponse.json(
      formateError(ERROR_CONFIG.AUTH.NEED_BUSINESS_DOMAIN_ID)
    );
  }
  try {
    const businessDomain = await getBusinessDomainById(businessDomainId);
    const { redirect_uris, client_id } = await getCurrentServerClient();
    const info = await validateMagicLink(token || "");
    const userInfo = {
      password: info.password!,
      email: info.identifier,
      name: info.name!,
      businessDomainId,
    };
    const user = await createOrUpdateUser(userInfo);

    const response = NextResponse.redirect(
      !businessDomain.sso
        ? `http://${request.headers.get('host')}/api/oauth/authorize/default?redirect_uri=${redirect_uris?.[0]}&client_id=${client_id}&userId=${user.id}`
        : `http://${request.headers.get('host')}/login-landing-page?targetUrl=${info.targetUrl}`,
      {
        status: 302,
      }
    );
    await setSessionTokenCookie({ ...user, sub: user.id }, response, request);

    return response;
  } catch {
    return NextResponse.redirect(process.env.NEXT_AUTH_URL!, { status: 302 });
  }
}
