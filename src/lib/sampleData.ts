import {
  Subject,
  Grade,
  AcademicGoal,
  Notification,
  UserProfile,
  ScheduleSettings,
} from "@/types/database";

export const defaultUser: UserProfile = {
  id: "student-shohjahon-01",
  email: "shohjahon@gradeflow.uz",
  full_name: "Shohjahon",
  avatar_url: "",
  grade_level: "Talaba / O'quvchi",
  school_name: "Akademik ta'lim",
  created_at: new Date().toISOString(),
};

// 4 Active subjects specifically requested by Shohjahon:
// 1. Kamon otish
// 2. Rus tili
// 3. Ona tili
// 4. Biologiya
export const defaultSubjects: Subject[] = [
  {
    id: "sub-kamon",
    user_id: defaultUser.id,
    name: "Kamon otish",
    code: "KAMON",
    color: "#EC4899", // Pink / Fuchsia
    icon: "Target",
    teacher_name: "Kamon otish murabbiyi",
    created_at: new Date().toISOString(),
  },
  {
    id: "sub-rus",
    user_id: defaultUser.id,
    name: "Rus tili",
    code: "RUS",
    color: "#3B82F6", // Blue
    icon: "Languages",
    teacher_name: "Rus tili o'qituvchisi",
    created_at: new Date().toISOString(),
  },
  {
    id: "sub-ona",
    user_id: defaultUser.id,
    name: "Ona tili",
    code: "ONA",
    color: "#6366F1", // Indigo
    icon: "BookOpen",
    teacher_name: "Ona tili o'qituvchisi",
    created_at: new Date().toISOString(),
  },
  {
    id: "sub-bio",
    user_id: defaultUser.id,
    name: "Biologiya",
    code: "BIO",
    color: "#14B8A6", // Teal
    icon: "Dna",
    teacher_name: "Biologiya o'qituvchisi",
    created_at: new Date().toISOString(),
  },
];

// All demo grades reset to 0 as requested ("bularni hammasi demo hamasini 0 qil")
export const defaultGrades: Grade[] = [];

// Clean initial goals
export const defaultGoals: AcademicGoal[] = [
  {
    id: "goal-ona",
    user_id: defaultUser.id,
    subject_id: "sub-ona",
    target_grade: 5.0,
    status: "in_progress",
    created_at: new Date().toISOString(),
  },
  {
    id: "goal-rus",
    user_id: defaultUser.id,
    subject_id: "sub-rus",
    target_grade: 4.8,
    status: "in_progress",
    created_at: new Date().toISOString(),
  },
  {
    id: "goal-bio",
    user_id: defaultUser.id,
    subject_id: "sub-bio",
    target_grade: 4.8,
    status: "in_progress",
    created_at: new Date().toISOString(),
  },
  {
    id: "goal-kamon",
    user_id: defaultUser.id,
    subject_id: "sub-kamon",
    target_grade: 5.0,
    status: "in_progress",
    created_at: new Date().toISOString(),
  },
];

// Initial welcome notification
export const defaultNotifications: Notification[] = [
  {
    id: "notif-welcome",
    user_id: defaultUser.id,
    title: "Xush kelibsiz, Shohjahon! 🎯",
    message: "GradeFlow monitoring tizimi va AI mentoringiz faollashdi. Dars jadvalingiz bo'yicha baholarni qayd etib boring!",
    type: "info",
    is_read: false,
    dedup_key: "welcome_shohjahon",
    created_at: new Date().toISOString(),
  },
];

// Default timetable and rest days for Admin Panel
export const defaultScheduleSettings: ScheduleSettings = {
  rest_days: ["sunday"],
  timetable: {
    monday: ["sub-ona", "sub-rus", "sub-kamon"],
    tuesday: ["sub-bio", "sub-ona", "sub-rus"],
    wednesday: ["sub-kamon", "sub-ona", "sub-bio"],
    thursday: ["sub-rus", "sub-ona", "sub-kamon"],
    friday: ["sub-bio", "sub-rus", "sub-ona"],
    saturday: ["sub-kamon", "sub-bio"],
    sunday: [],
  },
  updated_at: new Date().toISOString(),
};
