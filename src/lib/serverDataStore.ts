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

// Serverless-friendly data path: on Vercel / AWS Lambda, process.cwd() is read-only.
const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NEXT_RUNTIME === "edge"
);

const USER_DATA_DIR = IS_SERVERLESS
  ? path.join("/tmp", "gradeflow_data", "userdata")
  : path.join(process.cwd(), "data", "userdata");

// Persistent global memory cache across warm lambda invocations
const globalDataStore = globalThis as unknown as {
  __gradeflow_cloud_data__?: Map<string, UserCloudData>;
};

if (!globalDataStore.__gradeflow_cloud_data__) {
  globalDataStore.__gradeflow_cloud_data__ = new Map<string, UserCloudData>();
}

function ensureDirExists() {
  try {
    if (!fs.existsSync(USER_DATA_DIR)) {
      fs.mkdirSync(USER_DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn("Storage directory notice (non-fatal):", e);
  }
}

function getUserFilePath(userId: string): string {
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(USER_DATA_DIR, `${safeId}.json`);
}

export function getUserCloudData(userId: string): UserCloudData {
  if (globalDataStore.__gradeflow_cloud_data__?.has(userId)) {
    return globalDataStore.__gradeflow_cloud_data__.get(userId)!;
  }

  ensureDirExists();
  const filePath = getUserFilePath(userId);

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      if (raw) {
        const parsed: UserCloudData = JSON.parse(raw);
        globalDataStore.__gradeflow_cloud_data__?.set(userId, parsed);
        return parsed;
      }
    } catch (e) {
      console.warn(`Notice: fallback to memory for user ${userId}:`, e);
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
  const current = getUserCloudData(userId);
  const updated: UserCloudData = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  globalDataStore.__gradeflow_cloud_data__?.set(userId, updated);

  ensureDirExists();
  const filePath = getUserFilePath(userId);
  try {
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");
  } catch (e) {
    console.warn(`Notice: Saved data to memory cache for user ${userId}:`, e);
  }

  return updated;
}

