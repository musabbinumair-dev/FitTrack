import React, { useState } from 'react';
import { UserRole } from '../../types/fitness';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminRouteGuard } from './AdminRouteGuard';
import { UsersManagementPage } from './UsersManagementPage';
import { AnalyticsOverviewPage } from './AnalyticsOverviewPage';

interface AdminLayoutProps {
  currentRoute: 'analytics' | 'users';
  onNavigate: (route: 'analytics' | 'users') => void;
  onBackToMainApp: () => void;
  currentUserRole: UserRole;
  onToggleUserRole?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onSignOut?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentRoute,
  onNavigate,
  onBackToMainApp,
  currentUserRole,
  onToggleUserRole,
  isDarkMode = false,
  onToggleTheme,
  onSignOut,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleSearchChange = (query: string) => {
    setAdminSearch(query);
    if (query.trim() && currentRoute !== 'users') {
      onNavigate('users');
    }
  };

  return (
    <AdminRouteGuard
      userRole={currentUserRole}
      onRedirectToMainApp={onBackToMainApp}
    >
      <div
        id="admin-panel-root"
        className={`min-h-screen ${
          isDarkMode
            ? 'bg-slate-950 text-slate-100'
            : 'bg-[#F3F3F3] text-slate-800'
        } flex transition-colors duration-200`}
      >
        {/* Admin Slim Vertical Icon Dock (Matching User Panel SidebarDock) */}
        <AdminSidebar
          currentAdminRoute={currentRoute}
          onNavigate={onNavigate}
          onBackToMainApp={onBackToMainApp}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          currentUserRole={currentUserRole}
          onToggleUserRole={onToggleUserRole}
          onSignOut={onSignOut}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-8">
          {/* Admin Top Navigation Bar (Matching User Panel TopNavigationBar) */}
          <AdminHeader
            currentAdminRoute={currentRoute}
            onNavigate={onNavigate}
            onBackToMainApp={onBackToMainApp}
            currentUserRole={currentUserRole}
            onToggleUserRole={onToggleUserRole}
            isDarkMode={isDarkMode}
            onToggleTheme={onToggleTheme}
            onRefreshData={handleRefresh}
            isRefreshing={isRefreshing}
            searchQuery={adminSearch}
            onSearchChange={handleSearchChange}
            onSignOut={onSignOut}
          />

          {/* Admin Main Body */}
          <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-5 pb-24 md:pb-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
            {currentRoute === 'users' ? (
              <UsersManagementPage
                key={refreshKey}
                isDarkMode={isDarkMode}
                externalSearch={adminSearch}
              />
            ) : (
              <AnalyticsOverviewPage key={refreshKey} isDarkMode={isDarkMode} />
            )}
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  );
};
