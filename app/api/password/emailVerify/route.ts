import { ERROR_CONFIG } from "@/lib/errors";
import { createVerificationToken, getUser } from "@/lib/database";
import { sendVerificationEmail } from "@/lib/email";
import { formateError, formatSuccess } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password } = (await request.json()) || {};

  if (!email) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.NEED_EMAIL));
  } else if (!(await getUser({ email }))) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.USER_NOT_EXIST));
  } else {
    const newToken = await createVerificationToken({
      identifier: email, // 你需要的 identifier
      password,
      type: "passwordSet", // 可选
    });
    const verificationLink = `${process.env.NEXT_AUTH_URL}/api/password/set?token=${newToken.token}`;

    // 发送验证邮件
    await sendVerificationEmail(
      email,
      verificationLink,
      "Set AlphaRank's password ",
      {
        title: "Set Password",
        description:
          "We've received your new password setting requirement. If you did not request it, please just ignore it. Otherwise, finish setting your new password by the link below.",
        btnContent: "Set Password",
      }
    );
    return NextResponse.json(
      formatSuccess({
        message: "Please check your email to verify your account.",
      })
    );
  }
}
