import {
  UserProfile,
  Subject,
  Grade,
  AcademicGoal,
  Notification,
  Language,
} from "@/types/database";
import {
  defaultUser,
  defaultSubjects,
  defaultGrades,
  defaultGoals,
  defaultNotifications,
} from "./sampleData";
import { getSupabase, isSupabaseConfigured } from "./supabase";

const STORAGE_KEYS = {
  USER: "gradeflow_user",
  SUBJECTS: "gradeflow_subjects",
  GRADES: "gradeflow_grades",
  GOALS: "gradeflow_goals",
  NOTIFICATIONS: "gradeflow_notifications",
  LANGUAGE: "gradeflow_lang",
};

export const DATA_CHANGE_EVENT = "gradeflow:data-change";

export function notifyDataChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
  }
}

// ----------------------------------------------------
// LOCAL STORAGE CORE HELPERS
// ----------------------------------------------------
function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
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
export async function getUserProfile(): Promise<UserProfile> {
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
      }
    } catch (e) {
      console.warn("Supabase profile fetch error, fallback to local:", e);
    }
  }
  return readLocal<UserProfile>(STORAGE_KEYS.USER, defaultUser);
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const current = await getUserProfile();
  const updated = { ...current, ...profile };
  writeLocal(STORAGE_KEYS.USER, updated);

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
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name", { ascending: true });
      if (data && !error && data.length > 0) {
        writeLocal(STORAGE_KEYS.SUBJECTS, data);
        return data as Subject[];
      }
    } catch (e) {
      console.warn("Supabase subjects fetch error, fallback to local:", e);
    }
  }
  return readLocal<Subject[]>(STORAGE_KEYS.SUBJECTS, defaultSubjects);
}

export async function addSubject(subject: Omit<Subject, "id" | "created_at">): Promise<Subject> {
  const newSubject: Subject = {
    ...subject,
    id: "sub-" + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
  };

  const list = await getSubjects();
  const updated = [...list, newSubject];
  writeLocal(STORAGE_KEYS.SUBJECTS, updated);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("subjects").insert(newSubject);
    } catch (e) {
      console.warn("Supabase subject insert failed:", e);
    }
  }

  notifyDataChange();
  return newSubject;
}

export async function updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | null> {
  const list = await getSubjects();
  let updatedItem: Subject | null = null;
  const updated = list.map((item) => {
    if (item.id === id) {
      updatedItem = { ...item, ...updates };
      return updatedItem;
    }
    return item;
  });

  writeLocal(STORAGE_KEYS.SUBJECTS, updated);

  const supabase = getSupabase();
  if (supabase && updatedItem) {
    try {
      await supabase.from("subjects").update(updates).eq("id", id);
    } catch (e) {
      console.warn("Supabase subject update failed:", e);
    }
  }

  notifyDataChange();
  return updatedItem;
}

export async function deleteSubject(id: string): Promise<void> {
  const list = await getSubjects();
  writeLocal(
    STORAGE_KEYS.SUBJECTS,
    list.filter((s) => s.id !== id)
  );

  // Also remove corresponding grades and goals
  const grades = await getGrades();
  writeLocal(
    STORAGE_KEYS.GRADES,
    grades.filter((g) => g.subject_id !== id)
  );

  const goals = await getGoals();
  writeLocal(
    STORAGE_KEYS.GOALS,
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
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .order("date", { ascending: false });
      if (data && !error && data.length > 0) {
        writeLocal(STORAGE_KEYS.GRADES, data);
        return data as Grade[];
      }
    } catch (e) {
      console.warn("Supabase grades fetch error, fallback to local:", e);
    }
  }
  return readLocal<Grade[]>(STORAGE_KEYS.GRADES, defaultGrades);
}

export async function addGrade(grade: Omit<Grade, "id" | "created_at">): Promise<Grade> {
  const newGrade: Grade = {
    ...grade,
    id: "g-" + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
  };

  const list = await getGrades();
  const updated = [newGrade, ...list];
  writeLocal(STORAGE_KEYS.GRADES, updated);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("grades").insert(newGrade);
    } catch (e) {
      console.warn("Supabase grade insert failed:", e);
    }
  }

  notifyDataChange();
  return newGrade;
}

export async function updateGrade(id: string, updates: Partial<Grade>): Promise<Grade | null> {
  const list = await getGrades();
  let updatedItem: Grade | null = null;
  const updated = list.map((item) => {
    if (item.id === id) {
      updatedItem = { ...item, ...updates };
      return updatedItem;
    }
    return item;
  });

  writeLocal(STORAGE_KEYS.GRADES, updated);

  const supabase = getSupabase();
  if (supabase && updatedItem) {
    try {
      await supabase.from("grades").update(updates).eq("id", id);
    } catch (e) {
      console.warn("Supabase grade update failed:", e);
    }
  }

  notifyDataChange();
  return updatedItem;
}

export async function deleteGrade(id: string): Promise<void> {
  const list = await getGrades();
  writeLocal(
    STORAGE_KEYS.GRADES,
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
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("academic_goals")
        .select("*");
      if (data && !error && data.length > 0) {
        writeLocal(STORAGE_KEYS.GOALS, data);
        return data as AcademicGoal[];
      }
    } catch (e) {
      console.warn("Supabase goals fetch error, fallback to local:", e);
    }
  }
  return readLocal<AcademicGoal[]>(STORAGE_KEYS.GOALS, defaultGoals);
}

export async function saveGoal(goal: Omit<AcademicGoal, "id" | "created_at"> & { id?: string }): Promise<AcademicGoal> {
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
      user_id: goal.user_id || defaultUser.id,
      subject_id: goal.subject_id,
      target_grade: goal.target_grade,
      target_date: goal.target_date,
      status: goal.status || "in_progress",
      created_at: new Date().toISOString(),
    };
    updated = [...list, finalGoal];
  }

  writeLocal(STORAGE_KEYS.GOALS, updated);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("academic_goals").upsert(finalGoal);
    } catch (e) {
      console.warn("Supabase goal upsert failed:", e);
    }
  }

  notifyDataChange();
  return finalGoal;
}

export async function deleteGoal(id: string): Promise<void> {
  const list = await getGoals();
  writeLocal(
    STORAGE_KEYS.GOALS,
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
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (data && !error && data.length > 0) {
        writeLocal(STORAGE_KEYS.NOTIFICATIONS, data);
        return data as Notification[];
      }
    } catch (e) {
      console.warn("Supabase notif fetch error, fallback to local:", e);
    }
  }
  return readLocal<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications);
}

export async function addNotificationIfNotExists(notif: Omit<Notification, "id" | "created_at">): Promise<Notification | null> {
  const list = await getNotifications();
  if (notif.dedup_key) {
    const exists = list.some((n) => n.dedup_key === notif.dedup_key);
    if (exists) return null; // Avoid duplicate notifications!
  }

  const newNotif: Notification = {
    ...notif,
    id: "notif-" + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
  };

  const updated = [newNotif, ...list];
  writeLocal(STORAGE_KEYS.NOTIFICATIONS, updated);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("notifications").insert(newNotif);
    } catch (e) {
      console.warn("Supabase notification insert failed:", e);
    }
  }

  notifyDataChange();
  return newNotif;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const list = await getNotifications();
  const updated = list.map((n) => (n.id === id ? { ...n, is_read: true } : n));
  writeLocal(STORAGE_KEYS.NOTIFICATIONS, updated);

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
  const list = await getNotifications();
  const updated = list.map((n) => ({ ...n, is_read: true }));
  writeLocal(STORAGE_KEYS.NOTIFICATIONS, updated);

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
  writeLocal(STORAGE_KEYS.NOTIFICATIONS, []);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch (e) {
      console.warn("Supabase clear notifications failed:", e);
    }
  }

  notifyDataChange();
}

// ----------------------------------------------------
// BACKUP, RESET, AND IMPORT
// ----------------------------------------------------
export function resetToDemo(): void {
  if (typeof window === "undefined") return;
  writeLocal(STORAGE_KEYS.USER, defaultUser);
  writeLocal(STORAGE_KEYS.SUBJECTS, defaultSubjects);
  writeLocal(STORAGE_KEYS.GRADES, defaultGrades);
  writeLocal(STORAGE_KEYS.GOALS, defaultGoals);
  writeLocal(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications);
  notifyDataChange();
}

export function exportBackupData(): string {
  const data = {
    user: readLocal(STORAGE_KEYS.USER, defaultUser),
    subjects: readLocal(STORAGE_KEYS.SUBJECTS, defaultSubjects),
    grades: readLocal(STORAGE_KEYS.GRADES, defaultGrades),
    goals: readLocal(STORAGE_KEYS.GOALS, defaultGoals),
    notifications: readLocal(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications),
    exported_at: new Date().toISOString(),
    version: "1.0",
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.subjects && parsed.grades) {
      if (parsed.user) writeLocal(STORAGE_KEYS.USER, parsed.user);
      writeLocal(STORAGE_KEYS.SUBJECTS, parsed.subjects);
      writeLocal(STORAGE_KEYS.GRADES, parsed.grades);
      if (parsed.goals) writeLocal(STORAGE_KEYS.GOALS, parsed.goals);
      if (parsed.notifications) writeLocal(STORAGE_KEYS.NOTIFICATIONS, parsed.notifications);
      notifyDataChange();
      return true;
    }
    return false;
  } catch (err) {
    console.error("Import error", err);
    return false;
  }
}
