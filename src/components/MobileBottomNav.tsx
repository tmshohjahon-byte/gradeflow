"use client";

import React from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  Shield,
  Plus,
  BookOpen,
  Target,
  Bell,
} from "lucide-react";
import { Language, Notification } from "@/types/database";
import { translations } from "@/lib/i18n";

type MobileBottomNavProps = {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAddGrade: () => void;
  lang: Language;
  notifications: Notification[];
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddGrade,
  lang,
  notifications,
}) => {
  const t = translations[lang] || translations.uz;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const tabs = [
    {
      id: "dashboard",
      label: lang === "uz" ? "Asosiy" : lang === "ru" ? "Главная" : "Home",
      icon: LayoutDashboard,
    },
    {
      id: "grades",
      label: lang === "uz" ? "Baholar" : lang === "ru" ? "Оценки" : "Grades",
      icon: GraduationCap,
    },
    {
      id: "add",
      label: "Qo'shish",
      isAction: true,
    },
    {
      id: "mentor",
      label: "AI Mentor",
      icon: Sparkles,
      highlight: true,
    },
    {
      id: "admin",
      label: lang === "uz" ? "Jadval" : lang === "ru" ? "Расписание" : "Schedule",
      icon: Shield,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D16]/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.6)]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          if (tab.isAction) {
            return (
              <div key="action-add" className="relative -top-3">
                <button
                  type="button"
                  onClick={onOpenAddGrade}
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/40 border-2 border-[#090D16] active:scale-95 transition-transform"
                  title="Baho qo'shish"
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>
            );
          }

          const Icon = tab.icon!;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? tab.highlight
                    ? "text-indigo-400 font-bold"
                    : "text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110" : ""
                  } ${tab.highlight && isActive ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" : ""}`}
                />
                {tab.id === "notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#090D16]" />
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? "font-bold text-slate-100" : "font-medium text-slate-400"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
