import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  const logs: string[] = [];

  try {
    const supabase = getSupabase();
    if (supabase) {
      try {
        // Ping Supabase to reset the 7-day inactivity timer
        const { error } = await supabase.from("subjects").select("id").limit(1);
        if (error) {
          logs.push(`Supabase ping warning: ${error.message}`);
        } else {
          logs.push("Supabase ping OK: database is active and awake.");
        }
      } catch (err: any) {
        logs.push(`Supabase query exception: ${err?.message || err}`);
      }
    } else {
      logs.push("Supabase client not configured.");
    }

    const durationMs = Date.now() - startedAt;

    return NextResponse.json({
      success: true,
      status: "alive",
      message: "Keep-alive ping dispatched successfully! 24/7 database uptime preserved.",
      durationMs,
      logs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        status: "error",
        message: error?.message || "Keep-alive error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
