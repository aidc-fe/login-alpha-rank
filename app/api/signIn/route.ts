import { NextRequest, NextResponse } from "next/server";

import { ERROR_CONFIG } from "@/lib/errors";
import { getUser } from "@/lib/database";
import { isPasswordMatch } from "@/lib/secret";
import { formateError, formatSuccess } from "@/lib/request";
import { verifyToken } from "@/lib/auth";
import { decryptWithRSA } from "@/lib/rsa";

export async function POST(request: NextRequest) {
  const params = await request.json();

  try {
    const result = await verifyToken(params.token);

    if (!result) {
      return NextResponse.json(formateError(ERROR_CONFIG.AUTH.TURNSTILE_VERIFY_FAIL));
    }
  } catch (error) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.TURNSTILE_VERIFY_FAIL));
  }

  const user = await getUser({ email: params.email, businessDomainId: params.businessDomainId });

  if (!user) {
    return NextResponse.json(formateError(ERROR_CONFIG.SIGNIN));
  } else {
    // 解密密码
    const decryptedPassword = decryptWithRSA(params.password);

    if (!isPasswordMatch(decryptedPassword, user?.password || "")) {
      return NextResponse.json(formateError(ERROR_CONFIG.SIGNIN));
    } else {
      return NextResponse.json(
        formatSuccess({
          data: {
            email: user.email,
            image: user.image,
            name: user.name,
            sub: user.id,
          },
        })
      );
    }
  }
}
