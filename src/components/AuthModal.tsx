"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Lock,
  Mail,
  User,
  GraduationCap,
  School,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { UserProfile, Language } from "@/types/database";
import { translations } from "@/lib/i18n";
import { signUpStudent, logInStudent } from "@/lib/auth";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: "login" | "signup";
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  onAuthSuccess,
  initialMode = "signup",
}) => {
  const t = translations[lang] || translations.uz;

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Email va parolni kiriting.");
      return;
    }

    if (mode === "signup" && !fullName.trim()) {
      setErrorMessage("Ism va familiyangizni kiriting.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        const res = await signUpStudent({
          fullName: fullName.trim(),
          email: email.trim(),
          password: password,
          schoolName: schoolName.trim() || undefined,
          gradeLevel: gradeLevel.trim() || undefined,
        });

        if (res.success && res.user) {
          setSuccessMessage(res.message || "Ro'yxatdan muvaffaqiyatli o'tdingiz!");
          setTimeout(() => {
            onAuthSuccess(res.user!);
            onClose();
          }, 800);
        } else {
          setErrorMessage(res.message || "Ro'yxatdan o'tishda xatolik yuz berdi.");
        }
      } else {
        const res = await logInStudent({
          email: email.trim(),
          password: password,
        });

        if (res.success && res.user) {
          setSuccessMessage(res.message || "Xush kelibsiz!");
          setTimeout(() => {
            onAuthSuccess(res.user!);
            onClose();
          }, 800);
        } else {
          setErrorMessage(res.message || "Email yoki parol xato.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#0D1322] border border-slate-700/80 shadow-2xl overflow-hidden relative">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {mode === "signup" ? "GradeFlow Ro'yxatdan O'tish" : "GradeFlow-ga Kirish"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === "signup"
                  ? "Shaxsiy akademik monitoring hisobingizni yarating"
                  : "O'z baholaringiz va dars jadvalingizga kiring"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Kirish / Ro'yxatdan o'tish */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-900/80 border-b border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === "signup"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Ro'yxatdan o'tish
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === "login"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Kirish
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Full Name for Signup */}
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                <span className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Ism va Familiya *</span>
                </span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masalan: Shohjahon Rahimov"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              <span className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>Email Manzili *</span>
              </span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="talaba@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              <span className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Parol *</span>
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                required
                minLength={6}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Optional fields for Signup */}
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  <span className="flex items-center space-x-1">
                    <School className="w-3.5 h-3.5" />
                    <span>Maktab / OTM</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Prezident Maktabi..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  <span className="flex items-center space-x-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Sinf / Kurs</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  placeholder="10-sinf, 1-kurs..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 mt-2"
          >
            <span>{isSubmitting ? "Jarayonda..." : mode === "signup" ? "Ro'yxatdan O'tish" : "Tizimga Kirish"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="p-4 pt-2 border-t border-slate-800 text-center text-xs text-slate-400 bg-slate-900/40">
          {mode === "signup" ? (
            <div>
              Hisobingiz bormi?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-indigo-400 hover:underline font-semibold"
              >
                Tizimga kiring
              </button>
            </div>
          ) : (
            <div>
              Yangi talabamisiz?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-indigo-400 hover:underline font-semibold"
              >
                Ro'yxatdan o'ting
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
