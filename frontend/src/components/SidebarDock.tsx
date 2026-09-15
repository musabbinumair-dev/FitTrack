import React, { useState } from 'react';
import {
  Home,
  Dumbbell,
  Apple,
  TrendingUp,
  User,
  Calendar,
  Sparkles,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Bell,
  Shield,
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../types/fitness';

interface SidebarDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onShowWelcome?: () => void;
  onSignOut?: () => void;
  isDarkMode?: boolean;
  userRole?: UserRole;
  onOpenAdminPanel?: () => void;
}

export const SidebarDock: React.FC<SidebarDockProps> = ({
  activeTab,
  onTabChange,
  onShowWelcome,
  onSignOut,
  isDarkMode = false,
  userRole,
  onOpenAdminPanel,
}) => {

  // Upper navigation items matching exact icons, labels
  const upperNavItems = [
    {
      id: 'dashboard',
      altIds: ['dashboard', 'home', 'activity'],
      label: 'Home',
      icon: Home,
    },
    {
      id: 'workouts',
      altIds: ['workouts', 'workout', 'plans', 'routines'],
      label: 'Workouts',
      icon: Dumbbell,
    },
    {
      id: 'nutrition',
      altIds: ['nutrition', 'food', 'meals', 'macros'],
      label: 'Nutrition',
      icon: Apple,
    },
    {
      id: 'progress',
      altIds: ['progress', 'analytics', 'trending', 'stats', 'goals'],
      label: 'Progress',
      icon: TrendingUp,
    },
  ];

  const handleLogout = () => {
    if (onSignOut) {
      onSignOut();
    } else if (onShowWelcome) {
      onShowWelcome();
    }
  };

  return (
    <>
      <aside
        id="sidebar-exact-reference-dock"
        className="hidden md:flex flex-col shrink-0 sticky top-0 h-screen py-6 px-3 z-40 select-none justify-between items-center bg-[#131418] dark:bg-[#0D0E11] text-white w-20 lg:w-[84px] border-r border-slate-800/50"
      >
        {/* ========================================================================= */}
        {/* TOP SECTION: Clean Lucide Brand Logo + Navigation Stack */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center gap-7 w-full">
          {/* Brand Logo: Clean Lucide Zap Icon */}
          <button
            id="sidebar-brand-logo"
            className="w-11 h-11 rounded-full bg-[#C4FA2A] flex items-center justify-center cursor-pointer group focus:outline-none transition-transform hover:scale-105 shadow-sm"
            aria-label="FitTrack Home"
          >
            <Sparkles className="w-5 h-5 text-[#131418] stroke-[2.5]" />
          </button>

          {/* Upper Navigation Stack */}
          <nav id="sidebar-nav-items" className="flex flex-col items-center gap-3 w-full">
            {upperNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                item.altIds.includes(activeTab) ||
                (item.id === 'dashboard' && (!activeTab || activeTab === 'home'));

              return (
                <div key={item.id} className="relative group flex items-center justify-center w-11 h-11">
                  <button
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => onTabChange(item.id)}
                    className="relative w-11 h-11 rounded-full flex items-center justify-center cursor-pointer select-none outline-none transition-transform active:scale-95"
                    title={item.label}
                    aria-label={item.label}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarTabCircle"
                        className="absolute inset-0 rounded-full bg-[#C4FA2A] flex items-center justify-center shadow-sm"
                        transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                      />
                    )}

                    <Icon
                      className={`w-5 h-5 relative z-10 shrink-0 transition-colors duration-200 ${isActive ? 'text-[#131418] stroke-[2.5]' : 'text-slate-400 hover:text-white stroke-[2]'
                        }`}
                    />
                  </button>

                  {/* Tooltip */}
                  <div className="absolute left-[60px] px-2.5 py-1.5 bg-[#1F2026] text-white text-[11px] font-semibold tracking-wide rounded-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl border border-white/10">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM SECTION: Settings, Help, Logout Buttons */}
        {/* ========================================================================= */}
        <div id="sidebar-lower-actions" className="flex flex-col items-center gap-3 w-full pb-2">
          {/* Admin Console (Visible only for admin users) */}
          {userRole === 'admin' && onOpenAdminPanel && (
            <div className="relative group flex items-center justify-center w-11 h-11">
              <button
                id="sidebar-bottom-admin-btn"
                onClick={onOpenAdminPanel}
                className="w-11 h-11 rounded-full flex items-center justify-center text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 transition-all duration-150 cursor-pointer relative"
                title="Admin Console"
                aria-label="Admin Console"
              >
                <Shield className="w-5 h-5 stroke-[2.5]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#131418] animate-pulse" />
              </button>
              <div className="absolute left-[60px] px-2.5 py-1.5 bg-[#1F2026] text-amber-300 text-[11px] font-bold tracking-wide rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl border border-amber-500/30">
                Admin Console
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="relative group flex items-center justify-center w-11 h-11">
            <button
              id="sidebar-bottom-settings-btn"
              onClick={() => onTabChange('profile')}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${activeTab === 'profile' || activeTab === 'settings'
                  ? 'bg-[#C4FA2A] text-[#131418]'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              title="Profile & Settings"
              aria-label="Profile & Settings"
            >
              <Settings className={`w-5 h-5 stroke-[2] group-hover:rotate-45 transition-transform duration-300 ${activeTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
            </button>
            <div className="absolute left-[60px] px-2.5 py-1.5 bg-[#1F2026] text-white text-[11px] font-semibold tracking-wide rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl border border-white/10">
              Profile & Settings
            </div>
          </div>

          {/* Help & Support */}
          <div className="relative group flex items-center justify-center w-11 h-11">
            <button
              id="sidebar-bottom-help-btn"
              onClick={() => {
                onTabChange('profile');
                setTimeout(() => {
                  const target = document.getElementById('settings-support-card');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.classList.add('ring-4', 'ring-[#C4FA2A]', 'transition-all', 'duration-500');
                    setTimeout(() => {
                      target.classList.remove('ring-4', 'ring-[#C4FA2A]');
                    }, 2500);
                  }
                }, 180);
              }}
              className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-150 cursor-pointer"
              title="Help, Support & Feedback"
              aria-label="Help, Support & Feedback"
            >
              <HelpCircle className="w-5 h-5 stroke-[2]" />
            </button>
            <div className="absolute left-[60px] px-2.5 py-1.5 bg-[#1F2026] text-white text-[11px] font-semibold tracking-wide rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl border border-white/10">
              Help, Support & Feedback
            </div>
          </div>

          {/* Log Out */}
          <div className="relative group flex items-center justify-center w-11 h-11">
            <button
              id="sidebar-bottom-logout-btn"
              onClick={handleLogout}
              className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 cursor-pointer"
              title="Sign Out / Exit"
              aria-label="Sign Out"
            >
              <LogOut className="w-5 h-5 stroke-[2]" />
            </button>
            <div className="absolute left-[60px] px-2.5 py-1.5 bg-[#1F2026] text-white text-[11px] font-semibold tracking-wide rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl border border-white/10">
              Sign Out
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
