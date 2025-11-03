import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendQRMail(to, name, qrUrl, token) {
  const mailOptions = {
    from: `"DJS NOVA" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Moongazing 2.0 QR Code 🌙",
    html: `
      <h2>Hello ${name},</h2>
      <p>Welcome to <b>Moongazing 2.0</b>! 🌕</p>
      <p>Your unique entry token: <b>${token}</b></p>
      <p>Here is your QR code:</p>
      <img src="${qrUrl}" alt="QR Code" style="width:200px;height:200px;"/>
      <p>Keep this safe — you'll need it for event entry.</p>
      <br/>
      <p>– DJS NOVA Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Mail sent to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending mail to ${to}:`, error);
  }
}
