import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

  if (user && pass) {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });
      console.log(`[EmailService] Initialized Gmail SMTP transport with ${user}`);
    }
    return transporter;
  }
  return null;
}

/**
 * Send 6-digit verification code or password reset code
 */
export async function sendOtpEmail(toEmail, code, purpose = 'Tasdiqlash kodi') {
  const mailer = getTransporter();
  const subject = `Humo Logistics: ${purpose} (${code})`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #ffffff; padding: 20px; }
        .card { max-width: 500px; margin: 0 auto; background: #131b2e; border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .logo { text-align: center; margin-bottom: 24px; font-size: 24px; font-weight: bold; color: #f97316; letter-spacing: 1px; }
        .title { font-size: 20px; font-weight: 600; text-align: center; margin-bottom: 12px; color: #ffffff; }
        .desc { font-size: 14px; color: #94a3b8; text-align: center; line-height: 1.5; margin-bottom: 24px; }
        .code-box { background: #1e293b; border: 2px dashed #f97316; border-radius: 12px; padding: 18px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316; margin-bottom: 24px; }
        .warning { font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⚡ HUMO LOGISTICS</div>
        <div class="title">${purpose}</div>
        <div class="desc">Humo Logistics tizimidagi hisobingiz uchun bir martalik xavfsizlik kodi. Kod 10 daqiqa davomida amal qiladi:</div>
        <div class="code-box">${code}</div>
        <div class="warning">Agar ushbu so'rovni siz yubormagan bo'lsangiz, xabarni e'tiborsiz qoldiring. Hech kimga ushbu kodni bermang.</div>
      </div>
    </body>
    </html>
  `;

  if (mailer) {
    try {
      const info = await mailer.sendMail({
        from: `"Humo Logistics" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
        to: toEmail,
        subject,
        html
      });
      console.log(`[EmailService] Email sent successfully to ${toEmail}: messageId=${info.messageId}`);
      return { success: true, mode: 'smtp' };
    } catch (err) {
      console.error(`[EmailService] Failed to send email via SMTP to ${toEmail}:`, err.message);
      console.log(`[EmailService] Fallback to console log. OTP Code for ${toEmail}: [${code}]`);
      return { success: true, mode: 'fallback', code };
    }
  } else {
    console.log(`=======================================================`);
    console.log(`[EmailService: SIMULATED GMAIL OTP]`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Verification Code: [ ${code} ] (Expires in 10 minutes)`);
    console.log(`Note: Configure GMAIL_USER and GMAIL_APP_PASSWORD in .env for live email delivery.`);
    console.log(`=======================================================`);
    return { success: true, mode: 'simulated', code };
  }
}

export async function sendPasswordResetEmail(toEmail, code) {
  return sendOtpEmail(toEmail, code, "Parolni qayta tiklash kodi");
}
