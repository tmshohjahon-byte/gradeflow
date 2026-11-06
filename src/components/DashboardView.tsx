"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  BookOpen,
  GraduationCap,
  Award,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Minus,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Subject,
  Grade,
  PerformanceMetrics,
  MentorAnalysis,
  Language,
} from "@/types/database";
import { translations } from "@/lib/i18n";
import { formatDate, getGradeBadgeColor } from "@/lib/utils";

type DashboardViewProps = {
  metrics: PerformanceMetrics;
  mentorAnalysis: MentorAnalysis;
  subjects: Subject[];
  recentGrades: Grade[];
  lang: Language;
  onOpenAddGrade: () => void;
  onNavigateTab: (tab: string) => void;
  onEditGrade: (grade: Grade) => void;
  onDeleteGrade: (gradeId: string) => void;
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  mentorAnalysis,
  subjects,
  recentGrades,
  lang,
  onOpenAddGrade,
  onNavigateTab,
  onEditGrade,
  onDeleteGrade,
}) => {
  const t = translations[lang] || translations.uz;

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome & AI Mentor Diagnostic Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/60 border border-indigo-500/20 p-5 sm:p-6 backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.aiMentor}</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-300 font-medium">
                {t.aiMentorSubtitle}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {lang === "uz"
                ? "Akademik Ko'rsatkichlar & AI Monitoring"
                : lang === "ru"
                ? "Академическая Успеваемость & ИИ Мониторинг"
                : "Academic Performance & AI Monitoring"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {mentorAnalysis.weakestSubject ? (
                <>
                  <span className="text-rose-400 font-semibold">
                    {mentorAnalysis.weakestSubject.subject.name}
                  </span>{" "}
                  ({mentorAnalysis.weakestSubject.average} {t.outOf5}) —{" "}
                  {mentorAnalysis.weakestSubject.ruleMessage}
                </>
              ) : (
                t.mentorRuleGood
              )}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onNavigateTab("mentor")}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 transition-all hover:border-indigo-500/40"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{t.aiMentor}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={onOpenAddGrade}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.quickAddGrade}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Overall GPA */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.overallGpa}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">
              {metrics.overallGpa > 0 ? metrics.overallGpa.toFixed(2) : "0.00"}
            </span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {metrics.overallGpa >= 4.8
                ? "A'lo daraja"
                : metrics.overallGpa >= 4.5
                ? "Yaxshi natija"
                : metrics.overallGpa >= 4.0
                ? "Qoniqarli"
                : "Diqqat talab"}
            </span>
            <span className="font-bold text-indigo-400">
              {metrics.academicPercentage}%
            </span>
          </div>
        </div>

        {/* 2. Total Subjects & Grades */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.totalSubjects} & {t.totalGrades}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-3">
            <div>
              <span className="text-3xl font-black text-white">
                {metrics.totalSubjects}
              </span>
              <span className="text-xs text-slate-400 ml-1">fan</span>
            </div>
            <span className="text-slate-600 text-xl font-light">•</span>
            <div>
              <span className="text-3xl font-black text-white">
                {metrics.totalGrades}
              </span>
              <span className="text-xs text-slate-400 ml-1">baho</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center space-x-1">
            <span>Muntazamlik:</span>
            <span className="text-slate-200 font-medium">
              {metrics.totalGrades >= 15 ? "Yuqori faollik" : "O'rtacha faollik"}
            </span>
          </div>
        </div>

        {/* 3. Academic Improvement Indicator */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.improvementIndicator}
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                metrics.improvementIndicator.direction === "up"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : metrics.improvementIndicator.direction === "down"
                  ? "bg-rose-500/10 text-rose-400"
                  : "bg-slate-700/40 text-slate-300"
              }`}
            >
              {metrics.improvementIndicator.direction === "up" ? (
                <TrendingUp className="w-4 h-4" />
              ) : metrics.improvementIndicator.direction === "down" ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-2xl font-black ${
                metrics.improvementIndicator.direction === "up"
                  ? "text-emerald-400"
                  : metrics.improvementIndicator.direction === "down"
                  ? "text-rose-400"
                  : "text-slate-200"
              }`}
            >
              {metrics.improvementIndicator.label}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {t.vsPreviousPeriod}
          </div>
        </div>

        {/* 4. Grades Distribution Breakdown (5s, 4s, 3s, 2s) */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.gradesDistribution}
            </span>
            <span className="text-xs font-bold text-slate-300">
              Jami: {metrics.totalGrades}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 my-2.5">
            <div className="text-center p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-[10px] text-emerald-400 font-semibold">5 (A)</div>
              <div className="text-lg font-black text-emerald-300">
                {metrics.count5}
              </div>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-[10px] text-blue-400 font-semibold">4 (B)</div>
              <div className="text-lg font-black text-blue-300">
                {metrics.count4}
              </div>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-[10px] text-amber-400 font-semibold">3 (C)</div>
              <div className="text-lg font-black text-amber-300">
                {metrics.count3}
              </div>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <div className="text-[10px] text-rose-400 font-semibold">2 (F)</div>
              <div className="text-lg font-black text-rose-300">
                {metrics.count2}
              </div>
            </div>
          </div>

          {/* Visual bar distribution */}
          <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden">
            {metrics.totalGrades > 0 ? (
              <>
                <div
                  style={{ width: `${(metrics.count5 / metrics.totalGrades) * 100}%` }}
                  className="bg-emerald-500"
                  title={`5 baholar: ${metrics.count5}`}
                />
                <div
                  style={{ width: `${(metrics.count4 / metrics.totalGrades) * 100}%` }}
                  className="bg-blue-500"
                  title={`4 baholar: ${metrics.count4}`}
                />
                <div
                  style={{ width: `${(metrics.count3 / metrics.totalGrades) * 100}%` }}
                  className="bg-amber-500"
                  title={`3 baholar: ${metrics.count3}`}
                />
                <div
                  style={{ width: `${(metrics.count2 / metrics.totalGrades) * 100}%` }}
                  className="bg-rose-500"
                  title={`2 baholar: ${metrics.count2}`}
                />
              </>
            ) : (
              <div className="w-full bg-slate-800" />
            )}
          </div>
        </div>
      </div>

      {/* Charts Section: Weekly & Monthly Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Recharts */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {t.weeklyChartTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === "uz"
                  ? "Haftalar kesimida o'rtacha ball tebranishi"
                  : lang === "ru"
                  ? "Колебания среднего балла по неделям"
                  : "Average score velocity by calendar week"}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              5.0 shkalasi
            </span>
          </div>

          <div className="h-64 w-full">
            {metrics.weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics.weeklyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="week"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#1E293B" }}
                  />
                  <YAxis
                    domain={[2, 5]}
                    ticks={[2, 3, 4, 5]}
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#1E293B" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#F8FAFC",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                    }}
                    formatter={(val: any) => [`${val} ball`, t.averageGrade]}
                    labelFormatter={(label) => `Hafta: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="average"
                    stroke="#6366F1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAvg)"
                    dot={{ fill: "#6366F1", r: 4 }}
                    activeDot={{ r: 6, fill: "#818CF8" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                {t.noData}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Performance Recharts */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {t.monthlyChartTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === "uz"
                  ? "Oylar bo'yicha akademik barqarorlik"
                  : lang === "ru"
                  ? "Академическая стабильность по месяцам"
                  : "Monthly academic aggregate trend"}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Oylik dinamika
            </span>
          </div>

          <div className="h-64 w-full">
            {metrics.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.monthlyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#1E293B" }}
                  />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#1E293B" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#F8FAFC",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                    }}
                    formatter={(val: any) => [`${val} ball`, t.averageGrade]}
                  />
                  <Bar
                    dataKey="average"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                {t.noData}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Grades & Subject Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Grades Feed (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{t.recentGrades}</span>
            </h3>
            <button
              onClick={() => onNavigateTab("grades")}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>{t.viewAll}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentGrades.slice(0, 6).map((grade) => {
              const sub = getSubjectById(grade.subject_id);
              const badge = getGradeBadgeColor(grade.grade_value);

              return (
                <div
                  key={grade.id}
                  className="py-3 flex items-center justify-between group hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {/* Grade Number Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base border ${badge.bg} ${badge.text} ${badge.border} shrink-0`}
                    >
                      {grade.grade_value}
                    </div>

                    {/* Subject & Comment */}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: sub?.color || "#6366F1" }}
                        />
                        <span className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                          {sub?.name || "Fan"}
                        </span>
                        {grade.type && (
                          <span className="hidden sm:inline text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {grade.type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {grade.comment || formatDate(grade.date, lang)}
                      </p>
                    </div>
                  </div>

                  {/* Date & Quick Actions */}
                  <div className="flex items-center space-x-3 shrink-0 text-right">
                    <span className="text-xs text-slate-400 font-medium">
                      {formatDate(grade.date, lang)}
                    </span>
                    <button
                      onClick={() => onEditGrade(grade)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-slate-800 transition-all"
                      title={t.edit}
                    >
                      {t.edit}
                    </button>
                  </div>
                </div>
              );
            })}

            {recentGrades.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                {t.noData}
              </div>
            )}
          </div>
        </div>

        {/* Subject Averages Quick List (1 col) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>{t.subjects}</span>
            </h3>
            <button
              onClick={() => onNavigateTab("subjects")}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>{t.viewAll}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {metrics.subjectAverages.slice(0, 6).map((sub) => (
              <div
                key={sub.subjectId}
                onClick={() => onNavigateTab("subjects")}
                className="cursor-pointer p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span className="font-semibold text-slate-200 truncate">
                      {sub.name}
                    </span>
                  </div>
                  <span
                    className={`font-black ml-2 ${
                      sub.average >= 4.8
                        ? "text-emerald-400"
                        : sub.average >= 4.5
                        ? "text-blue-400"
                        : sub.average >= 4.0
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    {sub.average.toFixed(2)}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(sub.average / 5.0) * 100}%`,
                      backgroundColor: sub.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
