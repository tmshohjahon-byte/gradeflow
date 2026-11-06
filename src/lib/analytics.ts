import {
  Subject,
  Grade,
  SubjectStats,
  PerformanceMetrics,
  Language,
} from "@/types/database";
import { translations } from "./i18n";

export function calculateSubjectStats(
  subject: Subject,
  allGrades: Grade[],
  lang: Language = "uz"
): SubjectStats {
  const t = translations[lang] || translations.uz;
  const grades = allGrades
    .filter((g) => g.subject_id === subject.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalGrades = grades.length;
  if (totalGrades === 0) {
    return {
      subject,
      average: 0,
      totalGrades: 0,
      count5: 0,
      count4: 0,
      count3: 0,
      count2: 0,
      trend: "stable",
      trendDelta: 0,
      previousPeriodAverage: 0,
      recentGrades: [],
      ruleStatus: "good",
      ruleMessage: t.mentorRuleGood,
    };
  }

  const sum = grades.reduce((acc, g) => acc + g.grade_value, 0);
  const average = Number((sum / totalGrades).toFixed(2));

  let count5 = 0;
  let count4 = 0;
  let count3 = 0;
  let count2 = 0;
  grades.forEach((g) => {
    if (g.grade_value === 5) count5++;
    else if (g.grade_value === 4) count4++;
    else if (g.grade_value === 3) count3++;
    else if (g.grade_value === 2) count2++;
  });

  // Calculate Trend: Compare most recent half vs older half
  let trend: "up" | "down" | "stable" = "stable";
  let trendDelta = 0;
  let previousPeriodAverage = average;

  if (totalGrades >= 2) {
    const splitIndex = Math.ceil(totalGrades / 2);
    const recentGradesPart = grades.slice(0, splitIndex);
    const olderGradesPart = grades.slice(splitIndex);

    const recentAvg =
      recentGradesPart.reduce((acc, g) => acc + g.grade_value, 0) /
      recentGradesPart.length;
    const olderAvg =
      olderGradesPart.reduce((acc, g) => acc + g.grade_value, 0) /
      olderGradesPart.length;

    trendDelta = Number((recentAvg - olderAvg).toFixed(2));
    previousPeriodAverage = Number(olderAvg.toFixed(2));

    if (trendDelta >= 0.15) {
      trend = "up";
    } else if (trendDelta <= -0.15) {
      trend = "down";
    } else {
      trend = "stable";
    }
  }

  // Exact rule evaluation
  let ruleStatus: "danger" | "warning" | "good" | "excellent";
  let ruleMessage: string;

  if (average < 4.0) {
    ruleStatus = "danger";
    ruleMessage = t.mentorRuleRed;
  } else if (average < 4.5) {
    ruleStatus = "warning";
    ruleMessage = t.mentorRuleYellow;
  } else if (average < 4.8) {
    ruleStatus = "good";
    ruleMessage = t.mentorRuleGood;
  } else {
    ruleStatus = "excellent";
    ruleMessage = t.mentorRuleGreen;
  }

  return {
    subject,
    average,
    totalGrades,
    count5,
    count4,
    count3,
    count2,
    trend,
    trendDelta,
    previousPeriodAverage,
    recentGrades: grades.slice(0, 5),
    ruleStatus,
    ruleMessage,
  };
}

export function calculatePerformanceMetrics(
  subjects: Subject[],
  grades: Grade[],
  lang: Language = "uz",
  currentTime?: number
): PerformanceMetrics {
  const t = translations[lang] || translations.uz;
  const totalGrades = grades.length;
  const totalSubjects = subjects.length;

  if (totalGrades === 0) {
    return {
      overallGpa: 0,
      totalSubjects,
      totalGrades: 0,
      count5: 0,
      count4: 0,
      count3: 0,
      count2: 0,
      academicPercentage: 0,
      improvementIndicator: {
        direction: "neutral",
        value: 0,
        label: t.stable,
      },
      weeklyData: [],
      monthlyData: [],
      subjectAverages: [],
    };
  }

  const sumAll = grades.reduce((acc, g) => acc + g.grade_value, 0);
  const overallGpa = Number((sumAll / totalGrades).toFixed(2));
  const academicPercentage = Math.min(100, Number(((overallGpa / 5.0) * 100).toFixed(1)));

  let count5 = 0;
  let count4 = 0;
  let count3 = 0;
  let count2 = 0;
  grades.forEach((g) => {
    if (g.grade_value === 5) count5++;
    else if (g.grade_value === 4) count4++;
    else if (g.grade_value === 3) count3++;
    else if (g.grade_value === 2) count2++;
  });

  // Improvement indicator: compare last 21 days vs previous 21 days
  const now = currentTime ?? (typeof window !== "undefined" ? Date.now() : 1770000000000);
  const DAY_MS = 86400000;
  const recentPeriodGrades = grades.filter((g) => {
    const diff = now - new Date(g.date).getTime();
    return diff <= 21 * DAY_MS && diff >= 0;
  });
  const priorPeriodGrades = grades.filter((g) => {
    const diff = now - new Date(g.date).getTime();
    return diff > 21 * DAY_MS && diff <= 42 * DAY_MS;
  });

  let direction: "up" | "down" | "neutral" = "neutral";
  let indicatorValue = 0;
  let indicatorLabel: string = t.stable;

  if (recentPeriodGrades.length > 0 && priorPeriodGrades.length > 0) {
    const recentAvg =
      recentPeriodGrades.reduce((a, b) => a + b.grade_value, 0) /
      recentPeriodGrades.length;
    const priorAvg =
      priorPeriodGrades.reduce((a, b) => a + b.grade_value, 0) /
      priorPeriodGrades.length;
    const delta = recentAvg - priorAvg;
    indicatorValue = Math.abs(Number(((delta / priorAvg) * 100).toFixed(1)));

    if (delta > 0.05) {
      direction = "up";
      indicatorLabel = `+${delta.toFixed(2)} (${indicatorValue}%) ${t.improved}`;
    } else if (delta < -0.05) {
      direction = "down";
      indicatorLabel = `-${Math.abs(delta).toFixed(2)} (${indicatorValue}%) ${t.declined}`;
    } else {
      direction = "neutral";
      indicatorLabel = t.stable;
    }
  } else {
    indicatorLabel = t.stable;
  }

  // Weekly data (last 6-8 weeks)
  const sortedByDate = [...grades].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weeklyMap: Record<string, { sum: number; count: number; date: string }> = {};
  sortedByDate.forEach((g) => {
    const d = new Date(g.date);
    // Find week start (Monday)
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const weekKey = `${monday.getMonth() + 1}/${monday.getDate()}`;

    if (!weeklyMap[weekKey]) {
      weeklyMap[weekKey] = { sum: 0, count: 0, date: g.date };
    }
    weeklyMap[weekKey].sum += g.grade_value;
    weeklyMap[weekKey].count += 1;
  });

  const weeklyData = Object.entries(weeklyMap).map(([week, info]) => ({
    week: `${week}`,
    average: Number((info.sum / info.count).toFixed(2)),
    count: info.count,
    date: info.date,
  }));

  // Monthly data (grouped by Month Year)
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const monthlyMap: Record<string, { sum: number; count: number }> = {};
  sortedByDate.forEach((g) => {
    const d = new Date(g.date);
    const mKey = `${monthNames[d.getMonth()]}`;
    if (!monthlyMap[mKey]) {
      monthlyMap[mKey] = { sum: 0, count: 0 };
    }
    monthlyMap[mKey].sum += g.grade_value;
    monthlyMap[mKey].count += 1;
  });

  const monthlyData = Object.entries(monthlyMap).map(([month, info]) => ({
    month,
    average: Number((info.sum / info.count).toFixed(2)),
    count: info.count,
  }));

  // Subject averages for quick comparison
  const subjectAverages = subjects.map((sub) => {
    const subGrades = grades.filter((g) => g.subject_id === sub.id);
    const subAvg =
      subGrades.length > 0
        ? Number(
            (
              subGrades.reduce((a, b) => a + b.grade_value, 0) /
              subGrades.length
            ).toFixed(2)
          )
        : 0;
    return {
      subjectId: sub.id,
      name: sub.name,
      color: sub.color,
      average: subAvg,
      totalGrades: subGrades.length,
    };
  });

  return {
    overallGpa,
    totalSubjects,
    totalGrades,
    count5,
    count4,
    count3,
    count2,
    academicPercentage,
    improvementIndicator: {
      direction,
      value: indicatorValue,
      label: indicatorLabel,
    },
    weeklyData,
    monthlyData,
    subjectAverages,
  };
}

export function calculateNeededConsecutiveFives(
  currentSum: number,
  currentCount: number,
  targetAverage: number
): number {
  if (currentCount === 0) return 1;
  const currentAvg = currentSum / currentCount;
  if (currentAvg >= targetAverage) return 0;
  if (targetAverage >= 5.0) {
    // If target is 5.0 and there is any grade < 5, mathematically average can only approach 5
    // But we calculate how many consecutive 5s round up to 5.0 (4.95+)
    targetAverage = 4.95;
  }

  // (currentSum + 5*k) / (currentCount + k) >= targetAverage
  // currentSum + 5k >= targetAverage * currentCount + targetAverage * k
  // k * (5 - targetAverage) >= targetAverage * currentCount - currentSum
  const numerator = targetAverage * currentCount - currentSum;
  const denominator = 5.0 - targetAverage;
  if (denominator <= 0) return 1;
  const k = Math.ceil(numerator / denominator);
  return Math.max(1, k);
}
