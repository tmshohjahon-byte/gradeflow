import fs from "fs";
import path from "path";
import {
  Subject,
  Grade,
  AcademicGoal,
  Notification,
  ScheduleSettings,
} from "@/types/database";
import {
  defaultSubjects,
  defaultGrades,
  defaultGoals,
  defaultNotifications,
  defaultScheduleSettings,
} from "./sampleData";

export type UserCloudData = {
  userId: string;
  subjects: Subject[];
  grades: Grade[];
  goals: AcademicGoal[];
  schedule: ScheduleSettings;
  notifications: Notification[];
  updatedAt: string;
};

const USER_DATA_DIR = path.join(process.cwd(), "data", "userdata");

function ensureDirExists() {
  try {
    if (!fs.existsSync(USER_DATA_DIR)) {
      fs.mkdirSync(USER_DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.error("Failed to create userdata directory:", e);
  }
}

function getUserFilePath(userId: string): string {
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(USER_DATA_DIR, `${safeId}.json`);
}

export function getUserCloudData(userId: string): UserCloudData {
  ensureDirExists();
  const filePath = getUserFilePath(userId);

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error(`Error reading data for user ${userId}:`, e);
    }
  }

  // Initialize clean cloud data for this user
  const initialData: UserCloudData = {
    userId,
    subjects: defaultSubjects.map((s, idx) => ({
      ...s,
      id: `sub-${idx + 1}`,
      user_id: userId,
    })),
    grades: [],
    goals: defaultGoals.map((g) => ({
      ...g,
      user_id: userId,
    })),
    schedule: { ...defaultScheduleSettings },
    notifications: [...defaultNotifications],
    updatedAt: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), "utf8");
  } catch (e) {
    console.error(`Error initializing data for user ${userId}:`, e);
  }

  return initialData;
}

export function saveUserCloudData(
  userId: string,
  partial: Partial<UserCloudData>
): UserCloudData {
  ensureDirExists();
  const current = getUserCloudData(userId);
  const updated: UserCloudData = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  const filePath = getUserFilePath(userId);
  try {
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");
  } catch (e) {
    console.error(`Error saving cloud data for user ${userId}:`, e);
  }

  return updated;
}

