import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  User,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Bell,
  Sliders,
  Moon,
  Sun,
  Check,
  Edit3,
  Lock,
  Download,
  LogOut,
  Target,
  Flame,
  AlertCircle,
  Loader2,
  FileText,
  LifeBuoy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUnits } from '../context/UnitContext';
import { SupportModal } from './SupportModal';
import { userApi, authApi, exportApi, notificationApi } from '../lib/api';

interface ProfileData {
  name: string;
  username: string;
  email: string;
  bio: string;
  birthDate: string;
  gender: string;
  height: string;
  weight: string;
  targetWeight: string;
  fitnessGoal: string;
  dailyCalorieGoal: string;
  workoutDaysPerWeek: string;
  avatarUrl: string;
}

interface NotificationSettings {
  workoutReminders: boolean;
  goalAchievements: boolean;
  hydrationAlerts: boolean;
  recoveryAlerts: boolean;
}

interface EmailNotificationSettings {
  weeklyDigest: boolean;
  goalMilestones: boolean;
  workoutReminders: boolean;
  securityAlerts: boolean;
}

interface UnitSettings {
  weight: 'kg' | 'lbs';
  height: 'cm' | 'ft in';
  energy: 'kcal' | 'kJ';
}

interface ProfileSettingsPageProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({
  isDarkMode = false,
  onToggleTheme,
}) => {
  const { user, login, logout, refetch } = useAuth() as any;

  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    username: '',
    email: '',
    bio: '',
    birthDate: '',
    gender: 'Prefer not to say',
    height: '',
    weight: '',
    targetWeight: '',
    fitnessGoal: 'maintain',
    dailyCalorieGoal: '2000',
    workoutDaysPerWeek: '4',
    avatarUrl: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(profile);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIsError, setToastIsError] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('fitness_notifications');
      if (saved) return JSON.parse(saved);
    } catch {
    }
    return {
      workoutReminders: true,
      goalAchievements: true,
      hydrationAlerts: true,
      recoveryAlerts: false,
    };
  });

  const [emailNotifications, setEmailNotifications] = useState<EmailNotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('fitness_email_notifications');
      if (saved) return JSON.parse(saved);
    } catch {
    }
    return {
      weeklyDigest: true,
      goalMilestones: true,
      workoutReminders: true,
      securityAlerts: true,
    };
  });
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  const {
    energyUnit: globalEnergyUnit,
    setEnergyUnit: setGlobalEnergyUnit,
    weightUnit: globalWeightUnit,
    setWeightUnit: setGlobalWeightUnit,
    heightUnit: globalHeightUnit,
    setHeightUnit: setGlobalHeightUnit,
  } = useUnits();

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportCategory, setSupportCategory] = useState<'bug' | 'feedback' | 'contact' | 'other'>('feedback');

  const [units, setUnits] = useState<UnitSettings>(() => ({
    weight: (localStorage.getItem('fitness_weight_unit') as 'kg' | 'lbs') || 'kg',
    height: (() => {
      const stored = localStorage.getItem('fitness_height_unit');
      return (stored === 'in' || stored === 'ft in' ? 'ft in' : 'cm') as 'cm' | 'ft in';
    })(),
    energy: (localStorage.getItem('fitness_energy_unit') as 'kcal' | 'kJ') || 'kcal',
  }));

  // Synchronize local units state when global units change
  useEffect(() => {
    setUnits({
      weight: globalWeightUnit,
      height: globalHeightUnit,
      energy: globalEnergyUnit,
    });
  }, [globalWeightUnit, globalHeightUnit, globalEnergyUnit]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, isError = false) => {
    setToastMessage(message);
    setToastIsError(isError);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  useEffect(() => {
    if (user) {
      const uWeightUnit = user.weightUnit || user.preferences?.units || (localStorage.getItem('fitness_weight_unit') as 'kg' | 'lbs') || 'kg';
      const rawHUnit = user.heightUnit || localStorage.getItem('fitness_height_unit') || 'cm';
      const uHeightUnit: 'cm' | 'ft in' = rawHUnit === 'in' || rawHUnit === 'ft in' ? 'ft in' : 'cm';
      const uEnergyUnit = (localStorage.getItem('fitness_energy_unit') as 'kcal' | 'kJ') || 'kcal';

      setUnits({
        weight: uWeightUnit,
        height: uHeightUnit,
        energy: uEnergyUnit,
      });

      let displayHeight = '';
      if (user.height != null && user.height > 0) {
        if (uHeightUnit === 'ft in') {
          const cmVal = user.height > 100 ? user.height : Math.round(user.height * 2.54);
          const totalInches = Math.round(cmVal / 2.54);
          const feet = Math.floor(totalInches / 12);
          const inches = totalInches % 12;
          displayHeight = `${feet} ft ${inches} in`;
        } else {
          const cmVal = user.height < 100 ? Math.round(user.height * 2.54) : Math.round(user.height);
          displayHeight = String(cmVal);
        }
      }

      let displayWeight = '';
      if (user.weight != null && user.weight > 0) {
        if (uWeightUnit === 'lbs' && user.weight < 120 && user.weightUnit === 'kg') {
          displayWeight = (user.weight * 2.20462).toFixed(1);
        } else if (uWeightUnit === 'kg' && user.weight > 120 && user.weightUnit === 'lbs') {
          displayWeight = (user.weight / 2.20462).toFixed(1);
        } else {
          displayWeight = String(user.weight);
        }
      }

      let displayTargetWeight = '';
      if (user.targetWeight != null && user.targetWeight > 0) {
        if (uWeightUnit === 'lbs' && user.targetWeight < 120 && user.weightUnit === 'kg') {
          displayTargetWeight = (user.targetWeight * 2.20462).toFixed(1);
        } else if (uWeightUnit === 'kg' && user.targetWeight > 120 && user.weightUnit === 'lbs') {
          displayTargetWeight = (user.targetWeight / 2.20462).toFixed(1);
        } else {
          displayTargetWeight = String(user.targetWeight);
        }
      }

      const nextProfile: ProfileData = {
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        birthDate: user.age != null ? String(user.age) : '',
        gender: user.gender || 'Prefer not to say',
        height: displayHeight,
        weight: displayWeight,
        targetWeight: displayTargetWeight,
        fitnessGoal: user.fitnessGoal || 'maintain',
        dailyCalorieGoal: String(user.dailyCalorieGoal || user.calorieGoal || 2000),
        workoutDaysPerWeek: String(user.workoutDaysPerWeek || 4),
        avatarUrl: user.profilePhotoUrl || '',
      };

      setProfile(nextProfile);
      if (!isEditing) {
        setFormData(nextProfile);
      }
    }
  }, [user]);

  const getAvatarSrc = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5050/api';
    const backendHost = apiBase.replace(/\/api\/?$/, '');
    return `${backendHost}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=320&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=320&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&auto=format&fit=crop&q=80',
  ];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const res = await userApi.uploadPhoto(file);
      const newPhotoUrl = res.profilePhotoUrl || res.user?.profilePhotoUrl || '';
      if (res && res.user) {
        login(res.user);
      } else if (user) {
        login({ ...user, profilePhotoUrl: newPhotoUrl });
      }
      refetch?.();
      setProfile((prev) => ({ ...prev, avatarUrl: newPhotoUrl }));
      setFormData((prev) => ({ ...prev, avatarUrl: newPhotoUrl }));
      showToast('Profile photo uploaded and saved!');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload photo', true);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectPresetAvatar = async (url: string) => {
    if (isEditing) {
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
      return;
    }
    try {
      const res = await userApi.updateProfile({ profilePhotoUrl: url });
      if (res && res.user) {
        login(res.user);
      } else if (user) {
        login({ ...user, profilePhotoUrl: url });
      }
      refetch?.();
      setProfile((prev) => ({ ...prev, avatarUrl: url }));
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
      showToast('Profile avatar updated!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update avatar', true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        gender: formData.gender,
        age: formData.birthDate ? Number(formData.birthDate) : null,
        height: (() => {
          if (!formData.height) return null;
          if (units.height === 'ft in') {
            const m = formData.height.match(/(\d+)\s*(?:ft|')\s*(\d+)?/i);
            if (m) {
              const ft = parseInt(m[1], 10) || 0;
              const inch = m[2] ? parseInt(m[2], 10) : 0;
              return Math.round((ft * 12 + inch) * 2.54);
            }
          }
          return Number(formData.height) || null;
        })(),
        heightUnit: units.height,
        weight: formData.weight ? Number(formData.weight) : null,
        weightUnit: units.weight,
        targetWeight: formData.targetWeight ? Number(formData.targetWeight) : null,
        dailyCalorieGoal: formData.dailyCalorieGoal ? Number(formData.dailyCalorieGoal) : 2000,
        calorieGoal: formData.dailyCalorieGoal ? Number(formData.dailyCalorieGoal) : 2000,
        fitnessGoal: formData.fitnessGoal,
        workoutDaysPerWeek: formData.workoutDaysPerWeek ? Number(formData.workoutDaysPerWeek) : 4,
      };
      if (formData.avatarUrl) {
        payload.profilePhotoUrl = formData.avatarUrl;
      }
      const res = await userApi.updateProfile(payload);
      if (res && res.user) {
        login(res.user);
      } else if (user) {
        login({ ...user, ...payload });
      }
      refetch?.();
      setProfile(formData);
      setIsEditing(false);
      showToast('Profile changes saved successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save profile', true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const toggleNotification = async (key: keyof NotificationSettings) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(updated);
    localStorage.setItem('fitness_notifications', JSON.stringify(updated));
    const anyEnabled = Object.values(updated).some(Boolean);
    try {
      await userApi.updatePreferences({
        notificationsEnabled: anyEnabled,
        units: units.weight,
        theme: isDarkMode ? 'dark' : 'light',
      });
    } catch {
    }
  };

  const toggleEmailNotification = async (key: keyof EmailNotificationSettings) => {
    const updated = {
      ...emailNotifications,
      [key]: !emailNotifications[key],
    };
    setEmailNotifications(updated);
    localStorage.setItem('fitness_email_notifications', JSON.stringify(updated));
    try {
      await userApi.updatePreferences({
        emailNotifications: updated,
        units: units.weight,
        theme: isDarkMode ? 'dark' : 'light',
      });
    } catch {
    }
  };

  const handleSendTestDigest = async () => {
    setIsSendingTestEmail(true);
    try {
      const targetEmail = user?.email || 'yousha.mirza328@gmail.com';
      const res = await notificationApi.sendTestEmail({ recipientEmail: targetEmail });
      showToast(res.message || `Performance digest sent to ${targetEmail}! Check your inbox.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch email digest', true);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleWeightUnitChange = async (unit: 'kg' | 'lbs') => {
    if (unit === units.weight) return;
    setUnits((u) => ({ ...u, weight: unit }));
    setGlobalWeightUnit(unit);

    // Convert weight and targetWeight in profile and formData
    const convertWeightVal = (valStr: string) => {
      const val = parseFloat(valStr);
      if (isNaN(val) || val <= 0) return valStr;
      return unit === 'lbs' ? (val * 2.20462).toFixed(1) : (val / 2.20462).toFixed(1);
    };

    const newWeightStr = convertWeightVal(profile.weight);
    const newTargetWeightStr = convertWeightVal(profile.targetWeight);

    setProfile((prev) => ({
      ...prev,
      weight: newWeightStr,
      targetWeight: newTargetWeightStr,
    }));

    setFormData((prev) => ({
      ...prev,
      weight: newWeightStr,
      targetWeight: newTargetWeightStr,
    }));

    localStorage.setItem('fitness_weight_unit', unit);
    try {
      await userApi.updatePreferences({ units: unit, theme: isDarkMode ? 'dark' : 'light' });
      const updatePayload: any = { weightUnit: unit };
      if (newWeightStr && !isNaN(parseFloat(newWeightStr))) {
        updatePayload.weight = parseFloat(newWeightStr);
      }
      if (newTargetWeightStr && !isNaN(parseFloat(newTargetWeightStr))) {
        updatePayload.targetWeight = parseFloat(newTargetWeightStr);
      }
      const res = await userApi.updateProfile(updatePayload);
      if (res && res.user) {
        login(res.user);
      }
      showToast(`Weight unit converted to ${unit}`);
    } catch {
    }
  };

  const handleHeightUnitChange = async (unit: 'cm' | 'ft in') => {
    if (unit === units.height) return;
    setUnits((u) => ({ ...u, height: unit }));
    setGlobalHeightUnit(unit);

    let newHeightStr = '';
    let heightCmToSave = 0;

    if (unit === 'ft in') {
      // cm -> ft in
      const cmVal =
        parseFloat(profile.height || formData.height || '') ||
        (user?.height && user.height > 100 ? user.height : 175);
      const totalInches = Math.round(cmVal / 2.54);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      newHeightStr = `${feet} ft ${inches} in`;
      heightCmToSave = Math.round(cmVal);
    } else {
      // ft in -> cm
      const current = profile.height || formData.height || '';
      let feet = 5;
      let inches = 9;
      const match = current.match(/(\d+)\s*(?:ft|')\s*(\d+)?/i);
      if (match) {
        feet = parseInt(match[1], 10) || 0;
        inches = match[2] ? parseInt(match[2], 10) : 0;
      } else {
        const num = parseFloat(current);
        if (!isNaN(num) && num > 0) {
          if (num < 100) {
            feet = Math.floor(num / 12);
            inches = Math.round(num % 12);
          } else {
            feet = Math.floor(Math.round(num / 2.54) / 12);
            inches = Math.round(num / 2.54) % 12;
          }
        }
      }
      const totalInches = feet * 12 + inches;
      const cmVal = Math.round(totalInches * 2.54);
      newHeightStr = String(cmVal);
      heightCmToSave = cmVal;
    }

    setProfile((prev) => ({
      ...prev,
      height: newHeightStr,
    }));

    setFormData((prev) => ({
      ...prev,
      height: newHeightStr,
    }));

    localStorage.setItem('fitness_height_unit', unit);
    try {
      const updatePayload: any = { heightUnit: unit, height: heightCmToSave };
      const res = await userApi.updateProfile(updatePayload);
      if (res && res.user) {
        login(res.user);
      }
      showToast(`Height unit converted to ${unit === 'ft in' ? 'Imperial (ft in)' : 'Metric (cm)'}`);
    } catch {
    }
  };

  const handleEnergyUnitChange = (unit: 'kcal' | 'kJ') => {
    if (unit === units.energy) return;
    setUnits((u) => ({ ...u, energy: unit }));
    setGlobalEnergyUnit(unit);

    // Convert dailyCalorieGoal in profile and formData
    const convertCalVal = (valStr: string) => {
      const val = parseFloat(valStr);
      if (isNaN(val) || val <= 0) return valStr;
      return unit === 'kJ' ? Math.round(val * 4.184).toString() : Math.round(val / 4.184).toString();
    };

    setProfile((prev) => ({
      ...prev,
      dailyCalorieGoal: convertCalVal(prev.dailyCalorieGoal),
    }));

    setFormData((prev) => ({
      ...prev,
      dailyCalorieGoal: convertCalVal(prev.dailyCalorieGoal),
    }));

    localStorage.setItem('fitness_energy_unit', unit);
    showToast(`Energy unit converted to ${unit}`);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully!');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await exportApi.downloadProgressCsv();
      showToast('Progress data exported to CSV!');
    } catch (err: any) {
      showToast(err.message || 'Failed to export data', true);
    } finally {
      setIsExporting(false);
    }
  };

  const avatarDisplaySrc = isEditing ? getAvatarSrc(formData.avatarUrl) : getAvatarSrc(profile.avatarUrl);

  return (
    <div id="profile-settings-page" className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 select-none">
      {toastMessage && (
        <div
          className={`flex items-center gap-2.5 p-3.5 border rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200 text-xs sm:text-sm font-medium ${
            toastIsError
              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              toastIsError ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
            }`}
          >
            {toastIsError ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      <section
        id="profile-info-card"
        className="w-full bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)] transition-all"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
              Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">
              Manage your personal information and fitness metrics
            </p>
          </div>

          {!isEditing ? (
            <button
              id="edit-profile-btn"
              type="button"
              onClick={() => {
                setFormData(profile);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black text-xs font-semibold rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="cancel-profile-btn"
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                id="save-profile-btn"
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black text-xs font-semibold rounded-full shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Save</span>
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {avatarDisplaySrc ? (
                    <img
                      src={avatarDisplaySrc}
                      alt={profile.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-bold text-slate-400 dark:text-slate-500 font-['Outfit']">
                      {(profile.name || user?.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#C4FA2A] text-slate-900 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  title="Change profile picture"
                  aria-label="Change profile picture"
                >
                  {isUploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                    {profile.name || 'Anonymous User'}
                  </h2>
                  {profile.username && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                      @{profile.username}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {profile.email || 'No email configured'}
                </p>
                {profile.bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-xl line-clamp-2">
                    {profile.bio}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full">
                    {profile.gender || 'Not specified'}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full">
                    {profile.height ? (profile.height.includes('ft') ? profile.height : `${profile.height} ${units.height}`) : 'No height'}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full">
                    {profile.weight ? `${profile.weight} ${units.weight}` : 'No weight'}
                  </span>
                  <span className="px-3 py-1 bg-[#C4FA2A]/20 text-slate-900 dark:text-[#C4FA2A] text-xs font-medium rounded-full capitalize">
                    {profile.fitnessGoal.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F2FE] dark:bg-sky-950/50 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#0079C1] dark:text-[#38bdf8]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Full Name</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {profile.name || 'Not provided'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F2EDFD] dark:bg-purple-950/50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#9146FF] dark:text-[#c084fc]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Email Address</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                    {profile.email || 'Not provided'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FEF6E6] dark:bg-amber-950/50 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-[#D97706] dark:text-[#fbbf24]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Target Weight</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {profile.targetWeight ? `${profile.targetWeight} ${units.weight}` : 'Not set'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FDECEE] dark:bg-rose-950/50 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-[#FF5A5F] dark:text-[#fb7185]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Age</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {profile.birthDate ? `${profile.birthDate} years old` : 'Not provided'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F2FE] dark:bg-sky-950/50 flex items-center justify-center shrink-0">
                  <Ruler className="w-4 h-4 text-[#0079C1] dark:text-[#38bdf8]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Height</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {profile.height ? (profile.height.includes('ft') ? profile.height : `${profile.height} ${units.height}`) : 'Not set'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FDECEE] dark:bg-rose-950/50 flex items-center justify-center shrink-0">
                  <Weight className="w-4 h-4 text-[#FF5A5F] dark:text-[#fb7185]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Current Weight</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {profile.weight ? `${profile.weight} ${units.weight}` : 'Not set'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FEF6E6] dark:bg-amber-950/50 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-[#D97706] dark:text-[#fbbf24]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Daily Calorie Target</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {profile.dailyCalorieGoal || '2000'} kcal / day
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F2EDFD] dark:bg-purple-950/50 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-[#9146FF] dark:text-[#c084fc]" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Workout Schedule</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {profile.workoutDaysPerWeek || '4'} days / week
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {avatarDisplaySrc ? (
                    <img
                      src={avatarDisplaySrc}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-slate-400 font-['Outfit']">
                      {(formData.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#C4FA2A] text-slate-900 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isUploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Change profile photo
                </div>
                <p className="text-[11px] text-slate-400 mb-2.5">
                  Upload an image from your device or pick a preset avatar
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingPhoto ? 'Uploading...' : 'Upload image'}
                  </button>
                  <div className="flex items-center gap-1.5 ml-2">
                    {presetAvatars.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(url)}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform cursor-pointer ${
                          formData.avatarUrl === url
                            ? 'border-[#C4FA2A] scale-110'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  title="Email cannot be changed directly"
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  placeholder="e.g. 24"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {units.height === 'ft in' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Height (ft in)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={(() => {
                          const m = formData.height.match(/(\d+)\s*(?:ft|')/i);
                          if (m) return m[1];
                          const n = parseFloat(formData.height);
                          if (!isNaN(n) && n > 0 && n < 10) return String(Math.floor(n));
                          if (!isNaN(n) && n >= 10 && n < 100) return String(Math.floor(n / 12));
                          if (!isNaN(n) && n >= 100) return String(Math.floor(Math.round(n / 2.54) / 12));
                          return '5';
                        })()}
                        onChange={(e) => {
                          const newFt = e.target.value;
                          const m = formData.height.match(/(\d+)\s*(?:in|")/i);
                          const currentIn = m ? m[1] : '9';
                          setFormData({ ...formData, height: `${newFt} ft ${currentIn} in` });
                        }}
                        placeholder="5"
                        className="w-full pl-3.5 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                      />
                      <span className="absolute right-3 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none">ft</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={(() => {
                          const m = formData.height.match(/(\d+)\s*(?:in|")/i);
                          if (m) return m[1];
                          const n = parseFloat(formData.height);
                          if (!isNaN(n) && n > 0 && n < 10) return String(Math.round((n % 1) * 12));
                          if (!isNaN(n) && n >= 10 && n < 100) return String(Math.round(n % 12));
                          if (!isNaN(n) && n >= 100) return String(Math.round(n / 2.54) % 12);
                          return '9';
                        })()}
                        onChange={(e) => {
                          const newIn = e.target.value;
                          const m = formData.height.match(/(\d+)\s*(?:ft|')/i);
                          const currentFt = m ? m[1] : '5';
                          setFormData({ ...formData, height: `${currentFt} ft ${newIn} in` });
                        }}
                        placeholder="9"
                        className="w-full pl-3.5 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                      />
                      <span className="absolute right-3 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none">in</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="e.g. 175"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Weight ({units.weight})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g. 68"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Weight ({units.weight})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.targetWeight}
                  onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                  placeholder="e.g. 62"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Fitness Goal
                </label>
                <select
                  value={formData.fitnessGoal}
                  onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                >
                  <option value="lose_weight">Lose Weight / Fat</option>
                  <option value="build_muscle">Build Muscle / Bulk</option>
                  <option value="maintain">Maintain Fitness & Health</option>
                  <option value="increase_endurance">Increase Endurance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Daily Calorie Target (kcal)
                </label>
                <input
                  type="number"
                  step="10"
                  value={formData.dailyCalorieGoal}
                  onChange={(e) => setFormData({ ...formData, dailyCalorieGoal: e.target.value })}
                  placeholder="2000"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Workout Days Per Week
                </label>
                <select
                  value={formData.workoutDaysPerWeek}
                  onChange={(e) => setFormData({ ...formData, workoutDaysPerWeek: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                >
                  <option value="2">2 days / week</option>
                  <option value="3">3 days / week</option>
                  <option value="4">4 days / week</option>
                  <option value="5">5 days / week</option>
                  <option value="6">6 days / week</option>
                  <option value="7">Every day</option>
                </select>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Bio / Fitness Statement
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us a little about your fitness journey..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black text-xs font-semibold rounded-full shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save changes</span>
              </button>
            </div>
          </form>
        )}
      </section>

      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
            Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            Customize notifications, measurement units, and interface display
          </p>
        </div>

        <section
          id="settings-notifications-card"
          className="w-full bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-[14px] bg-[#E8F2FE] dark:bg-sky-950/50 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-[#0079C1] dark:text-[#38bdf8] stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                Notification preferences
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Choose what fitness alerts you receive
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex items-center justify-between py-3.5">
              <div className="pr-4">
                <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Workout reminders
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Daily prompts for scheduled workout sessions and routine targets
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification('workoutReminders')}
                className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                  notifications.workoutReminders ? 'bg-[#C4FA2A]' : 'bg-slate-200 dark:bg-slate-700'
                }`}
                aria-pressed={notifications.workoutReminders}
              >
                <span
                  className={`inline-block w-4 h-4 transform rounded-full bg-white dark:bg-slate-900 shadow-md transition-transform duration-200 ease-in-out ${
                    notifications.workoutReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <div className="pr-4">
                <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Goal achievements
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Celebrations when meeting daily calories, water, and streak milestones
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification('goalAchievements')}
                className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                  notifications.goalAchievements ? 'bg-[#C4FA2A]' : 'bg-slate-200 dark:bg-slate-700'
                }`}
                aria-pressed={notifications.goalAchievements}
              >
                <span
                  className={`inline-block w-4 h-4 transform rounded-full bg-white dark:bg-slate-900 shadow-md transition-transform duration-200 ease-in-out ${
                    notifications.goalAchievements ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <div className="pr-4">
                <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Hydration alerts
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Periodic gentle reminders to log water intake throughout the day
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification('hydrationAlerts')}
                className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                  notifications.hydrationAlerts ? 'bg-[#C4FA2A]' : 'bg-slate-200 dark:bg-slate-700'
                }`}
                aria-pressed={notifications.hydrationAlerts}
              >
                <span
                  className={`inline-block w-4 h-4 transform rounded-full bg-white dark:bg-slate-900 shadow-md transition-transform duration-200 ease-in-out ${
                    notifications.hydrationAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <div className="pr-4">
                <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Recovery & rest suggestions
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Guidance when muscle strain or consecutive high intensity is detected
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification('recoveryAlerts')}
                className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                  notifications.recoveryAlerts ? 'bg-[#C4FA2A]' : 'bg-slate-200 dark:bg-slate-700'
                }`}
                aria-pressed={notifications.recoveryAlerts}
              >
                <span
                  className={`inline-block w-4 h-4 transform rounded-full bg-white dark:bg-slate-900 shadow-md transition-transform duration-200 ease-in-out ${
                    notifications.recoveryAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F2EDFD] dark:bg-purple-950/50 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#9146FF] dark:text-[#c084fc]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                      <span>Email notifications</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Verified
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                      Delivering reports & digests to {user?.email || 'your email'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendTestDigest}
                  disabled={isSendingTestEmail}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-full transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
                  title="Send a preview digest to your registered email"
                >
                  {isSendingTestEmail ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Mail className="w-3 h-3" />
                  )}
                  <span>Send test digest</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Weekly performance digest
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Weekly recap of total calories, workout volume, and milestones every Sunday
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEmailNotification('weeklyDigest')}
                    className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                      emailNotifications.weeklyDigest ? 'bg-[#C4FA2A]' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                    aria-pressed={emailNotifications.weeklyDigest}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform rounded-full bg-white dark:bg-slate-900 shadow-md transition-transform duration-200 ease-in-out ${
                        emailNotifications.weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Goal achievements & milestones
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Email alerts when you hit weight milestones or complete personal bests
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEmailNotification('goalMilestones')}
                    className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                      emailNotifications.goalMilestones ? 'bg-[#C4FA2A]' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                    aria-pressed={emailNotifications.goalMilestones}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform rounded-full bg-white dark:bg-slate-900 shadow-md transition-transform duration-200 ease-in-out ${
                        emailNotifications.goalMilestones ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Workout plan reminders
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Morning briefing of scheduled routine exercises on active training days
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEmailNotification('workoutReminders')}
                    className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                      emailNotifications.workoutReminders ? 'bg-[#C4FA2A]' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                    aria-pressed={emailNotifications.workoutReminders}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform rounded-full bg-white dark:bg-slate-900 shadow-md transition-transform duration-200 ease-in-out ${
                        emailNotifications.workoutReminders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="pr-4">
                    <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Account security & login alerts
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Immediate alerts for password updates and significant account activities
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEmailNotification('securityAlerts')}
                    className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                      emailNotifications.securityAlerts ? 'bg-[#C4FA2A]' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                    aria-pressed={emailNotifications.securityAlerts}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform rounded-full bg-white dark:bg-slate-900 shadow-md transition-transform duration-200 ease-in-out ${
                        emailNotifications.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="settings-units-card"
          className="w-full bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-[14px] bg-[#FEF6E6] dark:bg-amber-950/50 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5 text-[#D97706] dark:text-[#fbbf24] stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                Units of measurement
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Configure preferred metric or imperial standards
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-t first:border-t-0 border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Weight
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  Used for body weight logs and lifting load
                </div>
              </div>
              <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl sm:rounded-full border border-slate-200/60 dark:border-slate-700/60 text-center">
                <button
                  type="button"
                  onClick={() => handleWeightUnitChange('kg')}
                  className={`py-2 sm:py-1 px-3.5 rounded-xl sm:rounded-full text-xs font-semibold transition-all cursor-pointer text-center ${
                    units.weight === 'kg'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Kilograms (kg)
                </button>
                <button
                  type="button"
                  onClick={() => handleWeightUnitChange('lbs')}
                  className={`py-2 sm:py-1 px-3.5 rounded-xl sm:rounded-full text-xs font-semibold transition-all cursor-pointer text-center ${
                    units.weight === 'lbs'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Pounds (lbs)
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Height & Distance
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  Used for stat tracking and cardiovascular routes
                </div>
              </div>
              <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl sm:rounded-full border border-slate-200/60 dark:border-slate-700/60 text-center">
                <button
                  type="button"
                  onClick={() => handleHeightUnitChange('cm')}
                  className={`py-2 sm:py-1 px-3.5 rounded-xl sm:rounded-full text-xs font-semibold transition-all cursor-pointer text-center ${
                    units.height === 'cm'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Metric (cm / km)
                </button>
                <button
                  type="button"
                  onClick={() => handleHeightUnitChange('ft in')}
                  className={`py-2 sm:py-1 px-3.5 rounded-xl sm:rounded-full text-xs font-semibold transition-all cursor-pointer text-center ${
                    units.height === 'ft in'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Imperial (ft in)
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Energy
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  Used for nutrition intake and calorie expenditure
                </div>
              </div>
              <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl sm:rounded-full border border-slate-200/60 dark:border-slate-700/60 text-center">
                <button
                  type="button"
                  onClick={() => handleEnergyUnitChange('kcal')}
                  className={`py-2 sm:py-1 px-3.5 rounded-xl sm:rounded-full text-xs font-semibold transition-all cursor-pointer text-center ${
                    units.energy === 'kcal'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Calories (kcal)
                </button>
                <button
                  type="button"
                  onClick={() => handleEnergyUnitChange('kJ')}
                  className={`py-2 sm:py-1 px-3.5 rounded-xl sm:rounded-full text-xs font-semibold transition-all cursor-pointer text-center ${
                    units.energy === 'kJ'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Kilojoules (kJ)
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="settings-theme-card"
          className="w-full bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-[#F2EDFD] dark:bg-purple-950/50 flex items-center justify-center shrink-0">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-[#9146FF] dark:text-[#c084fc] stroke-[2.2]" />
                ) : (
                  <Sun className="w-5 h-5 text-[#9146FF] dark:text-[#c084fc] stroke-[2.2]" />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Theme preference
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Switch between clean light canvas and dark mode
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl sm:rounded-full border border-slate-200/60 dark:border-slate-700/60 text-center">
              <button
                type="button"
                onClick={() => {
                  if (isDarkMode && onToggleTheme) onToggleTheme();
                }}
                className={`flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-4 rounded-xl sm:rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  !isDarkMode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isDarkMode && onToggleTheme) onToggleTheme();
                }}
                className={`flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-4 rounded-xl sm:rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </section>

        <section
          id="settings-support-card"
          className="w-full bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-[14px] bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                Help, Support & Feedback
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Contact support, report bugs, or share feature suggestions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setSupportCategory('contact');
                setIsSupportModalOpen(true);
              }}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                  <Mail className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Contact Support</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Direct message to our team</p>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-3 group-hover:underline">Open Contact &rarr;</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSupportCategory('bug');
                setIsSupportModalOpen(true);
              }}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Report an Issue</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Submit bug reports & glitches</p>
              </div>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-3 group-hover:underline">Report Bug &rarr;</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSupportCategory('feedback');
                setIsSupportModalOpen(true);
              }}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Provide Feedback</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Share ideas & feature requests</p>
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-3 group-hover:underline">Give Feedback &rarr;</span>
            </button>
          </div>
        </section>

        <section
          id="settings-security-card"
          className="w-full bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-[14px] bg-[#E8F2FE] dark:bg-sky-950/50 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#0079C1] dark:text-[#38bdf8] stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                Account security
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Update your account password
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            {passwordError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
                <Check className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Re-type new password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black text-xs font-semibold rounded-full shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isChangingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Update password</span>
              </button>
            </div>
          </form>
        </section>

        <section
          id="settings-data-card"
          className="w-full bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-[14px] bg-[#FEF6E6] dark:bg-amber-950/50 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-[#D97706] dark:text-[#fbbf24] stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                Data & account management
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Export your workout & nutrition history or sign out
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                Export personal health data
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Download all your metrics, workout logs, and nutrition logs in CSV format
              </div>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-full shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Export CSV</span>
            </button>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-200">
                Sign out of session
              </div>
              <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                Safely end your current session on this device
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-full shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </section>
      </div>

      {/* Support & Feedback Interactive Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        defaultCategory={supportCategory}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
