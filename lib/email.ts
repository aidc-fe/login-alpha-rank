// lib/mail.js
import nodemailer from "nodemailer";

export async function sendVerificationEmail(
  to: string,
  verificationLink: string,
  subject: string,
  displayContent: {
    title: string;
    description: string;
    btnContent: string;
  },
  {
    mail_server_host,
    mail_server_port,
    mail_server_user,
    mail_server_password,
    mail_template_image,
  }: {
    mail_server_host: string;
    mail_server_port: string;
    mail_server_user: string;
    mail_server_password: string;
    mail_template_image: string | null;
  },
  color?: string | null
) {
  const transporter = nodemailer.createTransport(
    `smtps://${mail_server_user}:${mail_server_password}@${mail_server_host}:${mail_server_port}`
  );

  const mailOptions = {
    from: mail_server_user, // 发件人
    to, // 收件人
    subject,
    html: `
      <div style="width: 500px; margin: 0 auto;">
        <h1 style="color: #000; font-size: 20px; line-height: 24px; margin: 0px 0px 22px;"> ${
          displayContent.title
        }</h1>
        <div style="margin: 0; font-size: 16px; line-height: 24px; color: #2c2c2c">${displayContent.description}</div>
        <p style="margin: 16px 0px 0px; text-align: center;"> 
        <a href=${verificationLink}
          style="width: 100%; height: 56px; display: inline-block; text-decoration: none; background: ${color}; border-radius: 20px; color: ${
            color ? "white" : ""
          };  font-size: 20px; line-height: 56px; font-weight: 700; text-align: center;" target="_blank">${
            displayContent.btnContent
          }</a>
        <a style="margin-top: 20px" href=${verificationLink}>${verificationLink}</a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
