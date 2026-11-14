import nodemailer from "nodemailer";
import { Resend } from "resend";

export type SendEmailParams = {
  to: string;
  code: string;
  fullName?: string;
};

export type EmailSendResult = {
  success: boolean;
  provider?: "resend" | "gmail" | "smtp";
  message: string;
  configured: boolean;
};

export function isEmailConfigured(): boolean {
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasGmail = Boolean(
    (process.env.GMAIL_USER || process.env.SMTP_USER) &&
    (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS)
  );
  return hasResend || hasGmail;
}

export function getEmailConfigStatus() {
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasGmail = Boolean(
    (process.env.GMAIL_USER || process.env.SMTP_USER) &&
    (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS)
  );

  return {
    isConfigured: hasResend || hasGmail,
    activeProvider: hasResend ? "Resend API" : hasGmail ? "Gmail SMTP" : "none",
    smtpUser: process.env.GMAIL_USER || process.env.SMTP_USER || null,
  };
}

function generateEmailHtml(code: string, fullName?: string): string {
  const name = fullName ? fullName : "Hurmatli talaba";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GradeFlow Tasdiqlash Kodi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090D16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090D16; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" style="max-width: 520px; background-color: #0D1322; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #6366F1, #8B5CF6); width: 44px; height: 44px; border-radius: 12px; line-height: 44px; text-align: center; color: #FFFFFF; font-weight: bold; font-size: 22px;">
                G
              </div>
              <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 12px 0 4px 0; letter-spacing: -0.5px;">
                GradeFlow
              </h1>
              <p style="color: #94A3B8; font-size: 13px; margin: 0;">
                Akademik Monitoring va Baholar Tizimi
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="border-top: 1px solid #1E293B; padding-top: 24px;">
              <p style="color: #F1F5F9; font-size: 15px; line-height: 1.5; margin: 0 0 12px 0;">
                Salom, <strong>${name}</strong>!
              </p>
              <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                GradeFlow hisobingiz xavfsizligini ta'minlash uchun 6 xonali tasdiqlash kodingiz:
              </p>

              <!-- OTP Code Display -->
              <div style="text-align: center; background-color: #111827; border: 2px dashed #6366F1; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #818CF8;">
                  ${code}
                </span>
              </div>

              <p style="color: #94A3B8; font-size: 12px; line-height: 1.5; margin: 0 0 8px 0; text-align: center;">
                ⏳ Ushbu kod <strong>10 daqiqa</strong> davomida amal qiladi.
              </p>
              <p style="color: #64748B; font-size: 11px; line-height: 1.4; margin: 0; text-align: center;">
                Agar siz ushbu amalni bajarmagan bo'lsangiz, xatni shunchaki e'tiborsiz qoldiring.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #1E293B; margin-top: 28px; padding-top: 20px; text-align: center;">
              <p style="color: #475569; font-size: 11px; margin: 0;">
                &copy; ${new Date().getFullYear()} GradeFlow Academic. Barcha huquqlar himoyalangan.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendRealEmail({
  to,
  code,
  fullName,
}: SendEmailParams): Promise<EmailSendResult> {
  const cleanTo = to.trim().toLowerCase();
  const subject = `GradeFlow: Tasdiqlash kodi - ${code}`;
  const html = generateEmailHtml(code, fullName);

  // 1. Try Resend if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.RESEND_FROM || "GradeFlow <onboarding@resend.dev>";
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: cleanTo,
        subject,
        html,
      });

      if (error) {
        console.error("Resend send error:", error);
        return {
          success: false,
          provider: "resend",
          configured: true,
          message: `Resend xatoligi: ${error.message}`,
        };
      }

      return {
        success: true,
        provider: "resend",
        configured: true,
        message: `Haqiqiy tasdiqlash kodi ${cleanTo} manziliga muvaffaqiyatli yuborildi!`,
      };
    } catch (e: any) {
      console.error("Resend exception:", e);
      return {
        success: false,
        provider: "resend",
        configured: true,
        message: e.message || "Resend orqali xat yuborishda xatolik.",
      };
    }
  }

  // 2. Try Gmail / SMTP if configured
  const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const smtpPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    try {
      const host = process.env.SMTP_HOST || "smtp.gmail.com";
      const port = Number(process.env.SMTP_PORT) || 465;
      const secure = port === 465;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"GradeFlow" <${smtpUser}>`,
        to: cleanTo,
        subject,
        html,
      });

      return {
        success: true,
        provider: "gmail",
        configured: true,
        message: `Haqiqiy tasdiqlash kodi ${cleanTo} manziliga Gmail orqali yuborildi!`,
      };
    } catch (e: any) {
      console.error("SMTP / Gmail send error:", e);
      return {
        success: false,
        provider: "gmail",
        configured: true,
        message: `Gmail SMTP xatoligi: ${e.message}`,
      };
    }
  }

  // 3. Not configured yet
  return {
    success: false,
    configured: false,
    message:
      "Haqiqiy Gmail orqali xat yuborish uchun SMTP yoki Resend sozlanmagan. Iltimos, .env.local fayliga GMAIL_USER va GMAIL_APP_PASSWORD (yoki RESEND_API_KEY) ni kiriting.",
  };
}

