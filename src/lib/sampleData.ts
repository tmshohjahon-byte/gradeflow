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

// 13 Subjects specifically configured for Shohjahon:
// 1. Ingliz tili
// 2. Matematika
// 3. Kimyo
// 4. Tarbiya
// 5. IT
// 6. Arab tili
// 7. Tarix
// 8. Rus tili
// 9. Ona tili
// 10. Fizika
// 11. Biologiya
// 12. Math Task
// 13. English Task
export const defaultSubjects: Subject[] = [
  {
    id: "sub-eng",
    user_id: defaultUser.id,
    name: "Ingliz tili",
    code: "ENG",
    color: "#3B82F6", // Blue
    icon: "Languages",
    teacher_name: "Ingliz tili o'qituvchisi",
    created_at: new Date().toISOString(),
  },
  {
    id: "sub-math",
    user_id: defaultUser.id,
    name: "Matematika",
    code: "MATH",
    color: "#6366F1", // Indigo
    icon: "Calculator",
    teacher_name: "Matematika o'qituvchisi",
    created_at: new Date().toISOString(),
  },
  {
    id: "sub-chem",
    user_id: defaultUser.id,
    name: "Kimyo",
    code: "CHEM",
    color: "#F59E0B", // Amber
    icon: "FlaskConical",
    teacher_name: "Kimyo o'qituvchisi",
    created_at: new Date().toISOString(),
  },
  {
    id: "sub-tarbiya",
    user_id: defaultUser.id,
    name: "Tarbiya",
    code: "TRB",
    color: "#10B981", // Emerald
    icon: "Sparkles",
    teacher_name: "Tarbiya fani o'qituvchisi",
    created_at: new Date().toISOString(),
  },
  {
    id: "sub-it",
    user_id: defaultUser.id,
    name: "IT",
    code: "IT",
    color: "#06B6D4", // Cyan
    icon: "Code",
    teacher_name: "IT & Dasturlash muhandisi",
    created_at: new Date().toISOString(),
  },
  {
    id: "sub-arab",
    user_id: defaultUser.id,
    name: "Arab tili",
    code: "ARAB",
    color: "#D97706", // Amber dark / Gold
    icon: "BookOpen",
    teacher_name: "Arab tili ustozi",
    created_at: new Date().toISOString(),
  },
  {
    id: "sub-hist",
    user_id: defaultUser.id,
    name: "Tarix",
    code: "HIST",
    color: "#8B5CF6", // Purple
    icon: "History",
    teacher_name: "Tarix o'qituvchisi",
    created_at: new Date().toISOString(),
  },
  {
    id: "sub-rus",
    user_id: defaultUser.id,
    name: "Rus tili",
    code: "RUS",
    color: "#0EA5E9", // Sky Blue
    icon: "Languages",
    teacher_name: "Rus tili o'qituvchisi",
    created_at: new Date().toISOString(),
  },
  {
    id: "sub-ona",
    user_id: defaultUser.id,
    name: "Ona tili",
    code: "ONA",
    color: "#EC4899", // Pink
    icon: "PenTool",
    teacher_name: "Ona tili o'qituvchisi",
    created_at: new Date().toISOString(),
  },
  {
    id: "sub-phys",
    user_id: defaultUser.id,
    name: "Fizika",
    code: "PHYS",
    color: "#F43F5E", // Rose
    icon: "Atom",
    teacher_name: "Fizika o'qituvchisi",
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
  {
    id: "sub-mathtask",
    user_id: defaultUser.id,
    name: "Math Task",
    code: "M-TSK",
    color: "#4F46E5", // Deep Indigo
    icon: "Sigma",
    teacher_name: "Matematika amaliyot kursi",
    created_at: new Date().toISOString(),
  },
  {
    id: "sub-engtask",
    user_id: defaultUser.id,
    name: "English Task",
    code: "E-TSK",
    color: "#2563EB", // Deep Blue
    icon: "FileText",
    teacher_name: "Ingliz tili topshiriqlar ustozi",
    created_at: new Date().toISOString(),
  },
];

// All grades start clean at 0 as requested ("bularni hammasi demo hamasini 0 qil")
export const defaultGrades: Grade[] = [];

// Initial Academic Goals (target 5.0 or 4.8)
export const defaultGoals: AcademicGoal[] = [
  { id: "goal-math", user_id: defaultUser.id, subject_id: "sub-math", target_grade: 5.0, status: "in_progress", created_at: new Date().toISOString() },
  { id: "goal-eng", user_id: defaultUser.id, subject_id: "sub-eng", target_grade: 5.0, status: "in_progress", created_at: new Date().toISOString() },
  { id: "goal-it", user_id: defaultUser.id, subject_id: "sub-it", target_grade: 5.0, status: "in_progress", created_at: new Date().toISOString() },
  { id: "goal-chem", user_id: defaultUser.id, subject_id: "sub-chem", target_grade: 4.8, status: "in_progress", created_at: new Date().toISOString() },
  { id: "goal-phys", user_id: defaultUser.id, subject_id: "sub-phys", target_grade: 4.8, status: "in_progress", created_at: new Date().toISOString() },
  { id: "goal-ona", user_id: defaultUser.id, subject_id: "sub-ona", target_grade: 5.0, status: "in_progress", created_at: new Date().toISOString() },
  { id: "goal-rus", user_id: defaultUser.id, subject_id: "sub-rus", target_grade: 4.8, status: "in_progress", created_at: new Date().toISOString() },
  { id: "goal-arab", user_id: defaultUser.id, subject_id: "sub-arab", target_grade: 4.8, status: "in_progress", created_at: new Date().toISOString() },
  { id: "goal-bio", user_id: defaultUser.id, subject_id: "sub-bio", target_grade: 4.8, status: "in_progress", created_at: new Date().toISOString() },
  { id: "goal-hist", user_id: defaultUser.id, subject_id: "sub-hist", target_grade: 4.8, status: "in_progress", created_at: new Date().toISOString() },
  { id: "goal-tarbiya", user_id: defaultUser.id, subject_id: "sub-tarbiya", target_grade: 5.0, status: "in_progress", created_at: new Date().toISOString() },
  { id: "goal-mathtask", user_id: defaultUser.id, subject_id: "sub-mathtask", target_grade: 5.0, status: "in_progress", created_at: new Date().toISOString() },
  { id: "goal-engtask", user_id: defaultUser.id, subject_id: "sub-engtask", target_grade: 5.0, status: "in_progress", created_at: new Date().toISOString() },
];

// Initial welcome notification
export const defaultNotifications: Notification[] = [
  {
    id: "notif-welcome",
    user_id: defaultUser.id,
    title: "Xush kelibsiz, Shohjahon! 🎯",
    message: "Barcha 13 ta faningiz muvaffaqiyatli qo'shildi. Dars jadvali bo'yicha baholaringizni kiritib boring!",
    type: "info",
    is_read: false,
    dedup_key: "welcome_shohjahon_13subjects",
    created_at: new Date().toISOString(),
  },
];

// Default weekly schedule for Shohjahon
export const defaultScheduleSettings: ScheduleSettings = {
  rest_days: ["sunday"],
  timetable: {
    monday: ["sub-ona", "sub-math", "sub-eng", "sub-it"],
    tuesday: ["sub-phys", "sub-chem", "sub-rus", "sub-mathtask"],
    wednesday: ["sub-bio", "sub-hist", "sub-arab", "sub-engtask"],
    thursday: ["sub-math", "sub-ona", "sub-tarbiya", "sub-it"],
    friday: ["sub-chem", "sub-phys", "sub-rus", "sub-bio"],
    saturday: ["sub-arab", "sub-hist", "sub-mathtask", "sub-engtask"],
    sunday: [],
  },
  updated_at: new Date().toISOString(),
};
