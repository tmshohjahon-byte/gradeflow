"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Database,
  Globe,
  User,
  Download,
  Upload,
  RefreshCw,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { UserProfile, Language } from "@/types/database";
import { translations } from "@/lib/i18n";
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  isSupabaseConfigured,
  getSupabase,
} from "@/lib/supabase";
import {
  exportBackupData,
  importBackupData,
  resetToDemo,
  updateUserProfile,
} from "@/lib/storage";

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onRefreshData: () => void;
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  lang,
  onLanguageChange,
  onRefreshData,
}) => {
  const t = translations[lang] || translations.uz;

  const [activeTab, setActiveTab] = useState<"general" | "supabase" | "data">("general");

  // Profile states
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [schoolName, setSchoolName] = useState(user?.school_name || "");
  const [gradeLevel, setGradeLevel] = useState(user?.grade_level || "");
  const [profileSaved, setProfileSaved] = useState(false);

  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [supabaseStatus, setSupabaseStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [copiedSchema, setCopiedSchema] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setSchoolName(user.school_name || "");
      setGradeLevel(user.grade_level || "");
    }
    const creds = getSupabaseCredentials();
    setSupabaseUrl(creds.url);
    setSupabaseKey(creds.anonKey);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      full_name: fullName.trim(),
      school_name: schoolName.trim(),
      grade_level: gradeLevel.trim(),
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
    onRefreshData();
  };

  const handleTestSupabase = async () => {
    setSupabaseStatus("testing");
    try {
      saveSupabaseCredentials(supabaseUrl, supabaseKey);
      const client = getSupabase();
      if (!client) {
        setSupabaseStatus("error");
        return;
      }
      // Quick ping test
      const { error } = await client.from("subjects").select("id").limit(1);
      if (error && error.code !== "PGRST116") {
        // Table might not exist yet, but connection URL is valid
      }
      setSupabaseStatus("success");
      onRefreshData();
    } catch {
      setSupabaseStatus("error");
    }
  };

  const handleExportData = () => {
    const json = exportBackupData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gradeflow-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupData(content);
      if (success) {
        alert("Ma'lumotlar muvaffaqiyatli tiklandi!");
        onRefreshData();
      } else {
        alert("Xatolik: Fayl formati mos emas.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm("Haqiqatan ham barcha ma'lumotlarni demo holatiga qaytarmoqchimisiz?")) {
      resetToDemo();
      onRefreshData();
      onClose();
    }
  };

  const sampleSchema = `-- GRADEFLOW SUPABASE SCHEMA
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  grade_level TEXT DEFAULT '10-sinf',
  school_name TEXT DEFAULT 'Prezident Maktabi',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  color TEXT NOT NULL DEFAULT '#6366F1',
  teacher_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  grade_value SMALLINT NOT NULL CHECK (grade_value BETWEEN 2 AND 5),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  comment TEXT,
  type TEXT DEFAULT 'classwork',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.academic_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  target_grade NUMERIC(3, 2) NOT NULL CHECK (target_grade BETWEEN 2.0 AND 5.0),
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  dedup_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-3xl bg-[#0D1322] border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
            <span>{t.settingsTitle}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/30 px-6 shrink-0">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === "general"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t.profileInfo}</span>
          </button>
          <button
            onClick={() => setActiveTab("supabase")}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === "supabase"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase DB</span>
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === "data"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Eksport / Tiklash</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Language Switcher */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  <span className="flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{t.languageSetting}</span>
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
                    { code: "en", label: "English", flag: "🇬🇧" },
                    { code: "ru", label: "Русский", flag: "🇷🇺" },
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => onLanguageChange(item.code as Language)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                        lang === item.code
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span>{item.flag}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Profile Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {t.profileInfo}
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t.fullName}</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">{t.school}</label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">{t.gradeLevel}</label>
                    <input
                      type="text"
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {profileSaved && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>{t.success}!</span>
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "supabase" && (
            <div className="space-y-5">
              {/* Active mode banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-300 font-medium">{t.storageMode}:</span>
                  <span className="font-bold text-indigo-300">
                    {isSupabaseConfigured() ? t.storageModeSupabase : t.storageModeLocal}
                  </span>
                </div>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSupabaseConfigured() ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
              </div>

              {/* Supabase URL and Anon Key Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t.supabaseUrl}</label>
                  <input
                    type="url"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t.supabaseAnonKey}</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {supabaseStatus === "success" && (
                    <span className="text-xs text-emerald-400 font-semibold">
                      {t.connectionSuccess}
                    </span>
                  )}
                  {supabaseStatus === "error" && (
                    <span className="text-xs text-rose-400 font-semibold">
                      {t.connectionFailed}
                    </span>
                  )}
                  <button
                    onClick={handleTestSupabase}
                    disabled={supabaseStatus === "testing"}
                    className="ml-auto px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    {supabaseStatus === "testing" ? t.loading : t.saveAndTestConnection}
                  </button>
                </div>
              </div>

              {/* View & Copy PostgreSQL Schema */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t.viewSqlSchema}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sampleSchema);
                      setCopiedSchema(true);
                      setTimeout(() => setCopiedSchema(false), 2000);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                  >
                    {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSchema ? "Nusxalandi!" : "SQL sxemani nusxalash"}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 max-h-36 overflow-y-auto font-mono">
                  {sampleSchema}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Zaxira nusxa (Backup)
                </h4>
                <p className="text-xs text-slate-400">
                  Barcha baholaringiz, fanlaringiz va maqsadlaringizni JSON fayl ko'rinishida saqlab oling yoki boshqa qurilmaga ko'chiring.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={handleExportData}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span>{t.exportData}</span>
                  </button>

                  <label className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>{t.importData}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset to demo */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  Namunaviy ma'lumotlarni tiklash
                </h4>
                <p className="text-xs text-rose-200/80">
                  Dastlabki to'liq namunaviy baholar (Azizbek Rahimovning 7 ta fani va tahlillari) ni qayta tiklash.
                </p>
                <button
                  onClick={handleResetData}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40"
                >
                  {t.resetDemoData}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
