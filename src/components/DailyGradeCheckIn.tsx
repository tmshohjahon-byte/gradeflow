"use client";

import React, { useState } from "react";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Coffee,
  HelpCircle,
  Award,
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  Subject,
  Grade,
  ScheduleSettings,
  DayOfWeek,
  Language,
  GradeValue,
} from "@/types/database";
import { translations } from "@/lib/i18n";
import { addGrade } from "@/lib/storage";

type DailyGradeCheckInProps = {
  schedule: ScheduleSettings;
  subjects: Subject[];
  grades: Grade[];
  lang: Language;
  userName: string;
  onRefreshData: () => void;
};

export const DailyGradeCheckIn: React.FC<DailyGradeCheckInProps> = ({
  schedule,
  subjects,
  grades,
  lang,
  userName,
  onRefreshData,
}) => {
  const t = translations[lang] || translations.uz;

  // Determine current day of week and date
  const now = new Date();
  const dayIndex = now.getDay();
  const dayMap: Record<number, DayOfWeek> = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };
  const todayKey: DayOfWeek = dayMap[dayIndex] || "monday";
  const todayStr = now.toISOString().split("T")[0];

  const daysLabels: Record<DayOfWeek, string> = {
    monday: "Dushanba",
    tuesday: "Seshanba",
    wednesday: "Chorshanba",
    thursday: "Payshanba",
    friday: "Juma",
    saturday: "Shanba",
    sunday: "Yakshanba",
  };

  const isRestDay = schedule.rest_days.includes(todayKey);
  const todaySubjectIds = schedule.timetable[todayKey] || [];
  const todaySubjects = todaySubjectIds
    .map((id) => subjects.find((s) => s.id === id))
    .filter(Boolean) as Subject[];

  // Track skipped subjects in this session
  const [skippedSubjectIds, setSkippedSubjectIds] = useState<Record<string, boolean>>({});
  const [savingSubjectId, setSavingSubjectId] = useState<string | null>(null);

  // Check which subjects are already graded today
  const isSubjectGradedToday = (subId: string) => {
    return grades.some((g) => g.subject_id === subId && g.date === todayStr);
  };

  const getTodayGrade = (subId: string) => {
    return grades.find((g) => g.subject_id === subId && g.date === todayStr);
  };

  const handleGradeToday = async (sub: Subject, gradeVal: GradeValue) => {
    setSavingSubjectId(sub.id);
    try {
      if (gradeVal === 5) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      await addGrade({
        user_id: sub.user_id,
        subject_id: sub.id,
        grade_value: gradeVal,
        date: todayStr,
        comment: `Bugungi dars bahosi (${daysLabels[todayKey]})`,
        type: "classwork",
      });

      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSubjectId(null);
    }
  };

  const handleSkipSubject = (subId: string) => {
    setSkippedSubjectIds((prev) => ({ ...prev, [subId]: true }));
  };

  // Case 1: Today is a Rest Day
  if (isRestDay) {
    return (
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/30 border border-amber-500/30 backdrop-blur-xl relative overflow-hidden shadow-xl animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
              🏖️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {daysLabels[todayKey]} • Dam Olish Kuni
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Bugun dam olish kuni, {userName}!
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Dars jadvalida darslar yo'q. Bugun mazza qilib hordiq chiqaring va kelasi haftaga kuch to'plang!
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold self-start sm:self-auto">
            Hordiq vaqti ✓
          </div>
        </div>
      </div>
    );
  }

  // Case 2: No subjects scheduled for today
  if (todaySubjects.length === 0) {
    return null;
  }

  // Count pending subjects
  const pendingSubjects = todaySubjects.filter(
    (s) => !isSubjectGradedToday(s.id) && !skippedSubjectIds[s.id]
  );

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/60 border border-indigo-500/30 shadow-2xl relative overflow-hidden animate-in fade-in">
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Bugun: {daysLabels[todayKey]} • Dars Jadvali
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Bugun ushbu fandan nechi baho oldingiz, {userName}?
            </h3>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          {pendingSubjects.length > 0 ? (
            <span className="text-amber-400 font-semibold">
              {pendingSubjects.length} ta dars bo'yicha baholash kutilmoqda
            </span>
          ) : (
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Bugungi darslar to'liq qayd etildi!</span>
            </span>
          )}
        </div>
      </div>

      {/* List of today's scheduled classes */}
      <div className="divide-y divide-slate-800/80 pt-2">
        {todaySubjects.map((sub, idx) => {
          const graded = isSubjectGradedToday(sub.id);
          const currentTodayGrade = getTodayGrade(sub.id);
          const isSkipped = !!skippedSubjectIds[sub.id];

          return (
            <div
              key={`${sub.id}-${idx}`}
              className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold flex items-center justify-center text-slate-300">
                  {idx + 1}
                </span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sub.color }}
                />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {sub.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {sub.code || "Fan"} • {sub.teacher_name || "O'qituvchi"}
                  </p>
                </div>
              </div>

              {/* Action Buttons: If not graded yet, show 5, 4, 3, 2, Baho olinmadi */}
              <div className="flex items-center space-x-2 self-end md:self-auto">
                {graded ? (
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Baho: {currentTodayGrade?.grade_value} (Qayd etildi)</span>
                  </div>
                ) : isSkipped ? (
                  <span className="text-xs text-slate-500 italic">
                    Baho qo'yilmadi deb belgilandi
                  </span>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs text-slate-400 mr-1 hidden sm:inline">
                      Baho:
                    </span>
                    <button
                      type="button"
                      disabled={savingSubjectId === sub.id}
                      onClick={() => handleGradeToday(sub, 5)}
                      className="w-9 h-9 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-black text-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      title="5 - A'lo"
                    >
                      5
                    </button>
                    <button
                      type="button"
                      disabled={savingSubjectId === sub.id}
                      onClick={() => handleGradeToday(sub, 4)}
                      className="w-9 h-9 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 font-black text-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      title="4 - Yaxshi"
                    >
                      4
                    </button>
                    <button
                      type="button"
                      disabled={savingSubjectId === sub.id}
                      onClick={() => handleGradeToday(sub, 3)}
                      className="w-9 h-9 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black text-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      title="3 - Qoniqarli"
                    >
                      3
                    </button>
                    <button
                      type="button"
                      disabled={savingSubjectId === sub.id}
                      onClick={() => handleGradeToday(sub, 2)}
                      className="w-9 h-9 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-black text-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                      title="2 - Qoniqarsiz"
                    >
                      2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSkipSubject(sub.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700 transition-colors ml-1"
                    >
                      Olinmadi
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

