import {
  Subject,
  Grade,
  AcademicGoal,
  SubjectStats,
  MentorAnalysis,
  Language,
} from "@/types/database";
import { calculateSubjectStats } from "./analytics";
import { translations } from "./i18n";
import { addNotificationIfNotExists } from "./storage";

export function analyzeAcademicPerformance(
  subjects: Subject[],
  grades: Grade[],
  goals: AcademicGoal[],
  lang: Language = "uz",
  currentTime?: number
): MentorAnalysis {
  const t = translations[lang] || translations.uz;

  // Calculate subject stats
  const subjectStatsList: SubjectStats[] = subjects.map((sub) =>
    calculateSubjectStats(sub, grades, lang)
  );

  // Filter subjects that have grades
  const activeStats = subjectStatsList.filter((s) => s.totalGrades > 0);

  // 1. Identify Strongest & Weakest Subjects
  // Multi-factor evaluation: average (60%) + trend delta (25%) + consistency (15%)
  const scoredSubjects = activeStats.map((s) => {
    const consistencyScore = s.totalGrades > 0 ? (s.count5 / s.totalGrades) * 5 : 3;
    const compositeScore =
      s.average * 0.6 + (s.average + s.trendDelta) * 0.25 + consistencyScore * 0.15;
    return {
      stats: s,
      compositeScore,
    };
  });

  scoredSubjects.sort((a, b) => b.compositeScore - a.compositeScore);

  const strongestSubject = scoredSubjects.length > 0 ? scoredSubjects[0].stats : null;
  const weakestSubject =
    scoredSubjects.length > 0
      ? scoredSubjects[scoredSubjects.length - 1].stats
      : null;

  // 2. Detect Declining Subjects
  // Either downward trend, or average < 4.0, or last 2 grades <= 3
  const decliningSubjects = activeStats.filter((s) => {
    const hasDownwardTrend = s.trend === "down";
    const isBelowFour = s.average < 4.0;
    const recentHasLowGrade = s.recentGrades.slice(0, 2).some((g) => g.grade_value <= 3);
    return hasDownwardTrend || isBelowFour || recentHasLowGrade;
  });

  // 3. Improving Subjects
  const improvingSubjects = activeStats.filter(
    (s) => s.trend === "up" || s.trendDelta > 0.2
  );

  // 4. Subjects Needing Attention
  // Includes subjects below 4.5 OR subjects with goal at risk OR low grade frequency
  const attentionNeededSubjects = activeStats.filter((s) => {
    const isBelowFourFive = s.average < 4.5;
    const isDeclining = s.trend === "down";
    const goal = goals.find((g) => g.subject_id === s.subject.id);
    const goalGap = goal ? goal.target_grade - s.average : 0;
    const goalAtRisk = goalGap > 0.4;
    return isBelowFourFive || isDeclining || goalAtRisk;
  });

  // 5. Weekly vs Monthly Comparison
  const now = currentTime ?? (typeof window !== "undefined" ? Date.now() : 1770000000000);
  const DAY_MS = 86400000;

  const thisWeekGrades = grades.filter((g) => {
    const diff = now - new Date(g.date).getTime();
    return diff <= 7 * DAY_MS && diff >= 0;
  });
  const lastWeekGrades = grades.filter((g) => {
    const diff = now - new Date(g.date).getTime();
    return diff > 7 * DAY_MS && diff <= 14 * DAY_MS;
  });

  const thisMonthGrades = grades.filter((g) => {
    const diff = now - new Date(g.date).getTime();
    return diff <= 30 * DAY_MS && diff >= 0;
  });
  const lastMonthGrades = grades.filter((g) => {
    const diff = now - new Date(g.date).getTime();
    return diff > 30 * DAY_MS && diff <= 60 * DAY_MS;
  });

  const calcAvg = (arr: Grade[]) =>
    arr.length > 0
      ? Number((arr.reduce((a, b) => a + b.grade_value, 0) / arr.length).toFixed(2))
      : 0;

  const thisWeekAvg = calcAvg(thisWeekGrades);
  const lastWeekAvg = calcAvg(lastWeekGrades);
  const thisMonthAvg = calcAvg(thisMonthGrades);
  const lastMonthAvg = calcAvg(lastMonthGrades);

  const weeklyTrend =
    lastWeekAvg > 0 ? Number((thisWeekAvg - lastWeekAvg).toFixed(2)) : 0;
  const monthlyTrend =
    lastMonthAvg > 0 ? Number((thisMonthAvg - lastMonthAvg).toFixed(2)) : 0;

  // 6. Generate Practical Study Recommendations
  const recommendations: MentorAnalysis["recommendations"] = [];

  // Weakest subject recommendation
  if (weakestSubject) {
    const sName = weakestSubject.subject.name;
    const avg = weakestSubject.average;
    let recTitle = "";
    let recDesc = "";
    let actionSteps: string[] = [];
    let potentialImpact = "";

    if (lang === "uz") {
      recTitle = `${sName} bo'yicha intensiv tiklash rejasi`;
      recDesc = `Joriy o'rtacha ko'rsatkich ${avg} ballni tashkil etmoqda. Oxirgi baholashlarda bo'shliqlar mavjudligi sezilmoqda.`;
      actionSteps = [
        "Mavzular bo'yicha tushunarsiz qolgan asosiy formulalar/qoidalarni ajratib oling",
        "Har kuni 25 daqiqa davomida chalg'imay faqat ushbu fan mashqlarini yeching (Pomodoro)",
        "O'qituvchi bilan konsultatsiya tashkil qilib, oxirgi nazorat ishi xatolarini tahlil qiling",
        "Keyingi 2 haftada kamida 2 ta mustaqil topshiriqni a'lo (5) bahoga topshiring",
      ];
      potentialImpact = "+0.35 GPA o'sish potentsiali (2 hafta ichida)";
    } else if (lang === "ru") {
      recTitle = `План интенсивного восстановления по предмету ${sName}`;
      recDesc = `Текущий средний балл составляет ${avg}. Наблюдаются пробелы в последних темах.`;
      actionSteps = [
        "Выпишите темы и формулы, вызвавшие затруднения в последних работах",
        "Выделяйте 25 минут ежедневно на решение практических задач (метод Помодоро)",
        "Разберите ошибки с преподавателем на консультации",
        "Сдайте следующие 2 практических задания на высший балл (5)",
      ];
      potentialImpact = "Потенциал роста +0.35 GPA за 2 недели";
    } else {
      recTitle = `Intensive Recovery Strategy for ${sName}`;
      recDesc = `Current average is ${avg}. Diagnostic reveals performance dips in recent assessments.`;
      actionSteps = [
        "Catalog core formulas and concepts that caused errors in recent tests",
        "Dedicate 25 minutes daily of uninterrupted deliberate practice (Pomodoro technique)",
        "Review mistake patterns with your teacher during office hours",
        "Submit the next 2 assignments targeting grade 5",
      ];
      potentialImpact = "+0.35 GPA recovery potential within 2 weeks";
    }

    recommendations.push({
      id: "rec-weakest",
      subjectId: weakestSubject.subject.id,
      subjectName: sName,
      priority: "high",
      title: recTitle,
      description: recDesc,
      actionSteps,
      potentialImpact,
    });
  }

  // Declining subjects recommendations
  decliningSubjects
    .filter((s) => s.subject.id !== weakestSubject?.subject.id)
    .slice(0, 2)
    .forEach((s, idx) => {
      const sName = s.subject.name;
      if (lang === "uz") {
        recommendations.push({
          id: `rec-declining-${idx}`,
          subjectId: s.subject.id,
          subjectName: sName,
          priority: "high",
          title: `${sName}: Pasayish tendensiyasini to'xtatish`,
          description: `So'nggi haftalarda o'rtacha ball ${s.average} ga o'zgardi (tendensiya: ${s.trendDelta > 0 ? "+" : ""}${s.trendDelta}).`,
          actionSteps: [
            "Oxirgi olingan 3 yoki 4 baholarning sabablarini tahlil qiling",
            "Muntazam o'z-o'zini sinash (active recall va mock testlar) usulini qo'llang",
            "Mavzularni boshqalarga tushuntirib berish (Feynman texnikasi)",
          ],
          potentialImpact: "+0.25 barqarorlik ko'rsatkichi",
        });
      } else if (lang === "ru") {
        recommendations.push({
          id: `rec-declining-${idx}`,
          subjectId: s.subject.id,
          subjectName: sName,
          priority: "high",
          title: `${sName}: Остановка нисходящего тренда`,
          description: `За последние недели показатель изменился до ${s.average} (дельта: ${s.trendDelta > 0 ? "+" : ""}${s.trendDelta}).`,
          actionSteps: [
            "Проанализируйте причины получения последних троек или четвёрок",
            "Применяйте метод активного повторения и самотестирования",
            "Объясняйте сложные темы вслух (техника Фейнмана)",
          ],
          potentialImpact: "Стабилизация и прирост +0.25 GPA",
        });
      } else {
        recommendations.push({
          id: `rec-declining-${idx}`,
          subjectId: s.subject.id,
          subjectName: sName,
          priority: "high",
          title: `${sName}: Halt Negative Momentum`,
          description: `Performance shifted to ${s.average} with a period delta of ${s.trendDelta > 0 ? "+" : ""}${s.trendDelta}.`,
          actionSteps: [
            "Audit recent graded quizzes to identify recurring misconception patterns",
            "Implement active recall and spaced practice sessions",
            "Use the Feynman technique: explain core concepts simply without looking at notes",
          ],
          potentialImpact: "+0.25 score stabilization",
        });
      }
    });

  // Strongest subject preservation recommendation
  if (strongestSubject) {
    const sName = strongestSubject.subject.name;
    if (lang === "uz") {
      recommendations.push({
        id: "rec-strongest",
        subjectId: strongestSubject.subject.id,
        subjectName: sName,
        priority: "medium",
        title: `${sName}: Yetakchi ko'rsatkichni saqlash va olimpiada tayyorgarligi`,
        description: `Sizning ${sName} bo'yicha o'rtacha ballingiz ${strongestSubject.average} — bu a'lo natija!`,
        actionSteps: [
          "Mavjud a'lo natijani ushlab turish uchun haftada 1 marta mustahkamlovchi takrorlash o'tkazing",
          "Murakkabroq olimpiada yoki xalqaro sertifikat darajasidagi masalalarni yechib boring",
          "O'z bilimlaringiz bilan sinfdoshlaringizga yordam berib bilimlarni yanada chuqurlashtiring",
        ],
        potentialImpact: "Doimiy 5.0 maksimal reytingni himoya qilish",
      });
    } else if (lang === "ru") {
      recommendations.push({
        id: "rec-strongest",
        subjectId: strongestSubject.subject.id,
        subjectName: sName,
        priority: "medium",
        title: `${sName}: Поддержание лидерства и олимпиадный уровень`,
        description: `Ваш средний балл по ${sName} составляет ${strongestSubject.average} — отличный результат!`,
        actionSteps: [
          "Проводите поддерживающее повторение раз в неделю",
          "Решайте олимпиадные и углубленные задачи",
          "Закрепляйте материал, объясняя его одноклассникам",
        ],
        potentialImpact: "Удержание максимального рейтинга 5.0",
      });
    } else {
      recommendations.push({
        id: "rec-strongest",
        subjectId: strongestSubject.subject.id,
        subjectName: sName,
        priority: "medium",
        title: `${sName}: Mastery Preservation & Advanced Growth`,
        description: `Average score in ${sName} is ${strongestSubject.average} — top tier execution!`,
        actionSteps: [
          "Conduct a 30-minute weekly review to prevent knowledge decay",
          "Attempt competition-level problems or advanced reading",
          "Deepen conceptual mastery through peer mentoring",
        ],
        potentialImpact: "Sustain near-perfect 5.0 ranking",
      });
    }
  }

  // 7. Track Whether Recommendations Are Working (Impact tracking)
  // Compare grades in the last 14 days vs earlier grades for subjects with alerts
  const measuredSinceDays = 21;
  const cutoffTime = now - measuredSinceDays * DAY_MS;
  const recentAlertGrades = grades.filter(
    (g) => new Date(g.date).getTime() >= cutoffTime
  );
  const priorAlertGrades = grades.filter(
    (g) => new Date(g.date).getTime() < cutoffTime
  );

  let averageGradeChange = 0;
  let effectiveRate = 85;

  if (recentAlertGrades.length > 0 && priorAlertGrades.length > 0) {
    const recentAvg =
      recentAlertGrades.reduce((a, b) => a + b.grade_value, 0) /
      recentAlertGrades.length;
    const priorAvg =
      priorAlertGrades.reduce((a, b) => a + b.grade_value, 0) /
      priorAlertGrades.length;
    averageGradeChange = Number((recentAvg - priorAvg).toFixed(2));
    effectiveRate =
      averageGradeChange >= 0
        ? Math.min(95, Math.max(70, Math.round(75 + averageGradeChange * 30)))
        : Math.max(45, Math.round(75 + averageGradeChange * 30));
  }

  return {
    weakestSubject,
    strongestSubject,
    decliningSubjects,
    improvingSubjects,
    attentionNeededSubjects,
    weeklyVsMonthly: {
      thisWeekAvg,
      lastWeekAvg,
      thisMonthAvg,
      lastMonthAvg,
      weeklyTrend,
      monthlyTrend,
    },
    recommendations,
    impactTracking: {
      measuredSinceDays,
      gradesRecordedSinceAlerts: recentAlertGrades.length,
      averageGradeChange,
      effectiveRate,
    },
  };
}

// ----------------------------------------------------
// DYNAMIC NOTIFICATION AUDITOR (Avoids duplicate notifications!)
// ----------------------------------------------------
export async function auditAndDispatchAcademicNotifications(
  subjects: Subject[],
  grades: Grade[],
  goals: AcademicGoal[],
  lang: Language = "uz"
) {
  const t = translations[lang] || translations.uz;

  for (const subject of subjects) {
    const stats = calculateSubjectStats(subject, grades, lang);
    if (stats.totalGrades === 0) continue;

    // Rule 1: A subject average drops below 4.5
    if (stats.average < 4.5) {
      const bucket = Math.floor(stats.average * 10);
      const dedupKey = `drop_below_45_${subject.id}_${bucket}`;
      await addNotificationIfNotExists({
        user_id: subject.user_id,
        title: `${t.alertDropBelow45Title}: ${subject.name}`,
        message: `${subject.name} ${t.alertDropBelow45Desc} (${stats.average} ${t.outOf5})`,
        type: stats.average < 4.0 ? "danger" : "warning",
        subject_id: subject.id,
        is_read: false,
        dedup_key: dedupKey,
      });
    }

    // Rule 2: A student's performance declines (trend down with delta <= -0.2)
    if (stats.trend === "down" && stats.trendDelta <= -0.2) {
      const dedupKey = `trend_down_${subject.id}_${Math.abs(Math.floor(stats.trendDelta * 10))}`;
      await addNotificationIfNotExists({
        user_id: subject.user_id,
        title: `${t.alertPerformanceDeclinedTitle}: ${subject.name}`,
        message: `${subject.name} ${t.alertPerformanceDeclinedDesc} (${stats.trendDelta})`,
        type: "warning",
        subject_id: subject.id,
        is_read: false,
        dedup_key: dedupKey,
      });
    }

    // Rule 3: Target achieved!
    const goal = goals.find((g) => g.subject_id === subject.id);
    if (goal && stats.average >= goal.target_grade) {
      const dedupKey = `target_achieved_${subject.id}_${goal.target_grade}`;
      await addNotificationIfNotExists({
        user_id: subject.user_id,
        title: `${t.alertTargetAchievedTitle}: ${subject.name}`,
        message: `${subject.name} ${t.alertTargetAchievedDesc} (${stats.average} / ${goal.target_grade})`,
        type: "success",
        subject_id: subject.id,
        is_read: false,
        dedup_key: dedupKey,
      });
    }

    // Rule 4: Subject needs additional attention (average < 4.2 or recent grade is 2/3)
    const hasRecentLowGrade = stats.recentGrades.slice(0, 1).some((g) => g.grade_value <= 3);
    if (hasRecentLowGrade) {
      const lastGrade = stats.recentGrades[0];
      const dedupKey = `attention_low_grade_${lastGrade.id}`;
      await addNotificationIfNotExists({
        user_id: subject.user_id,
        title: `${t.alertNeedsAttentionTitle}: ${subject.name}`,
        message: `${subject.name} ${t.alertNeedsAttentionDesc}`,
        type: "warning",
        subject_id: subject.id,
        is_read: false,
        dedup_key: dedupKey,
      });
    }
  }
}

// ----------------------------------------------------
// INTERACTIVE AI MENTOR CONVERSATION ENGINE
// ----------------------------------------------------
export function generateMentorResponse(
  userQuery: string,
  analysis: MentorAnalysis,
  subjects: Subject[],
  lang: Language = "uz"
): string {
  const queryLower = userQuery.toLowerCase();

  // Find if user mentioned a specific subject
  const matchedSubject = subjects.find(
    (s) =>
      queryLower.includes(s.name.toLowerCase()) ||
      (s.code && queryLower.includes(s.code.toLowerCase()))
  );

  if (lang === "uz") {
    if (matchedSubject) {
      const isWeak = analysis.weakestSubject?.subject.id === matchedSubject.id;
      const isDeclining = analysis.decliningSubjects.some(
        (s) => s.subject.id === matchedSubject.id
      );

      const subNameLower = matchedSubject.name.toLowerCase();
      let subjectSpecificSteps = "";

      if (subNameLower.includes("ingliz") || subNameLower.includes("english")) {
        subjectSpecificSteps = 
          `**Ingliz tili bo'yicha maxsus mentor tavsiyalari:**\n` +
          `1. 🎧 **Active Listening & Shadowing:** Podkastlarni tinglab, o'sha intonatsiyada ovoz chiqarib qaytaring.\n` +
          `2. 📖 **Academic Vocabulary:** Har kuni 10-15 ta yangi so'zni kontekstda gaplar tuzib yodlang.\n` +
          `3. ✍️ **Writing & Essays:** Har hafta kamida bitta insho yoki xat yozing va grammatikani tekshirib boring.\n` +
          `4. ⏱️ Reading va testlarda vaqtni to'g'ri taqsimlashni mashq qiling.`;
      } else if (subNameLower.includes("matematika") || subNameLower.includes("math")) {
        subjectSpecificSteps = 
          `**Matematika va Math Task bo'yicha maxsus mentor tavsiyalari:**\n` +
          `1. 📐 **Formulalarni tushunish:** Formulalarni yodlamasdan, ularning qayerdan kelib chiqishini isbotlab o'rganing.\n` +
          `2. 🎯 **Har kuni 5 ta murakkab masala:** Nazariyadan ko'ra ko'proq amaliy masalalarni ketma-ket yeching.\n` +
          `3. 📝 **Xatolar daftari:** Noto'g'ri chiqqan masalani 2 kundan keyin qaytadan mustaqil yechib ko'ring.\n` +
          `4. ⚡ Hisoblash tezligi va e'tiborni oshirish uchun doimiy mashq qiling.`;
      } else if (subNameLower.includes("kimyo")) {
        subjectSpecificSteps = 
          `**Kimyo bo'yicha maxsus mentor tavsiyalari:**\n` +
          `1. ⚗️ **Valentlik va formulalar:** Elementlar davriy jadvalidagi qonuniyatlarni chuqur o'rganing.\n` +
          `2. ⚖️ **Reaksiyalarni tenglashtirish:** Oksidlanish-qaytarilish reaksiyalarini elektron balans usulida tenglang.\n` +
          `3. 🧪 **Masala yechish:** Modda miqdori (mol), eritmalar konsentratsiyasi bo'yicha amaliy masalalarni yeching.\n` +
          `4. 📋 Laboratoriya va tajriba xulosalarini mantiqiy tahlil qiling.`;
      } else if (subNameLower.includes("it")) {
        subjectSpecificSteps = 
          `**IT va Dasturlash bo'yicha maxsus mentor tavsiyalari:**\n` +
          `1. 💻 **Hands-on Coding:** Har kuni kamida 30-45 daqiqa amaliy kod yozing (Python / Web).\n` +
          `2. 🧩 **Algoritmlar va Mantiq:** Masalalarni kichik qismlarga bo'lib, mantiqiy blok-sxemalar chizing.\n` +
          `3. 🛠️ **Loyihalar ustida ishlash:** Kichik real loyihalar yaratib bilimlarni mustahkamlang.\n` +
          `4. 🔍 Xatolarni (Debug) qilishni odat qiling, StackOverflow va dokumentatsiyani o'rganing.`;
      } else if (subNameLower.includes("arab")) {
        subjectSpecificSteps = 
          `**Arab tili bo'yicha maxsus mentor tavsiyalari:**\n` +
          `1. 🗣️ **Maxraj va talaffuz:** Harflarning to'g'ri maxrajidan chiqishiga jiddiy e'tibor bering.\n` +
          `2. 📖 **Sarf va Nahv:** So'z yasalishi va gapdagi e'roblar (harakatlar) qoidalarini mustahkamlang.\n` +
          `3. ✍️ **Husnixat va yozuv:** Arab yozuvida matnlarni ko'chirish va imloni mustahkamlash.\n` +
          `4. 📚 Lug'at boyligini oshirish uchun har kuni matnlarni tarjima qilish.`;
      } else if (subNameLower.includes("fizika")) {
        subjectSpecificSteps = 
          `**Fizika bo'yicha maxsus mentor tavsiyalari:**\n` +
          `1. ⚛️ **Fizik ma'no:** Har bir formuladagi kattaliklarning birliklari va fizik ma'nosini tushuning.\n` +
          `2. 📈 **Chizmalar va kuchlar:** Mexanika va dinamika masalalarida barcha ta'sir etuvchi kuchlarni chizmada ko'rsating.\n` +
          `3. 🧮 **O'lchov birliklari tahlili:** Javobning to'g'riligini o'lchov birliklari orqali tekshirish odati.\n` +
          `4. 🔬 Real hodisalar va tajribalarni nazariya bilan bog'lang.`;
      } else if (subNameLower.includes("tarix")) {
        subjectSpecificSteps = 
          `**Tarix bo'yicha maxsus mentor tavsiyalari:**\n` +
          `1. ⏳ **Xronologik jadval:** Muhim voqealar va sanalarni vaqt chizig'ida tizimlashtiring.\n` +
          `2. 🗺️ **Tarixiy xaritalar:** Davlatlar chegaralari va jang maydonlarini xaritada ko'rsatib o'rganing.\n` +
          `3. 🔗 **Sabab-oqibat mantiqi:** Har bir tarixiy hodisaning tub sabablarini va natijalarini tahlil qiling.\n` +
          `4. 📖 Mavzuni birovga ertak kabi hikoya qilib berish orqali xotirada mustahkamlang.`;
      } else if (subNameLower.includes("tarbiya")) {
        subjectSpecificSteps = 
          `**Tarbiya fani bo'yicha maxsus mentor tavsiyalari:**\n` +
          `1. 🌟 **Axloqiy qadriyatlar:** Darsdagi mavzularni kundalik hayotdagi munosabatlar bilan bog'lang.\n` +
          `2. 👥 **Jamoaviy madaniyat:** Sinfdoshlar va jamoada faol muloqot va hurmat qoidalarini qo'llang.\n` +
          `3. 📚 Ibratli voqealar va allomalarimiz o'gitlarini tahlil qiling.`;
      } else if (subNameLower.includes("rus")) {
        subjectSpecificSteps = 
          `**Rus tili bo'yicha maxsus mentor tavsiyalari:**\n` +
          `1. 🗣️ **Падежи & управление:** Har kuni bitta kelishik (падеж) va unga bog'liq fe'llar bo'yicha 15 daqiqa mashq yeching.\n` +
          `2. 📖 **Lug'at boyligi:** Har kuni 10 ta yangi ibora va sinonimlarni kartochkalar orqali yodlang.\n` +
          `3. 🎧 **Tinglab tushunish:** Rus tilidagi qisqa audio/podkastlarni tinglab, orqasidan ovoz chiqarib takrorlang (Shadowing usuli).\n` +
          `4. ✍️ Haftada 2 marta kichik bayon yoki diktant yozib xatolarni tahlil qiling.`;
      } else if (subNameLower.includes("ona tili")) {
        subjectSpecificSteps = 
          `**Ona tili bo'yicha maxsus mentor tavsiyalari:**\n` +
          `1. 📝 **Imlo va morfemika:** Asos va qo'shimchalar, tovush o'zgarishlari qoidalarini mustahkamlang.\n` +
          `2. 🔍 **Sintaktik tahlil:** Qo'shma gap turlari va tinish belgilarining qo'yilish o'rinlarini amalda qo'llang.\n` +
          `3. ✍️ **Insho va bayon mahorati:** Fikrni mantiqiy va adabiy tilda ifodalash ustida ishlang.\n` +
          `4. ⏱️ Har kuni 20 ta mavzulashtirilgan test yechib, xatolar ustida ishlang.`;
      } else if (subNameLower.includes("bio")) {
        subjectSpecificSteps = 
          `**Biologiya bo'yicha maxsus mentor tavsiyalari:**\n` +
          `1. 🧬 **Genetika masalalari:** Mendel qonunlari, krossingover va jinsga bog'liq irsiylanish masalalarini sxematik yeching.\n` +
          `2. 🔬 **Sitologiya va biokimyo:** Hujayra organoidlari, fotosintez va ATF sintezi bosqichlarini chizib o'rganing.\n` +
          `3. 📚 **Terminologiya:** Yangi biologik terminlar uchun lug'at tuting.\n` +
          `4. 📊 Test sinovlarida savolni oxirigacha sinchkovlik bilan o'qish odatini shakllantiring.`;
      } else {
        subjectSpecificSteps = 
          `**Tavsiya etiladigan amaliy qadamlar:**\n` +
          `1. Oxirgi darslar bo'yicha mavzuviy testlarni qayta mustahkamlang.\n` +
          `2. Xatolar daftari (Error Log) tuting: har bir xato sababini yozib boring.\n` +
          `3. O'qituvchidan qo'shimcha nazorat mashqlari so'rang va a'lo baho olishga harakat qiling.\n` +
          `4. Har kuni kamida 20 daqiqa ushbu fanga doimiy vaqt ajrating.`;
      }

      return `Sizning **${matchedSubject.name}** fani bo'yicha tahlilim:\n\n` +
        `• Joriy holat: ${isWeak ? "⚠️ Bu sizning eng ko'p e'tibor talab qiluvchi faningiz." : isDeclining ? "📉 Oxirgi baholarda biroz pasayish kuzatilmoqda." : "✅ Ushbu fan bo'yicha ko'rsatkichlaringiz yaxshi maromda."}\n\n` +
        subjectSpecificSteps;
    }

    if (queryLower.includes("reja") || queryLower.includes("plan") || queryLower.includes("jadval")) {
      return `📅 **Shohjahon uchun 7 kunlik Shaxsiy Akademik Reja:**\n\n` +
        `• **Dushanba**: Ona tili (Imlo va grammatik mashqlar) & Rus tili (Lug'at va matn)\n` +
        `• **Seshanba**: Biologiya (Genetika masalalari) & Ona tili\n` +
        `• **Chorshanba**: Kamon otish (Texnika va nishonga urish mashqi) & Biologiya\n` +
        `• **Payshanba**: Rus tili (Grammatika va suhbat) & Kamon otish mashg'uloti\n` +
        `• **Juma**: Biologiya (Sxemalar va takrorlash) & Ona tili (Haftalik nazorat)\n` +
        `• **Shanba**: Kamon otish (Musobaqa rejimida otish) va haftalik xatolar tahlili\n` +
        `• **Yakshanba**: 🏖️ Dam olish kuni! Hordiq chiqarish va yangi haftaga reja tuzish.`;
    }

    return `Salom, **Shohjahon**! Men sizning **GradeFlow AI Akademik Mentoringizman**.\n\n` +
      `Sizning fanlaringiz:\n` +
      `• 🎯 **Kamon otish** | 🇷🇺 **Rus tili** | 🇺🇿 **Ona tili** | 🧬 **Biologiya**\n\n` +
      `Bugungi kunda barcha ko'rsatkichlaringizni kuzatib bormoqdaman.\n` +
      `Menga bemalol savol bering: masalan, *"Kamon otishda qanday natijani oshiray?"*, *"7 kunlik dars rejasi"*, yoki *"Rus tilidan bahoni 5 qilish"*!`;
  }

  if (lang === "ru") {
    if (matchedSubject) {
      return `Мой детальный анализ по предмету **${matchedSubject.name}**:\n\n` +
        `• Рекомендации:\n` +
        `1. Заведите журнал ошибок и разберите каждую тему, вызвавшую вопросы.\n` +
        `2. Занимайтесь по 25 минут методом интервального повторения.\n` +
        `3. Проконсультируйтесь с преподавателем перед следующим экзаменом.\n` +
        `4. Стремитесь сдать следующие 2 работы на пятёрку.`;
    }
    return `Здравствуйте! Я ваш **GradeFlow ИИ Академический Ментор**.\n\n` +
      `• Сильный предмет: **${analysis.strongestSubject?.subject.name || "Английский"}** (${analysis.strongestSubject?.average || 5.0})\n` +
      `• Требует внимания: **${analysis.weakestSubject?.subject.name || "Физика"}** (${analysis.weakestSubject?.average || 3.8})\n\n` +
      `Спросите меня: *"Как улучшить оценку по физике?"*, *"Составь план на неделю"* или задайте любой вопрос по учебе!`;
  }

  // English
  if (matchedSubject) {
    return `AI Diagnostic for **${matchedSubject.name}**:\n\n` +
      `• Status: ${matchedSubject.name} requires consistent focus and spaced practice.\n` +
      `• Action Plan:\n` +
      `1. Keep an Error Log: write down exactly why past mistakes occurred.\n` +
      `2. Execute 25-minute Pomodoro study sprints focusing on primary problem sets.\n` +
      `3. Seek feedback during teacher consultation hours.\n` +
      `4. Target consecutive grade 5s on upcoming homework and quizzes.`;
  }
  return `Hello! I am your **GradeFlow AI Academic Mentor**.\n\n` +
    `• Strongest Subject: **${analysis.strongestSubject?.subject.name || "English"}** (${analysis.strongestSubject?.average || 5.0})\n` +
    `• Priority Focus: **${analysis.weakestSubject?.subject.name || "Physics"}** (${analysis.weakestSubject?.average || 3.8})\n` +
    `• Weekly Delta: ${analysis.weeklyVsMonthly.weeklyTrend >= 0 ? "+" : ""}${analysis.weeklyVsMonthly.weeklyTrend} points.\n\n` +
    `Ask me anything: *"How can I raise my Physics grade?"*, *"Build me a 7-day revision schedule"*, or *"What grades do I need to reach my goal?"*!`;
}
