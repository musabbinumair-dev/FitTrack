import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CheckCheck,
  LogOut,
  Search,
  ChevronDown,
  X,
  Sun,
  Moon,
  Shield,
  BarChart3,
  Users,
  Home,
  RefreshCw,
  UserCheck,
  Flame,
  Target,
  Dumbbell,
  UtensilsCrossed,
  Activity,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Mail,
  Sliders,
  Settings,
} from 'lucide-react';
import { UserRole } from '../../types/fitness';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/adminApi';
import { AdminPreferencesModal } from './AdminPreferencesModal';

interface AdminSearchDestination {
  id: string;
  title: string;
  category: 'Admin Section' | 'Admin Page' | 'User App';
  description: string;
  adminRoute?: 'analytics' | 'users';
  sectionId?: string;
  userAppTab?: string;
  keywords: string[];
}

const SEARCH_DESTINATIONS: AdminSearchDestination[] = [
  {
    id: 'dest-admin-analytics',
    title: 'Analytics Overview Dashboard',
    category: 'Admin Page',
    description: 'Platform KPIs, user growth trends, and telemetry metrics',
    adminRoute: 'analytics',
    sectionId: 'admin-kpi-workouts',
    keywords: ['analytics', 'dashboard', 'overview', 'kpis', 'admin', 'metrics'],
  },
  {
    id: 'dest-admin-users',
    title: 'Users Management & Directory',
    category: 'Admin Page',
    description: 'Manage registered user accounts, roles, access permissions, and logs',
    adminRoute: 'users',
    sectionId: 'admin-users-page-title',
    keywords: ['users', 'management', 'roster', 'directory', 'accounts', 'permissions', 'roles'],
  },
  {
    id: 'dest-admin-kpi-workouts',
    title: 'KPI: Total Workouts Completed',
    category: 'Admin Section',
    description: 'All-time total workouts logged across every athlete',
    adminRoute: 'analytics',
    sectionId: 'admin-kpi-workouts',
    keywords: ['kpi', 'workouts', 'sessions', 'completed'],
  },
  {
    id: 'dest-admin-kpi-meals',
    title: 'KPI: Meals Logged',
    category: 'Admin Section',
    description: 'All-time total meals and nutrition entries logged',
    adminRoute: 'analytics',
    sectionId: 'admin-kpi-meals',
    keywords: ['kpi', 'meals', 'nutrition', 'food'],
  },
  {
    id: 'dest-admin-kpi-calories',
    title: 'KPI: Calories Burned',
    category: 'Admin Section',
    description: 'Cumulative calories expended during exercise',
    adminRoute: 'analytics',
    sectionId: 'admin-kpi-calories',
    keywords: ['kpi', 'calories', 'burned', 'energy', 'expenditure'],
  },
  {
    id: 'dest-admin-kpi-avg-week',
    title: 'KPI: Active / Week Consistency',
    category: 'Admin Section',
    description: 'Weekly frequency of active athlete workouts',
    adminRoute: 'analytics',
    sectionId: 'admin-kpi-avg-week',
    keywords: ['kpi', 'weekly', 'consistency', 'average'],
  },
  {
    id: 'dest-admin-growth',
    title: 'User Growth Trend Chart',
    category: 'Admin Section',
    description: 'Cumulative registered user growth and sign-up timeline',
    adminRoute: 'analytics',
    sectionId: 'admin-user-growth-card',
    keywords: ['growth', 'users chart', 'signups', 'registrations', 'trend'],
  },
  {
    id: 'dest-admin-weekly-activity',
    title: 'Weekly Activity & Consistency Bars',
    category: 'Admin Section',
    description: 'Platform-wide logged workouts and daily activity comparison',
    adminRoute: 'analytics',
    sectionId: 'admin-weekly-activity-card',
    keywords: ['weekly', 'activity', 'consistency', 'bars', 'daily', 'active'],
  },
  {
    id: 'dest-admin-telemetry',
    title: 'Live Platform Telemetry & Exercise Leaderboard',
    category: 'Admin Section',
    description: 'Real-time exercise popularity, completion rates, and logged reps',
    adminRoute: 'analytics',
    sectionId: 'admin-exercise-leaderboard-card',
    keywords: ['telemetry', 'exercises', 'leaderboard', 'popular', 'realtime', 'live'],
  },
  {
    id: 'dest-admin-nutrition',
    title: 'Platform Macronutrients Split',
    category: 'Admin Section',
    description: 'Aggregated Protein, Carbohydrates, and Fats distribution',
    adminRoute: 'analytics',
    sectionId: 'admin-nutrition-split-card',
    keywords: ['macronutrients', 'nutrition', 'macros', 'protein', 'carbs', 'fats'],
  },
  {
    id: 'dest-admin-user-status',
    title: 'User Status Distribution',
    category: 'Admin Section',
    description: 'Active vs Inactive accounts breakdown and platform engagement',
    adminRoute: 'analytics',
    sectionId: 'admin-user-status-card',
    keywords: ['status', 'active', 'inactive', 'accounts'],
  },
  {
    id: 'dest-admin-retention',
    title: 'New vs Returning Users Retention',
    category: 'Admin Section',
    description: 'Cohort user retention and repeat platform visitor rates',
    adminRoute: 'analytics',
    sectionId: 'admin-user-retention-card',
    keywords: ['retention', 'returning', 'new', 'cohort', 'churn'],
  },
  {
    id: 'dest-admin-users-table',
    title: 'User Search & Filtering Table',
    category: 'Admin Section',
    description: 'Search, sort, filter by role/status, and inspect user profiles',
    adminRoute: 'users',
    sectionId: 'admin-users-search-input',
    keywords: ['search users', 'filter', 'table', 'roster', 'list'],
  },
  {
    id: 'dest-user-dashboard',
    title: 'Main Activity Dashboard',
    category: 'User App',
    description: 'Return to the athlete home dashboard and daily targets',
    userAppTab: 'activity',
    keywords: ['home', 'athlete', 'dashboard', 'main app', 'activity'],
  },
  {
    id: 'dest-user-workouts',
    title: 'Workouts & Routine Splits',
    category: 'User App',
    description: 'Push / Pull / Legs, Single Body Part, and logged gym workouts',
    userAppTab: 'workouts',
    keywords: ['workouts', 'routines', 'training', 'exercises', 'gym'],
  },
  {
    id: 'dest-user-nutrition',
    title: 'Nutrition & Macro Tracker',
    category: 'User App',
    description: 'Daily food meals, calorie calculation, and hydration tracking',
    userAppTab: 'nutrition',
    keywords: ['nutrition', 'meals', 'calories', 'water', 'hydration'],
  },
  {
    id: 'dest-user-analytics',
    title: 'Progress Analytics & Weight Trends',
    category: 'User App',
    description: 'Visual progress charts, body weight changes, and workout volume',
    userAppTab: 'analytics',
    keywords: ['progress', 'weight chart', 'history', 'graphs'],
  },
  {
    id: 'dest-user-coach',
    title: 'AI Fitness Coach Assistant',
    category: 'User App',
    description: 'Intelligent fitness coaching advice, recovery, and plan adjustments',
    userAppTab: 'community',
    keywords: ['ai coach', 'assistant', 'advice', 'recovery'],
  },
  {
    id: 'dest-admin-preferences',
    title: 'Admin Support Forwarding Email & Preferences',
    category: 'Admin Page',
    description: 'Configure destination email where user inquiries and support tickets are received',
    adminRoute: 'analytics',
    keywords: ['settings', 'support email', 'forwarding email', 'inquiries', 'preferences', 'admin email'],
  },
];

interface AdminHeaderProps {
  currentAdminRoute: 'analytics' | 'users';
  onNavigate: (route: 'analytics' | 'users') => void;
  onBackToMainApp: () => void;
  currentUserRole: UserRole;
  onToggleUserRole: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSignOut?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentAdminRoute,
  onNavigate,
  onBackToMainApp,
  currentUserRole,
  onToggleUserRole,
  isDarkMode = false,
  onToggleTheme,
  onRefreshData,
  isRefreshing = false,
  searchQuery = '',
  onSearchChange,
  onSignOut,
}) => {
  const { user } = useAuth() as any;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showAdminPreferences, setShowAdminPreferences] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const adminName = user?.name || 'System Administrator';
  const adminPhoto =
    user?.profilePhotoUrl ||
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=C4FA2A&color=131418&bold=true`;

  // Dynamic Admin Notification Alerts
  const [adminNotifications, setAdminNotifications] = useState<any[]>([
    {
      id: 'adm-system-health',
      title: 'System Health & Telemetry',
      message: 'Platform database synchronized with real-time metrics.',
      timeAgo: 'Just now',
      unread: false,
    },
  ]);

  const fetchNotifications = async () => {
    try {
      const res = await adminApi.getNotifications();
      if (res && Array.isArray(res.notifications) && res.notifications.length > 0) {
        setAdminNotifications(res.notifications);
      }
    } catch (e) {
      // Fallback gracefully
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = adminNotifications.filter((n) => n.unread).length;

  const handleMarkNotificationsRead = async () => {
    setAdminNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    try {
      await adminApi.markNotificationsRead();
    } catch { }
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    if (onSignOut) {
      onSignOut();
    } else {
      onBackToMainApp();
    }
  };

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchInput(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Search Destinations
  const filteredDestinations = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    if (!q) {
      return SEARCH_DESTINATIONS.slice(0, 8);
    }
    return SEARCH_DESTINATIONS.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchCat || matchKeywords;
    });
  }, [localSearch]);

  const handleSelectDestination = (item: AdminSearchDestination) => {
    setShowSearchInput(false);
    setLocalSearch('');
    onSearchChange?.('');

    if (item.id === 'dest-admin-preferences') {
      setShowAdminPreferences(true);
      return;
    }

    if (item.adminRoute) {
      if (currentAdminRoute !== item.adminRoute) {
        onNavigate(item.adminRoute);
      }

      if (item.sectionId) {
        setTimeout(() => {
          const el = document.getElementById(item.sectionId!);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-[#C4FA2A]', 'ring-offset-2', 'transition-all', 'duration-500');
            setTimeout(() => {
              el.classList.remove('ring-4', 'ring-[#C4FA2A]', 'ring-offset-2');
            }, 2500);
          }
        }, 220);
      }
    } else if (item.userAppTab) {
      localStorage.setItem('fittrack_target_nav_tab', item.userAppTab);
      if (item.sectionId) {
        localStorage.setItem('fittrack_target_section_id', item.sectionId);
      }
      onBackToMainApp();
    }
  };

  return (
    <header
      id="admin-top-navigation-bar"
      className="w-full pt-3 sm:pt-4 pb-3 sm:pb-3.5 px-3 sm:px-6 lg:px-8 select-none border-b border-slate-200/80 dark:border-slate-800/80 relative"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* ========================================================================= */}
        {/* LEFT: Profile Bar (Avatar + Admin Name + Chevron Dropdown)                 */}
        {/* ========================================================================= */}
        <div className="relative z-50">
          <button
            id="admin-profile-bar-btn"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
              setShowSearchInput(false);
            }}
            className={`flex items-center bg-white dark:bg-slate-900 ${showProfileMenu
              ? 'rounded-t-[20px] sm:rounded-t-[24px] rounded-b-none border-b-0 shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
              : 'rounded-[20px] sm:rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
              } p-0.5 sm:p-1 border border-slate-100/90 dark:border-slate-800/90 hover:shadow-md transition-all cursor-pointer group focus:outline-none select-none`}
            title="Admin Profile Menu"
          >
            {/* Avatar Image */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 bg-[#C4FA2A]/20">
              <img
                src={adminPhoto}
                alt={adminName}
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=C4FA2A&color=131418&bold=true`;
                }}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Name Label */}
            <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white px-2 sm:px-3.5 font-['Outfit'] select-none whitespace-nowrap">
              {adminName}
            </span>

            {/* Lime Green Circle Chevron Dropdown Button */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C4FA2A] text-[#131418] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 active:scale-95 transition-transform">
              <ChevronDown
                className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 stroke-[2.8] transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''
                  }`}
              />
            </div>
          </button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                id="admin-profile-dropdown-menu"
                initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -4, scaleY: 0.96 }}
                transition={{
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`absolute left-0 right-0 top-full mt-0 w-full border border-t border-slate-100/90 dark:border-slate-800/90 border-t-slate-100/80 dark:border-t-slate-800/80 rounded-b-[20px] sm:rounded-b-[24px] rounded-t-none shadow-[0_16px_36px_rgba(0,0,0,0.08)] p-1.5 sm:p-2 pb-2.5 sm:pb-3 pt-1 sm:pt-1.5 z-50 text-xs origin-top overflow-hidden ${isDarkMode
                  ? 'bg-slate-900 border-slate-800/90 text-slate-200 shadow-2xl'
                  : 'bg-white border-slate-100/90 text-slate-800'
                  }`}
              >
                <div className="space-y-1">
                  {/* Return to Main App */}
                  <button
                    id="admin-menu-return-app"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onBackToMainApp();
                    }}
                    className="w-full flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-[14px] sm:rounded-[16px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold transition-colors text-left cursor-pointer active:scale-[0.98]"
                  >
                    <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs">User Panel</span>
                  </button>

                  {/* Admin Preferences */}
                  <button
                    id="admin-menu-preferences"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowAdminPreferences(true);
                    }}
                    className="w-full flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-[14px] sm:rounded-[16px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold transition-colors text-left cursor-pointer active:scale-[0.98]"
                  >
                    <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs">Admin Preferences</span>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 my-1" />

                  {/* Log Out */}
                  <button
                    id="admin-menu-logout"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-[14px] sm:rounded-[16px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors text-left cursor-pointer active:scale-[0.98]"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0" />
                    <span className="text-[11px] sm:text-xs">Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: Action Buttons (Home + Theme + Refresh + Bell + Universal Search)   */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Return to User App Button */}
          <button
            id="admin-return-app-quick-btn"
            onClick={onBackToMainApp}
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100/80 dark:border-slate-800/80 flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${isDarkMode
              ? 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
              : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-100'
              }`}
            title="Return to User Panel"
            aria-label="Return to User Panel"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </button>

          {/* Instant Theme Switcher Button */}
          <button
            id="admin-top-theme-toggle-btn"
            onClick={onToggleTheme}
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100/80 dark:border-slate-800/80 flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${isDarkMode
              ? 'bg-slate-900 text-amber-400 hover:bg-slate-800 border-slate-800'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-100'
              }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme Mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2] text-amber-400 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2] text-slate-700 animate-in spin-in-180 duration-200" />
            )}
          </button>

          {/* Notification Bell Button with Lime Badge Dot */}
          <div className="relative">
            <button
              id="admin-top-notification-bell"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
                setShowSearchInput(false);
              }}
              className={`relative w-8 h-8 sm:w-11 sm:h-11 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100/80 dark:border-slate-800/80 flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${showNotifications
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              title="Admin Alerts"
              aria-label="Admin Alerts"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              {/* Lime Green Notification Dot */}
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#C4FA2A] rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs" />
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div
                id="admin-notification-dropdown-panel"
                className={`absolute right-0 mt-2 w-80 sm:w-96 border rounded-2xl shadow-xl p-3 sm:p-4 z-50 animate-in fade-in zoom-in-95 duration-150 ${isDarkMode
                  ? 'bg-slate-900 border-slate-800 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-800'
                  }`}
              >
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-slate-800 mb-2.5 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">Admin Alerts & Activity</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#C4FA2A] text-slate-950 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleMarkNotificationsRead}
                    className="text-[11px] sm:text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark read
                  </button>
                </div>

                <div className="space-y-2 max-h-72 sm:max-h-80 overflow-y-auto pr-1">
                  {adminNotifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    adminNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (n.type === 'user_registered' || n.type === 'system') {
                            onNavigate('users');
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${n.unread
                          ? isDarkMode
                            ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                            : 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                          : isDarkMode
                            ? 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100/70'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                            {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#C4FA2A]" />}
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{n.timeAgo}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] sm:text-xs">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* Universal Search Button & Interactive Command Palette Dropdown             */}
          {/* ========================================================================= */}
          <div className="relative" ref={searchContainerRef}>
            <button
              id="admin-top-search-toggle-btn"
              onClick={() => {
                setShowSearchInput(!showSearchInput);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100/80 dark:border-slate-800/80 flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${showSearchInput
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              title="Search Any Page or Section"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </button>

            {/* Universal Search Command Palette Dropdown */}
            {showSearchInput && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                {/* Search Input Bar */}
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                  <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
                  <input
                    id="admin-search-input"
                    type="text"
                    placeholder="Jump to any section, page, or metric..."
                    value={localSearch}
                    onChange={(e) => {
                      setLocalSearch(e.target.value);
                      onSearchChange?.(e.target.value);
                    }}
                    className="text-xs bg-transparent outline-none w-full text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
                    autoFocus
                  />
                  {localSearch && (
                    <button
                      onClick={() => {
                        setLocalSearch('');
                        onSearchChange?.('');
                      }}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Search Results List */}
                <div className="max-h-72 sm:max-h-80 overflow-y-auto space-y-1.5 pr-1">
                  {filteredDestinations.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No matching page or section found.
                    </div>
                  ) : (
                    filteredDestinations.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectDestination(item)}
                        className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-left flex items-start justify-between gap-3 cursor-pointer group"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-black dark:group-hover:text-white truncate">
                              {item.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 mt-0.5 ${item.category === 'Admin Section'
                            ? 'bg-[#C4FA2A]/25 text-slate-900 dark:text-[#C4FA2A]'
                            : item.category === 'Admin Page'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400'
                            }`}
                        >
                          {item.category}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Preferences Modal with Support Forwarding Email */}
      <AdminPreferencesModal
        isOpen={showAdminPreferences}
        onClose={() => setShowAdminPreferences(false)}
        currentUserRole={currentUserRole}
        onToggleUserRole={onToggleUserRole}
        isDarkMode={isDarkMode}
      />
    </header>
  );
};
