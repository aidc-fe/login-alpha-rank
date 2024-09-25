import { NextRequest, NextResponse } from "next/server";
import { hmacValidator } from "@/lib/auth";
import { formateError } from "@/lib/request";
import { ERROR_CONFIG } from "@/constants/errors";
import { generateEncryptedState } from "@/lib/secret";
import { SHOPLAZZA_SCOPES } from "@/constants/scopes";

export function GET(request: NextRequest) {
  // Validate HMAC
  if (!hmacValidator(request)) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.SHOPLAZZA.HMAC));
  }

  const shop = request.nextUrl.searchParams.get("shop") || "";

  // 下面的几个参数暂时用不到
  const hmac = request.nextUrl.searchParams.get("hmac");
  const install_from = request.nextUrl.searchParams.get("install_from");
  const store_id = request.nextUrl.searchParams.get("store_id") || "";

  // Generate a random state parameter
  const state = generateEncryptedState({ shop });

  // Store the state in a way that you can verify it later
  // For example, you might store it in a session or database associated with the user

  return NextResponse.redirect(
    `https://${shop}/admin/oauth/authorize?client_id=${process.env
      .SHOPLAZZA_CLIENT_ID!}&scope=${SHOPLAZZA_SCOPES.join(
      "+"
    )}&redirect_uri=${encodeURI(
      `${process.env.NEXT_PUBLIC_NEXT_AUTH_URL}/api/shoplazza/callback`
    )}&response_type=code&state=${state}`,
    302
  );
}
