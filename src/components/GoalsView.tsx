"use client";

import React, { useState } from "react";
import {
  Target,
  Trophy,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Subject, Grade, AcademicGoal, Language } from "@/types/database";
import { translations } from "@/lib/i18n";
import { calculateSubjectStats, calculateNeededConsecutiveFives } from "@/lib/analytics";
import { formatDate } from "@/lib/utils";
import { saveGoal, deleteGoal } from "@/lib/storage";

type GoalsViewProps = {
  goals: AcademicGoal[];
  subjects: Subject[];
  grades: Grade[];
  lang: Language;
  onRefreshData: () => void;
};

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  subjects,
  grades,
  lang,
  onRefreshData,
}) => {
  const t = translations[lang] || translations.uz;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<AcademicGoal | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [targetGrade, setTargetGrade] = useState("4.8");
  const [targetDate, setTargetDate] = useState("");

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleOpenAddGoal = (goal?: AcademicGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setSelectedSubjectId(goal.subject_id);
      setTargetGrade(goal.target_grade.toString());
      setTargetDate(goal.target_date || "");
    } else {
      setEditingGoal(null);
      // Pick first subject that doesn't have a goal yet, or first subject
      const unusedSub = subjects.find((s) => !goals.some((g) => g.subject_id === s.id));
      setSelectedSubjectId(unusedSub ? unusedSub.id : subjects[0]?.id || "");
      setTargetGrade("4.8");
      const inOneMonth = new Date();
      inOneMonth.setMonth(inOneMonth.getMonth() + 1);
      setTargetDate(inOneMonth.toISOString().split("T")[0]);
    }
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;

    const numTarget = parseFloat(targetGrade);
    if (isNaN(numTarget) || numTarget < 2 || numTarget > 5) return;

    const stats = calculateSubjectStats(
      subjects.find((s) => s.id === selectedSubjectId)!,
      grades,
      lang
    );
    const status =
      stats.average >= numTarget
        ? "achieved"
        : numTarget - stats.average > 0.4
        ? "at_risk"
        : "in_progress";

    if (status === "achieved") {
      triggerCelebration();
    }

    await saveGoal({
      id: editingGoal ? editingGoal.id : undefined,
      user_id: subjects.find((s) => s.id === selectedSubjectId)?.user_id || "student-usr-01",
      subject_id: selectedSubjectId,
      target_grade: numTarget,
      target_date: targetDate || undefined,
      status,
    });

    setIsModalOpen(false);
    onRefreshData();
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
    onRefreshData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Add Goal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>{t.goalsTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {lang === "uz"
              ? "Fanlar bo'yicha maqsadli o'rtacha ballarni belgilash va marraga intilish monitoringi"
              : lang === "ru"
              ? "Постановка целевых баллов по предметам и мониторинг достижения"
              : "Target average benchmarks and progress calculations"}
          </p>
        </div>

        <button
          onClick={() => handleOpenAddGoal()}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.setNewGoal}</span>
        </button>
      </div>

      {/* Target Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const sub = subjects.find((s) => s.id === goal.subject_id);
          if (!sub) return null;

          const stats = calculateSubjectStats(sub, grades, lang);
          const isAchieved = stats.average >= goal.target_grade;
          const distance = Math.max(0, Number((goal.target_grade - stats.average).toFixed(2)));

          // Progress percentage towards goal
          const progressPercent = Math.min(
            100,
            Math.max(0, Math.round((stats.average / goal.target_grade) * 100))
          );

          // Needed 5s calculation
          const neededFives = calculateNeededConsecutiveFives(
            stats.average * stats.totalGrades,
            stats.totalGrades,
            goal.target_grade
          );

          return (
            <div
              key={goal.id}
              className={`p-6 rounded-3xl bg-slate-900/60 border transition-all space-y-4 relative flex flex-col justify-between overflow-hidden ${
                isAchieved
                  ? "border-emerald-500/40 bg-emerald-950/10 shadow-lg shadow-emerald-500/5"
                  : goal.status === "at_risk"
                  ? "border-rose-500/30 bg-rose-950/10"
                  : "border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {/* Top Accent line with subject color */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: sub.color }}
              />

              <div className="space-y-3.5">
                {/* Header: Subject & Status badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400">
                      {sub.code || "Fan"}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5 truncate max-w-[200px]">
                      {sub.name}
                    </h3>
                  </div>

                  {isAchieved ? (
                    <button
                      onClick={triggerCelebration}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:scale-105 transition-transform"
                      title="Qayta bayram qilish!"
                    >
                      <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.goalAchieved}</span>
                    </button>
                  ) : goal.status === "at_risk" ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{t.goalAtRisk}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <span>{t.goalInProgress}</span>
                    </span>
                  )}
                </div>

                {/* Score Comparison Display */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                  <div>
                    <span className="text-[11px] text-slate-400">{t.currentAverage}</span>
                    <div className="text-2xl font-black text-white mt-0.5">
                      {stats.totalGrades > 0 ? stats.average.toFixed(2) : "0.00"}
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-600" />

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">{t.targetAverage}</span>
                    <div className="text-2xl font-black text-indigo-400 mt-0.5">
                      {goal.target_grade.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{t.progressToGoal}</span>
                    <span className="font-bold text-slate-200">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAchieved
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : "bg-gradient-to-r from-indigo-500 to-purple-500"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Mathematical "Grades Needed Calculator" */}
                {!isAchieved ? (
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center space-x-1.5 font-semibold text-indigo-300">
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{lang === "uz" ? "Hisoblangan talab:" : "Required Grades:"}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Maqsadga erishish uchun kamida{" "}
                      <strong className="text-emerald-400 font-bold">
                        {neededFives} ta
                      </strong>{" "}
                      ketma-ket <strong>5 baho</strong> olish talab etiladi.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium">
                    {t.goalReachedCongratulations}
                  </div>
                )}

                {goal.target_date && (
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.targetDate}: {formatDate(goal.target_date, lang)}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => handleOpenAddGoal(goal)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={t.edit}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title={t.delete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Set / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#0D1322] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingGoal ? "Maqsadni tahrirlash" : t.setNewGoal}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t.selectSubject} *
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  disabled={!!editingGoal}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  required
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t.targetAverage} (2.0 - 5.0) *
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="2.0"
                  max="5.0"
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t.targetDate}
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
