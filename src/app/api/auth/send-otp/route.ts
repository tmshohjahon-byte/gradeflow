import { NextRequest, NextResponse } from "next/server";
import { sendRealEmail, getEmailConfigStatus } from "@/lib/emailService";
import { setPendingOtp } from "@/lib/serverOtp";
import { isValidEmail, sanitizeText } from "@/lib/security/validator";
import { checkSendOtpRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { hashPassword } from "@/lib/security/crypto";
import { findUserByEmail } from "@/lib/serverUserStore";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Parse JSON body with safety
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Noto'g'ri so'rov formati (Invalid JSON)." },
        { status: 400 }
      );
    }

    const { email, fullName, password, gradeLevel } = body;

    // 1. Strict Email Validation (RFC 5322 & CRLF Injection Prevention)
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Iltimos, to'g'ri va haqiqiy email manzilini kiriting.",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Prevent Duplicate Registrations: If user is registering, check if email already exists
    if (fullName && password) {
      const existingUser = findUserByEmail(cleanEmail);
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            alreadyRegistered: true,
            message:
              "Ushbu email bilan allaqachon ro'yxatdan o'tilgan! Iltimos, 'Kirish' bo'limi orqali kiring.",
          },
          { status: 400 }
        );
      }
    }

    // 3. Sliding Window Rate Limiting (Prevents spam, email bombs, DDoS)
    const rateLimitCheck = checkSendOtpRateLimit(clientIp, cleanEmail);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          rateLimited: true,
          retryAfterSeconds: rateLimitCheck.retryAfterSeconds,
          message: rateLimitCheck.message,
        },
        { status: 429 }
      );
    }

    // 3. Check SMTP Configuration
    const configStatus = getEmailConfigStatus();
    if (!configStatus.isConfigured) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          message:
            "Haqiqiy xat yuborish uchun Gmail yoki Resend sozlanmagan. Iltimos, .env.local ga GMAIL_USER va GMAIL_APP_PASSWORD kiriting.",
        },
        { status: 400 }
      );
    }

    // 4. Sanitize Input Fields (XSS Prevention)
    const safeFullName = sanitizeText(fullName, 60);
    const safeGradeLevel = sanitizeText(gradeLevel, 40);

    // 5. Secure Password Hashing (PBKDF2 with Cryptographic Salt)
    const securePasswordHash = password ? hashPassword(password) : undefined;

    // 6. Generate CSPRNG 6-digit Code & Register in OTP Store
    const { code } = setPendingOtp(cleanEmail, {
      fullName: safeFullName,
      passwordHash: securePasswordHash,
      gradeLevel: safeGradeLevel,
    });

    // 7. Dispatch Real Email via Google SMTP
    const sendResult = await sendRealEmail({
      to: cleanEmail,
      code,
      fullName: safeFullName,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        {
          success: false,
          configured: true,
          message: sendResult.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      configured: true,
      provider: sendResult.provider,
      message: `Haqiqiy tasdiqlash kodi ${cleanEmail} pochtangizga yuborildi. Iltimos, Gmail pochtangizni tekshiring!`,
    });
  } catch (error: any) {
    console.error("send-otp server error:", error);
    return NextResponse.json(
      { success: false, message: "Kutilmagan server xatoligi yuz berdi." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const status = getEmailConfigStatus();
  return NextResponse.json(status);
}
