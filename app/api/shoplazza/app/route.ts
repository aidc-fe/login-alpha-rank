import { NextRequest, NextResponse } from "next/server";
import { shoplazzaHmacValidator } from "@/lib/auth";
import { generateEncryptedState } from "@/lib/secret";
import { SHOPLAZZA_SCOPES } from "@/constants/scopes";

export function GET(request: NextRequest) {
  try {
    // Validate HMAC
    shoplazzaHmacValidator(request);

    // 获取店铺
    const shop = request.nextUrl.searchParams.get("shop") || "";
    // 用shop生成一个随机state，用于防治crsf攻击
    const state = generateEncryptedState({ shop });

    return NextResponse.redirect(
      `https://${shop}/admin/oauth/authorize?client_id=${process.env
        .SHOPLAZZA_CLIENT_ID!}&scope=${SHOPLAZZA_SCOPES.join(
        "+"
      )}&redirect_uri=${encodeURI(
        `${process.env.NEXT_PUBLIC_NEXT_AUTH_URL}/api/shoplazza/callback`
      )}&response_type=code&state=${state}`,
      302
    );
  } catch (e) {
    return NextResponse.json(e, { status: 401 });
  }
}
