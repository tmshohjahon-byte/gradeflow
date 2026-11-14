"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  Lock,
  Mail,
  User,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { UserProfile, Language } from "@/types/database";
import { translations } from "@/lib/i18n";
import {
  signUpStudent,
  logInStudent,
  sendEmailVerificationOtp,
  verifyEmailOtp,
} from "@/lib/auth";
import { defaultUser } from "@/lib/sampleData";

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
  const [step, setStep] = useState<"form" | "otp">("form");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");

  // OTP Verification state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState<number>(60);
  const [notConfigured, setNotConfigured] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep("form");
      setErrorMessage("");
      setSuccessMessage("");
      setNotConfigured(false);
      setOtpDigits(["", "", "", "", "", ""]);
    }
  }, [isOpen, initialMode]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Auto-focus first input when entering OTP step
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  if (!isOpen) return null;

  // Handle Sign-up / Login Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setNotConfigured(false);

    if (!email) {
      setErrorMessage("Iltimos, email manzilingizni kiriting.");
      return;
    }

    // Registration requires real Gmail OTP verification
    if (mode === "signup") {
      if (!fullName.trim()) {
        setErrorMessage("Ism va familiyangizni kiriting.");
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await sendEmailVerificationOtp({
          email: email.trim(),
          fullName: fullName.trim(),
          password: password,
          gradeLevel: gradeLevel.trim() || undefined,
        });

        if (res.success) {
          setStep("otp");
          setCountdown(60);
          setOtpDigits(["", "", "", "", "", ""]);
          setSuccessMessage(res.message);
        } else {
          if (res.notConfigured) {
            setNotConfigured(true);
          }
          setErrorMessage(res.message || "Tasdiqlash kodini yuborishda xatolik yuz berdi.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Xatolik yuz berdi. Qayta urinib ko'ring.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Direct Login with password
    if (!password) {
      setErrorMessage("Parolni kiriting yoki Gmail orqali bir martalik kod bilan kiring.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await logInStudent({
        email: email.trim(),
        password: password,
      });

      if (res.success && res.user) {
        setSuccessMessage(res.message || "Xush kelibsiz!");
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 600);
      } else {
        setErrorMessage(res.message || "Email yoki parol noto'g'ri.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login via real Gmail OTP
  const handleStartOtpLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setNotConfigured(false);

    if (!email || !email.includes("@")) {
      setErrorMessage("Iltimos, avval to'g'ri email manzilini kiriting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendEmailVerificationOtp({ email: email.trim() });
      if (res.success) {
        setStep("otp");
        setCountdown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        setSuccessMessage(res.message);
      } else {
        if (res.notConfigured) {
          setNotConfigured(true);
        }
        setErrorMessage(res.message || "Kod yuborilmadi.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP digit changes
  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");

    // Handling paste of whole 6-digit code
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split("");
      const nextDigits = [...otpDigits];
      chars.forEach((c, i) => {
        if (index + i < 6) nextDigits[index + i] = c;
      });
      setOtpDigits(nextDigits);
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();

      if (nextDigits.every((d) => d !== "")) {
        handleVerifyOtp(nextDigits.join(""));
      }
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = cleaned[0] || "";
    setOtpDigits(nextDigits);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all digits filled
    if (cleaned && nextDigits.every((d) => d !== "")) {
      handleVerifyOtp(nextDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP submission
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join("");
    if (code.length !== 6) {
      setErrorMessage("Iltimos, 6 xonali kodni to'liq kiriting.");
      return;
    }

    setErrorMessage("");
    setIsVerifying(true);

    try {
      const res = await verifyEmailOtp({
        email: email.trim(),
        code: code,
      });

      if (res.success && res.user) {
        setSuccessMessage("Gmail orqali xavfsizlik tasdiqlandi! Xush kelibsiz!");
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onClose();
        }, 700);
      } else {
        setErrorMessage(res.message || "Kod noto'g'ri yoki muddati tugagan.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Tasdiqlashda xatolik yuz berdi.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage("");
    try {
      const res = await sendEmailVerificationOtp({
        email: email.trim(),
        fullName: fullName.trim() || undefined,
        password: password || undefined,
        gradeLevel: gradeLevel.trim() || undefined,
      });
      if (res.success) {
        setCountdown(60);
        setSuccessMessage("Yangi tasdiqlash kodi Gmail pochtangizga yuborildi!");
      } else {
        setErrorMessage(res.message || "Kodni qayta yuborib bo'lmadi.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Xatolik yuz berdi.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-[#0D1322] border border-slate-700/80 shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-indigo-500/40 shadow-lg shadow-indigo-600/30 shrink-0 bg-[#0D1322] p-0.5">
              <img
                src="/logo.jpg"
                alt="GradeFlow Logo"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center space-x-1.5">
                <span>
                  {step === "otp" ? (
                    "Gmail Xavfsizlik Tasdig'i"
                  ) : mode === "signup" ? (
                    <>
                      Grade<span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Flow</span> Ro'yxatdan O'tish
                    </>
                  ) : (
                    <>
                      Grade<span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Flow</span>-ga Kirish
                    </>
                  )}
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                {step === "otp"
                  ? "6 xonali xavfsizlik kodini kiriting"
                  : mode === "signup"
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

        {/* Tab switcher: Only shown in form step */}
        {step === "form" && (
          <div className="grid grid-cols-2 p-1 bg-slate-900/80 border-b border-slate-800 text-xs font-semibold shrink-0">
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
        )}

        {/* Content area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-3.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-3.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STEP 1: CREDENTIALS FORM */}
          {step === "form" ? (
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
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
                    <span>Gmail / Email Manzili *</span>
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nomingiz@gmail.com"
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
                    required={mode === "signup"}
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

              {/* Optional Sinf / Kurs field for Signup */}
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    <span className="flex items-center space-x-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Sinf yoki Kurs (ixtiyoriy)</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder="Masalan: 10-sinf, 1-kurs, Litsey..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Security Hint */}
              {mode === "signup" && (
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Xavfsizlik uchun pochtangizga 6 xonali tasdiqlash kodi yuboriladi.</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 mt-2"
              >
                <span>
                  {isSubmitting
                    ? "Yuborilmoqda..."
                    : mode === "signup"
                    ? "Kod Olish va Ro'yxatdan O'tish"
                    : "Tizimga Kirish"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Alternative login with Gmail OTP */}
              {mode === "login" && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartOtpLogin}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 font-semibold flex items-center justify-center space-x-2 transition-all"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Gmail orqali bir martalik kod (OTP) bilan kirish</span>
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* STEP 2: 6-DIGIT REAL GMAIL OTP VERIFICATION */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 mb-2">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Gmail Tasdiqlash Kodi</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  6 xonali xavfsizlik kodi quyidagi pochtaga yuborildi: <br />
                  <span className="font-semibold text-indigo-300">{email}</span>
                </p>
              </div>

              {/* Real Email Notice */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 text-center">
                📬 Iltimos, Gmail pochtangizni (agar xat kelmasa, <strong className="text-slate-300">Spam</strong> papkasini ham) tekshiring.
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="flex justify-center items-center gap-2 sm:gap-2.5 my-4">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl bg-slate-900 border-2 border-slate-700 text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isVerifying || otpDigits.some((d) => d === "")}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all duration-200"
              >
                <span>{isVerifying ? "Tasdiqlanmoqda..." : "Kodni Tasdiqlash"}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>

              {/* Resend & Back controls */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setErrorMessage("");
                  }}
                  className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Emailni o'zgartirish</span>
                </button>

                {countdown > 0 ? (
                  <span className="text-slate-500">
                    Qayta yuborish:{" "}
                    <span className="text-indigo-400 font-mono font-semibold">
                      00:{countdown < 10 ? `0${countdown}` : countdown}
                    </span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                    <span>Qayta kod yuborish</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info: Only shown in form step */}
        {step === "form" && (
          <div className="p-4 pt-2 border-t border-slate-800 text-center text-xs text-slate-400 bg-slate-900/40 shrink-0">
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
        )}
      </div>
    </div>
  );
};

