import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Phone,
  Calendar,
  Ruler,
  Weight,
  Target,
  Dumbbell,
  Utensils,
  Flame,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  Clock,
  CheckCircle2,
  Edit3,
  Save,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { User } from '../../types/fitness';
import { adminApi } from '../../services/adminApi';

interface UserDetailDrawerProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onToggleStatus: (user: User) => Promise<void>;
  onToggleRole: (user: User) => Promise<void>;
  onDeleteRequest: (user: User) => void;
  onUserUpdated?: (updated: User) => void;
  isActionLoading?: boolean;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  isOpen,
  user,
  onClose,
  onToggleStatus,
  onToggleRole,
  onDeleteRequest,
  onUserUpdated,
  isActionLoading = false,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [isFetchingFresh, setIsFetchingFresh] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    fitnessGoal: '',
    height: '',
    weight: '',
    gender: '',
  });

  // Sync user prop and load latest live details from database
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setEditForm({
        name: user.name || '',
        phone: user.phone || '',
        fitnessGoal: user.fitnessGoal || 'Maintain Health & Vitality',
        height: user.height ? String(user.height).replace(/[^0-9.]/g, '') : '175',
        weight: user.weight ? String(user.weight).replace(/[^0-9.]/g, '') : '72',
        gender: user.gender || 'Prefer not to say',
      });
      setIsEditMode(false);

      // Fetch fresh live details from database
      const loadFresh = async () => {
        try {
          setIsFetchingFresh(true);
          const fresh = await adminApi.getUserById(user.id);
          if (fresh) {
            setCurrentUser(fresh);
            setEditForm({
              name: fresh.name || '',
              phone: fresh.phone || '',
              fitnessGoal: fresh.fitnessGoal || 'Maintain Health & Vitality',
              height: fresh.height ? String(fresh.height).replace(/[^0-9.]/g, '') : '175',
              weight: fresh.weight ? String(fresh.weight).replace(/[^0-9.]/g, '') : '72',
              gender: fresh.gender || 'Prefer not to say',
            });
          }
        } catch (e) {
          // Fallback gracefully to passed user prop
        } finally {
          setIsFetchingFresh(false);
        }
      };
      loadFresh();
    }
  }, [user]);

  if (!isOpen || !currentUser) return null;

  const isActive = currentUser.status === 'active';
  const isAdmin = currentUser.role === 'admin';

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      const updated = await adminApi.updateUser(currentUser.id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        fitnessGoal: editForm.fitnessGoal.trim(),
        height: editForm.height ? parseFloat(editForm.height) : undefined,
        weight: editForm.weight ? parseFloat(editForm.weight) : undefined,
        gender: editForm.gender,
      } as any);

      setCurrentUser(updated);
      setIsEditMode(false);
      if (onUserUpdated) {
        onUserUpdated(updated);
      }
    } catch (err) {
      console.error('Failed to update user:', err);
      alert('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="admin-user-detail-drawer"
          className="w-screen max-w-md bg-white dark:bg-[#131418] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 text-slate-900 dark:text-slate-100"
        >
          {/* Drawer Top Bar */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                User Details
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {currentUser.status}
              </span>
              {isFetchingFresh && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  syncing
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  isEditMode
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
                title="Toggle Edit Profile"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Cancel' : 'Edit'}</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#C4FA2A] shadow-md shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                {isEditMode ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-2.5 py-1 text-sm font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="User Name"
                    />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="Phone number"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] truncate">
                      {currentUser.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {currentUser.email}
                    </p>
                    {currentUser.phone && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {currentUser.phone}
                      </p>
                    )}
                  </>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isAdmin
                        ? 'bg-[#C4FA2A] text-[#131418]'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono truncate">
                    ID: {currentUser.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Database Activity Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <Dumbbell className="w-4 h-4 mx-auto mb-1 text-slate-500 dark:text-[#C4FA2A]" />
                <div className="text-base font-black text-slate-900 dark:text-white font-['Outfit']">
                  {currentUser.totalWorkoutsLogged || 0}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Workouts
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <Utensils className="w-4 h-4 mx-auto mb-1 text-slate-500 dark:text-emerald-400" />
                <div className="text-base font-black text-slate-900 dark:text-white font-['Outfit']">
                  {currentUser.totalMealsLogged || 0}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Meals Logged
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <Flame className="w-4 h-4 mx-auto mb-1 text-slate-500 dark:text-orange-400" />
                <div className="text-base font-black text-slate-900 dark:text-white font-['Outfit']">
                  {(currentUser.totalCaloriesBurned || 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  kCal Burned
                </div>
              </div>
            </div>

            {/* Biometric & Profile Info */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                <span>Biometrics & Goals</span>
                {isEditMode && <span className="text-emerald-600 text-[10px] font-bold">EDITING</span>}
              </div>

              {isEditMode ? (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-0.5">Fitness Goal</label>
                    <select
                      value={editForm.fitnessGoal}
                      onChange={(e) => setEditForm({ ...editForm, fitnessGoal: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="Weight Loss & Shredding">Weight Loss & Shredding</option>
                      <option value="Hypertrophy & Muscle Gain">Hypertrophy & Muscle Gain</option>
                      <option value="Strength & Powerlifting">Strength & Powerlifting</option>
                      <option value="Cardiovascular Endurance">Cardiovascular Endurance</option>
                      <option value="Maintain Health & Vitality">Maintain Health & Vitality</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-0.5">Height (cm)</label>
                      <input
                        type="number"
                        value={editForm.height}
                        onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5">Weight (kg)</label>
                      <input
                        type="number"
                        value={editForm.weight}
                        onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-0.5">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="w-full mt-2 py-2 rounded-xl bg-[#C4FA2A] text-[#131418] font-bold flex items-center justify-center gap-1.5 hover:bg-[#b0e61e] cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Ruler className="w-3.5 h-3.5 text-slate-400" /> Height
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {currentUser.height || '175 cm'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Weight className="w-3.5 h-3.5 text-slate-400" /> Weight
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {currentUser.weight || '72 kg'}
                    </span>
                  </div>

                  {currentUser.gender && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Gender</span>
                      <span className="font-bold text-slate-900 dark:text-white">{currentUser.gender}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-slate-400" /> Fitness Goal
                    </span>
                    <span className="font-bold text-slate-900 dark:text-[#C4FA2A] text-right truncate max-w-[200px]">
                      {currentUser.fitnessGoal || 'General Fitness'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Account & Activity Timestamps */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Account Timeline
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member Since
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentUser.joinDate ? new Date(currentUser.joinDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Last Active
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {new Date(currentUser.lastActive).toLocaleDateString()} at{' '}
                  {new Date(currentUser.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {currentUser.createdAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Account Registered
                  </span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick Admin Actions
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Activate / Deactivate button */}
              <button
                type="button"
                onClick={() => onToggleStatus(currentUser)}
                disabled={isActionLoading}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                }`}
              >
                {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                <span>{isActive ? 'Deactivate' : 'Activate'}</span>
              </button>

              {/* Promote / Demote Role button */}
              <button
                type="button"
                onClick={() => onToggleRole(currentUser)}
                disabled={isActionLoading}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  isAdmin
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    : 'bg-[#C4FA2A]/20 hover:bg-[#C4FA2A]/30 text-slate-900 dark:text-[#C4FA2A] border-[#C4FA2A]/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isAdmin ? 'Demote to User' : 'Promote to Admin'}</span>
              </button>
            </div>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => onDeleteRequest(currentUser)}
              disabled={isActionLoading}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete User Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
