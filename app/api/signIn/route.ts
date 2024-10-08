import { ERROR_CONFIG } from "@/lib/errors";
import { getUser } from "@/lib/database";
import { isPasswordMatch } from "@/lib/secret";
import { formateError, formatSuccess } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const params = await request.json();
  const user = await getUser({ email: params.email });

  if (!user) {
    return NextResponse.json(formateError(ERROR_CONFIG.SIGNIN));
  } else if (!isPasswordMatch(params.password, user?.password || "")) {
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
