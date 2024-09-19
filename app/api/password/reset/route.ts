import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect(`${process.env.NEXT_AUTH_URL}/password/reset`, {
    status: 302,
  });
}
