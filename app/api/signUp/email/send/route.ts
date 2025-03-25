import { NextRequest, NextResponse } from "next/server";

import { ERROR_CONFIG } from "@/lib/errors";
import { createVerificationToken, findClientByClientId, getUser } from "@/lib/database";
import { sendVerificationEmail } from "@/lib/email";
import { formateError, formatSuccess } from "@/lib/request";
import { verifyToken } from "@/lib/auth";
import { decryptWithRSA } from "@/lib/rsa";

export async function POST(request: NextRequest) {
  const userInfo = await request.json();

  try {
    const result = await verifyToken(userInfo.token);

    if (!result) {
      return NextResponse.json(formateError(ERROR_CONFIG.AUTH.TURNSTILE_VERIFY_FAIL));
    }
  } catch (error) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.TURNSTILE_VERIFY_FAIL));
  }

  // 获取当前请求的 host
  const host = request.headers.get("host") || request.headers.get(":authority");
  const baseUrl = `https://${host}`;

  if (!userInfo.email) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.NEED_EMAIL));
  } else if (
    await getUser({
      email: userInfo.email,
      businessDomainId: userInfo.businessDomainId,
    })
  ) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.USER_EXIST));
  } else {
    // 解密密码
    const decryptedPassword = decryptWithRSA(userInfo.password);

    try {
      const newToken = await createVerificationToken({
        identifier: userInfo?.email,
        name: userInfo?.name,
        password: decryptedPassword,
        targetUrl: userInfo?.targetUrl,
        businessDomainId: userInfo?.businessDomainId,
        type: "signUp",
      });
      const verificationLink = `${baseUrl}/api/signUp/email/verify?token=${newToken.token}`;
      const client = await findClientByClientId(userInfo?.client_id);

      // 发送验证邮件
      await sendVerificationEmail(
        userInfo.email,
        verificationLink,
        "Verify your email ",
        {
          title: "Verify your email address",
          description: "To continue setting up your account, please verify your email address.",
          btnContent: "Verify Email Address",
        },
        {
          mail_server_host: client.mail_server_host,
          mail_server_port: client.mail_server_port,
          mail_server_user: client.mail_server_user,
          mail_server_password: client.mail_server_password,
          mail_template_image: client.mail_template_image,
        },
        client.brand_color
      );

      return NextResponse.json(
        formatSuccess({
          message: "Please check your email to verify your account.",
        })
      );
    } catch (error) {
      console.log("VERIFICATION_TOKEN.GENERATE_FAIL", error);

      return NextResponse.json(ERROR_CONFIG.DATABASE.VERIFICATION_TOKEN.GENERATE_FAIL);
    }
  }
}
