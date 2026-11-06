"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ChevronRight,
  MoreVertical,
  X,
  Check,
  Calendar,
  AlertTriangle,
  History,
  Trash2,
  Edit2,
} from "lucide-react";
import { Subject, Grade, AcademicGoal, Language, SubjectStats } from "@/types/database";
import { translations } from "@/lib/i18n";
import { calculateSubjectStats } from "@/lib/analytics";
import { formatDate, getGradeBadgeColor } from "@/lib/utils";
import { addSubject, updateSubject, deleteSubject } from "@/lib/storage";

type SubjectsViewProps = {
  subjects: Subject[];
  grades: Grade[];
  goals: AcademicGoal[];
  lang: Language;
  onOpenAddGrade: (subjectId?: string) => void;
  onRefreshData: () => void;
};

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  grades,
  goals,
  lang,
  onOpenAddGrade,
  onRefreshData,
}) => {
  const t = translations[lang] || translations.uz;

  const [selectedSubjectModal, setSelectedSubjectModal] = useState<Subject | null>(null);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // New subject form states
  const [newSubName, setNewSubName] = useState("");
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubColor, setNewSubColor] = useState("#6366F1");
  const [newSubTeacher, setNewSubTeacher] = useState("");
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const colors = [
    "#6366F1", // Indigo
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#8B5CF6", // Purple
    "#14B8A6", // Teal
    "#EF4444", // Red
  ];

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setNewSubName("");
    setNewSubCode("");
    setNewSubColor("#6366F1");
    setNewSubTeacher("");
    setIsAddSubjectOpen(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setNewSubName(sub.name);
    setNewSubCode(sub.code || "");
    setNewSubColor(sub.color);
    setNewSubTeacher(sub.teacher_name || "");
    setIsAddSubjectOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    if (editingSubject) {
      await updateSubject(editingSubject.id, {
        name: newSubName.trim(),
        code: newSubCode.trim() || undefined,
        color: newSubColor,
        teacher_name: newSubTeacher.trim() || undefined,
      });
    } else {
      await addSubject({
        user_id: subjects.length > 0 ? subjects[0].user_id : "student-usr-01",
        name: newSubName.trim(),
        code: newSubCode.trim() || undefined,
        color: newSubColor,
        teacher_name: newSubTeacher.trim() || undefined,
      });
    }

    setIsAddSubjectOpen(false);
    onRefreshData();
  };

  const handleDeleteSubjectConfirm = async () => {
    if (subjectToDelete) {
      await deleteSubject(subjectToDelete.id);
      setSubjectToDelete(null);
      if (selectedSubjectModal?.id === subjectToDelete.id) {
        setSelectedSubjectModal(null);
      }
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Add Subject */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t.subjectAnalyticsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {lang === "uz"
              ? "Har bir fan bo'yicha o'rtacha ball, tendensiya va dinamik tahlillar"
              : lang === "ru"
              ? "Средний балл, тренды и подробная аналитика по каждому предмету"
              : "Average grades, momentum, and deep subject-level analytics"}
          </p>
        </div>

        <button
          onClick={handleOpenAddSubject}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addSubject}</span>
        </button>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((sub) => {
          const stats = calculateSubjectStats(sub, grades, lang);
          const goal = goals.find((g) => g.subject_id === sub.id);

          return (
            <div
              key={sub.id}
              className="rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all p-5 space-y-4 relative flex flex-col justify-between group overflow-hidden"
            >
              {/* Top Accent bar with Subject Color */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: sub.color }}
              />

              <div className="space-y-3.5">
                {/* Subject Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md font-bold"
                      style={{
                        backgroundColor: `${sub.color}25`,
                        border: `1px solid ${sub.color}50`,
                        color: sub.color,
                      }}
                    >
                      {sub.code ? sub.code.slice(0, 3) : <BookOpen className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-white truncate">
                        {sub.name}
                      </h3>
                      {sub.teacher_name && (
                        <p className="text-xs text-slate-400 truncate">
                          {sub.teacher_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditSubject(sub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title={t.edit}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSubjectToDelete(sub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Average Grade & Trend */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-3xl font-black text-white">
                      {stats.totalGrades > 0 ? stats.average.toFixed(2) : "0.00"}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ 5.0</span>
                  </div>

                  {/* Trend Indicator */}
                  <div className="flex items-center space-x-1">
                    {stats.trend === "up" ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+{stats.trendDelta}</span>
                      </span>
                    ) : stats.trend === "down" ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>{stats.trendDelta}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                        <Minus className="w-3.5 h-3.5" />
                        <span>{t.stable}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Rule Status Banner */}
                <div
                  className={`p-2.5 rounded-xl text-xs font-medium border leading-snug ${
                    stats.ruleStatus === "danger"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      : stats.ruleStatus === "warning"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      : stats.ruleStatus === "good"
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  }`}
                >
                  {stats.ruleMessage}
                </div>

                {/* Breakdown Progress Bar & Counts */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {t.gradesCount}: <strong>{stats.totalGrades}</strong>
                    </span>
                    <div className="flex space-x-2 text-[11px]">
                      <span className="text-emerald-400 font-semibold">5: {stats.count5}</span>
                      <span className="text-blue-400 font-semibold">4: {stats.count4}</span>
                      <span className="text-amber-400 font-semibold">3: {stats.count3}</span>
                      <span className="text-rose-400 font-semibold">2: {stats.count2}</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 flex overflow-hidden">
                    {stats.totalGrades > 0 ? (
                      <>
                        <div
                          style={{ width: `${(stats.count5 / stats.totalGrades) * 100}%` }}
                          className="bg-emerald-500"
                        />
                        <div
                          style={{ width: `${(stats.count4 / stats.totalGrades) * 100}%` }}
                          className="bg-blue-500"
                        />
                        <div
                          style={{ width: `${(stats.count3 / stats.totalGrades) * 100}%` }}
                          className="bg-amber-500"
                        />
                        <div
                          style={{ width: `${(stats.count2 / stats.totalGrades) * 100}%` }}
                          className="bg-rose-500"
                        />
                      </>
                    ) : (
                      <div className="w-full bg-slate-800" />
                    )}
                  </div>
                </div>

                {/* Goal progress if target is set */}
                {goal && (
                  <div className="text-xs pt-1 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
                    <span>{t.targetAverage}: <strong className="text-white">{goal.target_grade.toFixed(1)}</strong></span>
                    <span
                      className={`font-semibold ${
                        stats.average >= goal.target_grade ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {stats.average >= goal.target_grade ? "Bajarildi 🏆" : `${(goal.target_grade - stats.average).toFixed(2)} qoldi`}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-2">
                <button
                  onClick={() => setSelectedSubjectModal(sub)}
                  className="text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1"
                >
                  <span>{t.detailedSubjectAnalysis}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => onOpenAddGrade(sub.id)}
                  className="p-1.5 px-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-slate-700 flex items-center space-x-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Baho</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Subject History & Modal */}
      {selectedSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0D1322] border border-slate-700 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                  style={{ backgroundColor: selectedSubjectModal.color }}
                >
                  {selectedSubjectModal.code || <BookOpen className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedSubjectModal.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedSubjectModal.teacher_name || t.subjectAnalyticsTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubjectModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagnostic Box */}
            {(() => {
              const modalStats = calculateSubjectStats(selectedSubjectModal, grades, lang);
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <div className="text-[11px] text-slate-400">{t.averageGrade}</div>
                      <div className="text-2xl font-black text-white mt-1">
                        {modalStats.average.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <div className="text-[11px] text-slate-400">{t.gradesCount}</div>
                      <div className="text-2xl font-black text-white mt-1">
                        {modalStats.totalGrades}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <div className="text-[11px] text-slate-400">{t.performanceTrend}</div>
                      <div
                        className={`text-xl font-black mt-1 ${
                          modalStats.trendDelta > 0
                            ? "text-emerald-400"
                            : modalStats.trendDelta < 0
                            ? "text-rose-400"
                            : "text-slate-300"
                        }`}
                      >
                        {modalStats.trendDelta > 0 ? "+" : ""}
                        {modalStats.trendDelta}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <div className="text-[11px] text-slate-400">{t.previousPeriodComp}</div>
                      <div className="text-xl font-black text-slate-300 mt-1">
                        {modalStats.previousPeriodAverage.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Exact rule quote */}
                  <div
                    className={`p-3.5 rounded-xl border text-xs font-semibold ${
                      modalStats.ruleStatus === "danger"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        : modalStats.ruleStatus === "warning"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                        : modalStats.ruleStatus === "good"
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    }`}
                  >
                    💡 AI Mentor: {modalStats.ruleMessage}
                  </div>

                  {/* Chronological Grades List */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Baholar jurnali (Xronologik)
                    </h4>
                    <div className="divide-y divide-slate-800 bg-slate-900/60 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
                      {grades
                        .filter((g) => g.subject_id === selectedSubjectModal.id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((g) => {
                          const badge = getGradeBadgeColor(g.grade_value);
                          return (
                            <div
                              key={g.id}
                              className="p-3 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center space-x-3">
                                <span
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black ${badge.bg} ${badge.text} border ${badge.border}`}
                                >
                                  {g.grade_value}
                                </span>
                                <div>
                                  <div className="text-slate-200 font-medium">
                                    {g.comment || (g.type ? `${g.type}` : "Baholash")}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {formatDate(g.date, lang)}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                                {g.type || "Baholash"}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const subId = selectedSubjectModal.id;
                  setSelectedSubjectModal(null);
                  onOpenAddGrade(subId);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Plus className="w-4 h-4" />
                <span>Ushbu fanga baho qo'shish</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSubjectModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#0D1322] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingSubject ? "Fanni tahrirlash" : t.addSubject}
              </h3>
              <button
                onClick={() => setIsAddSubjectOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t.subjectName} *
                </label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Masalan: Fizika, Ingliz tili..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    {t.subjectCode}
                  </label>
                  <input
                    type="text"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    placeholder="MATH, PHYS..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    {t.teacherName}
                  </label>
                  <input
                    type="text"
                    value={newSubTeacher}
                    onChange={(e) => setNewSubTeacher(e.target.value)}
                    placeholder="Ustoz ismi..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t.subjectColor}
                </label>
                <div className="flex items-center space-x-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        newSubColor === c ? "scale-125 border-white" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
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

      {/* Delete Subject Confirmation */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#0D1322] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-white text-center">
              Fanni o'chirishni tasdiqlaysizmi?
            </h4>
            <p className="text-xs text-slate-400 text-center">
              "{subjectToDelete.name}" va unga tegishli barcha baholar o'chiriladi.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSubjectToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteSubjectConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
