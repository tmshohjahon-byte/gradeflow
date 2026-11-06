"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { DashboardView } from "@/components/DashboardView";
import { GradesView } from "@/components/GradesView";
import { SubjectsView } from "@/components/SubjectsView";
import { MentorView } from "@/components/MentorView";
import { GoalsView } from "@/components/GoalsView";
import { NotificationsView } from "@/components/NotificationsView";
import { AdminScheduleView } from "@/components/AdminScheduleView";
import { QuickAddGradeModal } from "@/components/QuickAddGradeModal";
import { SettingsModal } from "@/components/SettingsModal";
import {
  UserProfile,
  Subject,
  Grade,
  AcademicGoal,
  Notification,
  Language,
  ScheduleSettings,
} from "@/types/database";
import {
  getUserProfile,
  getSubjects,
  getGrades,
  getGoals,
  getNotifications,
  getScheduleSettings,
  getStoredLanguage,
  setStoredLanguage,
  deleteGrade,
  DATA_CHANGE_EVENT,
} from "@/lib/storage";
import { defaultScheduleSettings } from "@/lib/sampleData";
import { calculatePerformanceMetrics } from "@/lib/analytics";
import { analyzeAcademicPerformance, auditAndDispatchAcademicNotifications } from "@/lib/mentorEngine";

export default function Home() {
  const [lang, setLang] = useState<Language>("uz");
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Data states
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [goals, setGoals] = useState<AcademicGoal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSettings>(defaultScheduleSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Modal states
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);
  const [gradeToEdit, setGradeToEdit] = useState<Grade | null>(null);
  const [defaultGradeSubjectId, setDefaultGradeSubjectId] = useState<string | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load all data
  const loadAllData = useCallback(async () => {
    try {
      const [u, s, g, goalsData, notifs, sched] = await Promise.all([
        getUserProfile(),
        getSubjects(),
        getGrades(),
        getGoals(),
        getNotifications(),
        getScheduleSettings(),
      ]);
      setUser(u);
      setSubjects(s);
      setGrades(g);
      setGoals(goalsData);
      setNotifications(notifs);
      setSchedule(sched);

      // Audit dynamic alerts in background
      await auditAndDispatchAcademicNotifications(s, g, goalsData, lang);
    } catch (err) {
      console.error("Failed to load GradeFlow data", err);
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    setIsMounted(true);
    setLang(getStoredLanguage());
    loadAllData();

    // Listen to changes
    const handleDataChange = () => {
      loadAllData();
    };

    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
    };
  }, [loadAllData]);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    setStoredLanguage(newLang);
  };

  const handleOpenAddGrade = (subjectId?: string) => {
    setGradeToEdit(null);
    setDefaultGradeSubjectId(subjectId);
    setIsAddGradeOpen(true);
  };

  const handleEditGrade = (grade: Grade) => {
    setGradeToEdit(grade);
    setDefaultGradeSubjectId(grade.subject_id);
    setIsAddGradeOpen(true);
  };

  const handleDeleteGrade = async (gradeId: string) => {
    await deleteGrade(gradeId);
    loadAllData();
  };

  // Dynamic calculations with stable reference
  const currentTime = isMounted ? Date.now() : 1770000000000;
  const metrics = calculatePerformanceMetrics(subjects, grades, lang, currentTime);
  const mentorAnalysis = analyzeAcademicPerformance(subjects, grades, goals, lang, currentTime);

  return (
    <div className="min-h-screen bg-[#090D16] text-[#E2E8F0] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        lang={lang}
        onLanguageChange={handleLanguageChange}
        user={user}
        notifications={notifications}
        overallGpa={metrics.overallGpa}
        academicPercentage={metrics.academicPercentage}
        onOpenAddGrade={() => handleOpenAddGrade()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        activeTab={activeTab}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          lang={lang}
          notifications={notifications}
          overallGpa={metrics.overallGpa}
          academicPercentage={metrics.academicPercentage}
        />

        {/* View Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {isLoading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-xs text-slate-400 font-medium">
                  {lang === "uz" ? "GradeFlow yuklanmoqda..." : "Loading GradeFlow..."}
                </span>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardView
                  metrics={metrics}
                  mentorAnalysis={mentorAnalysis}
                  subjects={subjects}
                  recentGrades={grades}
                  lang={lang}
                  schedule={schedule}
                  userName={user?.full_name || "Shohjahon"}
                  onRefreshData={loadAllData}
                  onOpenAddGrade={() => handleOpenAddGrade()}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onEditGrade={handleEditGrade}
                  onDeleteGrade={handleDeleteGrade}
                />
              )}

              {activeTab === "grades" && (
                <GradesView
                  grades={grades}
                  subjects={subjects}
                  lang={lang}
                  onOpenAddGrade={handleOpenAddGrade}
                  onEditGrade={handleEditGrade}
                  onDeleteGrade={handleDeleteGrade}
                />
              )}

              {activeTab === "subjects" && (
                <SubjectsView
                  subjects={subjects}
                  grades={grades}
                  goals={goals}
                  lang={lang}
                  onOpenAddGrade={handleOpenAddGrade}
                  onRefreshData={loadAllData}
                />
              )}

              {activeTab === "mentor" && (
                <MentorView
                  mentorAnalysis={mentorAnalysis}
                  subjects={subjects}
                  grades={grades}
                  goals={goals}
                  lang={lang}
                  onOpenAddGrade={handleOpenAddGrade}
                />
              )}

              {activeTab === "goals" && (
                <GoalsView
                  goals={goals}
                  subjects={subjects}
                  grades={grades}
                  lang={lang}
                  onRefreshData={loadAllData}
                />
              )}

              {activeTab === "admin" && (
                <AdminScheduleView
                  schedule={schedule}
                  subjects={subjects}
                  lang={lang}
                  onRefreshData={loadAllData}
                />
              )}

              {activeTab === "notifications" && (
                <NotificationsView
                  notifications={notifications}
                  lang={lang}
                  onRefreshData={loadAllData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Quick Add / Edit Grade Modal */}
      <QuickAddGradeModal
        isOpen={isAddGradeOpen}
        onClose={() => {
          setIsAddGradeOpen(false);
          setGradeToEdit(null);
          setDefaultGradeSubjectId(undefined);
        }}
        subjects={subjects}
        initialGrade={gradeToEdit}
        defaultSubjectId={defaultGradeSubjectId}
        lang={lang}
        onSuccess={loadAllData}
      />

      {/* System Settings & Supabase Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onRefreshData={loadAllData}
      />
    </div>
  );
}
