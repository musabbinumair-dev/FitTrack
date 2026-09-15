import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  Users,
  BarChart3,
  Home,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  Shield,
  X,
  Check,
  User,
  Bell,
} from 'lucide-react';
import { UserRole } from '../../types/fitness';
import { useAuth } from '../../context/AuthContext';
import { AdminPreferencesModal } from './AdminPreferencesModal';
import appLogo from '../../assets/images/app_logo.svg';

interface AdminSidebarProps {
  currentAdminRoute: 'analytics' | 'users';
  onNavigate: (route: 'analytics' | 'users') => void;
  onBackToMainApp: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  currentUserRole?: UserRole;
  onToggleUserRole?: () => void;
  onSignOut?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentAdminRoute,
  onNavigate,
  onBackToMainApp,
  isDarkMode = false,
  onToggleTheme,
  currentUserRole = 'admin',
  onToggleUserRole,
  onSignOut,
}) => {
  const { user } = useAuth() as any;
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Upper navigation items matching exact dock style & spacing
  const upperNavItems = [
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'users' as const,
      label: 'Users',
      icon: Users,
    },
  ];

  const handleLogout = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      onBackToMainApp();
    }
  };

  const adminName = user?.name || 'System Administrator';

  return (
    <>
      {/* Desktop & Tablet Slim Vertical Icon Dock matching reference */}
      <aside
        id="sidebar-exact-reference-dock"
        className="hidden md:flex flex-col shrink-0 sticky top-0 h-screen py-6 px-3 z-40 select-none justify-between items-center bg-[#131418] dark:bg-[#0D0E11] text-white w-20 lg:w-[84px] border-r border-slate-800/50"
      >
        {/* ========================================================================= */}
        {/* TOP SECTION: Clean Lucide Brand Logo + Navigation Stack */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center gap-7 w-full">
          {/* Brand Logo: Clean Official FitTrack App Icon */}
          <button
            id="sidebar-brand-logo"
            onClick={() => onNavigate('analytics')}
            className="w-11 h-11 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 flex items-center justify-center cursor-pointer group focus:outline-none transition-transform hover:scale-105 shadow-sm p-2"
            title="FitTrack Admin - Analytics Dashboard"
            aria-label="FitTrack Admin"
          >
            <img src={appLogo} alt="FitTrack Logo" className="w-7 h-7 object-contain drop-shadow-xs" />
          </button>

          {/* Upper Navigation Stack */}
          <nav id="sidebar-nav-items" className="flex flex-col items-center gap-3 w-full">
            {upperNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentAdminRoute === item.id;

              return (
                <div key={item.id} className="relative group flex items-center justify-center w-11 h-11">
                  <button
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => onNavigate(item.id)}
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
                      className={`w-5 h-5 relative z-10 shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-[#131418] stroke-[2.5]' : 'text-slate-400 hover:text-white stroke-[2]'
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
        {/* BOTTOM SECTION: Main App Link, Settings, Help, Logout Buttons */}
        {/* ========================================================================= */}
        <div id="sidebar-lower-actions" className="flex flex-col items-center gap-3 w-full pb-2">
          {/* Return to Main App / User Panel Button */}
          <div className="relative group flex items-center justify-center w-11 h-11">
            <button
              id="sidebar-bottom-main-app-btn"
              onClick={onBackToMainApp}
              className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-[#C4FA2A] hover:bg-white/10 transition-all duration-150 cursor-pointer border border-transparent hover:border-[#C4FA2A]/30"
              title="Return to User Panel"
              aria-label="Return to User Panel"
            >
              <Home className="w-5 h-5 stroke-[2]" />
            </button>
            <div className="absolute left-[60px] px-2.5 py-1.5 bg-[#1F2026] text-[#C4FA2A] text-[11px] font-bold tracking-wide rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl border border-white/10 flex items-center gap-1.5">
              <span>Return to User Panel</span>
            </div>
          </div>

          {/* Settings */}
          <div className="relative group flex items-center justify-center w-11 h-11">
            <button
              id="sidebar-bottom-settings-btn"
              onClick={() => setShowSettingsModal(true)}
              className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-150 cursor-pointer"
              title="Admin Preferences"
              aria-label="Admin Preferences"
            >
              <Settings className="w-5 h-5 stroke-[2] group-hover:rotate-45 transition-transform duration-300" />
            </button>
            <div className="absolute left-[60px] px-2.5 py-1.5 bg-[#1F2026] text-white text-[11px] font-semibold tracking-wide rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl border border-white/10">
              Admin Preferences
            </div>
          </div>

          {/* Help */}
          <div className="relative group flex items-center justify-center w-11 h-11">
            <button
              id="sidebar-bottom-help-btn"
              onClick={() => setShowSupportModal(true)}
              className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-150 cursor-pointer"
              title="Help & Support"
              aria-label="Help & Support"
            >
              <HelpCircle className="w-5 h-5 stroke-[2]" />
            </button>
            <div className="absolute left-[60px] px-2.5 py-1.5 bg-[#1F2026] text-white text-[11px] font-semibold tracking-wide rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl border border-white/10">
              Help & Support
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
            <div className="absolute left-[60px] px-2.5 py-1.5 bg-[#1F2026] text-white text-[11px] font-semibold tracking-wide rounded-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl border border-white/10">
              Sign Out
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE FLOATING PILL (Exact matching BottomFloatingBar.tsx via Portal) */}
      {/* ========================================================================= */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            id="bottom-floating-pill-container"
            style={{
              position: 'fixed',
              bottom: '20px',
              left: 0,
              right: 0,
              zIndex: 99999,
              pointerEvents: 'none',
            }}
            className="fixed bottom-5 inset-x-0 z-50 flex items-center justify-center pointer-events-none px-4 md:hidden"
          >
            <nav
              id="bottom-floating-nav-pill"
              role="navigation"
              aria-label="Admin Bottom Navigation"
              style={{ pointerEvents: 'auto' }}
              className="pointer-events-auto bg-[#08090C] border border-white/10 rounded-full p-[2px] flex items-center h-[54px] shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between w-full h-full relative gap-1.5 sm:gap-2">
                {/* Analytics Tab */}
                <button
                  id="bottom-nav-analytics"
                  onClick={() => onNavigate('analytics')}
                  className="relative h-full aspect-square flex items-center justify-center cursor-pointer select-none outline-none transition-transform active:scale-95"
                  title="Analytics"
                  aria-label="Analytics"
                >
                  {currentAdminRoute === 'analytics' && (
                    <motion.div
                      layoutId="activeFloatingTabCircleAdmin"
                      className="absolute inset-0 rounded-full bg-[#C4FA2A] flex items-center justify-center"
                      transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                    />
                  )}
                  <BarChart3
                    className={`w-[18px] h-[18px] relative z-10 shrink-0 transition-colors duration-200 ${
                      currentAdminRoute === 'analytics' ? 'text-[#08090C]' : 'text-white/80 hover:text-white'
                    }`}
                  />
                </button>

                {/* Users Tab */}
                <button
                  id="bottom-nav-users"
                  onClick={() => onNavigate('users')}
                  className="relative h-full aspect-square flex items-center justify-center cursor-pointer select-none outline-none transition-transform active:scale-95"
                  title="Users"
                  aria-label="Users"
                >
                  {currentAdminRoute === 'users' && (
                    <motion.div
                      layoutId="activeFloatingTabCircleAdmin"
                      className="absolute inset-0 rounded-full bg-[#C4FA2A] flex items-center justify-center"
                      transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                    />
                  )}
                  <Users
                    className={`w-[18px] h-[18px] relative z-10 shrink-0 transition-colors duration-200 ${
                      currentAdminRoute === 'users' ? 'text-[#08090C]' : 'text-white/80 hover:text-white'
                    }`}
                  />
                </button>

                {/* Return to User App Tab */}
                <button
                  id="bottom-nav-return-app"
                  onClick={onBackToMainApp}
                  className="relative h-full aspect-square flex items-center justify-center cursor-pointer select-none outline-none transition-transform active:scale-95"
                  title="User Panel"
                  aria-label="User Panel"
                >
                  <Home className="w-[18px] h-[18px] relative z-10 shrink-0 text-white/80 hover:text-[#C4FA2A]" />
                </button>
              </div>
            </nav>
          </div>,
          document.body
        )}

      {/* Admin Preferences Modal with Support Forwarding Email */}
      <AdminPreferencesModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentUserRole={currentUserRole}
        onToggleUserRole={onToggleUserRole}
        isDarkMode={isDarkMode}
      />

      {/* Support Modal matching SidebarDock */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-[#C4FA2A]" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Admin Support</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Documentation & system diagnostics</p>
                </div>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                The FitTrack Administrative Management Suite allows real-time viewing of user health telemetry, account activations, role promotions, and platform workout statistics.
              </p>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 text-[11px]">
                <div className="font-semibold text-slate-900 dark:text-white">Quick Reference:</div>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Full Express REST API active at /api/admin/*
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Route Guard enforces role: 'admin'
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-3 rounded-2xl bg-[#C4FA2A] hover:bg-[#b8f020] text-[#131418] font-bold text-sm transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};
