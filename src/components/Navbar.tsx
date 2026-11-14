"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Bell,
  Settings as SettingsIcon,
  Globe,
  Menu,
  X,
  TrendingUp,
  UserPlus,
  LogIn,
  LogOut,
  ChevronDown,
  User,
  Shield,
} from "lucide-react";
import { Language, UserProfile, Notification } from "@/types/database";
import { translations } from "@/lib/i18n";

type NavbarProps = {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  user: UserProfile | null;
  notifications: Notification[];
  overallGpa: number;
  academicPercentage: number;
  onOpenAddGrade: () => void;
  onOpenSettings: () => void;
  onNavigateTab: (tab: string) => void;
  activeTab: string;
  onOpenAuth: (mode?: "login" | "signup") => void;
  onLogOut: () => void;
};

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  user,
  notifications,
  overallGpa,
  academicPercentage,
  onOpenAddGrade,
  onOpenSettings,
  onNavigateTab,
  activeTab,
  onOpenAuth,
  onLogOut,
}) => {
  const t = translations[lang] || translations.uz;
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090D16]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Mobile menu toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <button
              onClick={() => onNavigateTab("dashboard")}
              className="flex items-center space-x-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-indigo-500/40 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200 bg-[#0D1322] shrink-0 p-0.5">
                <img
                  src="/logo.jpg"
                  alt="GradeFlow Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">
                    Grade<span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">Flow</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    AI Mentor
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-slate-400 font-medium">
                  {t.appSubtitle}
                </p>
              </div>
            </button>
          </div>

          {/* Center Quick KPIs (Desktop) */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs">
              <span className="text-slate-400 font-medium">GPA:</span>
              <span className="font-bold text-indigo-400 text-sm">
                {overallGpa > 0 ? overallGpa.toFixed(2) : "0.00"}
              </span>
              <span className="text-[10px] text-slate-400">/ 5.0</span>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 font-medium">{t.academicPercentage}:</span>
              <span className="font-bold text-emerald-400 text-sm">
                {academicPercentage}%
              </span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Add Grade Button (Desktop/Tablet) */}
            <button
              onClick={onOpenAddGrade}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-200 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t.quickAddGrade}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => onNavigateTab("notifications")}
              className={`relative p-2 rounded-lg border transition-colors ${
                activeTab === "notifications"
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                  : "bg-slate-900/70 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
              title={t.notifications}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-[#090D16] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangMenuOpen(!langMenuOpen);
                  setUserMenuOpen(false);
                }}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                title={t.languageSetting}
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="uppercase font-semibold tracking-wider">
                  {lang}
                </span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        onLanguageChange(item.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                        lang === item.code
                          ? "bg-indigo-600/15 text-indigo-400 font-semibold"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {lang === item.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-900/70 border border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
              title={t.settings}
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Quick Register / Share Button */}
            <button
              onClick={() => onOpenAuth("signup")}
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all duration-200"
              title="Yangi o'quvchi hisobini yaratish"
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ro'yxatdan o'tish</span>
            </button>

            {/* User Profile / Account Switcher Dropdown */}
            {user ? (
              <div className="relative pl-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen);
                    setLangMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 text-left transition-colors"
                >
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center text-xs font-bold text-indigo-300">
                      {user.full_name ? user.full_name.slice(0, 2).toUpperCase() : "GF"}
                    </div>
                  )}
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-semibold text-slate-200 leading-tight flex items-center space-x-1">
                      <span>{user.full_name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {user.grade_level || "Talaba / O'quvchi"}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl backdrop-blur-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 bg-slate-800/50 rounded-xl mb-2">
                      <div className="font-bold text-sm text-white flex items-center justify-between">
                        <span>{user.full_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Faol
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {user.email || "shohjahon@gradeflow.uz"}
                      </div>
                      <div className="text-[11px] text-indigo-400 font-medium mt-1">
                        {user.school_name || "Akademik ta'lim"} • {user.grade_level || "10-sinf"}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenAuth("signup");
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <UserPlus className="w-4 h-4 text-indigo-400" />
                        <span>Yangi hisob ochish (Ro'yxatdan o'tish)</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenAuth("login");
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <LogIn className="w-4 h-4 text-emerald-400" />
                        <span>Boshqa hisobga kirish (Login)</span>
                      </button>

                      <div className="border-t border-slate-800 my-1"></div>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogOut();
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Hisobdan chiqish</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth("login")}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Kirish</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 space-y-1">
            <button
              onClick={() => {
                onNavigateTab("dashboard");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === "dashboard"
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              {t.dashboard}
            </button>
            <button
              onClick={() => {
                onNavigateTab("grades");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === "grades"
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              {t.grades}
            </button>
            <button
              onClick={() => {
                onNavigateTab("subjects");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === "subjects"
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              {t.subjects}
            </button>
            <button
              onClick={() => {
                onNavigateTab("mentor");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                activeTab === "mentor"
                  ? "bg-indigo-600/20 text-indigo-400 font-bold"
                  : "text-indigo-300 hover:bg-slate-800/50"
              }`}
            >
              <span>{t.aiMentor}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                PRO
              </span>
            </button>
            <button
              onClick={() => {
                onNavigateTab("goals");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === "goals"
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              {t.goals}
            </button>
            <button
              onClick={() => {
                onNavigateTab("admin");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === "admin"
                  ? "bg-indigo-600/20 text-indigo-400 font-bold"
                  : "text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              Admin Panel (Dars jadvali)
            </button>
            <button
              onClick={() => {
                onNavigateTab("notifications");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                activeTab === "notifications"
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              <span>{t.notifications}</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500 text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="pt-2 border-t border-slate-800 flex space-x-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth("signup");
                }}
                className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Ro'yxatdan o'tish</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth("login");
                }}
                className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Kirish</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};


