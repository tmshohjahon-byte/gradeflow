export type GradeValue = 2 | 3 | 4 | 5;

export type Language = 'uz' | 'en' | 'ru';

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  grade_level?: string;
  school_name?: string;
  created_at: string;
};

export type Subject = {
  id: string;
  user_id: string;
  name: string;
  code?: string;
  color: string;
  icon?: string;
  teacher_name?: string;
  created_at: string;
};

export type GradeType = 'classwork' | 'homework' | 'quiz' | 'exam' | 'test' | 'other';

export type Grade = {
  id: string;
  user_id: string;
  subject_id: string;
  grade_value: GradeValue;
  date: string; // ISO date format YYYY-MM-DD
  comment?: string;
  type?: GradeType;
  created_at: string;
};

export type AcademicGoal = {
  id: string;
  user_id: string;
  subject_id: string;
  target_grade: number; // e.g. 4.8 or 5.0
  target_date?: string;
  status: 'in_progress' | 'achieved' | 'at_risk';
  created_at: string;
  updated_at?: string;
};

export type NotificationType = 'warning' | 'danger' | 'info' | 'success';

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  subject_id?: string;
  is_read: boolean;
  created_at: string;
  dedup_key?: string;
};

export type SubjectStats = {
  subject: Subject;
  average: number;
  totalGrades: number;
  count5: number;
  count4: number;
  count3: number;
  count2: number;
  trend: 'up' | 'down' | 'stable';
  trendDelta: number;
  previousPeriodAverage: number;
  recentGrades: Grade[];
  ruleStatus: 'danger' | 'warning' | 'good' | 'excellent';
  ruleMessage: string;
};

export type PerformanceMetrics = {
  overallGpa: number;
  totalSubjects: number;
  totalGrades: number;
  count5: number;
  count4: number;
  count3: number;
  count2: number;
  academicPercentage: number;
  improvementIndicator: {
    direction: 'up' | 'down' | 'neutral';
    value: number; // percentage change vs previous period
    label: string;
  };
  weeklyData: {
    week: string;
    average: number;
    count: number;
    date: string;
  }[];
  monthlyData: {
    month: string;
    average: number;
    count: number;
  }[];
  subjectAverages: {
    subjectId: string;
    name: string;
    color: string;
    average: number;
    totalGrades: number;
  }[];
};

export type MentorAnalysis = {
  weakestSubject: SubjectStats | null;
  strongestSubject: SubjectStats | null;
  decliningSubjects: SubjectStats[];
  improvingSubjects: SubjectStats[];
  attentionNeededSubjects: SubjectStats[];
  weeklyVsMonthly: {
    thisWeekAvg: number;
    lastWeekAvg: number;
    thisMonthAvg: number;
    lastMonthAvg: number;
    weeklyTrend: number;
    monthlyTrend: number;
  };
  recommendations: {
    id: string;
    subjectId?: string;
    subjectName?: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionSteps: string[];
    potentialImpact: string;
  }[];
  impactTracking: {
    measuredSinceDays: number;
    gradesRecordedSinceAlerts: number;
    averageGradeChange: number;
    effectiveRate: number; // 0-100%
  };
};
