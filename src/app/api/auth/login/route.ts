import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/serverUserStore";
import { isValidEmail } from "@/lib/security/validator";
import { getClientIp } from "@/lib/security/rateLimiter";

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

    // Authenticate against persistent server user store
    const authResult = authenticateUser(cleanEmail, password);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.message || "Email yoki parol noto'g'ri kiritildi.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: authResult.user,
      message: "Xush kelibsiz!",
    });
  } catch (error: any) {
    console.error("login API error:", error);
    return NextResponse.json(
      { success: false, message: "Kutilmagan server xatoligi yuz berdi." },
      { status: 500 }
    );
  }
}

