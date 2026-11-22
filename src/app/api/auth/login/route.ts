import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/serverUserStore";
import { isValidEmail } from "@/lib/security/validator";
import {
  getClientIp,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginRateLimit,
} from "@/lib/security/rateLimiter";
import { signSessionToken, SESSION_COOKIE_OPTIONS } from "@/lib/security/jwt";

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

    const { email, password } = body;
    const clientIp = getClientIp(req);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email va parolni kiriting." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Noto'g'ri email formati." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Sliding Window Brute-Force Rate Limiting (IP & Email lockout)
    const rateLimit = checkLoginRateLimit(clientIp, cleanEmail);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          rateLimited: true,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
          message: rateLimit.message,
        },
        { status: 429 }
      );
    }

    // 2. Authenticate against persistent server user store
    const authResult = authenticateUser(cleanEmail, password);

    if (!authResult.success || !authResult.user) {
      const failedCount = recordFailedLogin(clientIp, cleanEmail);
      const remaining = Math.max(0, 5 - failedCount);

      const message =
        remaining > 0
          ? `Email yoki parol noto'g'ri kiritildi. Qolgan urinishlar: ${remaining} ta.`
          : "Juda ko'p xato urinishlar qilindi. Xavfsizlik yuzasidan ushbu hisob 15 daqiqaga bloklandi.";

      return NextResponse.json(
        {
          success: false,
          remainingAttempts: remaining,
          message,
        },
        { status: 401 }
      );
    }

    // 3. Reset failed login attempts on success
    resetLoginRateLimit(clientIp, cleanEmail);

    // 4. Create cryptographically signed enterprise session token (JWT)
    const sessionToken = signSessionToken({
      userId: authResult.user.id,
      email: authResult.user.email,
      fullName: authResult.user.full_name,
    });

    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      message: "Xush kelibsiz!",
    });

    // 5. Set HttpOnly; Secure; SameSite=Lax session cookie
    response.cookies.set(
      SESSION_COOKIE_OPTIONS.name,
      sessionToken,
      SESSION_COOKIE_OPTIONS
    );

    return response;
  } catch (error: any) {
    console.error("login API error:", error);
    return NextResponse.json(
      { success: false, message: "Kutilmagan server xatoligi yuz berdi." },
      { status: 500 }
    );
  }
}
