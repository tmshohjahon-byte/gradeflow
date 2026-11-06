"use client";

import React from "react";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Sparkles,
  Target,
  Bell,
  Sliders,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Language, Notification } from "@/types/database";
import { translations } from "@/lib/i18n";

type SidebarProps = {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  notifications: Notification[];
  overallGpa: number;
  academicPercentage: number;
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  lang,
  notifications,
  overallGpa,
  academicPercentage,
}) => {
  const t = translations[lang] || translations.uz;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const navItems = [
    {
      id: "dashboard",
      label: t.dashboard,
      icon: LayoutDashboard,
    },
    {
      id: "grades",
      label: t.grades,
      icon: GraduationCap,
    },
    {
      id: "subjects",
      label: t.subjects,
      icon: BookOpen,
    },
    {
      id: "mentor",
      label: t.aiMentor,
      icon: Sparkles,
      highlight: true,
    },
    {
      id: "goals",
      label: t.goals,
      icon: Target,
    },
    {
      id: "notifications",
      label: t.notifications,
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-slate-850/80 bg-[#090D16]/50 min-h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? item.highlight
                      ? "bg-gradient-to-r from-indigo-600/30 via-indigo-600/20 to-purple-600/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-600/10"
                      : "bg-slate-800/80 text-white border border-slate-700/60 shadow-sm"
                    : item.highlight
                    ? "text-indigo-300 hover:text-white hover:bg-indigo-600/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? item.highlight
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-700 text-white"
                        : item.highlight
                        ? "text-indigo-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/10"
                        : "text-slate-400 group-hover:text-slate-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {item.highlight && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm">
                      AI
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && !item.highlight && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Mentor Widget Card */}
      <div className="pt-4 border-t border-slate-800/80">
        <div
          onClick={() => onSelectTab("mentor")}
          className="cursor-pointer p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/30 border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-200 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white tracking-tight">
                {t.aiMentor}
              </span>
            </div>
            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Online
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-2.5">
            {lang === "uz"
              ? "Baholaringiz dinamikasi tahlil qilindi. Yangi tavsiyalar mavjud."
              : lang === "ru"
              ? "Динамика успеваемости проанализирована. Есть рекомендации."
              : "Grade velocity monitored. Diagnostic suggestions available."}
          </p>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{t.academicPercentage}</span>
              <span className="font-bold text-indigo-300">
                {academicPercentage}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, academicPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
