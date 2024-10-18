// lib/mail.js
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true, // 使用SSL/TLS
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(
  to: string,
  verificationLink: string,
  subject: string,
  displayContent: {
    title: string;
    description: string;
    btnContent: string;
  }
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM, // 发件人
    to, // 收件人
    subject,
    html: `
      <h1 style="color: rgb(32, 33, 35); font-size: 32px; line-height: 40px; margin: 0px 0px 20px;"> ${displayContent.title}</h1>
      <p style="font-size: 16px; line-height: 24px;"> ${displayContent.description}</p>
      <table style="border-collapse: collapse; width: 100%; border-spacing: 20px; border: none; margin-top: 24px;">
        <tr>
          <td style="vertical-align: top; border: none; padding: 0; margin: 0; width: 100px;">
              <a href=${verificationLink} style="display: inline-block; text-decoration: none; background: #7c3aed; border-radius: 6px; color: white; font-size: 16px; line-height: 48px; text-align: center; font-weight: 500; width: 80px; height: 48px; margin: 0px;" target="_blank">${displayContent.btnContent}</a>
          </td>
          <td style="vertical-align: top; border: none; padding: 0; margin: 0;">
            <div style="padding-left: 16px;"><a href=${verificationLink} style="font-size: 14px; line-height: 20px; color: #7c3aed; word-break: break-all;" target="_blank">${verificationLink}</a></div>
          </td>
        </tr>
      </table>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
