import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Bell,
  CheckCheck,
  Dumbbell,
  Droplets,
  Apple,
  TrendingUp,
  Sparkles,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { NotificationItem } from '../types/fitness';

interface NotificationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  isDarkMode?: boolean;
}

export const NotificationsSidebar: React.FC<NotificationsSidebarProps> = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onNotificationClick,
  isDarkMode = false,
}) => {
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Helper to render icon & badge color matching AI Coach persona palette
  const getNotificationIconMeta = (item: NotificationItem) => {
    switch (item.type) {
      case 'workout':
        return {
          icon: <Dumbbell className="w-4 h-4 text-neutral-900" />,
          bgColor: 'bg-[#FED4CF]',
          badgeColor: 'bg-[#FBAEA5]',
        };
      case 'reminder':
        return {
          icon: <Droplets className="w-4 h-4 text-neutral-900" />,
          bgColor: 'bg-[#D2EEFF]',
          badgeColor: 'bg-[#B2E0FD]',
        };
      case 'achievement':
        return {
          icon: <TrendingUp className="w-4 h-4 text-neutral-900" />,
          bgColor: 'bg-[#EFFCA7]',
          badgeColor: 'bg-[#DCEB7A]',
        };
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-neutral-900" />,
          bgColor: 'bg-[#EAD5FB]',
          badgeColor: 'bg-[#D6B5F9]',
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="notifications-sidebar-root" className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <motion.div
            id="notifications-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Right-Docked Full-Height Sidebar matching AI Coach System */}
          <motion.aside
            id="notifications-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 right-0 bottom-0 w-full sm:w-[420px] max-w-full h-full z-50 flex flex-col select-none font-['Plus_Jakarta_Sans',sans-serif] shadow-[-16px_0_48px_rgba(0,0,0,0.18)] ${
              isDarkMode
                ? 'bg-[#141519]/95 backdrop-blur-2xl border-l border-neutral-800 text-white'
                : 'bg-[#F8F9FA]/95 backdrop-blur-2xl border-l border-neutral-200/90 text-neutral-900'
            }`}
            aria-label="Notifications Drawer"
          >
            {/* Top Bar: Eyebrow + Close Action */}
            <div className="flex items-center justify-between px-5 pt-4 sm:pt-5 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  FitTrack Alerts
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#EFFCA7] text-neutral-900 rounded-full shadow-2xs">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {/* Close Button strictly matching AI Coach Header */}
              <button
                id="btn-close-notifications-sidebar"
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[#EAECEF] dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center transition-transform active:scale-95 hover:bg-[#dfe2e6] dark:hover:bg-neutral-700 cursor-pointer shadow-2xs shrink-0"
                title="Close Notifications"
                aria-label="Close Notifications"
              >
                <X className="w-5 h-5 text-neutral-900 dark:text-white stroke-[2.2]" />
              </button>
            </div>

            {/* Header Title Section matching AI Coach Typography */}
            <div className="px-5 pt-2 pb-3">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.08]">
                    Notifications
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 pb-0.5 shrink-0">
                  {/* Lime Icon Badge Circle */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EFFCA7] text-neutral-900 flex items-center justify-center shadow-2xs">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-900 fill-neutral-900" />
                  </div>

                  {/* Mark All Read Button */}
                  {unreadCount > 0 && onMarkAllRead && (
                    <button
                      id="btn-mark-all-notifications-read"
                      type="button"
                      onClick={onMarkAllRead}
                      className="border border-dashed border-neutral-900 dark:border-neutral-400 rounded-full py-1.5 px-3 flex items-center gap-1.5 bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer shadow-2xs group"
                      title="Mark all notifications as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                      <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider text-neutral-900 dark:text-white uppercase">
                        MARK READ
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notification List Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3 no-scrollbar">
              {notifications.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-[28px] bg-white/60 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60">
                  <div className="w-12 h-12 rounded-full bg-[#EFFCA7] flex items-center justify-center mb-3 shadow-2xs">
                    <CheckCircle2 className="w-6 h-6 text-neutral-900" />
                  </div>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                    All Caught Up!
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-[240px]">
                    You have no unread alerts. Your workout and nutrition tracking is up to date.
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  const meta = getNotificationIconMeta(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => onNotificationClick?.(item)}
                      className={`p-4 rounded-[24px] border transition-all cursor-pointer select-none relative group ${
                        item.unread
                          ? isDarkMode
                            ? 'bg-[#1C1E24] border-neutral-700/80 shadow-md hover:border-neutral-600'
                            : 'bg-white border-neutral-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:border-neutral-300'
                          : isDarkMode
                          ? 'bg-[#18191E]/50 border-neutral-800/60 opacity-80 hover:opacity-100'
                          : 'bg-neutral-100/70 border-neutral-200/50 opacity-85 hover:opacity-100 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Type Icon in AI Coach Pastel Circle */}
                        <div
                          className={`w-10 h-10 rounded-full ${meta.badgeColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                        >
                          {meta.icon}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white truncate">
                              {item.title}
                            </h4>
                            <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 shrink-0">
                              {item.timeAgo}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                            {item.message}
                          </p>
                        </div>

                        {/* Unread indicator dot */}
                        {item.unread && (
                          <span
                            className="w-2.5 h-2.5 rounded-full bg-[#84CC16] ring-2 ring-white dark:ring-neutral-900 shrink-0 mt-1 shadow-2xs"
                            title="Unread alert"
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
