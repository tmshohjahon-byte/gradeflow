import {
  UserProfile,
  Subject,
  Grade,
  AcademicGoal,
  Notification,
  Language,
  ScheduleSettings,
  DayOfWeek,
} from "@/types/database";
import {
  defaultUser,
  defaultSubjects,
  defaultGrades,
  defaultGoals,
  defaultNotifications,
  defaultScheduleSettings,
} from "./sampleData";
import { getSupabase } from "./supabase";

const STORAGE_KEYS = {
  USER: "gradeflow_user",
  SUBJECTS: "gradeflow_subjects",
  GRADES: "gradeflow_grades",
  GOALS: "gradeflow_goals",
  NOTIFICATIONS: "gradeflow_notifications",
  LANGUAGE: "gradeflow_lang",
  SCHEDULE: "gradeflow_schedule",
  VERSION: "gradeflow_v4_shohjahon_13subjects",
};

export const DATA_CHANGE_EVENT = "gradeflow:data-change";

export function notifyDataChange() {
  if (typeof window !== "undefined") {
    pushUserDataToCloud().catch(() => {});
    window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
  }
}

// ----------------------------------------------------
// LOCAL STORAGE CORE HELPERS & AUTO-RESET CHECK
// ----------------------------------------------------
export function getActiveUserId(): string {
  if (typeof window === "undefined") return defaultUser.id;
  try {
    const raw = localStorage.getItem("gradeflow_current_user");
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id) return u.id;
    }
  } catch {}
  return defaultUser.id;
}

export function getUserKey(baseKey: string, userId: string = getActiveUserId()): string {
  if (!userId || userId === defaultUser.id) {
    return baseKey;
  }
  return `${baseKey}_${userId}`;
}

function ensureShohjahonReset() {
  if (typeof window === "undefined") return;
  const v = localStorage.getItem(STORAGE_KEYS.VERSION);
  if (v !== "true") {
    // Reset to Shohjahon and 0 grades as requested by user
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(defaultSubjects));
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(defaultGrades));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(defaultGoals));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifications));
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(defaultScheduleSettings));
    localStorage.setItem(STORAGE_KEYS.VERSION, "true");
  }
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  ensureShohjahonReset();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Storage write error", err);
  }
}

// ----------------------------------------------------
// CROSS-DEVICE CLOUD SYNCHRONIZATION ENGINE
// Synchronizes data across laptop, phone, and tablet!
// ----------------------------------------------------
export async function syncUserDataWithCloud(userId: string = getActiveUserId()): Promise<void> {
  if (typeof window === "undefined" || !userId) return;

  try {
    const res = await fetch(`/api/data/sync?userId=${encodeURIComponent(userId)}`);
    const json = await res.json();
    if (res.ok && json.success && json.data) {
      const data = json.data;
      const subKey = getUserKey(STORAGE_KEYS.SUBJECTS, userId);
      const gradesKey = getUserKey(STORAGE_KEYS.GRADES, userId);
      const goalsKey = getUserKey(STORAGE_KEYS.GOALS, userId);
      const schedKey = getUserKey(STORAGE_KEYS.SCHEDULE, userId);
      const notifsKey = getUserKey(STORAGE_KEYS.NOTIFICATIONS, userId);

      // Local vs Remote conflict resolution
      if (Array.isArray(data.subjects) && data.subjects.length > 0) {
        const localSubs = readLocal<Subject[]>(subKey, []);
        if (localSubs.length <= data.subjects.length) {
          writeLocal(subKey, data.subjects);
        }
      }
      if (Array.isArray(data.grades)) {
        const localGrades = readLocal<Grade[]>(gradesKey, []);
        if (data.grades.length >= localGrades.length) {
          writeLocal(gradesKey, data.grades);
        }
      }
      if (Array.isArray(data.goals)) {
        writeLocal(goalsKey, data.goals);
      }
      
      // CRITICAL TIMETABLE SAFETY & AUTO-PRESERVATION:
      // Never allow an empty or stale cloud schedule to overwrite local work!
      if (data.schedule) {
        const localSched = readLocal<ScheduleSettings>(schedKey, defaultScheduleSettings);
        const countEntries = (s?: ScheduleSettings) => {
          if (!s?.timetable) return 0;
          return Object.values(s.timetable).reduce(
            (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
            0
          );
        };

        const localCount = countEntries(localSched);
        const remoteCount = countEntries(data.schedule);
        const localTime = new Date(localSched.updated_at || 0).getTime();
        const remoteTime = new Date(data.schedule.updated_at || 0).getTime();

        if (localCount > 0 && remoteCount < localCount) {
          // Local timetable is richer! Do NOT overwrite; instead, push local to cloud!
          pushUserDataToCloud(userId).catch(() => {});
        } else if (remoteTime > localTime && remoteCount >= localCount) {
          writeLocal(schedKey, data.schedule);
        } else if (localCount === 0 && remoteCount > 0) {
          writeLocal(schedKey, data.schedule);
        }
      }

      if (Array.isArray(data.notifications)) {
        writeLocal(notifsKey, data.notifications);
      }
    }
  } catch (err) {
    console.warn("Cloud sync error:", err);
  }
}

export async function pushUserDataToCloud(userId: string = getActiveUserId()): Promise<void> {
  if (typeof window === "undefined" || !userId) return;

  try {
    const subKey = getUserKey(STORAGE_KEYS.SUBJECTS, userId);
    const gradesKey = getUserKey(STORAGE_KEYS.GRADES, userId);
    const goalsKey = getUserKey(STORAGE_KEYS.GOALS, userId);
    const schedKey = getUserKey(STORAGE_KEYS.SCHEDULE, userId);
    const notifsKey = getUserKey(STORAGE_KEYS.NOTIFICATIONS, userId);

    const subjects = readLocal(subKey, defaultSubjects);
    const grades = readLocal(gradesKey, defaultGrades);
    const goals = readLocal(goalsKey, defaultGoals);
    const schedule = readLocal(schedKey, defaultScheduleSettings);
    const notifications = readLocal(notifsKey, defaultNotifications);

    await fetch("/api/data/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        subjects,
        grades,
        goals,
        schedule,
        notifications,
      }),
    });
  } catch (err) {
    console.warn("Cloud push error:", err);
  }
}

// ----------------------------------------------------
// LANGUAGE
// ----------------------------------------------------
export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "uz";
  const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
  return stored === "uz" || stored === "en" || stored === "ru" ? stored : "uz";
}

export function setStoredLanguage(lang: Language): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    notifyDataChange();
  }
}

// ----------------------------------------------------
// USER PROFILE
// ----------------------------------------------------
// ----------------------------------------------------
// SYNCHRONOUS INSTANT LOCAL GETTERS (0ms SWR Fast-Path)
// ----------------------------------------------------
export function getLocalUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const active = localStorage.getItem("gradeflow_current_user");
    if (active) return JSON.parse(active);
  } catch {}
  return null;
}

export function getLocalSubjects(userId: string = getActiveUserId()): Subject[] {
  const subKey = getUserKey(STORAGE_KEYS.SUBJECTS, userId);
  return readLocal<Subject[]>(subKey, defaultSubjects);
}

export function getLocalGrades(userId: string = getActiveUserId()): Grade[] {
  const gradesKey = getUserKey(STORAGE_KEYS.GRADES, userId);
  return readLocal<Grade[]>(gradesKey, defaultGrades);
}

export function getLocalGoals(userId: string = getActiveUserId()): AcademicGoal[] {
  const goalsKey = getUserKey(STORAGE_KEYS.GOALS, userId);
  return readLocal<AcademicGoal[]>(goalsKey, defaultGoals);
}

export function getLocalNotifications(userId: string = getActiveUserId()): Notification[] {
  const notifsKey = getUserKey(STORAGE_KEYS.NOTIFICATIONS, userId);
  return readLocal<Notification[]>(notifsKey, defaultNotifications);
}

export function getLocalScheduleSettings(userId: string = getActiveUserId()): ScheduleSettings {
  const schedKey = getUserKey(STORAGE_KEYS.SCHEDULE, userId);
  return readLocal<ScheduleSettings>(schedKey, defaultScheduleSettings);
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const local = getLocalUserProfile();
  if (local) return local;

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data && !error) return data as UserProfile;

        return {
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "O'quvchi",
          school_name: user.user_metadata?.school_name || "Akademik ta'lim",
          grade_level: user.user_metadata?.grade_level || "Talaba / O'quvchi",
          created_at: user.created_at || new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn("Supabase profile fetch error, fallback to local:", e);
    }
  }

  return null;
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const current = (await getUserProfile()) || defaultUser;
  const updated = { ...current, ...profile };
  
  if (typeof window !== "undefined") {
    localStorage.setItem("gradeflow_current_user", JSON.stringify(updated));
    if (updated.id === defaultUser.id) {
      writeLocal(STORAGE_KEYS.USER, updated);
    }
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("profiles").upsert(updated);
    } catch (e) {
      console.warn("Supabase profile update failed:", e);
    }
  }

  notifyDataChange();
  return updated;
}

// ----------------------------------------------------
// SUBJECTS
// ----------------------------------------------------
export async function getSubjects(): Promise<Subject[]> {
  const userId = getActiveUserId();
  const subKey = getUserKey(STORAGE_KEYS.SUBJECTS, userId);

  let initialFallback = defaultSubjects;
  if (userId !== defaultUser.id) {
    // For a newly registered student, provide clean starter subjects
    initialFallback = defaultSubjects.map((s, idx) => ({
      ...s,
      id: `usr-${userId.slice(0, 6)}-sub-${idx + 1}`,
      user_id: userId,
    }));
  }

  const localSubjects = readLocal<Subject[]>(subKey, initialFallback);
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", userId)
        .order("name", { ascending: true });
      if (data && !error && data.length > 0) {
        // Merge Supabase subjects with local styling (color/icon/code)
        const merged: Subject[] = data.map((remote) => {
          const match = localSubjects.find((l) => l.id === remote.id || l.name === remote.name);
          return {
            id: remote.id,
            user_id: remote.user_id || userId,
            name: remote.name,
            code: match?.code || remote.name.slice(0, 3).toUpperCase(),
            color: match?.color || "#6366F1",
            icon: match?.icon || "BookOpen",
            teacher_name: match?.teacher_name || remote.teacher_name,
            created_at: remote.created_at || new Date().toISOString(),
          };
        });
        writeLocal(subKey, merged);
        return merged;
      }
    } catch (e) {
      console.warn("Supabase subjects fetch error, fallback to local:", e);
    }
  }
  return localSubjects;
}

export async function addSubject(subject: Omit<Subject, "id" | "created_at">): Promise<Subject> {
  const userId = getActiveUserId();
  const subKey = getUserKey(STORAGE_KEYS.SUBJECTS, userId);

  const newSubject: Subject = {
    ...subject,
    user_id: subject.user_id || userId,
    id: "sub-" + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
  };

  const list = await getSubjects();
  const updated = [...list, newSubject];
  writeLocal(subKey, updated);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("subjects").insert({
        id: newSubject.id,
        name: newSubject.name,
        user_id: newSubject.user_id || userId,
      });
    } catch (e) {
      console.warn("Supabase subject insert failed:", e);
    }
  }

  notifyDataChange();
  return newSubject;
}
export async function updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | null> {
  const userId = getActiveUserId();
  const subKey = getUserKey(STORAGE_KEYS.SUBJECTS, userId);
  const list = await getSubjects();
  let updatedItem: Subject | null = null;
  const updated = list.map((item) => {
    if (item.id === id) {
      updatedItem = { ...item, ...updates };
      return updatedItem;
    }
    return item;
  });

  writeLocal(subKey, updated);

  const supabase = getSupabase();
  if (supabase && updatedItem) {
    try {
      await supabase.from("subjects").update({ name: updates.name }).eq("id", id);
    } catch (e) {
      console.warn("Supabase subject update failed:", e);
    }
  }

  notifyDataChange();
  return updatedItem;
}

export async function deleteSubject(id: string): Promise<void> {
  const userId = getActiveUserId();
  const subKey = getUserKey(STORAGE_KEYS.SUBJECTS, userId);
  const gradesKey = getUserKey(STORAGE_KEYS.GRADES, userId);
  const goalsKey = getUserKey(STORAGE_KEYS.GOALS, userId);

  const list = await getSubjects();
  writeLocal(
    subKey,
    list.filter((s) => s.id !== id)
  );

  const grades = await getGrades();
  writeLocal(
    gradesKey,
    grades.filter((g) => g.subject_id !== id)
  );

  const goals = await getGoals();
  writeLocal(
    goalsKey,
    goals.filter((g) => g.subject_id !== id)
  );

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("subjects").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase subject delete failed:", e);
    }
  }

  notifyDataChange();
}

// ----------------------------------------------------
// GRADES
// ----------------------------------------------------
export async function getGrades(): Promise<Grade[]> {
  const userId = getActiveUserId();
  const gradesKey = getUserKey(STORAGE_KEYS.GRADES, userId);

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      if (data && !error && data.length > 0) {
        const mapped: Grade[] = data.map((remote) => ({
          id: remote.id,
          user_id: remote.user_id,
          subject_id: remote.subject_id,
          grade_value: remote.grade || remote.grade_value,
          date: remote.date,
          comment: remote.comment,
          type: remote.type || "classwork",
          created_at: remote.created_at || new Date().toISOString(),
        }));
        writeLocal(gradesKey, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn("Supabase grades fetch error, fallback to local:", e);
    }
  }
  return readLocal<Grade[]>(gradesKey, defaultGrades);
}

export async function addGrade(grade: Omit<Grade, "id" | "created_at">): Promise<Grade> {
  const userId = getActiveUserId();
  const gradesKey = getUserKey(STORAGE_KEYS.GRADES, userId);

  const newGrade: Grade = {
    ...grade,
    user_id: grade.user_id || userId,
    id: "g-" + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
  };

  const list = await getGrades();
  const updated = [newGrade, ...list];
  writeLocal(gradesKey, updated);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("grades").insert({
        id: newGrade.id,
        user_id: newGrade.user_id,
        subject_id: newGrade.subject_id,
        grade: newGrade.grade_value,
        date: newGrade.date,
        comment: newGrade.comment,
      });
    } catch (e) {
      console.warn("Supabase grade insert failed:", e);
    }
  }

  notifyDataChange();
  return newGrade;
}

export async function updateGrade(id: string, updates: Partial<Grade>): Promise<Grade | null> {
  const userId = getActiveUserId();
  const gradesKey = getUserKey(STORAGE_KEYS.GRADES, userId);

  const list = await getGrades();
  let updatedItem: Grade | null = null;
  const updated = list.map((item) => {
    if (item.id === id) {
      updatedItem = { ...item, ...updates };
      return updatedItem;
    }
    return item;
  });

  writeLocal(gradesKey, updated);

  const supabase = getSupabase();
  if (supabase && updatedItem) {
    try {
      await supabase
        .from("grades")
        .update({
          grade: updates.grade_value,
          date: updates.date,
          comment: updates.comment,
        })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase grade update failed:", e);
    }
  }

  notifyDataChange();
  return updatedItem;
}

export async function deleteGrade(id: string): Promise<void> {
  const userId = getActiveUserId();
  const gradesKey = getUserKey(STORAGE_KEYS.GRADES, userId);

  const list = await getGrades();
  writeLocal(
    gradesKey,
    list.filter((g) => g.id !== id)
  );

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("grades").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase grade delete failed:", e);
    }
  }

  notifyDataChange();
}

// ----------------------------------------------------
// ACADEMIC GOALS
// ----------------------------------------------------
export async function getGoals(): Promise<AcademicGoal[]> {
  const userId = getActiveUserId();
  const goalsKey = getUserKey(STORAGE_KEYS.GOALS, userId);

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("academic_goals")
        .select("*")
        .eq("user_id", userId);
      if (data && !error && data.length > 0) {
        const mapped: AcademicGoal[] = data.map((remote) => ({
          id: remote.id,
          user_id: remote.user_id,
          subject_id: remote.subject_id,
          target_grade: remote.target_average || remote.target_grade,
          target_date: remote.target_date,
          status: remote.status || "in_progress",
          created_at: remote.created_at || new Date().toISOString(),
          updated_at: remote.updated_at,
        }));
        writeLocal(goalsKey, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn("Supabase goals fetch error, fallback to local:", e);
    }
  }
  return readLocal<AcademicGoal[]>(goalsKey, defaultGoals);
}

export async function saveGoal(goal: Omit<AcademicGoal, "id" | "created_at"> & { id?: string }): Promise<AcademicGoal> {
  const userId = getActiveUserId();
  const goalsKey = getUserKey(STORAGE_KEYS.GOALS, userId);

  const list = await getGoals();
  const existingIdx = list.findIndex(
    (g) => g.id === goal.id || g.subject_id === goal.subject_id
  );

  let finalGoal: AcademicGoal;
  let updated: AcademicGoal[];

  if (existingIdx >= 0) {
    finalGoal = {
      ...list[existingIdx],
      ...goal,
      updated_at: new Date().toISOString(),
    };
    updated = [...list];
    updated[existingIdx] = finalGoal;
  } else {
    finalGoal = {
      id: "goal-" + Math.random().toString(36).substring(2, 9),
      user_id: goal.user_id || userId,
      subject_id: goal.subject_id,
      target_grade: goal.target_grade,
      target_date: goal.target_date,
      status: goal.status || "in_progress",
      created_at: new Date().toISOString(),
    };
    updated = [...list, finalGoal];
  }

  writeLocal(goalsKey, updated);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("academic_goals").upsert({
        id: finalGoal.id,
        user_id: finalGoal.user_id,
        subject_id: finalGoal.subject_id,
        target_average: finalGoal.target_grade,
      });
    } catch (e) {
      console.warn("Supabase goal upsert failed:", e);
    }
  }

  notifyDataChange();
  return finalGoal;
}

export async function deleteGoal(id: string): Promise<void> {
  const userId = getActiveUserId();
  const goalsKey = getUserKey(STORAGE_KEYS.GOALS, userId);

  const list = await getGoals();
  writeLocal(
    goalsKey,
    list.filter((g) => g.id !== id)
  );

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("academic_goals").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase goal delete failed:", e);
    }
  }

  notifyDataChange();
}

// ----------------------------------------------------
// NOTIFICATIONS
// ----------------------------------------------------
export async function getNotifications(): Promise<Notification[]> {
  const userId = getActiveUserId();
  const notifKey = getUserKey(STORAGE_KEYS.NOTIFICATIONS, userId);

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (data && !error && data.length > 0) {
        writeLocal(notifKey, data);
        return data as Notification[];
      }
    } catch (e) {
      console.warn("Supabase notif fetch error, fallback to local:", e);
    }
  }
  return readLocal<Notification[]>(notifKey, defaultNotifications);
}

export async function addNotificationIfNotExists(notif: Omit<Notification, "id" | "created_at">): Promise<Notification | null> {
  const userId = getActiveUserId();
  const notifKey = getUserKey(STORAGE_KEYS.NOTIFICATIONS, userId);

  const list = await getNotifications();
  if (notif.dedup_key) {
    const exists = list.some((n) => n.dedup_key === notif.dedup_key);
    if (exists) return null;
  }

  const newNotif: Notification = {
    ...notif,
    user_id: notif.user_id || userId,
    id: "notif-" + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
  };

  const updated = [newNotif, ...list];
  writeLocal(notifKey, updated);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("notifications").insert({
        id: newNotif.id,
        user_id: newNotif.user_id,
        title: newNotif.title,
        message: newNotif.message,
        is_read: newNotif.is_read,
      });
    } catch (e) {
      console.warn("Supabase notification insert failed:", e);
    }
  }

  notifyDataChange();
  return newNotif;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const userId = getActiveUserId();
  const notifKey = getUserKey(STORAGE_KEYS.NOTIFICATIONS, userId);

  const list = await getNotifications();
  const updated = list.map((n) => (n.id === id ? { ...n, is_read: true } : n));
  writeLocal(notifKey, updated);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    } catch (e) {
      console.warn("Supabase notification update failed:", e);
    }
  }

  notifyDataChange();
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const userId = getActiveUserId();
  const notifKey = getUserKey(STORAGE_KEYS.NOTIFICATIONS, userId);

  const list = await getNotifications();
  const updated = list.map((n) => ({ ...n, is_read: true }));
  writeLocal(notifKey, updated);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("notifications").update({ is_read: true }).neq("is_read", true);
    } catch (e) {
      console.warn("Supabase notif mark all failed:", e);
    }
  }

  notifyDataChange();
}

export async function clearAllNotifications(): Promise<void> {
  const userId = getActiveUserId();
  const notifKey = getUserKey(STORAGE_KEYS.NOTIFICATIONS, userId);
  writeLocal(notifKey, []);
  notifyDataChange();
}

// ----------------------------------------------------
// TIMETABLE & REST DAYS (ADMIN PANEL)
// ----------------------------------------------------
export async function getScheduleSettings(): Promise<ScheduleSettings> {
  const userId = getActiveUserId();
  const schedKey = getUserKey(STORAGE_KEYS.SCHEDULE, userId);
  return readLocal<ScheduleSettings>(schedKey, defaultScheduleSettings);
}

export async function saveScheduleSettings(settings: ScheduleSettings): Promise<ScheduleSettings> {
  const userId = getActiveUserId();
  const schedKey = getUserKey(STORAGE_KEYS.SCHEDULE, userId);
  const updated = { ...settings, updated_at: new Date().toISOString() };
  writeLocal(schedKey, updated);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("gradeflow_schedule_backup", JSON.stringify(updated));
      localStorage.setItem(`gradeflow_schedule_backup_${userId}`, JSON.stringify(updated));
    } catch {}
  }

  notifyDataChange();
  return updated;
}

export function getScheduleBackup(): ScheduleSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const userId = getActiveUserId();
    const raw =
      localStorage.getItem(`gradeflow_schedule_backup_${userId}`) ||
      localStorage.getItem("gradeflow_schedule_backup");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// RESET & BACKUP
// ----------------------------------------------------
export function resetToDemo(): void {
  if (typeof window === "undefined") return;
  writeLocal(STORAGE_KEYS.USER, defaultUser);
  writeLocal(STORAGE_KEYS.SUBJECTS, defaultSubjects);
  writeLocal(STORAGE_KEYS.GRADES, defaultGrades);
  writeLocal(STORAGE_KEYS.GOALS, defaultGoals);
  writeLocal(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications);
  writeLocal(STORAGE_KEYS.SCHEDULE, defaultScheduleSettings);
  localStorage.setItem(STORAGE_KEYS.VERSION, "true");
  notifyDataChange();
}

export function exportBackupData(): string {
  const data = {
    user: readLocal(STORAGE_KEYS.USER, defaultUser),
    subjects: readLocal(STORAGE_KEYS.SUBJECTS, defaultSubjects),
    grades: readLocal(STORAGE_KEYS.GRADES, defaultGrades),
    goals: readLocal(STORAGE_KEYS.GOALS, defaultGoals),
    notifications: readLocal(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications),
    schedule: readLocal(STORAGE_KEYS.SCHEDULE, defaultScheduleSettings),
    exported_at: new Date().toISOString(),
    version: "2.0-shohjahon",
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.subjects) {
      if (parsed.user) writeLocal(STORAGE_KEYS.USER, parsed.user);
      writeLocal(STORAGE_KEYS.SUBJECTS, parsed.subjects);
      writeLocal(STORAGE_KEYS.GRADES, parsed.grades || []);
      if (parsed.goals) writeLocal(STORAGE_KEYS.GOALS, parsed.goals);
      if (parsed.notifications) writeLocal(STORAGE_KEYS.NOTIFICATIONS, parsed.notifications);
      if (parsed.schedule) writeLocal(STORAGE_KEYS.SCHEDULE, parsed.schedule);
      notifyDataChange();
      return true;
    }
    return false;
  } catch (err) {
    console.error("Import error", err);
    return false;
  }
}
