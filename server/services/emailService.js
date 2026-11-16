import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  const user = (process.env.GMAIL_USER || process.env.EMAIL_USER || '').trim();
  const rawPass = (process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || '').trim();
  // Strip spaces from Google App Password (e.g., 'abcd efgh ijkl mnop' -> 'abcdefghijklmnop')
  const pass = rawPass.replace(/\s+/g, '');

  if (user && pass) {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: { user, pass }
      });
      console.log(`[EmailService] Initialized official Gmail SMTP transport for ${user} (host: smtp.gmail.com, port: 465, secure: true)`);
    }
    return { mailer: transporter, user };
  }
  return null;
}

/**
 * Returns current email configuration status without exposing credentials
 */
export function getEmailStatus() {
  const user = (process.env.GMAIL_USER || process.env.EMAIL_USER || '').trim();
  const rawPass = (process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || '').trim();
  const pass = rawPass.replace(/\s+/g, '');
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const configured = Boolean((user && pass) || resendKey);

  let maskedUser = 'missing';
  if (user) {
    const parts = user.split('@');
    maskedUser = parts.length === 2 ? `${parts[0].slice(0, 3)}***@${parts[1]}` : `${user.slice(0, 3)}***`;
  }

  return {
    configured,
    active_channel: resendKey ? 'resend_https' : (user && pass ? 'gmail_smtp' : 'none'),
    gmail_user: maskedUser,
    has_gmail_password: Boolean(pass),
    has_resend_api_key: Boolean(resendKey),
    smtp_host: 'smtp.gmail.com',
    port: 465,
    secure: true
  };
}

/**
 * Builds a clean, responsive, dark-and-orange branded HTML email template for Humo Logistics
 */
function buildOtpEmailHtml({ purposeTitle, formattedCode, expiryMinutes = 10 }) {
  return `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${purposeTitle} — Humo Logistics</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0F19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0B0F19; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; background-color: #131B2E; border: 1px solid rgba(249, 115, 22, 0.35); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Brand Accent Bar -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #EA580C 0%, #F97316 50%, #FDBA74 100%);"></td>
          </tr>

          <!-- Header / Brand Section -->
          <tr>
            <td style="padding: 32px 32px 20px; text-align: center;">
              <!-- Humo Phoenix Emblem -->
              <div style="display: inline-block; margin-bottom: 14px;">
                <div style="width: 56px; height: 56px; line-height: 56px; margin: 0 auto; background: rgba(249, 115, 22, 0.12); border: 1.5px solid rgba(249, 115, 22, 0.4); border-radius: 50%; font-size: 26px;">
                  🦅
                </div>
              </div>
              <div style="font-size: 24px; font-weight: 800; letter-spacing: 0.5px; margin: 0; color: #FFFFFF;">
                Humo <span style="color: #F97316;">Logistics</span>
              </div>
              <div style="font-size: 13px; color: #94A3B8; margin-top: 6px; letter-spacing: 0.3px;">
                Xalqaro va mahalliy yuk tashish tizimi
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="height: 1px; background-color: #1E293B;"></div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 32px 20px; text-align: center;">
              <h1 style="font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 0 0 12px;">
                ${purposeTitle}
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #94A3B8; margin: 0 0 26px;">
                Humo Logistics platformasidagi hisobingiz uchun bir martalik xavfsizlik kodi:
              </p>

              <!-- 6-Digit Code Box -->
              <div style="background-color: #0B0F19; border: 2px dashed #F97316; border-radius: 14px; padding: 20px 16px; margin: 0 auto 26px; max-width: 380px;">
                <div style="font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #F97316; text-shadow: 0 2px 10px rgba(249, 115, 22, 0.3);">
                  ${formattedCode}
                </div>
              </div>

              <!-- Expiry & Security Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: rgba(30, 41, 59, 0.6); border-radius: 10px; padding: 14px 16px; margin-bottom: 8px;">
                <tr>
                  <td style="font-size: 13px; line-height: 1.5; color: #CBD5E1; text-align: left;">
                    ⏱️ <strong>Eslatma:</strong> Ushbu kod <strong>${expiryMinutes} daqiqa</strong> davomida amal qiladi. Agar bu so'rovni siz yubormagan bo'lsangiz, ushbu xatga e'tibor bermang.
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #64748B; margin: 16px 0 0; line-height: 1.5;">
                🔒 Xavfsizlik qoidasi: Humo Logistics ma'muriyati hech qachon sizdan ushbu kodni yoki parolingizni so'ramaydi.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px 28px; background-color: #0D1322; border-top: 1px solid #1E293B; text-align: center;">
              <p style="font-size: 12px; color: #64748B; margin: 0 0 6px;">
                © ${new Date().getFullYear()} Humo Logistics platformasi. Barcha huquqlar himoyalangan.
              </p>
              <p style="font-size: 11px; color: #475569; margin: 0;">
                O'zbekiston bo'yicha va xalqaro yuk tashuvchilar hamjamiyati
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Builds plain-text fallback content so spam filters do not flag HTML-only emails
 */
function buildOtpEmailText({ purposeTitle, rawCode, expiryMinutes = 10 }) {
  return `Humo Logistics — Xalqaro va mahalliy yuk tashish tizimi

${purposeTitle}

Sizning bir martalik tasdiqlash kodingiz: ${rawCode}

Ushbu kod ${expiryMinutes} daqiqa davomida amal qiladi. Agar bu so'rovni siz yubormagan bo'lsangiz, ushbu xatga e'tibor bermang.

Xavfsizlik eslatmasi: Humo Logistics xodimlari hech qachon sizdan ushbu kodni yoki parolingizni so'ramaydi.

© ${new Date().getFullYear()} Humo Logistics. Barcha huquqlar himoyalangan.`;
}

/**
 * Send 6-digit verification code or password reset code
 * Official sender: "Humo Logistics" <process.env.GMAIL_USER>
 */
export async function sendOtpEmail(toEmail, code, purpose = "Ro'yxatdan o'tishni tasdiqlash kodi") {
  const transportData = getTransporter();
  const rawCode = code.toString().trim();
  const formattedCode = rawCode.length === 6 ? `${rawCode.slice(0, 3)} ${rawCode.slice(3)}` : rawCode;

  const purposeTitle = purpose.includes('tiklash')
    ? 'Parolni tiklash kodi'
    : (purpose.includes("o'tish") || purpose.includes('Ro‘yxatdan') || purpose.includes("Ro'yxatdan"))
      ? "Ro'yxatdan o'tishni tasdiqlash kodi"
      : purpose;

  const subject = `Humo Logistics: ${purposeTitle} (${formattedCode})`;
  const html = buildOtpEmailHtml({ purposeTitle, formattedCode, expiryMinutes: 10 });
  const text = buildOtpEmailText({ purposeTitle, rawCode, expiryMinutes: 10 });

  const fromEmail = transportData?.user || process.env.GMAIL_USER || process.env.EMAIL_USER || 'noreply@humologistics.uz';
  const fromHeader = `"Humo Logistics" <${fromEmail}>`;

  // 1. If RESEND_API_KEY is configured, send via Resend HTTPS REST API (bypasses cloud SMTP port blocks)
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Humo Logistics <onboarding@resend.dev>',
          to: [toEmail],
          subject,
          html,
          text
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`[EmailService] Sent email via Resend HTTPS API to ${toEmail}: id=${data.id}`);
        return { success: true, mode: 'resend_https', messageId: data.id };
      } else {
        console.warn(`[EmailService] Resend API error:`, data);
      }
    } catch (httpErr) {
      console.error(`[EmailService] Resend HTTPS call failed:`, httpErr.message);
    }
  }

  // 2. Send via Gmail SMTP
  if (transportData?.mailer) {
    try {
      const info = await transportData.mailer.sendMail({
        from: fromHeader,
        to: toEmail,
        subject,
        text,
        html
      });
      console.log(`[EmailService] Official Humo Logistics email sent successfully to ${toEmail}: messageId=${info.messageId}`);
      return { success: true, mode: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.error(`[EmailService] Failed to send email via SMTP to ${toEmail}:`, {
        code: err.code,
        command: err.command,
        response: err.response,
        message: err.message
      });

      const isTimeout = err.code === 'ETIMEDOUT' || err.message?.includes('timeout');
      const errorMsg = isTimeout
        ? `Gmail SMTP ulanish vaqti tugadi (ETIMEDOUT). Render.com bepul hostingida 465/587 portlar cheklangan bo‘lishi mumkin. Telefon orqali ro‘yxatdan o‘tish yoki RESEND_API_KEY qo‘shish tavsiya etiladi.`
        : `Gmail SMTP orqali email yuborishda xatolik: ${err.message} (${err.code || 'UNKNOWN'})`;

      return {
        success: false,
        error: 'smtp_error',
        message: errorMsg,
        details: { code: err.code, response: err.response }
      };
    }
  } else {
    console.warn(`[EmailService] GMAIL_USER or GMAIL_APP_PASSWORD missing in environment.`);
    console.log(`=======================================================`);
    console.log(`[EmailService: SIMULATED HUMO LOGISTICS GMAIL OTP]`);
    console.log(`From: ${fromHeader}`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Verification Code: [ ${formattedCode} ] (Expires in 10 minutes)`);
    console.log(`Note: Configure GMAIL_USER and GMAIL_APP_PASSWORD in environment for live SMTP delivery.`);
    console.log(`=======================================================`);
    return {
      success: false,
      error: 'email_not_configured',
      message: 'Email xizmati sozlanmagan: GMAIL_USER yoki GMAIL_APP_PASSWORD o‘zgaruvchisi topilmadi. Render.com muhitida Environment Variables sozlanishi kerak.',
      details: { configured: false }
    };
  }
}

/**
 * Send Registration Verification Email
 */
export async function sendRegistrationOtpEmail(toEmail, code) {
  return sendOtpEmail(toEmail, code, "Ro'yxatdan o'tishni tasdiqlash kodi");
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordResetEmail(toEmail, code) {
  return sendOtpEmail(toEmail, code, "Parolni tiklash kodi");
}
