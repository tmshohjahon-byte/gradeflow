"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  Calendar,
  CheckCircle2,
  Shield,
  Zap,
  Globe,
  Award,
  BookOpen,
  Bell,
  Star,
  Users,
  Play,
} from "lucide-react";
import { Language } from "@/types/database";
import { translations } from "@/lib/i18n";

type LandingPageProps = {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAuth: (mode: "login" | "signup") => void;
  onQuickDemo: () => void;
};

export const LandingPage: React.FC<LandingPageProps> = ({
  lang,
  onLanguageChange,
  onOpenAuth,
  onQuickDemo,
}) => {
  const t = translations[lang] || translations.uz;
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
  ];

  const features = [
    {
      icon: Brain,
      color: "from-indigo-500 to-purple-600",
      title: lang === "uz" ? "Shaxsiy AI Mentor" : lang === "ru" ? "Личный ИИ Ментор" : "Personal AI Mentor",
      description:
        lang === "uz"
          ? "Zaif va kuchli fanlaringizni aniqlab, 4.0 dan past ko'rsatkichlarda ogohlantiruvchi va tavsiyalar beruvchi aqlli monitoring."
          : lang === "ru"
          ? "Интеллектуальный анализ ваших слабых и сильных предметов с точными рекомендациями по успеваемости."
          : "Identifies weak and strong subjects with intelligent alerts and practical study recommendations.",
    },
    {
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      title: lang === "uz" ? "Kundalik Baho So'rovi" : lang === "ru" ? "Ежедневный опрос оценок" : "Daily Check-in",
      description:
        lang === "uz"
          ? "Dars jadvalingiz asosida har kuni 'Bugun ushbu fandan nechi baho oldingiz?' deb so'raydi. Dam olish kunlari esa hordiq chiqarishingizni eslatadi."
          : lang === "ru"
          ? "Каждый учебный день напоминает отметить оценки согласно расписанию, а в выходные желает хорошего отдыха."
          : "Prompts you each school day with subjects from your timetable to log grades with single clicks.",
    },
    {
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-500",
      title: lang === "uz" ? "Dinamik GPA & Tahlillar" : lang === "ru" ? "Динамический GPA и аналитика" : "Dynamic GPA Analytics",
      description:
        lang === "uz"
          ? "Umumiy o'rtacha baho, 5, 4, 3 baholar taqsimoti, haftalik va oylik o'zgarishlar grafiklari doimo qo'lingizda."
          : lang === "ru"
          ? "Полная статистика оценок 5, 4, 3, еженедельная динамика GPA и прогресс успеваемости."
          : "Instant GPA recalculation, grade distributions, and weekly/monthly performance trendlines.",
    },
    {
      icon: Award,
      color: "from-amber-500 to-orange-500",
      title: lang === "uz" ? "Akademik Maqsadlar" : lang === "ru" ? "Академические цели" : "Academic Goals",
      description:
        lang === "uz"
          ? "Har bir fan bo'yicha maqsadli ball qo'ying (masalan: 5.0 yoki 4.8) va unga erishish bosqichlarini progress-bar orqali kuzatib boring."
          : lang === "ru"
          ? "Устанавливайте целевые баллы по предметам и отслеживайте прогресс их достижения."
          : "Set target averages for every subject and track how close you are to reaching top honors.",
    },
    {
      icon: BookOpen,
      color: "from-fuchsia-500 to-pink-500",
      title: lang === "uz" ? "Dars Jadvali Boshqaruvi" : lang === "ru" ? "Управление расписанием" : "Timetable Management",
      description:
        lang === "uz"
          ? "Haftaning istalgan kuni uchun fanlarni yuklang, dars sonini sozlang va yakshanba kabi dam olish kunlarini erkin belgilang."
          : lang === "ru"
          ? "Гибкая настройка расписания уроков на каждый день недели и отметка дней отдыха."
          : "Customize your weekly schedule for all 7 days and configure personalized rest days.",
    },
    {
      icon: Shield,
      color: "from-violet-500 to-indigo-600",
      title: lang === "uz" ? "Shaxsiy & Mustaqil Kabinet" : lang === "ru" ? "Личный приватный кабинет" : "Private & Secure",
      description:
        lang === "uz"
          ? "Har bir o'quvchi alohida ro'yxatdan o'tadi va o'zining shaxsiy baholari, jadvallari va maqsadlariga ega bo'ladi."
          : lang === "ru"
          ? "Каждый ученик регистрируется отдельно и получает свое изолированное личное пространство."
          : "Every student gets an isolated, private workspace protected with encrypted authentication.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-[#E2E8F0] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background radial blurs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-indigo-900/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-purple-900/10 blur-[130px] rounded-full" />
      </div>

      {/* Top Floating Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#090D16]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  GradeFlow
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI Mentor
                </span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="uppercase font-semibold tracking-wider">{lang}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login Button */}
            <button
              onClick={() => onOpenAuth("login")}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white transition-colors"
            >
              {lang === "uz" ? "Kirish" : lang === "ru" ? "Войти" : "Log In"}
            </button>

            {/* Signup CTA */}
            <button
              onClick={() => onOpenAuth("signup")}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-200 active:scale-95"
            >
              {lang === "uz" ? "Ro'yxatdan o'tish" : lang === "ru" ? "Регистрация" : "Get Started"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>
            {lang === "uz"
              ? "O'quvchilar va Talabalar uchun Shaxsiy AI Mentor"
              : lang === "ru"
              ? "Персональный ИИ Ментор для школьников и студентов"
              : "Intelligent Academic Mentor for Students"}
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          {lang === "uz" ? (
            <>
              O'qishingizni Nazorat Qiling,{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                A'lo Natijalarga
              </span>{" "}
              Erishing
            </>
          ) : lang === "ru" ? (
            <>
              Контролируйте учебу и достигайте{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Отличных Результатов
              </span>
            </>
          ) : (
            <>
              Master Your Grades with Your Personal{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                AI Academic Mentor
              </span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {lang === "uz"
            ? "GradeFlow — bu sizning kundalik darslaringiz, baholaringiz dinamikasi va GPA ko'rsatkichlaringizni doimiy kuzatib boruvchi, zaif fanlarni oldindan ogohlantiruvchi zamonaviy intellektual platforma."
            : lang === "ru"
            ? "Умная система отслеживания оценок, динамики GPA и ежедневного расписания с персональными рекомендациями ИИ-ментора."
            : "Track your grades, monitor GPA trendlines, manage timetables, and receive instant personalized advice from your AI mentor."}
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            onClick={() => onOpenAuth("signup")}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all duration-200 active:scale-95 group"
          >
            <span>{lang === "uz" ? "Bepul Ro'yxatdan O'tish" : lang === "ru" ? "Зарегистрироваться бесплатно" : "Start Tracking Free"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onOpenAuth("login")}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-bold text-sm sm:text-base shadow-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>{lang === "uz" ? "Tizimga Kirish" : lang === "ru" ? "Войти в систему" : "Log In to Account"}</span>
          </button>
        </div>

        {/* Shohjahon Quick Demo / Founder Badge */}
        <div className="mt-6">
          <button
            onClick={onQuickDemo}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors py-1 px-3 rounded-lg hover:bg-slate-900/60"
          >
            <Play className="w-3 h-3 text-indigo-400" />
            <span>
              {lang === "uz"
                ? "Shohjahon Namunasi (Tezkor Demo ko'rish)"
                : lang === "ru"
                ? "Демо-просмотр профиля Шохжахона"
                : "Explore Shohjahon Demo Showcase"}
            </span>
          </button>
        </div>

        {/* Mini stats teaser */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="text-xl sm:text-2xl font-black text-indigo-400">100%</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {lang === "uz" ? "Shaxsiy Maxfiylik" : "Private & Secure"}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">5.0 GPA</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {lang === "uz" ? "Akademik Maqsad" : "Target System"}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="text-xl sm:text-2xl font-black text-purple-400">AI</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {lang === "uz" ? "Mentor Tahlillari" : "Mentor Engine"}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="text-xl sm:text-2xl font-black text-amber-400">Kunlik</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {lang === "uz" ? "Dars So'rovi" : "Check-in Alert"}
            </div>
          </div>
        </div>
      </section>

      {/* App Visual Mockup Showcase */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="relative rounded-2xl p-1 bg-gradient-to-b from-indigo-500/30 via-slate-800/50 to-purple-500/20 shadow-2xl shadow-indigo-950/50">
          <div className="rounded-[14px] bg-[#0A0E1A] p-4 sm:p-6 border border-slate-800 overflow-hidden">
            {/* Mock Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">gradeflow.uz/dashboard</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 font-semibold">
                  GPA: 4.88
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold">
                  A'lo (96%)
                </span>
              </div>
            </div>

            {/* Mock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Daily check-in mock card */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30">
                <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300 mb-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Bugungi Darslar So'rovi</span>
                </div>
                <div className="text-xs text-slate-300">
                  Bugun <span className="font-bold text-white">Matematika</span> fanidan nechi baho oldingiz?
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-3">
                  <span className="py-1 text-center font-bold text-xs rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">5</span>
                  <span className="py-1 text-center font-bold text-xs rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">4</span>
                  <span className="py-1 text-center font-bold text-xs rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">3</span>
                  <span className="py-1 text-center font-bold text-xs rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">2</span>
                </div>
              </div>

              {/* AI Mentor advice mock */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30">
                <div className="flex items-center space-x-2 text-xs font-semibold text-purple-300 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>AI Mentor Tashxisi</span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  "A'lo darajadagi natija! Ingliz tili va IT fanlarida yuqori dinamika saqlanmoqda."
                </div>
                <div className="mt-3 text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Barcha maqsadlar reja asosida</span>
                </div>
              </div>

              {/* Subjects Preview */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span>Fanlar & Natijalar</span>
                  <span className="text-[10px] text-indigo-400">13 ta fan</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-300">Ingliz tili</span>
                    <span className="font-bold text-emerald-400">5.0</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-300">IT & Dasturlash</span>
                    <span className="font-bold text-emerald-400">5.0</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-300">Matematika</span>
                    <span className="font-bold text-indigo-400">4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid ("Reklama / Asosiy Qulayliklar") */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {lang === "uz"
              ? "Nima Uchun Aynan GradeFlow?"
              : lang === "ru"
              ? "Почему именно GradeFlow?"
              : "Why Choose GradeFlow?"}
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            {lang === "uz"
              ? "Oddiy kundalik emas, balki sizning natijalaringizni tahlil qilib, o'sishingizga yordam beruvchi shaxsiy yordamchi."
              : lang === "ru"
              ? "Не просто дневник оценок, а ваш персональный помощник по улучшению успеваемости."
              : "More than a grade tracker — an intelligent academic companion built to help you excel."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-105 transition-transform`}
                >
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center space-x-1.5 text-xs font-semibold text-indigo-400">
                <span>{lang === "uz" ? "To'liq faol" : "Available"}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-10">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-indigo-950/70 border border-indigo-500/30 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {lang === "uz"
                ? "Siz ham o'z natijalaringizni bugundan nazorat qiling"
                : lang === "ru"
                ? "Начните контролировать свои оценки прямо сегодня"
                : "Start Tracking Your Academic Success Today"}
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              {lang === "uz"
                ? "Bir daqiqada ro'yxatdan o'ting va o'z dars jadvalingiz bilan baholaringizni qayd etib boring."
                : lang === "ru"
                ? "Быстрая регистрация за 1 минуту. Настройте свои предметы и начните путь к успеху."
                : "Register in under 1 minute and unlock full academic insights."}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onOpenAuth("signup")}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/40 transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>{lang === "uz" ? "Hisob Ochish" : lang === "ru" ? "Создать аккаунт" : "Create Free Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenAuth("login")}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-colors"
              >
                {lang === "uz" ? "Tizimga Kirish" : lang === "ru" ? "Войти" : "Log In"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">GradeFlow</span>
            <span>•</span>
            <span>AI Academic Mentor Platform</span>
          </div>
          <div>
            Shohjahon uchun maxsus yaratilgan • 2026
          </div>
        </div>
      </footer>
    </div>
  );
};
