import { ERROR_CONFIG } from "@/lib/errors";
import { createVerificationToken, getUser } from "@/lib/database";
import { sendVerificationEmail } from "@/lib/email";
import { formateError, formatSuccess } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const userInfo = await request.json();

  if (!userInfo.email) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.NEED_EMAIL));
  } else if (await getUser({ email: userInfo.email })) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.USER_EXIST));
  } else {
    // 生成验证链接（你需要实现生成实际的链接）

    try {
      const newToken = await createVerificationToken({
        identifier: userInfo?.email, // 你需要的 identifier
        name: userInfo?.name,
        password: userInfo?.password, // 可选
        targetUrl: userInfo?.targetUrl,
        type: "signUp", // 可选
      });
      const verificationLink = `${process.env.NEXT_AUTH_URL}/api/signUp/email/verify?token=${newToken.token}`;

      // 发送验证邮件
      await sendVerificationEmail(
        userInfo.email,
        verificationLink,
        "AlphaRank - Verify your email ",
        {
          title: "Verify your email address",
          description:
            "To continue setting up your AlphaRank account, please verify your email address.",
          btnContent: "Verify Email Address",
        }
      );
      return NextResponse.json(
        formatSuccess({
          message: "Please check your email to verify your account.",
        })
      );
    } catch (error) {
      console.log("VERIFICATION_TOKEN.GENERATE_FAIL", error);
      return NextResponse.json(
        ERROR_CONFIG.DATABASE.VERIFICATION_TOKEN.GENERATE_FAIL
      );
    }
  }
}
