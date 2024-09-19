import { ERROR_CONFIG } from "@/constants/errors";
import { userExist } from "@/lib/database";
import { sendVerificationEmail } from "@/lib/email";
import { formateError, formatSuccess } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; // 用于生成唯一的验证链接

export async function POST(request: NextRequest) {
  const userInfo = await request.json();

  if (!userInfo.email) {
    return NextResponse.json(
      formateError({
        message: "email required.",
        code: ERROR_CONFIG.AUTH.NEED_EMAIL,
      })
    );
  } else if (await userExist(userInfo.email)) {
    return NextResponse.json(
      formateError({
        code: ERROR_CONFIG.AUTH.USER_EXIST,
        message: "user already exit,please sign in.",
      })
    );
  } else {
    // 生成验证链接（你需要实现生成实际的链接）
    const verificationToken = uuidv4();
    const verificationLink = `${process.env.NEXT_AUTH_URL}/api/signUp/email/verify?token=${verificationToken}`;

    // TODO: 将用户信息和验证令牌保存到数据库

    // 发送验证邮件
    await sendVerificationEmail(
      userInfo.email,
      verificationLink,
      "AlphaRank - Verify your email ",
      {
        title: "Verify your email address",
        description:
          "To continue setting up your AlphaRank account, please verify that this is your email address.",
        btnContent: "Verify Email Address",
      }
    );
    return NextResponse.json(
      formatSuccess({
        message: "Please check your email to verify your account.",
      })
    );
  }
}
