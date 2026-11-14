"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Check,
  Coffee,
  BookOpen,
  Sparkles,
  Save,
  RotateCcw,
  Shield,
  Sun,
  AlertCircle,
} from "lucide-react";
import { Subject, ScheduleSettings, DayOfWeek, Language } from "@/types/database";
import { translations } from "@/lib/i18n";
import { saveScheduleSettings, getScheduleBackup } from "@/lib/storage";

type AdminScheduleViewProps = {
  schedule: ScheduleSettings;
  subjects: Subject[];
  lang: Language;
  onRefreshData: () => void;
};

export const AdminScheduleView: React.FC<AdminScheduleViewProps> = ({
  schedule,
  subjects,
  lang,
  onRefreshData,
}) => {
  const t = translations[lang] || translations.uz;

  const [currentSchedule, setCurrentSchedule] = useState<ScheduleSettings>(schedule);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");
  const [subjectToAdd, setSubjectToAdd] = useState<string>(subjects[0]?.id || "");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);

  // Sync with incoming schedule and detect local backups
  React.useEffect(() => {
    const count = (s?: ScheduleSettings) =>
      Object.values(s?.timetable || {}).reduce((acc, l) => acc + (l?.length || 0), 0);

    const backup = getScheduleBackup();
    if (backup && count(backup) > 0) {
      setHasBackup(true);
    }

    if (schedule) {
      setCurrentSchedule((prev) => {
        // If current state has timetable items, keep them; otherwise take incoming or backup
        if (count(prev) > 0) return prev;
        if (count(schedule) > 0) return schedule;
        if (backup && count(backup) > 0) return backup;
        return schedule;
      });
    }
  }, [schedule]);

  const daysInfo: { id: DayOfWeek; nameUz: string; nameRu: string; nameEn: string; short: string }[] = [
    { id: "monday", nameUz: "Dushanba", nameRu: "Понедельник", nameEn: "Monday", short: "Dush" },
    { id: "tuesday", nameUz: "Seshanba", nameRu: "Вторник", nameEn: "Tuesday", short: "Sesh" },
    { id: "wednesday", nameUz: "Chorshanba", nameRu: "Среда", nameEn: "Wednesday", short: "Chor" },
    { id: "thursday", nameUz: "Payshanba", nameRu: "Четверг", nameEn: "Thursday", short: "Pay" },
    { id: "friday", nameUz: "Juma", nameRu: "Пятница", nameEn: "Friday", short: "Jum" },
    { id: "saturday", nameUz: "Shanba", nameRu: "Суббота", nameEn: "Saturday", short: "Shan" },
    { id: "sunday", nameUz: "Yakshanba", nameRu: "Воскресенье", nameEn: "Sunday", short: "Yak" },
  ];

  const getDayName = (id: DayOfWeek) => {
    const d = daysInfo.find((item) => item.id === id);
    if (!d) return id;
    return lang === "ru" ? d.nameRu : lang === "en" ? d.nameEn : d.nameUz;
  };

  const getSubjectById = (id: string) => {
    if (!id) return undefined;
    return (
      subjects.find((s) => s.id === id) ||
      subjects.find((s) => s.id.toLowerCase() === id.toLowerCase()) ||
      subjects.find((s) => s.code && s.code.toLowerCase() === id.toLowerCase()) ||
      subjects.find(
        (s) =>
          id.toLowerCase().includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(id.toLowerCase())
      )
    );
  };

  // Toggle Rest Day with Immediate Auto-save
  const handleToggleRestDay = (day: DayOfWeek) => {
    const isRest = currentSchedule.rest_days.includes(day);
    let updatedRestDays: DayOfWeek[];
    if (isRest) {
      updatedRestDays = currentSchedule.rest_days.filter((d) => d !== day);
    } else {
      updatedRestDays = [...currentSchedule.rest_days, day];
    }
    const next: ScheduleSettings = {
      ...currentSchedule,
      rest_days: updatedRestDays,
      updated_at: new Date().toISOString(),
    };
    setCurrentSchedule(next);
    saveScheduleSettings(next);
  };

  // Add Subject to Selected Day with Immediate Auto-save
  const handleAddSubjectToDay = (day: DayOfWeek) => {
    if (!subjectToAdd) return;
    const currentList = currentSchedule.timetable[day] || [];
    const updatedTimetable = {
      ...currentSchedule.timetable,
      [day]: [...currentList, subjectToAdd],
    };
    const next: ScheduleSettings = {
      ...currentSchedule,
      timetable: updatedTimetable,
      updated_at: new Date().toISOString(),
    };
    setCurrentSchedule(next);
    saveScheduleSettings(next);
  };

  // Remove Subject from Day with Immediate Auto-save
  const handleRemoveSubjectFromDay = (day: DayOfWeek, index: number) => {
    const currentList = currentSchedule.timetable[day] || [];
    const updatedList = currentList.filter((_, idx) => idx !== index);
    const updatedTimetable = {
      ...currentSchedule.timetable,
      [day]: updatedList,
    };
    const next: ScheduleSettings = {
      ...currentSchedule,
      timetable: updatedTimetable,
      updated_at: new Date().toISOString(),
    };
    setCurrentSchedule(next);
    saveScheduleSettings(next);
  };

  // Save all schedule changes explicitly
  const handleSave = async () => {
    const updated = {
      ...currentSchedule,
      updated_at: new Date().toISOString(),
    };
    await saveScheduleSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    onRefreshData();
  };

  // Restore timetable from local backup
  const handleRestoreBackup = () => {
    const backup = getScheduleBackup();
    if (backup) {
      setCurrentSchedule(backup);
      saveScheduleSettings(backup);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      onRefreshData();
    }
  };

  // Preset Template Loader (Standard Shohjahon Schedule for 13 subjects)
  const handleLoadStandardTemplate = () => {
    const findSub = (query: string) => {
      const q = query.toLowerCase().trim();
      const match =
        subjects.find((s) => s.name.toLowerCase().trim() === q) ||
        subjects.find((s) => s.name.toLowerCase().includes(q)) ||
        subjects.find((s) => s.code && s.code.toLowerCase().includes(q));
      return match?.id || "";
    };

    const eng = findSub("ingliz");
    const math = findSub("matematika");
    const chem = findSub("kimyo");
    const tarbiya = findSub("tarbiya");
    const it = findSub("it");
    const arab = findSub("arab");
    const hist = findSub("tarix");
    const rus = findSub("rus");
    const ona = findSub("ona");
    const phys = findSub("fizika");
    const bio = findSub("biologiya");
    const mathTask = findSub("math task") || findSub("task");
    const engTask = findSub("english task");

    const template: ScheduleSettings = {
      rest_days: ["sunday"],
      timetable: {
        monday: [ona, math, eng, it].filter(Boolean),
        tuesday: [phys, chem, rus, mathTask].filter(Boolean),
        wednesday: [bio, hist, arab, engTask].filter(Boolean),
        thursday: [math, ona, tarbiya, it].filter(Boolean),
        friday: [chem, phys, rus, bio].filter(Boolean),
        saturday: [arab, hist, mathTask, engTask].filter(Boolean),
        sunday: [],
      },
      updated_at: new Date().toISOString(),
    };
    setCurrentSchedule(template);
    saveScheduleSettings(template);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    onRefreshData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 p-6 sm:p-7 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Panel</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Dars Jadvali & Dam Olish Kunlari Boshqaruvi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Hafta kunlari bo'yicha qaysi fanlar o'tilishini belgilang. Dars bo'lgan kuni tizim sizdan avtomatik ravishda bahongizni so'raydi!
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Saqlandi!</span>
              </span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Jadvalni Saqlash</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: DAM OLISH KUNLARI (Rest Days Management) */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coffee className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Dam Olish Kunlarini Belgilash
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Belgilangan kunlarda dars so'ralmaydi va dam olish rejimi ko'rsatiladi
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {daysInfo.map((d) => {
            const isRest = currentSchedule.rest_days.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => handleToggleRestDay(d.id)}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between space-y-2 ${
                  isRest
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/5 scale-102"
                    : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                }`}
              >
                <div className="text-xs font-bold">{getDayName(d.id)}</div>
                <div className="text-xl">
                  {isRest ? "🏖️" : "📚"}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isRest
                      ? "bg-amber-500/30 text-amber-200"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isRest ? "Dam olish" : "Dars kuni"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: DARS JADVALI (Timetable by Day of the Week) */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Haftalik Dars Jadvali
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {hasBackup && (
              <button
                onClick={handleRestoreBackup}
                className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors flex items-center space-x-1"
                title="Lokal zaxiradan dars jadvalini qayta tiklash"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zaxiradan tiklash</span>
              </button>
            )}
            <button
              onClick={handleLoadStandardTemplate}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Namunaviy jadvalni yuklash</span>
            </button>
          </div>
        </div>

        {/* Day selector tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-3 border-b border-slate-800/80 -mx-1 px-1">
          {daysInfo.map((d) => {
            const isRest = currentSchedule.rest_days.includes(d.id);
            const isSelected = selectedDay === d.id;
            const count = currentSchedule.timetable[d.id]?.length || 0;

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDay(d.id)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all flex items-center space-x-1.5 sm:space-x-2 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : isRest
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <span>{getDayName(d.id)}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {isRest ? "Dam olish" : `${count} ta dars`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Content */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>{getDayName(selectedDay)} kungi darslar</span>
                {currentSchedule.rest_days.includes(selectedDay) && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                    Dam olish kuni sifatida belgilangan
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ushbu kunda qaysi fanlar o'tilishini belgilang
              </p>
            </div>

            {/* Add Subject to this Day */}
            <div className="flex items-center space-x-2">
              <select
                value={subjectToAdd}
                onChange={(e) => setSubjectToAdd(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => handleAddSubjectToDay(selectedDay)}
                className="flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Qo'shish</span>
              </button>
            </div>
          </div>

          {/* List of Scheduled Subjects on this day */}
          <div className="space-y-2.5">
            {(currentSchedule.timetable[selectedDay] || []).map((subId, idx) => {
              const sub = getSubjectById(subId);

              return (
                <div
                  key={`${subId}-${idx}`}
                  className="p-3.5 rounded-2xl bg-slate-800/30 border border-slate-700/50 flex items-center justify-between group hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center border border-slate-700">
                      {idx + 1}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sub?.color || "#6366F1" }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {sub?.name || `Fan (${subId})`}
                      </h4>
                      <div className="text-[11px] text-slate-400">
                        {sub?.code || "Dars"} • {sub?.teacher_name || "O'qituvchi"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSubjectFromDay(selectedDay, idx)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Jadvaldan olib tashlash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {(!currentSchedule.timetable[selectedDay] || currentSchedule.timetable[selectedDay].length === 0) && (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                {currentSchedule.rest_days.includes(selectedDay)
                  ? "Ushbu kun dam olish kuni deb belgilangan 🏖️"
                  : "Ushbu kunga hali darslar qo'shilmagan. Yuqoridagi tugma orqali fan qo'shing."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: WEEKLY OVERVIEW TABLE */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Butun Hafta Bo'yicha Umumiy Ko'rinish
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {daysInfo.map((d) => {
            const isRest = currentSchedule.rest_days.includes(d.id);
            const subs = currentSchedule.timetable[d.id] || [];

            return (
              <div
                key={d.id}
                className={`p-3 rounded-2xl border space-y-2 flex flex-col justify-between ${
                  isRest
                    ? "bg-amber-950/10 border-amber-500/20"
                    : "bg-slate-800/20 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs font-bold text-slate-300">
                  <span>{d.short}</span>
                  {isRest && <span className="text-[10px] text-amber-400">Dam</span>}
                </div>

                <div className="space-y-1.5 min-h-[60px]">
                  {isRest ? (
                    <div className="text-[11px] text-slate-500 italic text-center py-3">
                      Hordiq kuni
                    </div>
                  ) : subs.length > 0 ? (
                    subs.map((sId, i) => {
                      const s = getSubjectById(sId);
                      return (
                        <div
                          key={i}
                          className="px-2 py-1 rounded-lg bg-slate-800/70 text-[11px] font-medium text-slate-300 truncate"
                          title={s?.name}
                        >
                          {i + 1}. {s?.name || "Fan"}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-[11px] text-slate-600 text-center py-3">
                      Dars yo'q
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

