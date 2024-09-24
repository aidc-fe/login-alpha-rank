import { ERROR_CONFIG } from "@/constants/errors";
import { createVerificationToken, getUserByEmail } from "@/lib/database";
import { sendVerificationEmail } from "@/lib/email";
import { formateError, formatSuccess } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password } = (await request.json()) || {};

  if (!email) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.NEED_EMAIL));
  } else if (!(await getUserByEmail(email))) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.USER_NOT_EXIST));
  } else {
    const newToken = await createVerificationToken({
      identifier: email, // 你需要的 identifier
      password,
      type: "passwordReset", // 可选
    });
    const verificationLink = `/api/password/reset?token=${newToken.token}`;

    // 发送验证邮件
    await sendVerificationEmail(
      email,
      verificationLink,
      "Changing AlphaRank's password ",
      {
        title: "Reset Password",
        description:
          "A password change has been requested for your account. If this was requested by you, please use the link below to reset your password.",
        btnContent: "Reset Password",
      }
    );
    return NextResponse.json(
      formatSuccess({
        message: "Please check your email to verify your account.",
      })
    );
  }
}
