import { NextRequest, NextResponse } from "next/server";
import { getUserCloudData, saveUserCloudData } from "@/lib/serverDataStore";
import { getSupabase } from "@/lib/supabase";

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

    const supabase = getSupabase();
    if (supabase) {
      try {
        const [subsRes, gradesRes, goalsRes, notifsRes, schedRes] = await Promise.all([
          supabase.from("subjects").select("*").eq("user_id", userId),
          supabase.from("grades").select("*").eq("user_id", userId).order("date", { ascending: false }),
          supabase.from("academic_goals").select("*").eq("user_id", userId),
          supabase.from("notifications").select("*").eq("user_id", userId),
          supabase.from("schedule_settings").select("*").eq("user_id", userId).maybeSingle(),
        ]);

        if (subsRes.data && subsRes.data.length > 0) {
          const cloudData = {
            userId,
            subjects: subsRes.data,
            grades: (gradesRes.data || []).map((g: any) => ({
              ...g,
              grade_value: g.grade,
            })),
            goals: goalsRes.data || [],
            notifications: notifsRes.data || [],
            schedule: schedRes.data || {
              rest_days: ["sunday"],
              timetable: {},
            },
            updatedAt: new Date().toISOString(),
          };
          return NextResponse.json({ success: true, data: cloudData });
        }
      } catch (err) {
        console.warn("Supabase fetch in sync GET failed, using fallback:", err);
      }
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

    // 1. Save to server store
    const updated = saveUserCloudData(userId, {
      subjects,
      grades,
      goals,
      schedule,
      notifications,
    });

    // 2. Persist to Supabase in parallel
    const supabase = getSupabase();
    if (supabase) {
      try {
        if (Array.isArray(subjects) && subjects.length > 0) {
          const subsToUpsert = subjects.map((s: any) => ({
            id: s.id,
            user_id: userId,
            name: s.name,
            code: s.code || "",
            color: s.color || "#6366F1",
            icon: s.icon || "BookOpen",
            teacher_name: s.teacher_name || "",
          }));
          await supabase.from("subjects").upsert(subsToUpsert, { onConflict: "id" });
        }

        if (Array.isArray(grades) && grades.length > 0) {
          const gradesToUpsert = grades.map((g: any) => ({
            id: g.id,
            user_id: userId,
            subject_id: g.subject_id,
            grade: g.grade_value || g.grade,
            date: g.date,
            comment: g.comment || "",
            type: g.type || "classwork",
          }));
          await supabase.from("grades").upsert(gradesToUpsert, { onConflict: "id" });
        }

        if (schedule) {
          await supabase.from("schedule_settings").upsert(
            {
              user_id: userId,
              rest_days: schedule.rest_days || ["sunday"],
              timetable: schedule.timetable || {},
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        }
      } catch (dbErr) {
        console.warn("Supabase background upsert in sync POST notice:", dbErr);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("POST /api/data/sync error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server xatoligi." },
      { status: 500 }
    );
  }
}
