import { Subject, Grade, AcademicGoal, Notification, UserProfile } from "@/types/database";

export const defaultUser: UserProfile = {
  id: "student-usr-01",
  email: "azizbek.rahimov@example.uz",
  full_name: "Azizbek Rahimov",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  grade_level: "10-A sinf",
  school_name: "Toshkent Shaxar Prezident Maktabi",
  created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
};

export const defaultSubjects: Subject[] = [
  {
    id: "sub-math",
    user_id: defaultUser.id,
    name: "Matematika (Algebra & Geometriya)",
    code: "MATH",
    color: "#6366F1", // Indigo
    icon: "Calculator",
    teacher_name: "Ustoz Ergashev N.",
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "sub-eng",
    user_id: defaultUser.id,
    name: "Ingliz tili (Academic English)",
    code: "ENG",
    color: "#3B82F6", // Blue
    icon: "Languages",
    teacher_name: "Miss Jennifer Adams",
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "sub-phys",
    user_id: defaultUser.id,
    name: "Fizika (Mexanika & Termodinamika)",
    code: "PHYS",
    color: "#EC4899", // Pink
    icon: "Atom",
    teacher_name: "Dotsent Qodirov S.",
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "sub-cs",
    user_id: defaultUser.id,
    name: "Informatika & Dasturlash (Python)",
    code: "CS",
    color: "#10B981", // Emerald
    icon: "Code",
    teacher_name: "Muhandis Aliyev T.",
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "sub-chem",
    user_id: defaultUser.id,
    name: "Kimyo (Organik Kimyo)",
    code: "CHEM",
    color: "#F59E0B", // Amber
    icon: "FlaskConical",
    teacher_name: "O'qituvchi Mahmudova D.",
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "sub-hist",
    user_id: defaultUser.id,
    name: "O'zbekiston & Jahon Tarixi",
    code: "HIST",
    color: "#8B5CF6", // Purple
    icon: "History",
    teacher_name: "Muallim Saidov B.",
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: "sub-bio",
    user_id: defaultUser.id,
    name: "Biologiya (Genetika & Hujayra)",
    code: "BIO",
    color: "#14B8A6", // Teal
    icon: "Dna",
    teacher_name: "O'qituvchi Umarova G.",
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
];

// Helper to calculate date string days ago
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

export const defaultGrades: Grade[] = [
  // --- INGLIZ TILI (Consistent 5s, average ~4.85 - Green / Excellent)
  { id: "g-eng-1", user_id: defaultUser.id, subject_id: "sub-eng", grade_value: 5, date: daysAgo(38), comment: "Essay: Sustainable Cities", type: "homework", created_at: daysAgo(38) },
  { id: "g-eng-2", user_id: defaultUser.id, subject_id: "sub-eng", grade_value: 5, date: daysAgo(31), comment: "IELTS Reading Mock", type: "quiz", created_at: daysAgo(31) },
  { id: "g-eng-3", user_id: defaultUser.id, subject_id: "sub-eng", grade_value: 4, date: daysAgo(24), comment: "Vocabulary Test Unit 4", type: "classwork", created_at: daysAgo(24) },
  { id: "g-eng-4", user_id: defaultUser.id, subject_id: "sub-eng", grade_value: 5, date: daysAgo(17), comment: "Debate & Speaking presentation", type: "exam", created_at: daysAgo(17) },
  { id: "g-eng-5", user_id: defaultUser.id, subject_id: "sub-eng", grade_value: 5, date: daysAgo(10), comment: "Advanced Grammar test", type: "quiz", created_at: daysAgo(10) },
  { id: "g-eng-6", user_id: defaultUser.id, subject_id: "sub-eng", grade_value: 5, date: daysAgo(3), comment: "Academic Research Abstract", type: "homework", created_at: daysAgo(3) },

  // --- INFORMATIKA (CS) (average ~4.67 - Good)
  { id: "g-cs-1", user_id: defaultUser.id, subject_id: "sub-cs", grade_value: 5, date: daysAgo(36), comment: "Python OOP Classes & Objects", type: "classwork", created_at: daysAgo(36) },
  { id: "g-cs-2", user_id: defaultUser.id, subject_id: "sub-cs", grade_value: 4, date: daysAgo(28), comment: "Data Structures (Stack/Queue)", type: "homework", created_at: daysAgo(28) },
  { id: "g-cs-3", user_id: defaultUser.id, subject_id: "sub-cs", grade_value: 5, date: daysAgo(20), comment: "Recursion & Dynamic Programming", type: "quiz", created_at: daysAgo(20) },
  { id: "g-cs-4", user_id: defaultUser.id, subject_id: "sub-cs", grade_value: 5, date: daysAgo(12), comment: "Sorting algorithms project", type: "exam", created_at: daysAgo(12) },
  { id: "g-cs-5", user_id: defaultUser.id, subject_id: "sub-cs", grade_value: 4, date: daysAgo(5), comment: "SQL Database design lab", type: "classwork", created_at: daysAgo(5) },
  { id: "g-cs-6", user_id: defaultUser.id, subject_id: "sub-cs", grade_value: 5, date: daysAgo(1), comment: "API integration task", type: "homework", created_at: daysAgo(1) },

  // --- MATEMATIKA (average ~4.29 - Yellow / Room for improvement)
  { id: "g-math-1", user_id: defaultUser.id, subject_id: "sub-math", grade_value: 5, date: daysAgo(42), comment: "Hosilalar va funksiyalar", type: "classwork", created_at: daysAgo(42) },
  { id: "g-math-2", user_id: defaultUser.id, subject_id: "sub-math", grade_value: 4, date: daysAgo(35), comment: "Trigonometrik tenglamalar", type: "quiz", created_at: daysAgo(35) },
  { id: "g-math-3", user_id: defaultUser.id, subject_id: "sub-math", grade_value: 4, date: daysAgo(29), comment: "Geometriya: Fazoda vektorlar", type: "homework", created_at: daysAgo(29) },
  { id: "g-math-4", user_id: defaultUser.id, subject_id: "sub-math", grade_value: 3, date: daysAgo(21), comment: "Nazorat ishi: Integrallar", type: "exam", created_at: daysAgo(21) },
  { id: "g-math-5", user_id: defaultUser.id, subject_id: "sub-math", grade_value: 5, date: daysAgo(14), comment: "Kombinatorika masalalari", type: "classwork", created_at: daysAgo(14) },
  { id: "g-math-6", user_id: defaultUser.id, subject_id: "sub-math", grade_value: 4, date: daysAgo(7), comment: "Ehtimollar nazariyasi", type: "homework", created_at: daysAgo(7) },
  { id: "g-math-7", user_id: defaultUser.id, subject_id: "sub-math", grade_value: 5, date: daysAgo(2), comment: "Mustaqil ish topshirig'i", type: "classwork", created_at: daysAgo(2) },

  // --- FIZIKA (average ~3.83 - Red / Declining warning)
  { id: "g-phys-1", user_id: defaultUser.id, subject_id: "sub-phys", grade_value: 5, date: daysAgo(40), comment: "Kinematika qonunlari", type: "classwork", created_at: daysAgo(40) },
  { id: "g-phys-2", user_id: defaultUser.id, subject_id: "sub-phys", grade_value: 4, date: daysAgo(33), comment: "Dinamika va Nyuton qonunlari", type: "quiz", created_at: daysAgo(33) },
  { id: "g-phys-3", user_id: defaultUser.id, subject_id: "sub-phys", grade_value: 4, date: daysAgo(25), comment: "Statika va impuls saqlanishi", type: "homework", created_at: daysAgo(25) },
  { id: "g-phys-4", user_id: defaultUser.id, subject_id: "sub-phys", grade_value: 3, date: daysAgo(18), comment: "Termodinamika 1-qonuni", type: "exam", created_at: daysAgo(18) },
  { id: "g-phys-5", user_id: defaultUser.id, subject_id: "sub-phys", grade_value: 3, date: daysAgo(11), comment: "Molekulyar fizika nazorati", type: "quiz", created_at: daysAgo(11) },
  { id: "g-phys-6", user_id: defaultUser.id, subject_id: "sub-phys", grade_value: 4, date: daysAgo(4), comment: "Laboratoriya ishi №4", type: "classwork", created_at: daysAgo(4) },

  // --- KIMYO (average ~4.50 - Good)
  { id: "g-chem-1", user_id: defaultUser.id, subject_id: "sub-chem", grade_value: 4, date: daysAgo(37), comment: "Alkanlar va Alkenlar", type: "classwork", created_at: daysAgo(37) },
  { id: "g-chem-2", user_id: defaultUser.id, subject_id: "sub-chem", grade_value: 5, date: daysAgo(27), comment: "Kimyoviy kinetika va muvozanat", type: "quiz", created_at: daysAgo(27) },
  { id: "g-chem-3", user_id: defaultUser.id, subject_id: "sub-chem", grade_value: 4, date: daysAgo(19), comment: "Eritmalar konsentratsiyasi", type: "homework", created_at: daysAgo(19) },
  { id: "g-chem-4", user_id: defaultUser.id, subject_id: "sub-chem", grade_value: 5, date: daysAgo(9), comment: "Organik kimyo oraliq nazorati", type: "exam", created_at: daysAgo(9) },

  // --- TARIX (average ~4.60 - Good)
  { id: "g-hist-1", user_id: defaultUser.id, subject_id: "sub-hist", grade_value: 5, date: daysAgo(34), comment: "Temuriylar davri madaniyati", type: "classwork", created_at: daysAgo(34) },
  { id: "g-hist-2", user_id: defaultUser.id, subject_id: "sub-hist", grade_value: 5, date: daysAgo(26), comment: "Buyuk ipak yo'li ta'siri", type: "homework", created_at: daysAgo(26) },
  { id: "g-hist-3", user_id: defaultUser.id, subject_id: "sub-hist", grade_value: 4, date: daysAgo(16), comment: "Yevropa Uyg'onish davri", type: "quiz", created_at: daysAgo(16) },
  { id: "g-hist-4", user_id: defaultUser.id, subject_id: "sub-hist", grade_value: 5, date: daysAgo(8), comment: "Xronologik jadval tahlili", type: "classwork", created_at: daysAgo(8) },
  { id: "g-hist-5", user_id: defaultUser.id, subject_id: "sub-hist", grade_value: 4, date: daysAgo(2), comment: "XX asr diplomatik munosabatlari", type: "exam", created_at: daysAgo(2) },

  // --- BIOLOGIYA (average ~4.40 - Yellow / Acceptable)
  { id: "g-bio-1", user_id: defaultUser.id, subject_id: "sub-bio", grade_value: 4, date: daysAgo(32), comment: "Hujayra tuzilishi va mitoz", type: "classwork", created_at: daysAgo(32) },
  { id: "g-bio-2", user_id: defaultUser.id, subject_id: "sub-bio", grade_value: 5, date: daysAgo(22), comment: "Mendel qonunlari va genetik masalalar", type: "homework", created_at: daysAgo(22) },
  { id: "g-bio-3", user_id: defaultUser.id, subject_id: "sub-bio", grade_value: 4, date: daysAgo(15), comment: "DNK replikatsiyasi va RNK sintezi", type: "quiz", created_at: daysAgo(15) },
  { id: "g-bio-4", user_id: defaultUser.id, subject_id: "sub-bio", grade_value: 4, date: daysAgo(6), comment: "Ekologiya va oziq zanjiri", type: "classwork", created_at: daysAgo(6) },
  { id: "g-bio-5", user_id: defaultUser.id, subject_id: "sub-bio", grade_value: 5, date: daysAgo(1), comment: "Genetik modifikatsiyalar referati", type: "homework", created_at: daysAgo(1) },
];

export const defaultGoals: AcademicGoal[] = [
  {
    id: "goal-1",
    user_id: defaultUser.id,
    subject_id: "sub-math",
    target_grade: 4.8,
    target_date: daysAgo(-30),
    status: "in_progress",
    created_at: daysAgo(40),
  },
  {
    id: "goal-2",
    user_id: defaultUser.id,
    subject_id: "sub-eng",
    target_grade: 4.8,
    target_date: daysAgo(-20),
    status: "achieved", // 4.83 >= 4.80
    created_at: daysAgo(40),
  },
  {
    id: "goal-3",
    user_id: defaultUser.id,
    subject_id: "sub-phys",
    target_grade: 4.5,
    target_date: daysAgo(-15),
    status: "at_risk", // 3.83 is far from 4.5
    created_at: daysAgo(40),
  },
  {
    id: "goal-4",
    user_id: defaultUser.id,
    subject_id: "sub-chem",
    target_grade: 4.5,
    target_date: daysAgo(-45),
    status: "achieved", // 4.50 >= 4.50
    created_at: daysAgo(40),
  },
  {
    id: "goal-5",
    user_id: defaultUser.id,
    subject_id: "sub-cs",
    target_grade: 4.9,
    target_date: daysAgo(-25),
    status: "in_progress",
    created_at: daysAgo(40),
  },
];

export const defaultNotifications: Notification[] = [
  {
    id: "notif-1",
    user_id: defaultUser.id,
    title: "Diqqat: Fizika fanida pasayish",
    message: "Fizika fani bo'yicha o'rtacha ball 3.83 ga tushdi. Ushbu fanga ko'proq e'tibor qaratishingiz zarur.",
    type: "danger",
    subject_id: "sub-phys",
    is_read: false,
    dedup_key: "drop_below_40_sub-phys",
    created_at: daysAgo(4),
  },
  {
    id: "notif-2",
    user_id: defaultUser.id,
    title: "Maqsadga erishildi! 🏆",
    message: "Ingliz tili fani bo'yicha 4.80 maqsadli ko'rsatkich muvaffaqiyatli zabt etildi (Joriy ball: 4.83)!",
    type: "success",
    subject_id: "sub-eng",
    is_read: false,
    dedup_key: "target_achieved_sub-eng",
    created_at: daysAgo(3),
  },
  {
    id: "notif-3",
    user_id: defaultUser.id,
    title: "Kimyo bo'yicha maqsad bajarildi",
    message: "Kimyo fanida o'rtacha 4.50 ko'rsatkichga chiqildi.",
    type: "info",
    subject_id: "sub-chem",
    is_read: true,
    dedup_key: "target_achieved_sub-chem",
    created_at: daysAgo(9),
  },
  {
    id: "notif-4",
    user_id: defaultUser.id,
    title: "Haftalik o'sish sur'ati",
    message: "Informatika va Dasturlash bo'yicha oxirgi haftada ketma-ket a'lo baholar qayd etildi.",
    type: "info",
    subject_id: "sub-cs",
    is_read: true,
    dedup_key: "weekly_boost_sub-cs",
    created_at: daysAgo(5),
  },
];
