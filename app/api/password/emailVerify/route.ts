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
  const { email, password, businessDomainId, client_id } = await request.json() || {};
  
  // 参数验证
  if (!email) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.NEED_EMAIL));
  }

  // 获取当前请求的 host
  const host = request.headers.get("host") || request.headers.get(":authority");
  const baseUrl = `https://${host}`;

  try {
    // 检查用户是否存在
    const existingUser = await getUser({ email, businessDomainId });
    if (!existingUser) {
      return NextResponse.json(formateError(ERROR_CONFIG.AUTH.USER_NOT_EXIST));
    }

    // 并行处理异步操作
    const [verificationToken, client] = await Promise.all([
      createVerificationToken({
        identifier: email,
        password,
        type: "passwordSet",
      }),
      findClientByClientId(client_id)
    ]);

    const verificationLink = `${baseUrl}/api/password/set?token=${verificationToken.token}&businessDomainId=${businessDomainId}`;

    const emailConfig = {
      mail_server_host: client.mail_server_host,
      mail_server_port: client.mail_server_port,
      mail_server_user: client.mail_server_user,
      mail_server_password: client.mail_server_password,
      mail_template_image: client.mail_template_image,
    };

    const emailContent = {
      title: "Set Password",
      description: "We've received your new password setting requirement. If you did not request it, please just ignore it. Otherwise, finish setting your new password by the link below.",
      btnContent: "Set Password",
    };

    await sendVerificationEmail(
      email,
      verificationLink,
      `Set ${client.name}'s password`,
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
    console.error("Password reset email sending failed:", error);
    return NextResponse.json(formateError(ERROR_CONFIG.DATABASE.VERIFICATION_TOKEN.GENERATE_FAIL));
  }
}
