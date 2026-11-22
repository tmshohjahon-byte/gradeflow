import { NextResponse } from "next/server";
import { SESSION_COOKIE_OPTIONS } from "@/lib/security/jwt";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Tizimdan muvaffaqiyatli chiqildi.",
    });

    // Clear session cookie completely
    response.cookies.set(SESSION_COOKIE_OPTIONS.name, "", {
      httpOnly: SESSION_COOKIE_OPTIONS.httpOnly,
      secure: SESSION_COOKIE_OPTIONS.secure,
      sameSite: SESSION_COOKIE_OPTIONS.sameSite,
      path: SESSION_COOKIE_OPTIONS.path,
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    console.error("logout error:", error);
    return NextResponse.json(
      { success: false, message: "Chiqishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
