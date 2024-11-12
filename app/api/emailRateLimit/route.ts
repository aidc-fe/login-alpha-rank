import { emailRateLimiter } from "@/lib/redis";
import { formateError, formatSuccess } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  const isUnderLimit = await emailRateLimiter(email);
  if (isUnderLimit) {
    return NextResponse.json(formatSuccess({ data: true }));
  } else {
    return NextResponse.json(
      formateError({
        code: "EMAIL_OVER_LIMIT",
        message:
          "Your email send limit has been reached for today. Please try again tomorrow.",
      })
    );
  }
}
