import { NextRequest, NextResponse } from "next/server";
import { getUserCloudData, saveUserCloudData } from "@/lib/serverDataStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId talab qilinadi." },
        { status: 400 }
      );
    }

    const data = getUserCloudData(userId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("GET /api/data/sync error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server xatoligi." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, subjects, grades, goals, schedule, notifications } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId talab qilinadi." },
        { status: 400 }
      );
    }

    const updated = saveUserCloudData(userId, {
      subjects,
      grades,
      goals,
      schedule,
      notifications,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("POST /api/data/sync error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server xatoligi." },
      { status: 500 }
    );
  }
}

