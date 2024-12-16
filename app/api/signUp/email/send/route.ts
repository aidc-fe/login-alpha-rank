import { ERROR_CONFIG } from "@/lib/errors";
import {
  createVerificationToken,
  findClientByClientId,
  isUserExist,
} from "@/lib/database";
import { sendVerificationEmail } from "@/lib/email";
import { formateError, formatSuccess } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userInfo = await request.json();
    const host = request.headers.get("host") || request.headers.get(":authority");
    const baseUrl = `https://${host}`;

    // 早期验证
    if (!userInfo.email) {
      return NextResponse.json(formateError(ERROR_CONFIG.AUTH.NEED_EMAIL));
    }

    const existingUser = await isUserExist({
      email: userInfo.email,
      businessDomainId: userInfo.businessDomainId,
    });

    if (existingUser) {
      return NextResponse.json(formateError(ERROR_CONFIG.AUTH.USER_EXIST));
    }

    // 并行处理异步操作
    const [newToken, client] = await Promise.all([
      createVerificationToken({
        identifier: userInfo.email,
        name: userInfo.name,
        password: userInfo.password,
        targetUrl: userInfo.targetUrl,
        type: "signUp",
      }),
      findClientByClientId(userInfo.client_id),
    ]);

    const verificationLink = `${baseUrl}/api/signUp/email/verify?token=${newToken.token}&businessDomainId=${userInfo.businessDomainId}`;

    const emailConfig = {
      mail_server_host: client.mail_server_host,
      mail_server_port: client.mail_server_port,
      mail_server_user: client.mail_server_user,
      mail_server_password: client.mail_server_password,
      mail_template_image: client.mail_template_image,
    };

    const emailContent = {
      title: "Verify your email address",
      description: "To continue setting up your account, please verify your email address.",
      btnContent: "Verify Email Address",
    };

    await sendVerificationEmail(
      userInfo.email,
      verificationLink,
      "Verify your email",
      emailContent,
      emailConfig,
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
