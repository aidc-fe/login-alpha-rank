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
<p style="margin: 24px 0px 0px; text-align: left;"> 
<a href=${verificationLink}
 style="display: inline-block; text-decoration: none; background: #7c3aed; border-radius: 6px; color: white;  font-size: 16px; line-height: 24px; font-weight: 500; padding: 12px 20px 11px; margin: 0px;" target="_blank">${displayContent.btnContent}</a> 
</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
