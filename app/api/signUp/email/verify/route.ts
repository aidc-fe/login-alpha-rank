import { setSessionTokenCookie } from "@/lib/auth";
import { createOrUpdateUser, validateMagicLink } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  try {
    const info = await validateMagicLink(token || "");
    const userInfo = {
      password: info.password!,
      email: info.identifier,
      name: info.name!,
    };
    const user = await createOrUpdateUser(userInfo);

    const response = NextResponse.redirect(
      `${process.env.NEXT_AUTH_URL}/login-landing-page?targetUrl=${info.targetUrl}`,
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
