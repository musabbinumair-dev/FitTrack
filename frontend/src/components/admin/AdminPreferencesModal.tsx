import React, { useState, useEffect } from 'react';
import { Settings, X, Mail, Check, Loader2, User, Shield, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../lib/api';
import { UserRole } from '../../types/fitness';

interface AdminPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: UserRole;
  onToggleUserRole?: () => void;
  isDarkMode?: boolean;
}

export const AdminPreferencesModal: React.FC<AdminPreferencesModalProps> = ({
  isOpen,
  onClose,
  currentUserRole = 'admin',
  onToggleUserRole,
  isDarkMode = false,
}) => {
  const { user, refetch } = useAuth() as any;
  const adminName = user?.name || 'System Administrator';

  const [adminSupportEmail, setAdminSupportEmail] = useState(
    user?.preferences?.adminSupportEmail || ''
  );
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [toastFeedback, setToastFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  useEffect(() => {
    if (user?.preferences?.adminSupportEmail !== undefined) {
      setAdminSupportEmail(user.preferences.adminSupportEmail || '');
    }
  }, [user?.preferences?.adminSupportEmail]);

  if (!isOpen) return null;

  const showToast = (message: string, isError = false) => {
    setToastFeedback({ message, isError });
    setTimeout(() => {
      setToastFeedback(null);
    }, 3000);
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingEmail(true);
      await userApi.updatePreferences({
        adminSupportEmail: adminSupportEmail.trim(),
      });
      if (refetch) await refetch();
      showToast('Support forwarding email saved successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update forwarding email', true);
    } finally {
      setIsSavingEmail(false);
    }
  };

  return (
    <div
      id="admin-preferences-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="admin-preferences-modal-card"
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border relative ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Toast Alert Inside Modal */}
        {toastFeedback && (
          <div className="absolute top-3 left-6 right-6 z-10 animate-in slide-in-from-top-2 duration-150">
            <div
              className={`p-3 rounded-2xl shadow-lg flex items-center gap-2.5 text-xs font-bold ${
                toastFeedback.isError
                  ? 'bg-rose-600 text-white'
                  : 'bg-[#C4FA2A] text-[#131418] border border-[#a6da1e]'
              }`}
            >
              {toastFeedback.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{toastFeedback.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C4FA2A] text-[#131418] flex items-center justify-center shrink-0 shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg font-['Outfit']">Admin Preferences</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#C4FA2A] text-[#131418]">
                  SYSTEM
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">System settings and administration</p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-admin-preferences"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-5 text-sm max-h-[75vh] overflow-y-auto pr-1">
          {/* 1. Admin Support Email Forwarding Section */}
          <div className="p-4 rounded-2xl bg-[#C4FA2A]/10 dark:bg-[#C4FA2A]/5 border border-[#C4FA2A]/30 dark:border-[#C4FA2A]/20 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#C4FA2A] text-[#131418] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Admin Support Email Forwarding
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Receive all user questions, bug reports, and feedback
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEmail} className="space-y-2.5 pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Forward User Inquiries To Email:
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="email"
                  id="admin-support-email-input"
                  required
                  value={adminSupportEmail}
                  onChange={(e) => setAdminSupportEmail(e.target.value)}
                  placeholder="e.g. admin.support@fittrack.com"
                  className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-[#C4FA2A] transition-colors"
                />
                <button
                  type="submit"
                  id="btn-save-admin-forwarding-email"
                  disabled={isSavingEmail}
                  className="px-4 py-2 bg-[#C4FA2A] hover:bg-[#b0e61e] text-[#131418] text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center gap-1.5"
                >
                  {isSavingEmail ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  <span>Save Email</span>
                </button>
              </div>
              <p className="text-[10.5px] text-slate-400 dark:text-slate-500 leading-relaxed">
                When athletes submit inquiries via the Support & Feedback center, their details and messages will be forwarded directly to this email inbox.
              </p>
            </form>
          </div>

          {/* 2. Admin Account Status */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-semibold text-xs">Logged In Profile</div>
                <div className="text-xs text-slate-500">{adminName} (Administrator)</div>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase bg-[#C4FA2A] text-[#131418] px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>

          {/* 3. Role Simulator */}
          {onToggleUserRole && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[#C4FA2A]" />
                <div>
                  <div className="font-semibold text-xs">Simulate User Role</div>
                  <div className="text-xs text-slate-500">Current Role: {currentUserRole}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleUserRole}
                className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 cursor-pointer transition-all"
              >
                Switch
              </button>
            </div>
          )}

          {/* 4. Telemetry / Push Alerts status */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-semibold text-xs">Admin Platform Alerts</div>
                <div className="text-xs text-slate-500">Instant registration & telemetry sync</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
              Enabled
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
