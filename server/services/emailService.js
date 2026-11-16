/**
 * Official Humo Logistics Transactional Email Service
 * Uses HTTPS REST APIs (Brevo & Resend) to eliminate raw SMTP timeouts (ETIMEDOUT) on cloud hosts (Render.com)
 */

export function getSanitizedBrevoKey() {
  let key = (process.env.BREVO_API_KEY || '').trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  return key;
}

export function getSanitizedSenderEmail() {
  let email = (
    process.env.SENDER_EMAIL ||
    process.env.GMAIL_USER ||
    process.env.EMAIL_USER ||
    'no-reply@humologistics.uz'
  ).trim();
  if ((email.startsWith('"') && email.endsWith('"')) || (email.startsWith("'") && email.endsWith("'"))) {
    email = email.slice(1, -1).trim();
  }
  return email;
}

export function getSanitizedResendKey() {
  let key = (process.env.RESEND_API_KEY || '').trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  return key;
}

/**
 * Returns current email configuration status without exposing secrets
 */
export function getEmailStatus() {
  const brevoKey = getSanitizedBrevoKey();
  const resendKey = getSanitizedResendKey();
  const senderEmail = getSanitizedSenderEmail();

  const configured = Boolean(brevoKey || resendKey);
  const activeChannel = brevoKey ? 'brevo_https' : (resendKey ? 'resend_https' : 'unconfigured');

  let maskedSender = senderEmail;
  if (senderEmail && senderEmail.includes('@')) {
    const parts = senderEmail.split('@');
    maskedSender = `${parts[0].slice(0, 3)}***@${parts[1]}`;
  }

  return {
    configured,
    active_channel: activeChannel,
    brevo_configured: Boolean(brevoKey),
    resend_configured: Boolean(resendKey),
    sender_email: maskedSender,
    https_only: true,
    smtp_disabled: true
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
 * Builds plain-text fallback content
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
 * Send OTP via Brevo Transactional Email API (HTTPS REST)
 * Brevo allows sending transactional emails from any verified sender email (including Gmail)
 * without needing custom domain DNS records!
 */
async function sendViaBrevo(brevoApiKey, { toEmail, subject, html, text }) {
  const apiKey = (brevoApiKey || getSanitizedBrevoKey()).trim();
  const senderEmail = getSanitizedSenderEmail();

  if (!apiKey) {
    const err = new Error("BREVO_API_KEY sozlanmagan. Iltimos, Render environment'da BREVO_API_KEY ni sozlang.");
    err.status = 500;
    throw err;
  }

  if (apiKey.startsWith('xsmtpsib-')) {
    const err = new Error("Render'da SMTP kaliti (xsmtpsib-) kiritilgan. Brevo -> SMTP & API -> API Keys bo'limidan xkeysib- bilan boshlanuvchi kalit oling!");
    err.status = 400;
    err.brevoCode = 'smtp_key_not_allowed';
    throw err;
  }

  if (!apiKey.startsWith('xkeysib-')) {
    const err = new Error(`Noto'g'ri Brevo API kalit formati (kalit "${apiKey.slice(0, 8)}..." bilan boshlanadi). Brevo API kalitlari "xkeysib-" bilan boshlanishi kerak. Brevo -> SMTP & API -> API Keys bo'limidan kalit oling.`);
    err.status = 400;
    err.brevoCode = 'invalid_key_prefix';
    throw err;
  }

  const payload = {
    sender: {
      name: 'Humo Logistics',
      email: senderEmail
    },
    to: [{ email: toEmail.trim().toLowerCase() }],
    subject,
    htmlContent: html,
    textContent: text
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = data.message || (data.code ? `[${data.code}] ${data.message || ''}` : `Brevo API HTTP ${response.status}`);
    if (response.status === 401 || (data.message && data.message.toLowerCase().includes('key not found'))) {
      errorMsg = "Brevo API kaliti topilmadi yoki yaroqsiz (Key not found). Brevo -> SMTP & API -> API Keys bo'limiga kirib yangi API kalit ('xkeysib-...') yarating va Render'da BREVO_API_KEY o'zgaruvchisiga o'rnating.";
    }
    console.error(`[EmailService:Brevo] Delivery failed (HTTP ${response.status}):`, data);
    const err = new Error(errorMsg);
    err.brevoCode = data.code || 'unauthorized';
    err.status = response.status >= 400 && response.status < 600 ? response.status : 500;
    throw err;
  }

  console.log(`[EmailService:Brevo] Email delivered successfully to ${toEmail}: messageId=${data.messageId}`);
  return { success: true, mode: 'brevo_https', messageId: data.messageId };
}

/**
 * Send OTP via Resend API (HTTPS REST)
 */
async function sendViaResend(resendApiKey, { toEmail, subject, html, text }) {
  const apiKey = (resendApiKey || getSanitizedResendKey()).trim();
  const senderEmail = getSanitizedSenderEmail();

  const payload = {
    from: senderEmail.includes('<') ? senderEmail : `Humo Logistics <${senderEmail}>`,
    to: [toEmail.trim().toLowerCase()],
    subject,
    html,
    text
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Resend API HTTP ${response.status}`;
    console.error(`[EmailService:Resend] Delivery failed (HTTP ${response.status}):`, data);
    const err = new Error(errorMsg);
    err.status = response.status >= 400 && response.status < 600 ? response.status : 500;
    throw err;
  }

  console.log(`[EmailService:Resend] Email delivered successfully to ${toEmail}: id=${data.id}`);
  return { success: true, mode: 'resend_https', messageId: data.id };
}

/**
 * Send 6-digit verification code or password reset code
 * Primary: Brevo HTTPS REST API
 * Secondary: Resend HTTPS REST API
 * Strictly surfaces real API errors if delivery fails
 */
export async function sendOtpEmail(toEmail, code, purpose = "Ro'yxatdan o'tishni tasdiqlash kodi") {
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

  const brevoKey = getSanitizedBrevoKey();
  const resendKey = getSanitizedResendKey();

  // 1. Strictly use Brevo Transactional Email API (HTTPS port 443)
  if (brevoKey) {
    try {
      return await sendViaBrevo(brevoKey, { toEmail, subject, html, text });
    } catch (brevoErr) {
      console.error(`[EmailService] Brevo delivery failed:`, brevoErr.message);
      if (resendKey) {
        try {
          return await sendViaResend(resendKey, { toEmail, subject, html, text });
        } catch (resendErr) {
          console.error(`[EmailService] Resend fallback also failed:`, resendErr.message);
          const combinedErr = new Error(`Email yetkazib berishda xatolik: Brevo (${brevoErr.message}), Resend (${resendErr.message})`);
          combinedErr.status = brevoErr.status || 500;
          throw combinedErr;
        }
      }
      // Never pretend the email was sent if Brevo rejected it!
      throw brevoErr;
    }
  }

  // 2. Try Resend if configured
  if (resendKey) {
    return await sendViaResend(resendKey, { toEmail, subject, html, text });
  }

  // 3. If neither key is configured, surface error
  const err = new Error("Email xizmati sozlanmagan. Iltimos, Render environment'da BREVO_API_KEY va SENDER_EMAIL ni sozlang.");
  err.status = 500;
  throw err;
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
