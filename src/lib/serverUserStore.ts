import fs from "fs";
import path from "path";
import { verifyPassword } from "./security/crypto";
import { UserProfile } from "@/types/database";

export type StoredUser = {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  gradeLevel?: string;
  schoolName?: string;
  createdAt: string;
};

// Serverless-friendly data path: on Vercel / AWS Lambda, process.cwd() is read-only.
const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NEXT_RUNTIME === "edge"
);

const DATA_DIR = IS_SERVERLESS
  ? path.join("/tmp", "gradeflow_data")
  : path.join(process.cwd(), "data");

const USERS_FILE = path.join(DATA_DIR, "users.json");

// Pre-seeded initial users (so existing accounts like Shohjahon's work out of the box in serverless)
const DEFAULT_SEED_USERS: StoredUser[] = [
  {
    id: "usr-mihysvu",
    email: "tmshohjahon@gmail.com",
    fullName: "shohjahon",
    passwordHash: "e20df790d602d070a15d4587589ab954:184e9789cfc3659e5b32b32408a6e5608a066f3fa1fdbf3c7b15cccf0612546a5c1e7e1975f1de2170896aaead018793e0f08b20582f2d496ea8469239e47560",
    gradeLevel: "9",
    schoolName: "Akademik ta'lim",
    createdAt: "2026-11-08T17:25:24.051Z"
  }
];

// Persistent global cache in memory across warm lambda invocations
const globalUserStore = globalThis as unknown as {
  __gradeflow_users_cache__?: StoredUser[];
};

if (!globalUserStore.__gradeflow_users_cache__) {
  globalUserStore.__gradeflow_users_cache__ = [...DEFAULT_SEED_USERS];
}

function ensureFileExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(globalUserStore.__gradeflow_users_cache__, null, 2), "utf8");
    }
  } catch (e) {
    // Graceful catch for read-only or restricted environments
    console.warn("Storage notice (non-fatal):", e);
  }
}

export function getAllUsers(): StoredUser[] {
  ensureFileExists();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, "utf8");
      if (raw) {
        const fileUsers: StoredUser[] = JSON.parse(raw);
        // Merge file users into global cache
        if (Array.isArray(fileUsers) && fileUsers.length > 0) {
          globalUserStore.__gradeflow_users_cache__ = fileUsers;
        }
      }
    }
  } catch (e) {
    console.warn("Notice: Reading users from memory cache:", e);
  }
  return globalUserStore.__gradeflow_users_cache__ || DEFAULT_SEED_USERS;
}

export function saveAllUsers(users: StoredUser[]): void {
  globalUserStore.__gradeflow_users_cache__ = users;
  ensureFileExists();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (e) {
    console.warn("Notice: Persisting users to memory only (read-only filesystem):", e);
  }
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const cleanEmail = email.toLowerCase().trim();
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase().trim() === cleanEmail);
}

export function saveUser(user: StoredUser): void {
  const users = getAllUsers();
  const cleanEmail = user.email.toLowerCase().trim();
  const existingIndex = users.findIndex(
    (u) => u.email.toLowerCase().trim() === cleanEmail
  );

  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...user };
  } else {
    users.push(user);
  }

  saveAllUsers(users);
}

export function authenticateUser(
  email: string,
  plainPassword: string
): { success: boolean; user?: UserProfile; message?: string } {
  const stored = findUserByEmail(email);
  if (!stored) {
    return {
      success: false,
      message: "Ushbu email bilan ro'yxatdan o'tilmagan yoki email noto'g'ri.",
    };
  }

  // Check password using cryptographic verification (or legacy btoa check)
  const isMatch =
    verifyPassword(plainPassword, stored.passwordHash) ||
    stored.passwordHash === Buffer.from(plainPassword).toString("base64");

  if (!isMatch) {
    return {
      success: false,
      message: "Email yoki parol noto'g'ri kiritildi.",
    };
  }

  const profile: UserProfile = {
    id: stored.id,
    email: stored.email,
    full_name: stored.fullName,
    school_name: stored.schoolName || "Akademik ta'lim",
    grade_level: stored.gradeLevel || "Talaba / O'quvchi",
    created_at: stored.createdAt,
  };

  return {
    success: true,
    user: profile,
    message: "Xush kelibsiz!",
  };
}

