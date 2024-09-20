import { createUser, validateMagicLink } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  try {
    const info = await validateMagicLink(token || "");
    await createUser({
      password: info.password!,
      email: info.identifier,
      name: info.name!,
    });
    return NextResponse.redirect(process.env.NEXT_AUTH_URL!, { status: 302 });
  } catch {
    return NextResponse.redirect(process.env.NEXT_AUTH_URL!, { status: 302 });
  }
}
