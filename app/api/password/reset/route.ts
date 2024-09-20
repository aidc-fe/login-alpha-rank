import { updateUserByEmail, validateMagicLink } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const newToken = await validateMagicLink(token || "");

  try {
    await updateUserByEmail(newToken.identifier, {
      password: newToken.password!,
    });
    return NextResponse.redirect(process.env.NEXT_AUTH_URL!, {
      status: 302,
    });
  } catch {}

  // return NextResponse.redirect(
  //   `${process.env.NEXT_AUTH_URL}/password/reset?email=${newToken.identifier}`,
  //   {
  //     status: 302,
  //   }
  // );
}
