import { ERROR_CONFIG } from "@/lib/errors";
import {
  createVerificationToken,
  findClientByClientId,
  getUser,
} from "@/lib/database";
import { sendVerificationEmail } from "@/lib/email";
import { formateError, formatSuccess } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const userInfo = await request.json();
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
    // 生成验证链接（你需要实现生成实际的链接）

    try {
      const newToken = await createVerificationToken({
        identifier: userInfo?.email, // 你需要的 identifier
        name: userInfo?.name,
        password: userInfo?.password, // 可选
        targetUrl: userInfo?.targetUrl,
        businessDomainId: userInfo?.businessDomainId,
        type: "signUp", // 可选
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
          description:
            "To continue setting up your account, please verify your email address.",
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
      return NextResponse.json(
        ERROR_CONFIG.DATABASE.VERIFICATION_TOKEN.GENERATE_FAIL
      );
    }
  }
}
