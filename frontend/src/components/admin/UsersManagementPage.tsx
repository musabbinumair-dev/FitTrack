import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Shield,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  RotateCw,
  Dumbbell,
  Utensils,
  Flame,
  Filter,
} from 'lucide-react';
import { User, UserRole, UserStatus } from '../../types/fitness';
import { AdminUserStats, AdminUsersQuery } from '../../types/admin';
import { adminApi } from '../../services/adminApi';
import { UserDetailDrawer } from './UserDetailDrawer';
import { DeleteUserModal } from './DeleteUserModal';

interface UsersManagementPageProps {
  isDarkMode?: boolean;
  externalSearch?: string;
}

export const UsersManagementPage: React.FC<UsersManagementPageProps> = ({
  isDarkMode = false,
  externalSearch = '',
}) => {
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminUserStats>({
    totalUsers: 0,
    activeUsers7d: 0,
    newUsersThisMonth: 0,
    adminCount: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });

  // Query States
  const [search, setSearch] = useState(externalSearch);

  useEffect(() => {
    if (externalSearch !== undefined) {
      setSearch(externalSearch);
    }
  }, [externalSearch]);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [sortBy, setSortBy] = useState<'joinDate' | 'lastActive' | 'name'>('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users when filters change
  const fetchUsers = async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      else setIsRefreshing(true);

      const query: AdminUsersQuery = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        status: statusFilter,
        role: roleFilter,
        sortBy,
        sortOrder,
      };

      const res = await adminApi.getUsers(query);
      setUsers(res.users);
      setPagination(res.pagination);
      setStats(res.stats);
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast('Failed to load users from server', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, debouncedSearch, statusFilter, roleFilter, sortBy, sortOrder]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  // Row click
  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  // Quick Action: Toggle Status (Activate / Deactivate)
  const handleToggleStatus = async (user: User) => {
    try {
      setIsActionLoading(true);
      const nextStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
      const updated = await adminApi.updateUser(user.id, { status: nextStatus });

      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      if (selectedUser?.id === user.id) {
        setSelectedUser(updated);
      }
      // Re-fetch stats quietly to update active 7d counts
      fetchUsers(true);
      showToast(`User status updated to ${nextStatus}`, 'success');
    } catch (error) {
      console.error('Failed to update status', error);
      showToast('Failed to update user status', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Quick Action: Toggle Role (Promote / Demote)
  const handleToggleRole = async (user: User) => {
    try {
      setIsActionLoading(true);
      const nextRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
      const updated = await adminApi.updateUser(user.id, { role: nextRole });

      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      if (selectedUser?.id === user.id) {
        setSelectedUser(updated);
      }
      setStats((prev) => ({
        ...prev,
        adminCount: nextRole === 'admin' ? prev.adminCount + 1 : Math.max(1, prev.adminCount - 1),
      }));
      showToast(`User role updated to ${nextRole}`, 'success');
    } catch (error) {
      console.error('Failed to update role', error);
      showToast('Failed to update user role', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Quick Action: Delete User
  const handleDeleteRequest = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (userId: string) => {
    try {
      setIsActionLoading(true);
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setStats((prev) => ({
        ...prev,
        totalUsers: Math.max(0, prev.totalUsers - 1),
      }));
      if (selectedUser?.id === userId) {
        setIsDrawerOpen(false);
        setSelectedUser(null);
      }
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      showToast('User account successfully deleted', 'success');
    } catch (error) {
      console.error('Failed to delete user', error);
      showToast('Failed to delete user', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Quick Action: Export CSV
  const handleExportCSV = () => {
    if (users.length === 0) {
      showToast('No users to export', 'error');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Fitness Goal', 'Workouts', 'Meals', 'Calories Burned', 'Join Date', 'Last Active'];
    const rows = users.map((u) => [
      u.id,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      u.email,
      u.role,
      u.status,
      `"${(u.fitnessGoal || '').replace(/"/g, '""')}"`,
      u.totalWorkoutsLogged || 0,
      u.totalMealsLogged || 0,
      u.totalCaloriesBurned || 0,
      u.joinDate,
      u.lastActive,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fittrack_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported users CSV successfully', 'success');
  };

  const handleSortToggle = (field: 'joinDate' | 'lastActive' | 'name') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold ${
              feedbackToast.type === 'success'
                ? 'bg-[#C4FA2A] text-[#131418] border border-[#a8dd16]'
                : 'bg-rose-600 text-white'
            }`}
          >
            {feedbackToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{feedbackToast.message}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 0. PAGE HEADING: Exact User Panel typography & styling */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-1">
        <div className="shrink-0">
          <h1
            id="admin-users-page-title"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit']"
          >
            Users Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Manage user accounts, roles, access permissions, and live activity status.
          </p>
        </div>

        {/* Right Info Pill & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={isRefreshing || isLoading}
            className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            title="Refresh Users"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C4FA2A]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP STATS BAR: 4 High-Craft KPI Cards (Matching User Panel Architecture) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {/* 1. Total Users */}
        <div
          id="admin-kpi-total-users"
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[135px] sm:min-h-[150px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
              Total Users
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-[#00B4D8]" />
            </div>
          </div>

          <div className="mt-3.5 sm:mt-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-normal text-slate-400 dark:text-slate-400 block">
                Accounts
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Registered
              </span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit'] mt-0.5 sm:mt-1">
              {stats.totalUsers.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 2. Active Users (Last 7 Days) */}
        <div
          id="admin-kpi-active-users"
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[135px] sm:min-h-[150px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
              Active (7d)
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#22C55E]" />
            </div>
          </div>

          <div className="mt-3.5 sm:mt-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-normal text-slate-400 dark:text-slate-400 block">
                Retention
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-[#22C55E]">
                {stats.totalUsers > 0
                  ? `${Math.round((stats.activeUsers7d / stats.totalUsers) * 100)}% rate`
                  : '0%'}
              </span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit'] mt-0.5 sm:mt-1">
              {stats.activeUsers7d.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 3. New Users (This Month) */}
        <div
          id="admin-kpi-new-users"
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[135px] sm:min-h-[150px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
              New Signups
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
              <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF5722]" />
            </div>
          </div>

          <div className="mt-3.5 sm:mt-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-normal text-slate-400 dark:text-slate-400 block">
                This Month
              </span>
              <span className="text-[11px] font-medium text-orange-500 font-mono">
                +30d
              </span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit'] mt-0.5 sm:mt-1">
              +{stats.newUsersThisMonth.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 4. Admin Count */}
        <div
          id="admin-kpi-admins"
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[135px] sm:min-h-[150px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
              Admins
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-[#FFAE12]" />
            </div>
          </div>

          <div className="mt-3.5 sm:mt-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-normal text-slate-400 dark:text-slate-400 block">
                Privilege
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Staff
              </span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit'] mt-0.5 sm:mt-1">
              {stats.adminCount} <span className="text-sm sm:text-base font-medium text-slate-400">supervisors</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & FILTER CONTROLS BAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#131418] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="admin-search-users-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email, phone, or goal..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4FA2A] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills & Sort Options */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                id="filter-status-all"
                onClick={() => {
                  setStatusFilter('all');
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Status
              </button>
              <button
                id="filter-status-active"
                onClick={() => {
                  setStatusFilter('active');
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                id="filter-status-inactive"
                onClick={() => {
                  setStatusFilter('inactive');
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'inactive'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-300 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Inactive
              </button>
            </div>

            {/* Role Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                id="filter-role-all"
                onClick={() => {
                  setRoleFilter('all');
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Roles
              </button>
              <button
                id="filter-role-user"
                onClick={() => {
                  setRoleFilter('user');
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === 'user'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Athletes
              </button>
              <button
                id="filter-role-admin"
                onClick={() => {
                  setRoleFilter('admin');
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === 'admin'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-[#C4FA2A] shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Admins
              </button>
            </div>

            {/* Sort Toggle Controls */}
            <div className="flex items-center gap-1.5">
              <button
                id="sort-btn-joindate"
                onClick={() => handleSortToggle('joinDate')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  sortBy === 'joinDate'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
                title="Sort by Join Date"
              >
                <span>Joined</span>
                <ArrowUpDown className="w-3 h-3" />
                {sortBy === 'joinDate' && (
                  <span className="text-[10px] uppercase opacity-75">{sortOrder}</span>
                )}
              </button>

              <button
                id="sort-btn-lastactive"
                onClick={() => handleSortToggle('lastActive')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  sortBy === 'lastActive'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
                title="Sort by Last Active"
              >
                <span>Last Active</span>
                <ArrowUpDown className="w-3 h-3" />
                {sortBy === 'lastActive' && (
                  <span className="text-[10px] uppercase opacity-75">{sortOrder}</span>
                )}
              </button>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 px-2 py-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              <span className="mr-1.5 text-[11px] font-semibold">Per page:</span>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination((p) => ({ ...p, limit: parseInt(e.target.value, 10), page: 1 }))}
                className="bg-transparent font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value={8}>8</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. USERS TABLE */}
        {/* ========================================================================= */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Activity Volume</th>
                <th className="py-3 px-4">Join Date</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#C4FA2A] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Loading users from MongoDB...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No users found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filter criteria</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isActive = user.status === 'active';
                  const isAdmin = user.role === 'admin';

                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleRowClick(user)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      {/* Avatar & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shrink-0">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate group-hover:text-[#C4FA2A] transition-colors">
                              {user.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {user.fitnessGoal || 'Maintain Health'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            isAdmin
                              ? 'bg-[#C4FA2A] text-[#131418]'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {isAdmin && <Shield className="w-2.5 h-2.5 stroke-[3]" />}
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {user.status}
                        </span>
                      </td>

                      {/* Activity Volume (Live Stats) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1" title="Total Workouts Logged">
                            <Dumbbell className="w-3 h-3 text-emerald-500" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {user.totalWorkoutsLogged || 0}
                            </span>
                          </span>
                          <span className="flex items-center gap-1" title="Total Meals Logged">
                            <Utensils className="w-3 h-3 text-sky-500" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {user.totalMealsLogged || 0}
                            </span>
                          </span>
                          <span className="flex items-center gap-1" title="Calories Burned">
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {(user.totalCaloriesBurned || 0) >= 1000
                                ? `${((user.totalCaloriesBurned || 0) / 1000).toFixed(1)}k`
                                : user.totalCaloriesBurned || 0}
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                        {user.joinDate}
                      </td>

                      {/* Last Active */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(user.lastActive).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-flex items-center gap-1">
                          {/* Quick Toggle Status */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            disabled={isActionLoading}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title={isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            {isActive ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                Deactivate
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                Activate
                              </span>
                            )}
                          </button>

                          {/* Quick Toggle Role */}
                          <button
                            type="button"
                            onClick={() => handleToggleRole(user)}
                            disabled={isActionLoading}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title={isAdmin ? 'Demote to user' : 'Promote to admin'}
                          >
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                              {isAdmin ? 'Demote' : 'Promote'}
                            </span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(user)}
                            disabled={isActionLoading}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* View Drawer Button */}
                          <button
                            type="button"
                            onClick={() => handleRowClick(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#C4FA2A] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Open Details Drawer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* 4. PAGINATION FOOTER */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {users.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {pagination.total}
            </span>{' '}
            users
          </div>

          <div className="flex items-center gap-2">
            <button
              id="admin-pagination-prev-btn"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              Page {pagination.page} of {pagination.totalPages}
            </div>

            <button
              id="admin-pagination-next-btn"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Drawer */}
      <UserDetailDrawer
        isOpen={isDrawerOpen}
        user={selectedUser}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedUser(null);
        }}
        onToggleStatus={handleToggleStatus}
        onToggleRole={handleToggleRole}
        onDeleteRequest={handleDeleteRequest}
        onUserUpdated={(updatedUser) => {
          setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
          setSelectedUser(updatedUser);
          showToast('User profile updated successfully', 'success');
        }}
        isActionLoading={isActionLoading}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        user={userToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isActionLoading}
      />
    </div>
  );
};
