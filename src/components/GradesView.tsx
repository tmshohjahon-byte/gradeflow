"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  BookOpen,
  ArrowUpDown,
  Tag,
  AlertCircle,
} from "lucide-react";
import { Subject, Grade, GradeValue, Language } from "@/types/database";
import { translations } from "@/lib/i18n";
import { formatDate, getGradeBadgeColor } from "@/lib/utils";

type GradesViewProps = {
  grades: Grade[];
  subjects: Subject[];
  lang: Language;
  onOpenAddGrade: (subjectId?: string) => void;
  onEditGrade: (grade: Grade) => void;
  onDeleteGrade: (gradeId: string) => void;
};

export const GradesView: React.FC<GradesViewProps> = ({
  grades,
  subjects,
  lang,
  onOpenAddGrade,
  onEditGrade,
  onDeleteGrade,
}) => {
  const t = translations[lang] || translations.uz;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [selectedGradeValue, setSelectedGradeValue] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [gradeToDelete, setGradeToDelete] = useState<Grade | null>(null);

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  // Filter & sort logic
  const filteredGrades = useMemo(() => {
    return grades
      .filter((g) => {
        // Subject filter
        if (selectedSubjectId !== "all" && g.subject_id !== selectedSubjectId) {
          return false;
        }
        // Grade value filter
        if (selectedGradeValue !== "all" && g.grade_value !== Number(selectedGradeValue)) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const sub = getSubjectById(g.subject_id);
          const subName = sub?.name.toLowerCase() || "";
          const comment = g.comment?.toLowerCase() || "";
          const type = g.type?.toLowerCase() || "";
          if (!subName.includes(query) && !comment.includes(query) && !type.includes(query)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === "highest") {
          return b.grade_value - a.grade_value;
        }
        if (sortBy === "lowest") {
          return a.grade_value - b.grade_value;
        }
        return 0;
      });
  }, [grades, selectedSubjectId, selectedGradeValue, searchQuery, sortBy, subjects]);

  // Aggregate stats for current filter
  const filterStats = useMemo(() => {
    const total = filteredGrades.length;
    if (total === 0) return { avg: 0, c5: 0, c4: 0, c3: 0, c2: 0 };
    const sum = filteredGrades.reduce((acc, g) => acc + g.grade_value, 0);
    return {
      avg: Number((sum / total).toFixed(2)),
      c5: filteredGrades.filter((g) => g.grade_value === 5).length,
      c4: filteredGrades.filter((g) => g.grade_value === 4).length,
      c3: filteredGrades.filter((g) => g.grade_value === 3).length,
      c2: filteredGrades.filter((g) => g.grade_value === 2).length,
    };
  }, [filteredGrades]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t.gradeHistory}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {lang === "uz"
              ? "Barcha baholarning to'liq arxivi, tahlili va boshqaruvi"
              : lang === "ru"
              ? "Полная история, аналитика и управление всеми оценками"
              : "Complete grade ledger, analytics, and management"}
          </p>
        </div>

        <button
          onClick={() => onOpenAddGrade()}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addGradeTitle}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-1.5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="all">{t.all} fanlar</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Value Filter */}
          <div>
            <select
              value={selectedGradeValue}
              onChange={(e) => setSelectedGradeValue(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="all">{t.all} baholar</option>
              <option value="5">5 (A'lo)</option>
              <option value="4">4 (Yaxshi)</option>
              <option value="3">3 (Qoniqarli)</option>
              <option value="2">2 (Qoniqarsiz)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="oldest">{t.sortOldest}</option>
              <option value="highest">{t.sortHighest}</option>
              <option value="lowest">{t.sortLowest}</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Summary Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>{filteredGrades.length} ta baho topildi</span>
            <span>•</span>
            <span>
              O'rtacha:{" "}
              <strong className="text-white">
                {filterStats.avg > 0 ? filterStats.avg : "-"}
              </strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-semibold">
              5: {filterStats.c5}
            </span>
            <span>•</span>
            <span className="text-blue-400 font-semibold">
              4: {filterStats.c4}
            </span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">
              3: {filterStats.c3}
            </span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">
              2: {filterStats.c2}
            </span>
          </div>
        </div>
      </div>

      {/* Grades Table / List */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="divide-y divide-slate-800/80">
          {filteredGrades.map((grade) => {
            const sub = getSubjectById(grade.subject_id);
            const badge = getGradeBadgeColor(grade.grade_value);

            return (
              <div
                key={grade.id}
                className="p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors group"
              >
                {/* Left side: Grade value badge + Subject Info */}
                <div className="flex items-center space-x-4 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl border ${badge.bg} ${badge.text} ${badge.border} shrink-0`}
                  >
                    {grade.grade_value}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sub?.color || "#6366F1" }}
                      />
                      <span className="font-bold text-sm sm:text-base text-slate-100 truncate">
                        {sub?.name || "Noma'lum fan"}
                      </span>
                      {sub?.code && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {sub.code}
                        </span>
                      )}
                      {grade.type && (
                        <span className="hidden sm:inline text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-indigo-300 border border-slate-700">
                          {grade.type}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(grade.date, lang)}</span>
                      </span>
                      {grade.comment && (
                        <>
                          <span>•</span>
                          <span className="truncate text-slate-300 max-w-xs sm:max-w-md">
                            {grade.comment}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Action buttons */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onEditGrade(grade)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title={t.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGradeToDelete(grade)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredGrades.length === 0 && (
            <div className="py-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Search className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-slate-300">
                {t.noData}
              </div>
              <p className="text-xs text-slate-500">
                Qidiruv shartlarini o'zgartiring yoki yangi baho kiriting
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {gradeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#0D1322] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-white">
                {t.confirmDelete}
              </h4>
              <p className="text-xs text-slate-400">
                Ushbu baho ma'lumotlar bazasidan butunlay o'chiriladi.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setGradeToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteGrade(gradeToDelete.id);
                  setGradeToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all"
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

