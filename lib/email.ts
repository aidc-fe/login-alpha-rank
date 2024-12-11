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
  emailConfig: {
    emailServer: string | null;
    emailForm: string | null;
  },
  color?: string | null
) {
  console.log("supportEmail", emailConfig);

  if (!emailConfig.emailServer || !emailConfig.emailForm) {
    throw new Error("Email server or email form is not set");
  }

  const transporter = nodemailer.createTransport(`smtps://${emailConfig.emailServer}`);


  const mailOptions = {
    from: emailConfig.emailForm, // 发件人
    to, // 收件人
    subject,
    html: `
      <h1 style="color: rgb(32, 33, 35); font-size: 32px; line-height: 40px; margin: 0px 0px 20px;"> ${displayContent.title}</h1>
      <span style="font-size: 20px; line-height: 24px;"> ${displayContent.description}</span>
    <p style="margin: 24px 0px 0px; text-align: left;"> 
    <a href=${verificationLink}
    style="display: inline-block; text-decoration: none; background: ${color}; border-radius: 6px; color: ${color ? 'white' : ''};  font-size: 16px; line-height: 24px; font-weight: 500; padding: 12px 20px 11px; margin: 0px;" target="_blank">${displayContent.btnContent}</a>
    </p>
    <a href=${verificationLink} style="display: inline-block; font-size: 14px; line-height: 20px; color: ${color}; margin-top: 2px; word-break: break-all;" target="_blank">${verificationLink}</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
