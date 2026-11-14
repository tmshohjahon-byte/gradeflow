import { getSupabase } from "./supabase";
import { UserProfile } from "@/types/database";
import { defaultUser } from "./sampleData";

export type AuthState = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
};

const LOCAL_AUTH_USER_KEY = "gradeflow_current_user";
const LOCAL_USERS_REGISTRY_KEY = "gradeflow_registered_users";

type RegisteredLocalUser = {
  id: string;
  email: string;
  passwordHash: string; // Basic local hash for offline multi-account support
  profile: UserProfile;
};

function getRegisteredLocalUsers(): RegisteredLocalUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_USERS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredLocalUsers(users: RegisteredLocalUser[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_USERS_REGISTRY_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Local users registry error", err);
  }
}

export async function getCurrentUserSession(): Promise<UserProfile | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch or build profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) return profile as UserProfile;

        // Fallback from auth metadata
        const fallbackProfile: UserProfile = {
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "O'quvchi",
          school_name: user.user_metadata?.school_name || "Akademik ta'lim",
          grade_level: user.user_metadata?.grade_level || "Talaba / O'quvchi",
          created_at: user.created_at || new Date().toISOString(),
        };

        // Try upserting to profiles table
        await supabase.from("profiles").upsert(fallbackProfile);
        return fallbackProfile;
      }
    } catch (e) {
      console.warn("Supabase auth check error:", e);
    }
  }

  // Check local active session
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem(LOCAL_AUTH_USER_KEY);
      if (local) return JSON.parse(local);
    } catch {
      // fallback
    }
  }

  return defaultUser;
}

export async function signUpStudent({
  fullName,
  email,
  password,
  schoolName = "Akademik Ta'lim",
  gradeLevel = "Talaba / O'quvchi",
}: {
  fullName: string;
  email: string;
  password: string;
  schoolName?: string;
  gradeLevel?: string;
}): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            school_name: schoolName,
            grade_level: gradeLevel,
          },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: cleanEmail,
          full_name: cleanName,
          school_name: schoolName,
          grade_level: gradeLevel,
          created_at: new Date().toISOString(),
        };

        try {
          await supabase.from("profiles").upsert(profile);
        } catch {
          // Profile table trigger might handle it
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
        }

        return {
          success: true,
          user: profile,
          message: data.session ? "Muvaffaqiyatli ro'yxatdan o'tdingiz!" : "Ro'yxatdan o'tildi! Tasdiqlash xabari yuborildi.",
        };
      }
    } catch (err: any) {
      console.warn("Supabase signUp exception:", err);
    }
  }

  // Local accounts manager (offline / fallback support)
  const registry = getRegisteredLocalUsers();
  if (registry.some((u) => u.email === cleanEmail)) {
    return { success: false, message: "Ushbu email bilan allaqachon ro'yxatdan o'tilgan." };
  }

  const localUserId = "usr-" + Math.random().toString(36).substring(2, 9);
  const newProfile: UserProfile = {
    id: localUserId,
    email: cleanEmail,
    full_name: cleanName,
    school_name: schoolName,
    grade_level: gradeLevel,
    created_at: new Date().toISOString(),
  };

  registry.push({
    id: localUserId,
    email: cleanEmail,
    passwordHash: btoa(password),
    profile: newProfile,
  });
  saveRegisteredLocalUsers(registry);

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(newProfile));
  }

  return { success: true, user: newProfile, message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!" };
}

export async function logInStudent({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Primary: Authenticate via server-side secure verified users registry
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        password,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(data.user));
      }
      return {
        success: true,
        user: data.user,
        message: data.message || "Xush kelibsiz!",
      };
    }
  } catch (apiErr) {
    console.warn("Server login API attempt failed, checking fallback:", apiErr);
  }

  // 2. Fallback: Supabase Auth (if online and verified)
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!error && data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        const finalProfile: UserProfile = profile || {
          id: data.user.id,
          email: cleanEmail,
          full_name: data.user.user_metadata?.full_name || cleanEmail.split("@")[0],
          school_name: data.user.user_metadata?.school_name || "Akademik ta'lim",
          grade_level: data.user.user_metadata?.grade_level || "Talaba / O'quvchi",
          created_at: data.user.created_at || new Date().toISOString(),
        };

        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(finalProfile));
        }

        return { success: true, user: finalProfile, message: "Xush kelibsiz!" };
      }
    } catch (err: any) {
      console.warn("Supabase logIn exception:", err);
    }
  }

  // 3. Fallback: Local offline registry
  const registry = getRegisteredLocalUsers();
  const matched = registry.find(
    (u) =>
      u.email === cleanEmail &&
      (u.passwordHash === btoa(password) || u.passwordHash === "real-otp-verified")
  );

  if (matched) {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(matched.profile));
    }
    return { success: true, user: matched.profile, message: "Xush kelibsiz!" };
  }

  return { success: false, message: "Email yoki parol noto'g'ri kiritildi." };
}

export async function logOutStudent(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut error:", e);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_AUTH_USER_KEY);
  }
}

// ----------------------------------------------------
// REAL GMAIL / EMAIL 6-DIGIT OTP SECURITY VERIFICATION
// ----------------------------------------------------

export async function sendEmailVerificationOtp({
  email,
  fullName,
  password,
  gradeLevel,
}: {
  email: string;
  fullName?: string;
  password?: string;
  gradeLevel?: string;
}): Promise<{ success: boolean; message: string; notConfigured?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        fullName,
        password,
        gradeLevel,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        notConfigured: data.configured === false,
        message: data.message || "Xat yuborishda xatolik yuz berdi.",
      };
    }

    return {
      success: true,
      message: data.message || `6 xonali tasdiqlash kodi ${cleanEmail} pochtangizga yuborildi.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Server bilan bog'lanishda xatolik.",
    };
  }
}

export async function verifyEmailOtp({
  email,
  code,
}: {
  email: string;
  code: string;
}): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  try {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        code: cleanCode,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.user) {
      return {
        success: false,
        message: data.message || "Kiritilgan kod noto'g'ri.",
      };
    }

    const verifiedUser: UserProfile = data.user;

    // Save in local registry and active session
    const registry = getRegisteredLocalUsers();
    if (!registry.some((u) => u.email === cleanEmail)) {
      registry.push({
        id: verifiedUser.id,
        email: cleanEmail,
        passwordHash: btoa("real-otp-verified"),
        profile: verifiedUser,
      });
      saveRegisteredLocalUsers(registry);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(verifiedUser));
    }

    return {
      success: true,
      user: verifiedUser,
      message: "Email muvaffaqiyatli tasdiqlandi!",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Tasdiqlashda server xatoligi.",
    };
  }
}


