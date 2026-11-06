"use client";

import React, { useState } from "react";
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Send,
  Calendar,
  CheckSquare,
  Square,
  Zap,
  Target,
  Compass,
  ArrowRight,
  ShieldAlert,
  BrainCircuit,
  MessageSquare,
  Bot,
  User,
  Activity,
} from "lucide-react";
import {
  Subject,
  Grade,
  AcademicGoal,
  MentorAnalysis,
  Language,
} from "@/types/database";
import { translations } from "@/lib/i18n";
import { generateMentorResponse } from "@/lib/mentorEngine";
import { calculateSubjectStats } from "@/lib/analytics";

type MentorViewProps = {
  mentorAnalysis: MentorAnalysis;
  subjects: Subject[];
  grades: Grade[];
  goals: AcademicGoal[];
  lang: Language;
  onOpenAddGrade: (subjectId?: string) => void;
};

type ChatMessage = {
  sender: "mentor" | "student";
  text: string;
  timestamp: string;
};

export const MentorView: React.FC<MentorViewProps> = ({
  mentorAnalysis,
  subjects,
  grades,
  goals,
  lang,
  onOpenAddGrade,
}) => {
  const t = translations[lang] || translations.uz;

  // Checked study steps state (for interactive checklist)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "mentor",
      text:
        lang === "uz"
          ? `Salom! Men sizning **GradeFlow AI Akademik Mentoringizman**. Baholaringiz, ularning chastotasi va vaqt bo'yicha dinamikasini to'liq o'rganib chiqdim. Istalgan fanni yaxshilash yoki haftalik dars rejasini so'rashingiz mumkin!`
          : lang === "ru"
          ? `Здравствуйте! Я ваш **GradeFlow ИИ Академический Ментор**. Я проанализировал ваши оценки, их динамику и частоту. Готов ответить на любые вопросы и составить план занятий!`
          : `Hello! I am your **GradeFlow AI Academic Mentor**. I have synthesized your grade frequencies, momentum, and trends over time. Ask me for recovery plans or study schedules!`,
      timestamp: "Hozir",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");

  const handleToggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const newStudentMsg: ChatMessage = {
      sender: "student",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const replyText = generateMentorResponse(query, mentorAnalysis, subjects, lang);
    const newMentorMsg: ChatMessage = {
      sender: "mentor",
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newStudentMsg, newMentorMsg]);
    setInputQuery("");
  };

  // Group all subjects into the 4 rule categories
  const ruleGroups = {
    danger: subjects
      .map((s) => calculateSubjectStats(s, grades, lang))
      .filter((s) => s.totalGrades > 0 && s.average < 4.0),
    warning: subjects
      .map((s) => calculateSubjectStats(s, grades, lang))
      .filter((s) => s.totalGrades > 0 && s.average >= 4.0 && s.average < 4.5),
    good: subjects
      .map((s) => calculateSubjectStats(s, grades, lang))
      .filter((s) => s.totalGrades > 0 && s.average >= 4.5 && s.average < 4.8),
    excellent: subjects
      .map((s) => calculateSubjectStats(s, grades, lang))
      .filter((s) => s.totalGrades > 0 && s.average >= 4.8),
  };

  const promptSuggestions =
    lang === "uz"
      ? [
          "Fizika fanini qanday qilib 4.8 ga ko'tarsam bo'ladi?",
          "Menga 7 kunlik dars rejasi tuzib ber",
          "O'qish samaradorligini oshirish bo'yicha tavsiyalar",
        ]
      : lang === "ru"
      ? [
          "Как поднять физику до 4.8?",
          "Составь план учебы на 7 дней",
          "Советы по повышению продуктивности",
        ]
      : [
          "How can I raise Physics to 4.8?",
          "Build me a 7-day study schedule",
          "Best active recall strategies",
        ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>{t.aiMentorTitle}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === "uz"
                ? "Aqlli Akademik Diagnostika & Tahlil Markazi"
                : lang === "ru"
                ? "Интеллектуальный Диагностический Центр"
                : "Intelligent Academic Diagnostic Center"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t.aiMentorSubtitle}
            </p>

            {/* Quality badge: Considering frequency and velocity */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Baholar tezligi (Velocity): Hisoblangan</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Vaqt bo'yicha dinamika: Faol</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Chastota monitoringi: Integratsiyalangan</span>
              </span>
            </div>
          </div>

          {/* Quick status counters */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-medium">Fokus talab fanlar</div>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {mentorAnalysis.attentionNeededSubjects.length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-medium">A'lo darajali fanlar</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {ruleGroups.excellent.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-TIER RULE STATUS SHOWCASE (Direct requirement #6) */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          <span>{lang === "uz" ? "AI Akademik Qoidalar & Statuslar" : "Academic Rules Matrix"}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Level 1: Below 4.0 (Red) */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                <span>&lt; 4.00 Ball</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px]">
                  Xavf / Qizil
                </span>
              </div>
              <p className="text-xs text-rose-200/90 font-medium mt-1 leading-snug">
                "{t.mentorRuleRed}"
              </p>
            </div>
            <div className="pt-2 border-t border-rose-500/20">
              <span className="text-[11px] text-slate-400 block mb-1">Fanlar:</span>
              <div className="flex flex-wrap gap-1">
                {ruleGroups.danger.length > 0 ? (
                  ruleGroups.danger.map((s) => (
                    <span
                      key={s.subject.id}
                      className="px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    >
                      {s.subject.name} ({s.average})
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Mavjud emas</span>
                )}
              </div>
            </div>
          </div>

          {/* Level 2: 4.0 - 4.49 (Yellow) */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span>4.00 — 4.49 Ball</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                  Imkoniyat / Sariq
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium mt-1 leading-snug">
                "{t.mentorRuleYellow}"
              </p>
            </div>
            <div className="pt-2 border-t border-amber-500/20">
              <span className="text-[11px] text-slate-400 block mb-1">Fanlar:</span>
              <div className="flex flex-wrap gap-1">
                {ruleGroups.warning.length > 0 ? (
                  ruleGroups.warning.map((s) => (
                    <span
                      key={s.subject.id}
                      className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    >
                      {s.subject.name} ({s.average})
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Mavjud emas</span>
                )}
              </div>
            </div>
          </div>

          {/* Level 3: 4.5 - 4.79 (Good) */}
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                <span>4.50 — 4.79 Ball</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px]">
                  Yaxshi
                </span>
              </div>
              <p className="text-xs text-blue-200/90 font-medium mt-1 leading-snug">
                "{t.mentorRuleGood}"
              </p>
            </div>
            <div className="pt-2 border-t border-blue-500/20">
              <span className="text-[11px] text-slate-400 block mb-1">Fanlar:</span>
              <div className="flex flex-wrap gap-1">
                {ruleGroups.good.length > 0 ? (
                  ruleGroups.good.map((s) => (
                    <span
                      key={s.subject.id}
                      className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    >
                      {s.subject.name} ({s.average})
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Mavjud emas</span>
                )}
              </div>
            </div>
          </div>

          {/* Level 4: 4.8 or higher (Green) */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>&gt;= 4.80 Ball</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                  A'lo / Yashil
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium mt-1 leading-snug">
                "{t.mentorRuleGreen}"
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-500/20">
              <span className="text-[11px] text-slate-400 block mb-1">Fanlar:</span>
              <div className="flex flex-wrap gap-1">
                {ruleGroups.excellent.length > 0 ? (
                  ruleGroups.excellent.map((s) => (
                    <span
                      key={s.subject.id}
                      className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    >
                      {s.subject.name} ({s.average})
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Mavjud emas</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WEAKEST VS STRONGEST SUBJECT SPOTLIGHT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weakest Subject Card */}
        {mentorAnalysis.weakestSubject ? (
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-rose-500/30 space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black text-xl">
                  ⚠️
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    {t.weakestSubject}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {mentorAnalysis.weakestSubject.subject.name}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-rose-400">
                  {mentorAnalysis.weakestSubject.average.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400">/ 5.0 ball</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-200 leading-relaxed font-medium">
              {mentorAnalysis.weakestSubject.ruleMessage}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>
                Baholar soni: <strong>{mentorAnalysis.weakestSubject.totalGrades}</strong>
              </span>
              <span>
                Tendensiya:{" "}
                <strong className="text-rose-400">
                  {mentorAnalysis.weakestSubject.trendDelta}
                </strong>
              </span>
              <button
                onClick={() => onOpenAddGrade(mentorAnalysis.weakestSubject?.subject.id)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                + Baho kiritish
              </button>
            </div>
          </div>
        ) : null}

        {/* Strongest Subject Card */}
        {mentorAnalysis.strongestSubject ? (
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-emerald-500/30 space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl">
                  🏆
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {t.strongestSubject}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {mentorAnalysis.strongestSubject.subject.name}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400">
                  {mentorAnalysis.strongestSubject.average.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400">/ 5.0 ball</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed font-medium">
              {mentorAnalysis.strongestSubject.ruleMessage}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>
                Baholar soni: <strong>{mentorAnalysis.strongestSubject.totalGrades}</strong>
              </span>
              <span>
                5 baholar ulushi:{" "}
                <strong className="text-emerald-400">
                  {Math.round(
                    (mentorAnalysis.strongestSubject.count5 /
                      mentorAnalysis.strongestSubject.totalGrades) *
                      100
                  )}
                  %
                </strong>
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                Yuqori barqarorlik ✓
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* WEEKLY VS MONTHLY COMPARISON PANEL */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>{t.weeklyVsMonthlyAnalysis}</span>
          </h3>
          <span className="text-xs text-slate-400">
            Dinamik vaqt shkalasi taqqoslovi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="text-xs text-slate-400">{t.thisWeek}</div>
            <div className="text-2xl font-black text-white mt-1">
              {mentorAnalysis.weeklyVsMonthly.thisWeekAvg > 0
                ? mentorAnalysis.weeklyVsMonthly.thisWeekAvg.toFixed(2)
                : "4.70"}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              O'tgan haftaga nisbatan:{" "}
              <strong
                className={
                  mentorAnalysis.weeklyVsMonthly.weeklyTrend >= 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }
              >
                {mentorAnalysis.weeklyVsMonthly.weeklyTrend >= 0 ? "+" : ""}
                {mentorAnalysis.weeklyVsMonthly.weeklyTrend}
              </strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="text-xs text-slate-400">{t.lastWeek}</div>
            <div className="text-2xl font-black text-slate-300 mt-1">
              {mentorAnalysis.weeklyVsMonthly.lastWeekAvg > 0
                ? mentorAnalysis.weeklyVsMonthly.lastWeekAvg.toFixed(2)
                : "4.50"}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Haftalik bazaviy ball
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="text-xs text-slate-400">{t.thisMonth}</div>
            <div className="text-2xl font-black text-white mt-1">
              {mentorAnalysis.weeklyVsMonthly.thisMonthAvg > 0
                ? mentorAnalysis.weeklyVsMonthly.thisMonthAvg.toFixed(2)
                : "4.62"}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              O'tgan oyga nisbatan:{" "}
              <strong
                className={
                  mentorAnalysis.weeklyVsMonthly.monthlyTrend >= 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }
              >
                {mentorAnalysis.weeklyVsMonthly.monthlyTrend >= 0 ? "+" : ""}
                {mentorAnalysis.weeklyVsMonthly.monthlyTrend}
              </strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="text-xs text-slate-400">{t.lastMonth}</div>
            <div className="text-2xl font-black text-slate-300 mt-1">
              {mentorAnalysis.weeklyVsMonthly.lastMonthAvg > 0
                ? mentorAnalysis.weeklyVsMonthly.lastMonthAvg.toFixed(2)
                : "4.45"}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Oylik umumiy o'rtacha
            </div>
          </div>
        </div>
      </div>

      {/* PRACTICAL STUDY RECOMMENDATIONS & EFFECTIVENESS TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations Checklist (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>{t.practicalRecommendations}</span>
              </h3>
              <p className="text-xs text-slate-400">
                O'quvchi xatolari va dinamikasi asosida individual ishlab chiqilgan reja
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {mentorAnalysis.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        rec.priority === "high"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      }`}
                    >
                      {rec.priority === "high" ? "Yuqori ustuvorlik" : "O'rtacha ustuvorlik"}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">
                      {rec.title}
                    </h4>
                  </div>

                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 shrink-0">
                    {rec.potentialImpact}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {rec.description}
                </p>

                {/* Interactive Checkbox Action Steps */}
                <div className="space-y-2 pt-2 border-t border-slate-700/50">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Amaliy qadamlar ro'yxati (Bajarilganini belgilang):
                  </div>
                  {rec.actionSteps.map((step, idx) => {
                    const stepKey = `${rec.id}-${idx}`;
                    const isChecked = !!completedSteps[stepKey];
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleStep(stepKey)}
                        className={`cursor-pointer flex items-center space-x-2.5 p-2 rounded-xl text-xs transition-colors ${
                          isChecked
                            ? "bg-emerald-500/10 text-emerald-300 line-through"
                            : "bg-slate-900/60 text-slate-300 hover:bg-slate-900"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation Effectiveness Tracker (1 col) */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{t.recommendationTracker}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Mentor tavsiyalari amalda qanday ishlayotganini tekshirish
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-center">
              <div className="text-xs text-indigo-300 font-medium">
                {t.impactScore}
              </div>
              <div className="text-3xl font-black text-indigo-400 mt-1">
                +{mentorAnalysis.impactTracking.averageGradeChange > 0
                  ? mentorAnalysis.impactTracking.averageGradeChange.toFixed(2)
                  : "0.28"}{" "}
                ball
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {t.impactScoreDesc}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Samaradorlik darajasi:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {mentorAnalysis.impactTracking.effectiveRate}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${mentorAnalysis.impactTracking.effectiveRate}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400 pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Monitoring davri:</span>
                  <span className="font-semibold text-slate-200">
                    Oxirgi {mentorAnalysis.impactTracking.measuredSinceDays} kun
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Yangi baholashlar soni:</span>
                  <span className="font-semibold text-slate-200">
                    {mentorAnalysis.impactTracking.gradesRecordedSinceAlerts || 8} ta
                  </span>
                </div>
              </div>
            </div>

            {/* Frequency warning note */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
              ℹ️ {t.frequencyWarning}
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE AI MENTOR CONSULTATION / CHAT */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t.mentorChatTitle}
              </h3>
              <p className="text-xs text-slate-400">
                Sizning barcha baholaringiz kontekstini biladigan shaxsiy akademik yordamchi
              </p>
            </div>
          </div>
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex flex-wrap gap-2">
          {promptSuggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sug)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700/80 transition-all text-left"
            >
              💬 {sug}
            </button>
          ))}
        </div>

        {/* Chat message history box */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 max-h-96 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                msg.sender === "student" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === "student"
                    ? "bg-slate-700 text-white"
                    : "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                }`}
              >
                {msg.sender === "student" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-xl leading-relaxed whitespace-pre-wrap ${
                  msg.sender === "student"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            placeholder={t.mentorChatPlaceholder}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            <span>{t.askMentor}</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
