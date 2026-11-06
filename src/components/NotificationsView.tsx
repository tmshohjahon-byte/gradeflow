"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Trophy,
  Info,
  CheckCircle,
} from "lucide-react";
import { Notification, Language } from "@/types/database";
import { translations } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import { markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications } from "@/lib/storage";

type NotificationsViewProps = {
  notifications: Notification[];
  lang: Language;
  onRefreshData: () => void;
};

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  lang,
  onRefreshData,
}) => {
  const t = translations[lang] || translations.uz;
  const [filterUnread, setFilterUnread] = useState(false);

  const displayedList = filterUnread
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    onRefreshData();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    onRefreshData();
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    onRefreshData();
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case "success":
        return <Trophy className="w-5 h-5 text-emerald-400" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotifBadge = (type: string) => {
    switch (type) {
      case "danger":
        return "bg-rose-500/10 border-rose-500/25";
      case "warning":
        return "bg-amber-500/10 border-amber-500/25";
      case "success":
        return "bg-emerald-500/10 border-emerald-500/25";
      case "info":
      default:
        return "bg-blue-500/10 border-blue-500/25";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>{t.notificationsTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {lang === "uz"
              ? "Ko'rsatkichlar pasayishi, maqsadlar bajarilishi va muhim akademik ogohlantirishlar"
              : lang === "ru"
              ? "Оповещения о снижении успеваемости, достижении целей и рекомендации"
              : "Automatic performance alerts, goal achievements, and mentor flags"}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.every((n) => n.is_read)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 disabled:opacity-40 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>{t.markAllAsRead}</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 border border-slate-700 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.clearNotifications}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilterUnread(false)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            !filterUnread
              ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.all} ({notifications.length})
        </button>
        <button
          onClick={() => setFilterUnread(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterUnread
              ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          O'qilmagan ({notifications.filter((n) => !n.is_read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 divide-y divide-slate-800/80 overflow-hidden shadow-xl">
        {displayedList.map((notif) => (
          <div
            key={notif.id}
            onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
            className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer group ${
              !notif.is_read
                ? "bg-slate-800/30 hover:bg-slate-800/50"
                : "hover:bg-slate-800/20 opacity-80"
            }`}
          >
            <div className="flex items-start space-x-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getNotifBadge(
                  notif.type
                )}`}
              >
                {getNotifIcon(notif.type)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    {notif.title}
                  </h4>
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {notif.message}
                </p>
                <div className="text-[11px] text-slate-500 pt-0.5">
                  {formatDate(notif.created_at, lang)}
                </div>
              </div>
            </div>

            <div className="shrink-0 pt-1">
              {!notif.is_read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notif.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded bg-slate-800 transition-all"
                >
                  O'qildi
                </button>
              )}
            </div>
          </div>
        ))}

        {displayedList.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Bell className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-slate-300">
              {t.noNotifications}
            </div>
            <p className="text-xs text-slate-500">
              Barcha akademik ogohlantirishlar va xabarnomalar shu yerda ko'rsatiladi
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
