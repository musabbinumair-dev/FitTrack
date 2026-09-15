import React, { useEffect } from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { UserRole } from '../../types/fitness';

interface AdminRouteGuardProps {
  userRole: UserRole;
  onRedirectToMainApp: () => void;
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  userRole,
  onRedirectToMainApp,
  children,
}) => {
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      const timer = setTimeout(() => {
        onRedirectToMainApp();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, onRedirectToMainApp]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#131418] border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Only users with <span className="font-bold text-rose-500">role: 'admin'</span> can access <span className="font-mono text-slate-700 dark:text-slate-300">/admin/*</span> routes.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            Current session role: <span className="font-bold uppercase text-slate-900 dark:text-white">{userRole}</span>.
            Redirecting to the main application...
          </div>

          <button
            type="button"
            onClick={onRedirectToMainApp}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Main App Immediately</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
