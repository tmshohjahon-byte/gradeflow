"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Calendar, BookOpen, MessageSquare, Tag } from "lucide-react";
import { Subject, Grade, GradeValue, GradeType, Language } from "@/types/database";
import { translations } from "@/lib/i18n";
import { addGrade, updateGrade } from "@/lib/storage";

type QuickAddGradeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialGrade?: Grade | null;
  defaultSubjectId?: string;
  lang: Language;
  onSuccess: () => void;
};

export const QuickAddGradeModal: React.FC<QuickAddGradeModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialGrade,
  defaultSubjectId,
  lang,
  onSuccess,
}) => {
  const t = translations[lang] || translations.uz;

  const [subjectId, setSubjectId] = useState<string>("");
  const [gradeValue, setGradeValue] = useState<GradeValue>(5);
  const [date, setDate] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [gradeType, setGradeType] = useState<GradeType>("classwork");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (initialGrade) {
      setSubjectId(initialGrade.subject_id);
      setGradeValue(initialGrade.grade_value);
      setDate(initialGrade.date);
      setComment(initialGrade.comment || "");
      setGradeType(initialGrade.type || "classwork");
    } else {
      setSubjectId(defaultSubjectId || (subjects.length > 0 ? subjects[0].id : ""));
      setGradeValue(5);
      setDate(new Date().toISOString().split("T")[0]);
      setComment("");
      setGradeType("classwork");
    }
    setError("");
  }, [initialGrade, defaultSubjectId, subjects, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      setError(t.selectSubject);
      return;
    }
    if (!date) {
      setError(t.selectDate);
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialGrade) {
        await updateGrade(initialGrade.id, {
          subject_id: subjectId,
          grade_value: gradeValue,
          date,
          comment: comment.trim() || undefined,
          type: gradeType,
        });
      } else {
        await addGrade({
          user_id: subjects.find((s) => s.id === subjectId)?.user_id || "student-usr-01",
          subject_id: subjectId,
          grade_value: gradeValue,
          date,
          comment: comment.trim() || undefined,
          type: gradeType,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const gradeOptions: { val: GradeValue; label: string; desc: string; color: string }[] = [
    { val: 5, label: "5", desc: lang === "uz" ? "A'lo" : lang === "ru" ? "Отлично" : "Excellent", color: "border-emerald-500 bg-emerald-500/20 text-emerald-300" },
    { val: 4, label: "4", desc: lang === "uz" ? "Yaxshi" : lang === "ru" ? "Хорошо" : "Good", color: "border-blue-500 bg-blue-500/20 text-blue-300" },
    { val: 3, label: "3", desc: lang === "uz" ? "Qoniqarli" : lang === "ru" ? "Удовл." : "Fair", color: "border-amber-500 bg-amber-500/20 text-amber-300" },
    { val: 2, label: "2", desc: lang === "uz" ? "Qoniqarsiz" : lang === "ru" ? "Неудовл." : "Poor", color: "border-rose-500 bg-rose-500/20 text-rose-300" },
  ];

  const typeOptions: { val: GradeType; label: string }[] = [
    { val: "classwork", label: t.typeClasswork },
    { val: "homework", label: t.typeHomework },
    { val: "quiz", label: t.typeQuiz },
    { val: "exam", label: t.typeExam },
    { val: "other", label: t.typeOther },
  ];

  const commentSuggestions =
    lang === "uz"
      ? ["Nazorat ishi", "Oraliq test", "Mustaqil ish", "Laboratoriya ishi", "Uy vazifasi", "Taqdimot"]
      : lang === "ru"
      ? ["Контрольная работа", "Тест", "Самостоятельная работа", "Лабораторная", "Домашняя работа"]
      : ["Unit Exam", "Pop Quiz", "Homework Assignment", "Lab Report", "Presentation"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#0D1322] border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
            <span>{initialGrade ? t.editGradeTitle : t.addGradeTitle}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Subject Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <span className="flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t.selectSubject} *</span>
              </span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} {sub.code ? `(${sub.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Value Selector Buttons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {t.selectGrade} *
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {gradeOptions.map((opt) => {
                const isSelected = gradeValue === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setGradeValue(opt.val)}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `${opt.color} shadow-lg scale-102`
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-2xl font-black">{opt.label}</span>
                    <span className="text-[11px] font-medium mt-0.5">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker & Grade Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t.selectDate} *</span>
                </span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                <span className="flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{t.gradeType}</span>
                </span>
              </label>
              <select
                value={gradeType}
                onChange={(e) => setGradeType(e.target.value as GradeType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.val} value={opt.val}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comment with Quick chips */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <span className="flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t.gradeComment}</span>
              </span>
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t.gradeCommentPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {commentSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setComment(sug)}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  +{sug}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all duration-150 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? t.loading : t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
