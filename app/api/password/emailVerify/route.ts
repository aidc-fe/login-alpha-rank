import { ERROR_CONFIG } from "@/lib/errors";
import { createVerificationToken, findClientByClientId, getUser } from "@/lib/database";
import { sendVerificationEmail } from "@/lib/email";
import { formateError, formatSuccess } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password, businessDomainId, client_id, token } = (await request.json()) || {};

  // 验证turnstile token
  const result = await verifyToken(token);
  if (!result) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.TURNSTILE_VERIFY_FAIL));
  }

  // 获取当前请求的 host
  const host = request.headers.get("host") || request.headers.get(":authority");
  const baseUrl = `https://${host}`;

  if (!email) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.NEED_EMAIL));
  } else if (!(await getUser({ email, businessDomainId }))) {
    return NextResponse.json(formateError(ERROR_CONFIG.AUTH.USER_NOT_EXIST));
  } else {
    const newToken = await createVerificationToken({
      identifier: email, // 你需要的 identifier
      password,
      type: "passwordSet", // 可选
      businessDomainId,
    });
    const verificationLink = `${baseUrl}/api/password/set?token=${newToken.token}`;
    const client = await findClientByClientId(client_id);

    // 发送验证邮件
    await sendVerificationEmail(
      email,
      verificationLink,
      `Set ${client?.name}'s password `,
      {
        title: "Set Password",
        description:
          "We've received your new password setting requirement. If you did not request it, please just ignore it. Otherwise, finish setting your new password by the link below.",
        btnContent: "Set Password",
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
  }
}
