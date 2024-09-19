import { ERROR_CONFIG } from "@/constants/errors";
import { userExist } from "@/lib/database";
import { sendVerificationEmail } from "@/lib/email";
import { formateError, formatSuccess } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; // 用于生成唯一的验证链接

export async function POST(request: NextRequest) {
  const { email } = (await request.json()) || {};

  if (!email) {
    return NextResponse.json(
      formateError({
        message: "email required.",
        code: ERROR_CONFIG.AUTH.NEED_EMAIL,
      })
    );
  } else if (!(await userExist(email))) {
    return NextResponse.json(
      formateError({
        code: ERROR_CONFIG.AUTH.USER_NOT_EXIST,
        message: "user not exist, please sign up.",
      })
    );
  } else {
    // 生成验证链接（你需要实现生成实际的链接）
    const verificationToken = uuidv4();
    const verificationLink = `${process.env.NEXT_AUTH_URL}/api/password/reset?token=${verificationToken}`;

    // TODO: 将用户信息和验证令牌保存到数据库

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
