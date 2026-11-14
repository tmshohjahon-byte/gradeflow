import { NextRequest, NextResponse } from "next/server";
import {
  getPendingOtp,
  deletePendingOtp,
  incrementFailedAttempts,
} from "@/lib/serverOtp";
import { isValidEmail, isValidOtpFormat } from "@/lib/security/validator";
import { constantTimeCompare } from "@/lib/security/crypto";
import { saveUser, findUserByEmail } from "@/lib/serverUserStore";
import { UserProfile } from "@/types/database";

const MAX_FAILED_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Noto'g'ri so'rov formati (Invalid JSON)." },
        { status: 400 }
      );
    }

    const { email, code } = body;

    // 1. Strict Format Validation
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Noto'g'ri email formati." },
        { status: 400 }
      );
    }

    if (!isValidOtpFormat(code)) {
      return NextResponse.json(
        { success: false, message: "Kod 6 xonali raqam bo'lishi kerak." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    // 2. Lookup Pending OTP
    const pending = getPendingOtp(cleanEmail);
    if (!pending) {
      return NextResponse.json(
        {
          success: false,
          message: "Ushbu email uchun faol kod topilmadi yoki muddati o'tgan. Yangi kod so'rang.",
        },
        { status: 400 }
      );
    }

    // 3. TTL Expiration Check (10 minutes)
    if (Date.now() > pending.expiresAt) {
      deletePendingOtp(cleanEmail);
      return NextResponse.json(
        {
          success: false,
          message: "Kodning amal qilish muddati (10 daqiqa) tugagan. Yangi kod so'rang.",
        },
        { status: 400 }
      );
    }

    // 4. Brute-Force Shield: Lockout after 5 failed attempts
    if (pending.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      deletePendingOtp(cleanEmail);
      return NextResponse.json(
        {
          success: false,
          lockedOut: true,
          message:
            "Xavfsizlik yuzasidan ushbu kod bloklandi (5 ta noto'g'ri urinish). Iltimos, yangi kod so'rang.",
        },
        { status: 403 }
      );
    }

    // 5. Constant-Time Cryptographic Comparison (Side-Channel Timing Attack Prevention)
    const isCodeValid = constantTimeCompare(pending.code, cleanCode);

    if (!isCodeValid) {
      const attemptsCount = incrementFailedAttempts(cleanEmail);
      const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - attemptsCount);

      if (remainingAttempts === 0) {
        deletePendingOtp(cleanEmail);
        return NextResponse.json(
          {
            success: false,
            lockedOut: true,
            message:
              "Xavfsizlik yuzasidan ushbu kod bloklandi (5 ta noto'g'ri urinish). Iltimos, yangi kod so'rang.",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          remainingAttempts,
          message: `Kiritilgan 6 xonali kod noto'g'ri. Qolgan urinishlar soni: ${remainingAttempts} ta.`,
        },
        { status: 400 }
      );
    }

    // 6. Verification Successful! Build or Retrieve Verified Profile
    const existing = findUserByEmail(cleanEmail);
    const userId = existing
      ? existing.id
      : "usr-" + Math.random().toString(36).substring(2, 9);

    const userProfile: UserProfile = {
      id: userId,
      email: cleanEmail,
      full_name: pending.fullName || existing?.fullName || cleanEmail.split("@")[0],
      school_name: existing?.schoolName || "Akademik ta'lim",
      grade_level: pending.gradeLevel || existing?.gradeLevel || "Talaba / O'quvchi",
      created_at: existing?.createdAt || new Date().toISOString(),
    };

    // Save into persistent server store so user can log in with password from ANY device
    saveUser({
      id: userId,
      email: cleanEmail,
      fullName: userProfile.full_name,
      passwordHash: pending.passwordHash || existing?.passwordHash || "",
      gradeLevel: userProfile.grade_level,
      schoolName: userProfile.school_name,
      createdAt: userProfile.created_at,
    });

    // 7. Atomic Invalidation: Purge verified OTP from memory immediately
    deletePendingOtp(cleanEmail);

    return NextResponse.json({
      success: true,
      user: userProfile,
      message: "Gmail muvaffaqiyatli tasdiqlandi!",
    });
  } catch (error: any) {
    console.error("verify-otp server error:", error);
    return NextResponse.json(
      { success: false, message: "Kutilmagan server xatoligi yuz berdi." },
      { status: 500 }
    );
  }
}
