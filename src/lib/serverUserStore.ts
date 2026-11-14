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

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureFileExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), "utf8");
    }
  } catch (e) {
    console.error("Failed to ensure users.json exists:", e);
  }
}

export function getAllUsers(): StoredUser[] {
  ensureFileExists();
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading users.json:", e);
    return [];
  }
}

export function saveAllUsers(users: StoredUser[]): void {
  ensureFileExists();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing users.json:", e);
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

