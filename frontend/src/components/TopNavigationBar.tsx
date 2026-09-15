import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CheckCheck,
  LogOut,
  Search,
  ChevronDown,
  User,
  X,
  Sun,
  Moon,
  Dumbbell,
  UtensilsCrossed,
  Droplets,
  Activity,
  TrendingUp,
  Scale,
  Sparkles,
  Flame,
  Bot,
  LayoutDashboard,
  Target,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Shield,
} from 'lucide-react';
import { NotificationItem, UserRole } from '../types/fitness';
import { useAuth } from '../context/AuthContext';

interface TopNavigationBarProps {
  activeNavTab: string;
  onNavTabChange: (tab: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onOpenQuickLog: (type?: 'workout' | 'meal' | 'water' | 'weight') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSignOut?: () => void;
  onNavigateToLogin?: () => void;
  userRole?: UserRole;
  onOpenAdminPanel?: () => void;
}

const SEARCH_ITEMS = [
  {
    id: 'dash-overview',
    title: 'Dashboard Overview',
    category: 'Page' as const,
    description: 'Main home dashboard with vital metrics & previews',
    tab: 'activity',
    icon: LayoutDashboard,
    color: 'bg-blue-500/10 text-blue-500',
    keywords: ['dashboard', 'home', 'main', 'activity', 'overview'],
  },
  {
    id: 'dash-body-overview',
    title: 'Body Overview & Fuel Target',
    category: 'Section' as const,
    description: 'Daily calories remaining & dynamic macro breakdown',
    tab: 'activity',
    sectionId: 'section-body-overview',
    icon: Flame,
    color: 'bg-orange-500/10 text-[#FF5500]',
    keywords: ['body', 'fuel', 'calories', 'macros', 'protein', 'carbs', 'fats', 'gauge'],
  },
  {
    id: 'dash-kpis',
    title: 'Daily Targets & KPI Metrics',
    category: 'Section' as const,
    description: 'Calories, Water, Sleep, and Weight live targets',
    tab: 'activity',
    sectionId: 'section-kpi-metrics',
    icon: Target,
    color: 'bg-emerald-500/10 text-emerald-500',
    keywords: ['kpi', 'targets', 'daily', 'calories', 'water', 'sleep', 'weight'],
  },
  {
    id: 'dash-todays-workout',
    title: "Today's Active Workout",
    category: 'Section' as const,
    description: 'Scheduled routine preview and workout launch',
    tab: 'activity',
    sectionId: 'section-todays-workout',
    icon: Dumbbell,
    color: 'bg-purple-500/10 text-purple-500',
    keywords: ['today', 'workout', 'routine', 'exercises', 'active', 'push', 'pull', 'legs', 'single body'],
  },
  {
    id: 'dash-recent-activity',
    title: 'Recent Activity Feed',
    category: 'Section' as const,
    description: 'Chronological timeline of logged workouts and meals',
    tab: 'activity',
    sectionId: 'section-recent-activity',
    icon: Activity,
    color: 'bg-cyan-500/10 text-cyan-500',
    keywords: ['recent', 'activity', 'feed', 'history', 'logs'],
  },
  {
    id: 'page-workouts',
    title: 'Workouts & Training Routines',
    category: 'Page' as const,
    description: 'Custom splits (Push/Pull/Legs, Single Body Part), exercise logs & builder',
    tab: 'workouts',
    icon: Dumbbell,
    color: 'bg-purple-500/10 text-purple-500',
    keywords: ['workouts', 'routines', 'exercises', 'split', 'gym', 'training', 'sets', 'reps'],
  },
  {
    id: 'page-nutrition',
    title: 'Nutrition & Macro Tracker',
    category: 'Page' as const,
    description: 'Track daily meals, food items, custom calories, and macros',
    tab: 'nutrition',
    icon: UtensilsCrossed,
    color: 'bg-amber-500/10 text-amber-500',
    keywords: ['nutrition', 'food', 'meals', 'macros', 'protein', 'carbs', 'fats', 'breakfast', 'lunch', 'dinner'],
  },
  {
    id: 'section-hydration',
    title: 'Hydration & Water Tracker',
    category: 'Section' as const,
    description: 'Log water consumption and monitor daily hydration goal',
    tab: 'nutrition',
    icon: Droplets,
    color: 'bg-sky-500/10 text-sky-500',
    keywords: ['water', 'hydration', 'drink', 'fluid', 'intake', 'ml', 'glasses'],
  },
  {
    id: 'page-analytics',
    title: 'Progress Analytics & Charts',
    category: 'Page' as const,
    description: 'Interactive weight loss/gain charts, volume, and consistency',
    tab: 'analytics',
    icon: TrendingUp,
    color: 'bg-lime-500/10 text-lime-600 dark:text-lime-400',
    keywords: ['analytics', 'progress', 'charts', 'weight graph', 'trends', 'volume', 'goals'],
  },
  {
    id: 'page-coach',
    title: 'AI Fitness Coach',
    category: 'Page' as const,
    description: 'Instant AI coaching advice, form tips, and workout recovery',
    tab: 'community',
    icon: Bot,
    color: 'bg-indigo-500/10 text-indigo-500',
    keywords: ['ai', 'coach', 'fitness coach', 'advice', 'tips', 'chat', 'assistant'],
  },
  {
    id: 'page-profile',
    title: 'Profile & Settings',
    category: 'Page' as const,
    description: 'Manage personal info, body metrics, theme, and fitness goals',
    tab: 'profile',
    icon: User,
    color: 'bg-slate-500/10 text-slate-500',
    keywords: ['profile', 'settings', 'account', 'height', 'weight', 'theme', 'dark mode', 'edit'],
  },
  {
    id: 'settings-support',
    title: 'Help, Support & Feedback',
    category: 'Section' as const,
    description: 'Direct support, FAQ guides, and user feedback submission',
    tab: 'profile',
    sectionId: 'settings-support-card',
    icon: HelpCircle,
    color: 'bg-emerald-500/10 text-emerald-500',
    keywords: ['help', 'support', 'feedback', 'faq', 'contact', 'bug', 'assistance'],
  },
  {
    id: 'action-workout',
    title: 'Log New Workout Session',
    category: 'Quick Action' as const,
    description: 'Record exercises, sets, reps, and calories burned',
    action: 'workout' as const,
    icon: Dumbbell,
    color: 'bg-[#FF5500]/10 text-[#FF5500]',
    keywords: ['log workout', 'record workout', 'add workout', 'new workout'],
  },
  {
    id: 'action-meal',
    title: 'Log Meal / Food Item',
    category: 'Quick Action' as const,
    description: 'Quickly log breakfast, lunch, dinner, or snacks',
    action: 'meal' as const,
    icon: UtensilsCrossed,
    color: 'bg-emerald-500/10 text-emerald-500',
    keywords: ['log meal', 'add food', 'eat', 'log breakfast', 'log lunch', 'log dinner'],
  },
  {
    id: 'action-water',
    title: 'Log Water Intake',
    category: 'Quick Action' as const,
    description: 'Add water to reach your customized daily hydration goal',
    action: 'water' as const,
    icon: Droplets,
    color: 'bg-sky-500/10 text-sky-500',
    keywords: ['log water', 'add water', 'drink', 'hydration'],
  },
  {
    id: 'action-weight',
    title: 'Log Current Weight',
    category: 'Quick Action' as const,
    description: 'Update your current scale weight to track progress',
    action: 'weight' as const,
    icon: Scale,
    color: 'bg-amber-500/10 text-amber-500',
    keywords: ['log weight', 'record weight', 'weigh in', 'update weight'],
  },
];

export const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  onNavTabChange,
  notifications,
  onMarkNotificationsRead,
  isDarkMode = false,
  onToggleTheme,
  searchQuery = '',
  onSearchChange,
  onSignOut,
  userRole,
  onOpenAdminPanel,
}) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const userName = user?.name || 'User';

  const resolvePhotoUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5050/api';
    const backendHost = apiBase.replace(/\/api\/?$/, '');
    return `${backendHost}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const rawPhoto = user?.profilePhotoUrl || user?.avatarUrl;
  const userPhoto = rawPhoto
    ? resolvePhotoUrl(rawPhoto)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=C4FA2A&color=131418&bold=true`;

  const filteredSearchItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return SEARCH_ITEMS.slice(0, 8);
    }
    return SEARCH_ITEMS.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchDesc = item.description.toLowerCase().includes(query);
      const matchCat = item.category.toLowerCase().includes(query);
      const matchKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(query));
      return matchTitle || matchDesc || matchCat || matchKeywords;
    });
  }, [searchQuery]);

  const handleSelectSearchItem = (item: (typeof SEARCH_ITEMS)[0]) => {
    setShowSearchInput(false);
    onSearchChange?.('');

    if (item.action) {
      onOpenQuickLog?.(item.action);
      return;
    }

    if (item.tab) {
      onNavTabChange(item.tab);
      if (item.sectionId) {
        setTimeout(() => {
          const el = document.getElementById(item.sectionId!);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-[#C4FA2A]', 'transition-all', 'duration-500');
            setTimeout(() => {
              el.classList.remove('ring-2', 'ring-[#C4FA2A]');
            }, 2000);
          }
        }, 180);
      }
    }
  };

  return (
    <header
      id="top-navigation-bar"
      className="w-full pt-3 sm:pt-4 pb-3 sm:pb-3.5 px-3 sm:px-6 lg:px-8 select-none border-b border-slate-200/80 dark:border-slate-800/80 relative"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* ========================================================================= */}
        {/* LEFT: Exact Profile Bar (Avatar + Full Name + Lime Green Chevron Circle) */}
        {/* ========================================================================= */}
        <div className="relative z-50">
          <button
            id="profile-bar-btn"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
              setShowSearchInput(false);
            }}
            className={`flex items-center bg-white dark:bg-slate-900 ${
              showProfileMenu
                ? 'rounded-t-[20px] sm:rounded-t-[24px] rounded-b-none border-b-0 shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
                : 'rounded-[20px] sm:rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
            } p-0.5 sm:p-1 border border-slate-100/90 dark:border-slate-800/90 hover:shadow-md transition-all cursor-pointer group focus:outline-none select-none`}
            title="Profile Menu"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 bg-[#C4FA2A]/20">
              <img
                src={userPhoto}
                alt={userName}
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=C4FA2A&color=131418&bold=true`;
                }}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
              />
            </div>

            <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white px-2 sm:px-3.5 font-['Outfit'] select-none whitespace-nowrap">
              {userName}
            </span>

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C4FA2A] text-[#131418] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 active:scale-95 transition-transform">
              <ChevronDown
                className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 stroke-[2.8] transition-transform duration-200 ${
                  showProfileMenu ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                id="profile-dropdown-menu"
                initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -4, scaleY: 0.96 }}
                transition={{
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`absolute left-0 right-0 top-full mt-0 w-full border border-t border-slate-100/90 dark:border-slate-800/90 border-t-slate-100/80 dark:border-t-slate-800/80 rounded-b-[20px] sm:rounded-b-[24px] rounded-t-none shadow-[0_16px_36px_rgba(0,0,0,0.08)] p-1.5 sm:p-2 pb-2.5 sm:pb-3 pt-1 sm:pt-1.5 z-50 text-xs origin-top overflow-hidden ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800/90 text-slate-200 shadow-2xl'
                    : 'bg-white border-slate-100/90 text-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <button
                    id="profile-dropdown-profile-link"
                    onClick={() => {
                      onNavTabChange('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-[14px] sm:rounded-[16px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold transition-colors text-left cursor-pointer active:scale-[0.98]"
                  >
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-[11px] sm:text-xs">Profile & Settings</span>
                  </button>

                  <button
                    id="profile-dropdown-theme-toggle"
                    onClick={() => {
                      onToggleTheme?.();
                    }}
                    className="w-full flex items-center justify-between px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-[14px] sm:rounded-[16px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold transition-colors text-left cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      {isDarkMode ? (
                        <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                      )}
                      <span className="text-[11px] sm:text-xs">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      {isDarkMode ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {(userRole === 'admin' || user?.role === 'admin') && onOpenAdminPanel && (
                    <button
                      id="profile-dropdown-admin-link"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAdminPanel();
                      }}
                      className="w-full flex items-center justify-between px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-[14px] sm:rounded-[16px] text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold transition-colors text-left cursor-pointer active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                        <span className="text-[11px] sm:text-xs">Admin Console</span>
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold tracking-wider">
                        Admin
                      </span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800/80 my-1" />

                  <button
                    id="profile-dropdown-logout-link"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSignOut?.();
                    }}
                    className="w-full flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-[14px] sm:rounded-[16px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors text-left cursor-pointer active:scale-[0.98]"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0" />
                    <span className="text-[11px] sm:text-xs">Log Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: Exact Circular Action Buttons (Theme Toggle + Notification Bell + Search) */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dedicated Instant Theme Switcher Button */}
          <button
            id="top-theme-toggle-btn"
            onClick={onToggleTheme}
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100/80 dark:border-slate-800/80 flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${
              isDarkMode
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
              id="top-notification-bell"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
                setShowSearchInput(false);
              }}
              className={`relative w-8 h-8 sm:w-11 sm:h-11 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100/80 dark:border-slate-800/80 flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${
                showNotifications
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              {/* Lime Green Notification Dot */}
              <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#C4FA2A] rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs" />
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div
                id="notification-dropdown-panel"
                className={`absolute right-0 mt-2 w-72 sm:w-88 border rounded-2xl shadow-xl p-3 sm:p-4 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-slate-800 mb-2.5 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">Fitness Alerts</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#C4FA2A] text-slate-950 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onMarkNotificationsRead}
                    className="text-[11px] sm:text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark read
                  </button>
                </div>

                <div className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs transition-colors ${
                        n.unread
                          ? isDarkMode
                            ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                            : 'bg-emerald-50/50 border-emerald-100 text-slate-800'
                          : isDarkMode
                          ? 'bg-slate-800/50 border-slate-800 text-slate-400'
                          : 'bg-slate-50 border-slate-100 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.timeAgo}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] sm:text-xs">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="relative">
            <button
              id="top-search-toggle-btn"
              onClick={() => {
                setShowSearchInput(!showSearchInput);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100/80 dark:border-slate-800/80 flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${
                showSearchInput
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Search"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </button>

            {/* Search Dropdown / Interactive Command Palette */}
            {showSearchInput && (
              <div
                id="search-command-palette"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Search Input Bar */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search sections, pages, workouts, food..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="text-xs bg-transparent outline-none w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onSearchChange?.('')}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Section / Page Results List */}
                <div className="max-h-72 sm:max-h-80 overflow-y-auto p-1.5 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>{searchQuery ? 'Matching Results' : 'Suggested Jump Links'}</span>
                    <span>{filteredSearchItems.length} found</span>
                  </div>

                  {filteredSearchItems.length === 0 ? (
                    <div className="text-center py-6 px-4 text-xs text-slate-400">
                      No section or page found matching &ldquo;{searchQuery}&rdquo;.
                    </div>
                  ) : (
                    filteredSearchItems.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSearchItem(item)}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}
                            >
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {item.title}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                    item.category === 'Page'
                                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                      : item.category === 'Quick Action'
                                      ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  }`}
                                >
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
