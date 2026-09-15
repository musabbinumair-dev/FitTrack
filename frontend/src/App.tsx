/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { SidebarDock } from './components/SidebarDock';
import { TopNavigationBar } from './components/TopNavigationBar';
import { DashboardHeader } from './components/DashboardHeader';
import { BodyOverviewCard } from './components/BodyOverviewCard';
import { KpiMetricsGrid } from './components/KpiMetricsGrid';
import { TodaysWorkoutCard } from './components/TodaysWorkoutCard';
import { RecentActivityFeedCard, DashboardActivity } from './components/RecentActivityFeedCard';
import { WorkoutsRoutinesPage } from './components/WorkoutsRoutinesPage';
import { NutritionTrackerPage } from './components/NutritionTrackerPage';
import { ProgressAnalyticsPage } from './components/ProgressAnalyticsPage';
import { ActivityFeedSection } from './components/ActivityFeedSection';
import { AiFitnessCoachCard } from './components/AiFitnessCoachCard';
import { ProfileSettingsPage } from './components/ProfileSettingsPage';
import { BottomFloatingBar } from './components/BottomFloatingBar';
import { QuickLogModal } from './components/QuickLogModal';
import { ReportModal } from './components/ReportModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { AiCoachWidget } from './components/AiCoachWidget';
import { NotificationsSidebar } from './components/NotificationsSidebar';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UnitProvider, useUnits } from './context/UnitContext';
import { nutritionApi, workoutApi } from './lib/api';

import {
  initialKpis,
  initialWorkouts,
  initialMeals,
  initialNotifications,
} from './data/mockFitnessData';
import { WorkoutLog, MealLog, KpiCardData, NotificationItem } from './types/fitness';

export default function App() {
  return (
    <AuthProvider>
      <UnitProvider>
        <AppInner />
      </UnitProvider>
    </AuthProvider>
  );
}

function AppInner() {
  // Reset stored login session so the user can register and go through onboarding fresh
  try {
    const hasReset = sessionStorage.getItem('fittrack_auth_reset_done');
    if (!hasReset) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('guest_onboarding_completed');
      sessionStorage.setItem('fittrack_auth_reset_done', 'true');
    }
  } catch {}

  // Handle any remaining OAuth callback tokens from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      window.history.replaceState({}, document.title, '/');
      setAuthScreen('app');
    }
  }, []);

  // Check if user is already authenticated or returning from OAuth callback on app load
  const getInitialAuthScreen = (): 'welcome' | 'login' | 'signup' | 'forgot-password' | 'app' => {
    const path = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    // 1. Immediately store tokens from OAuth callback
    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      window.history.replaceState({}, document.title, '/');
      return 'app';
    }

    // 2. If OAuth failed with an error, direct to login while preserving error query
    if (error) {
      return 'login';
    }

    // 3. If authenticated, allow entry to main application
    const hasTokens = Boolean(localStorage.getItem('accessToken'));
    if (hasTokens) {
      return 'app';
    }

    // 4. Default to signup screen so user can register and see onboarding
    if (path === '/login') return 'login';
    if (path === '/welcome') return 'welcome';
    if (path === '/forgot-password') return 'forgot-password';
    if (path.startsWith('/auth/callback')) return 'login';

    return 'signup';
  };

  // Navigation & Authentication View State ('welcome', 'login', 'signup', 'forgot-password', 'app')
  const [authScreen, setAuthScreen] = useState<'welcome' | 'login' | 'signup' | 'forgot-password' | 'app'>(getInitialAuthScreen);
  const [activeNavTab, setActiveNavTab] = useState('activity');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('fitness_theme');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Synchronize dark mode class with root html element & localStorage
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        localStorage.setItem('fitness_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
        localStorage.setItem('fitness_theme', 'light');
      }
    } catch (e) {
      console.error('Failed to sync theme preference', e);
    }
  }, [isDarkMode]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');
  const [userAuthMethod, setUserAuthMethod] = useState<string>('credentials');

  // Admin route state: 'analytics' | 'users' | null
  const [adminRoute, setAdminRoute] = useState<'analytics' | 'users' | null>(() => {
    const hasTokens = Boolean(localStorage.getItem('accessToken'));
    if (!hasTokens) return null;
    const path = window.location.pathname.toLowerCase();
    if (path === '/admin/users' || path === '/admin/user') return 'users';
    if (path === '/admin' || path.startsWith('/admin')) return 'analytics';
    return null;
  });

  const navigateToAdmin = (route: 'analytics' | 'users' = 'analytics') => {
    setAdminRoute(route);
    window.history.pushState({}, '', `/admin/${route}`);
  };

  const exitAdminPanel = () => {
    setAdminRoute(null);
    window.history.pushState({}, '', '/');
  };

  const navigateToLogin = () => {
    window.history.pushState({}, '', '/login');
    setAuthScreen('login');
  };

  const navigateToSignUp = () => {
    window.history.pushState({}, '', '/signup');
    setAuthScreen('signup');
  };

  const navigateToWelcome = () => {
    window.history.pushState({}, '', '/');
    setAuthScreen('welcome');
  };

  const navigateToForgotPassword = () => {
    window.history.pushState({}, '', '/forgot-password');
    setAuthScreen('forgot-password');
  };

  // Sync back/forward browser button navigation and enforce auth guarding
  useEffect(() => {
    const handlePopState = () => {
      const hasTokens = Boolean(localStorage.getItem('accessToken'));
      const path = window.location.pathname.toLowerCase();

      if (!hasTokens) {
        setAdminRoute(null);
        if (path === '/' || path === '' || path === '/welcome') {
          setAuthScreen('welcome');
        } else if (path === '/login') {
          setAuthScreen('login');
        } else if (path === '/signup') {
          setAuthScreen('signup');
        } else if (path === '/forgot-password') {
          setAuthScreen('forgot-password');
        } else {
          setAuthScreen('login');
          window.history.replaceState({}, '', '/login');
        }
        return;
      }

      if (path === '/admin/users' || path === '/admin/user') {
        setAdminRoute('users');
      } else if (path === '/admin' || path.startsWith('/admin')) {
        setAdminRoute('analytics');
      } else {
        setAdminRoute(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle cross-navigation from admin search to user app tabs
  useEffect(() => {
    const targetTab = localStorage.getItem('fittrack_target_nav_tab');
    if (targetTab) {
      setActiveNavTab(targetTab);
      localStorage.removeItem('fittrack_target_nav_tab');
    }
    const targetSection = localStorage.getItem('fittrack_target_section_id');
    if (targetSection) {
      setTimeout(() => {
        const el = document.getElementById(targetSection);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-[#C4FA2A]', 'ring-offset-2', 'transition-all', 'duration-500');
          setTimeout(() => el.classList.remove('ring-4', 'ring-[#C4FA2A]', 'ring-offset-2'), 2500);
        }
      }, 350);
      localStorage.removeItem('fittrack_target_section_id');
    }
  }, [adminRoute]);

  // Scroll to top immediately when navigating between tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const rootEl = document.getElementById('fitness-app-root');
    if (rootEl) rootEl.scrollTop = 0;
  }, [activeNavTab]);

  const { logout, refetch, user } = useAuth();

  // Interactive Data States (Real Dynamic Data from DB)
  const [kpis, setKpis] = useState<Record<string, KpiCardData>>(initialKpis);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);

  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogType, setQuickLogType] = useState<'workout' | 'meal' | 'water' | 'weight'>('workout');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (authScreen === 'app') {
      if (user?.role === 'admin') {
        setIsOnboardingOpen(false);
        return;
      }
      if (user && user.isOnboardingCompleted === false) {
        setIsOnboardingOpen(true);
      } else if (!user && !localStorage.getItem('guest_onboarding_completed')) {
        setIsOnboardingOpen(true);
      }
    }
  }, [authScreen, user]);

  useEffect(() => {
    if (user && user.isOnboardingCompleted) {
      setKpis((prev) => ({
        ...prev,
        calories: {
          ...prev.calories,
          goal: user.calorieGoal || prev.calories.goal,
          progressPercent: Math.min(
            Math.round((prev.calories.value / (user.calorieGoal || 2800)) * 100),
            100
          ),
        },
        water: {
          ...prev.water,
          goal: user.waterGoalMl || prev.water.goal,
          progressPercent: Math.min(
            Math.round((prev.water.value / (user.waterGoalMl || 3200)) * 100),
            100
          ),
        },
        weight: {
          ...prev.weight,
          value: user.weight || prev.weight.value,
          formattedValue: String(user.weight || prev.weight.value),
          unit: (user.weightUnit as 'kg' | 'lbs') || 'kg',
          goal: user.targetWeight || prev.weight.goal,
        },
      }));
    }
  }, [user]);

  useEffect(() => {
    if (authScreen !== 'app') return;

    const loadDashboardData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [nutritionRes, workoutsRes] = await Promise.allSettled([
          nutritionApi.getLog(today),
          workoutApi.getLogs(),
        ]);

        const loadedActivities: DashboardActivity[] = [];

        if (nutritionRes.status === 'fulfilled' && nutritionRes.value?.log) {
          const log = nutritionRes.value.log;
          setKpis((prev) => ({
            ...prev,
            water: {
              ...prev.water,
              value: log.waterIntakeMl ?? prev.water.value,
              formattedValue: String(log.waterIntakeMl ?? prev.water.value),
              progressPercent: Math.min(
                Math.round(((log.waterIntakeMl ?? prev.water.value) / (user?.waterGoalMl || prev.water.goal || 3200)) * 100),
                100
              ),
            },
            calories: {
              ...prev.calories,
              value: log.totalCalories ?? prev.calories.value,
              formattedValue: String(log.totalCalories ?? prev.calories.value),
              progressPercent: Math.min(
                Math.round(((log.totalCalories ?? prev.calories.value) / (user?.calorieGoal || prev.calories.goal || 2400)) * 100),
                100
              ),
            },
          }));

          if (log.waterIntakeMl && log.waterIntakeMl > 0) {
            loadedActivities.push({
              id: `act-water-today`,
              title: 'Hydration Intake',
              dateText: 'Today',
              timeText: 'Logged',
              stat: `+ ${log.waterIntakeMl} ml`,
              type: 'water',
            });
          }

          if (log.meals && Array.isArray(log.meals) && log.meals.length > 0) {
            const mappedMeals: MealLog[] = log.meals.flatMap((m: any) =>
              (m.items || []).map((item: any, idx: number) => ({
                id: item._id || `${m._id}-${idx}`,
                mealType: m.type ? (m.type.charAt(0).toUpperCase() + m.type.slice(1)) : 'Lunch',
                name: item.foodName || item.name || 'Meal Item',
                calories: item.calories || 0,
                proteinGrams: item.macros?.protein || item.protein || 0,
                carbsGrams: item.macros?.carbs || item.carbs || 0,
                fatsGrams: item.macros?.fat || item.fats || 0,
                servingSize: item.servingSize || `${item.servings || 1} serving`,
                timestamp: 'Today',
              }))
            );
            if (mappedMeals.length > 0) {
              setMeals(mappedMeals);
              mappedMeals.slice(0, 3).forEach((m) => {
                loadedActivities.push({
                  id: `act-m-${m.id}`,
                  title: m.name,
                  dateText: 'Today',
                  timeText: 'Logged',
                  stat: `+ ${m.calories} kcal`,
                  type: 'meal',
                });
              });
            }
          }
        }

        if (workoutsRes.status === 'fulfilled' && workoutsRes.value?.logs) {
          const logs = workoutsRes.value.logs;
          if (logs.length > 0) {
            const mappedWorkouts: WorkoutLog[] = logs.map((l: any) => ({
              id: l._id,
              name: l.routineName || (l.exercisesPerformed?.[0]?.name ? `${l.exercisesPerformed[0].name} Session` : 'Workout Session'),
              category: 'Strength',
              sets: l.exercisesPerformed?.reduce((acc: number, ex: any) => acc + (ex.sets?.length || 3), 0) || 3,
              reps: 10,
              durationMinutes: l.durationMinutes || 45,
              caloriesBurned: l.caloriesBurned || 350,
              timestamp: l.performedAt ? new Date(l.performedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today',
              completed: true,
            }));
            setWorkouts(mappedWorkouts);
            mappedWorkouts.slice(0, 3).forEach((w) => {
              loadedActivities.push({
                id: `act-w-${w.id}`,
                title: w.name,
                dateText: w.timestamp,
                timeText: 'Completed',
                stat: `- ${w.caloriesBurned} kcal`,
                type: 'workout',
              });
            });
          }
        }

        if (loadedActivities.length > 0) {
          setActivities(loadedActivities);
        }
      } catch {}
    };

    loadDashboardData();
  }, [authScreen, user]);

  const handleOnboardingComplete = (data: any) => {
    setIsOnboardingOpen(false);
    localStorage.setItem('guest_onboarding_completed', 'true');
    refetch();

    if (data) {
      setKpis((prev) => ({
        ...prev,
        calories: {
          ...prev.calories,
          goal: data.calorieGoal || prev.calories.goal,
          progressPercent: Math.min(
            Math.round((prev.calories.value / (data.calorieGoal || 2800)) * 100),
            100
          ),
        },
        water: {
          ...prev.water,
          goal: data.waterGoalMl || prev.water.goal,
          progressPercent: Math.min(
            Math.round((prev.water.value / (data.waterGoalMl || 3200)) * 100),
            100
          ),
        },
        weight: {
          ...prev.weight,
          value: data.weight || prev.weight.value,
          formattedValue: String(data.weight || prev.weight.value),
          unit: data.weightUnit || 'kg',
          goal: data.targetWeight || prev.weight.goal,
        },
      }));
    }

    addNotification(
      'Profile Configured! 🎉',
      `Welcome to PulseFit! Your custom goal of ${(data?.calorieGoal || 2400).toLocaleString()} kcal is now active.`,
      'success'
    );
  };

  const [toastNotification, setToastNotification] = useState<{
    id: string;
    title: string;
    message: string;
    type?: 'success' | 'info' | 'warning';
  } | null>(null);

  const addNotification = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' = 'info'
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      timeAgo: 'Just now',
      unread: true,
      type: (type === 'success' ? 'achievement' : 'reminder'),
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setToastNotification({ id: newNotif.id, title, message, type });
  };

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  const handleSignOut = () => {
    logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAdminRoute(null);
    window.history.replaceState({}, '', '/login');
    setAuthScreen('login');
  };

  const handleOnboardingCancel = () => {
    setIsOnboardingOpen(false);
    logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAdminRoute(null);
    window.history.replaceState({}, '', '/login');
    setAuthScreen('login');
    addNotification('Logged Out', 'Onboarding cancelled. Please log in to your account.', 'info');
  };

  const handleWelcomeContinue = (method: 'google' | 'email' | 'guest') => {
    setUserAuthMethod(method);
    setAuthScreen('app');
    addNotification('Welcome Guest! 👋', 'Explore the tracker or personalize your plan anytime.', 'info');
  };

  const handleAuthSuccess = (method: 'credentials' | 'google') => {
    setUserAuthMethod(method);
    setAuthScreen('app');
    refetch();

    // Check if logging in as admin to land directly in the Admin Console
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role === 'admin') {
          setAdminRoute('analytics');
          window.history.pushState({}, '', '/admin/analytics');
          addNotification('Admin Mode Active 🛡️', 'Logged into FitTrack Administrator Console.', 'success');
          return;
        }
      } catch {}
    }

    addNotification('Logged In Successfully! 🚀', 'Welcome back to your fitness hub.', 'success');
  };

  // Quick Action Handlers
  const handleOpenQuickLog = (type: 'workout' | 'meal' | 'water' | 'weight' = 'workout') => {
    setQuickLogType(type);
    setIsQuickLogOpen(true);
  };

  const handleQuickAddWater = () => {
    const today = new Date().toISOString().split('T')[0];
    nutritionApi.updateWater(today, { amountMl: 250, mode: 'add' }).catch(() => {});

    setKpis((prev) => {
      const currentWater = prev.water.value + 250;
      const progress = Math.min(Math.round((currentWater / (prev.water.goal || 3200)) * 100), 100);
      addNotification(
        'Hydration Logged! 💧',
        `+250 ml logged. Today's total: ${currentWater.toLocaleString()} ml`,
        'success'
      );
      return {
        ...prev,
        water: {
          ...prev.water,
          value: currentWater,
          formattedValue: currentWater.toLocaleString(),
          progressPercent: progress,
        },
      };
    });

    const newAct: DashboardActivity = {
      id: `act-w-${Date.now()}`,
      title: 'Hydration Intake',
      dateText: 'Today',
      timeText: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      stat: '+ 250 ml',
      type: 'water',
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleQuickAddCalories = () => {
    setKpis((prev) => {
      const currentCal = prev.calories.value + 150;
      const progress = Math.min(Math.round((currentCal / (prev.calories.goal || 2800)) * 100), 100);
      addNotification(
        'Calories Logged! 🔥',
        `+150 kcal added. Current daily total: ${currentCal.toLocaleString()} kcal`,
        'info'
      );
      return {
        ...prev,
        calories: {
          ...prev.calories,
          value: currentCal,
          formattedValue: currentCal.toLocaleString(),
          progressPercent: progress,
        },
      };
    });

    const newAct: DashboardActivity = {
      id: `act-cal-${Date.now()}`,
      title: 'Quick Calorie Snack',
      dateText: 'Today',
      timeText: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      stat: '+ 150 kcal',
      type: 'meal',
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleAddWorkout = (newWorkout: Omit<WorkoutLog, 'id' | 'timestamp'>) => {
    const created: WorkoutLog = {
      ...newWorkout,
      id: `w-${Date.now()}`,
      timestamp: 'Just now',
    };
    setWorkouts((prev) => [created, ...prev]);

    // Persist real workout log to backend database
    workoutApi
      .logWorkout({
        routineName: newWorkout.name || `${newWorkout.category} Session`,
        durationMinutes: newWorkout.durationMinutes || 45,
        caloriesBurned: newWorkout.caloriesBurned || 300,
        performedAt: new Date().toISOString(),
        exercisesPerformed: [
          {
            name: newWorkout.name || 'Strength Exercise',
            category: newWorkout.category || 'Strength',
            sets: Array.from({ length: newWorkout.sets || 3 }).map((_, i) => ({
              setNumber: i + 1,
              reps: newWorkout.reps || 10,
              weightKg: newWorkout.weightKg || 0,
              completed: true,
            })),
          },
        ],
      })
      .then((res) => {
        if (res?.log?._id) {
          setWorkouts((prev) =>
            prev.map((w) => (w.id === created.id ? { ...w, id: res.log._id } : w))
          );
        }
      })
      .catch(() => {});

    setKpis((prev) => {
      const newCal = prev.calories.value + newWorkout.caloriesBurned;
      return {
        ...prev,
        calories: {
          ...prev.calories,
          value: newCal,
          formattedValue: newCal.toLocaleString(),
          progressPercent: Math.min(Math.round((newCal / 2800) * 100), 100),
        },
      };
    });

    const newAct: DashboardActivity = {
      id: `act-w-${Date.now()}`,
      title: newWorkout.name || `${newWorkout.category} Workout`,
      dateText: 'Today',
      timeText: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      stat: `- ${newWorkout.caloriesBurned} kcal`,
      type: 'workout',
    };
    setActivities((prev) => [newAct, ...prev]);

    addNotification(
      'Workout Recorded! 🏋️‍♂️',
      `Completed ${newWorkout.name || newWorkout.category || 'workout'} (${newWorkout.caloriesBurned} kcal burned)`,
      'success'
    );
  };

  const handleToggleWorkoutComplete = (workoutId: string) => {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === workoutId ? { ...w, completed: !w.completed } : w))
    );
    addNotification('Workout Routine Updated! ✅', 'Your workout routine status has been toggled.', 'info');
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    setActivities((prev) => prev.filter((a) => !a.id.includes(workoutId)));
    try {
      if (!workoutId.startsWith('w-')) {
        await workoutApi.deleteLog(workoutId);
      }
    } catch {}
    addNotification('Workout Removed 🗑️', 'Workout session removed from recent activity feed.', 'info');
  };

  const handleAddMeal = (newMeal: Omit<MealLog, 'id' | 'timestamp'>) => {
    const created: MealLog = {
      ...newMeal,
      id: `m-${Date.now()}`,
      timestamp: 'Just now',
    };
    setMeals((prev) => [created, ...prev]);

    setKpis((prev) => {
      const newCal = prev.calories.value + (Number(newMeal.calories) || 0);
      return {
        ...prev,
        calories: {
          ...prev.calories,
          value: newCal,
          formattedValue: newCal.toLocaleString(),
          progressPercent: Math.min(Math.round((newCal / (prev.calories.goal || 2400)) * 100), 100),
        },
      };
    });

    const newAct: DashboardActivity = {
      id: `act-m-${Date.now()}`,
      title: newMeal.name || `${newMeal.mealType} Meal`,
      dateText: 'Today',
      timeText: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      stat: `+ ${newMeal.calories} kcal`,
      type: 'meal',
    };
    setActivities((prev) => [newAct, ...prev]);

    addNotification(
      'Meal Logged! 🍽️',
      `Added ${newMeal.name} (${newMeal.calories} kcal, ${newMeal.proteinGrams || 0}g protein)`,
      'success'
    );
  };

  const handleDeleteMeal = async (mealId: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
    setActivities((prev) => prev.filter((a) => !a.id.includes(mealId)));
    try {
      const today = new Date().toISOString().split('T')[0];
      if (!mealId.startsWith('m-')) {
        await nutritionApi.deleteMeal(today, mealId);
      }
    } catch {}
    addNotification('Meal Removed 🗑️', 'Meal entry removed from nutrition log.', 'info');
  };

  const handleUpdateWater = (amountMl: number) => {
    const today = new Date().toISOString().split('T')[0];
    nutritionApi.updateWater(today, { amountMl, mode: 'add' }).catch(() => {});

    setKpis((prev) => {
      const newTotal = prev.water.value + amountMl;
      return {
        ...prev,
        water: {
          ...prev.water,
          value: newTotal,
          formattedValue: newTotal.toLocaleString(),
          progressPercent: Math.min(Math.round((newTotal / (prev.water.goal || 3200)) * 100), 100),
        },
      };
    });

    const newAct: DashboardActivity = {
      id: `act-h-${Date.now()}`,
      title: 'Hydration Intake',
      dateText: 'Today',
      timeText: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      stat: `+ ${amountMl} ml`,
      type: 'water',
    };
    setActivities((prev) => [newAct, ...prev]);

    addNotification('Hydration Updated! 💧', `Water intake logged: ${amountMl} ml`, 'success');
  };

  const handleUpdateWeight = (newWeightKg: number) => {
    setKpis((prev) => ({
      ...prev,
      weight: {
        ...prev.weight,
        value: newWeightKg,
        formattedValue: newWeightKg.toFixed(1),
      },
    }));

    const newAct: DashboardActivity = {
      id: `act-wt-${Date.now()}`,
      title: 'Scale Weight Logged',
      dateText: 'Today',
      timeText: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      stat: `${newWeightKg.toFixed(1)} kg`,
      type: 'weight',
    };
    setActivities((prev) => [newAct, ...prev]);

    addNotification('Weight Updated! ⚖️', `Current scale weight recorded as ${newWeightKg.toFixed(1)} kg`, 'success');
  };

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  if (authScreen === 'welcome') {
    return (
      <WelcomeScreen
        onContinue={handleWelcomeContinue}
        onNavigateToLogin={navigateToLogin}
        onNavigateToSignUp={navigateToSignUp}
      />
    );
  }

  if (authScreen === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleAuthSuccess}
        onNavigateToSignUp={navigateToSignUp}
        onNavigateToForgotPassword={navigateToForgotPassword}
        onBackToWelcome={navigateToWelcome}
      />
    );
  }

  if (authScreen === 'signup') {
    return (
      <SignUpPage
        onSignUpSuccess={handleAuthSuccess}
        onNavigateToLogin={navigateToLogin}
        onBackToWelcome={navigateToWelcome}
      />
    );
  }

  if (authScreen === 'forgot-password') {
    return (
      <ForgotPasswordPage
        onNavigateToLogin={navigateToLogin}
        onBackToWelcome={navigateToWelcome}
      />
    );
  }

  // Render Administrator Panel if user is inside the admin route
  if (authScreen === 'app' && adminRoute) {
    return (
      <AdminLayout
        currentRoute={adminRoute}
        onNavigate={(r) => {
          setAdminRoute(r);
          window.history.pushState({}, '', `/admin/${r}`);
        }}
        onBackToMainApp={exitAdminPanel}
        currentUserRole={(user?.role as any) || 'admin'}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div
      id="fitness-app-root"
      className={`min-h-screen ${
        isDarkMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-[#F3F3F3] text-slate-800'
      } flex transition-colors duration-200`}
    >
      {/* Left Slim Vertical Icon Dock matching reference */}
      <SidebarDock
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        onShowWelcome={() => setAuthScreen('login')}
        onSignOut={handleSignOut}
        isDarkMode={isDarkMode}
        userRole={(user?.role as any) || 'user'}
        onOpenAdminPanel={() => navigateToAdmin('analytics')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-8">
        {/* Top Floating Pill Navigation Bar */}
        <TopNavigationBar
          activeNavTab={activeNavTab}
          onNavTabChange={setActiveNavTab}
          notifications={notifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onOpenQuickLog={(type) => handleOpenQuickLog(type || 'workout')}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSignOut={handleSignOut}
          onNavigateToLogin={() => setAuthScreen('login')}
          userRole={(user?.role as any) || 'user'}
          onOpenAdminPanel={() => navigateToAdmin('analytics')}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* Dashboard Main Content Body */}
        <main className="px-3 sm:px-6 lg:px-8 py-5 pb-28 md:pb-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto w-full">
          {activeNavTab === 'workouts' ? (
            <WorkoutsRoutinesPage
              onStartSession={(routine) => {
                // Keep session open in page
              }}
              onLogQuickSet={(exercise, sets, reps, weight) => {
                handleAddWorkout({
                  name: exercise,
                  category: 'Strength',
                  sets,
                  reps,
                  weightKg: weight,
                  durationMinutes: 30,
                  caloriesBurned: 180,
                  completed: true,
                  notes: `${sets} sets of ${reps} reps @ ${weight} kg`,
                });
              }}
              isDarkMode={isDarkMode}
            />
          ) : activeNavTab === 'nutrition' ? (
            <NutritionTrackerPage
              isDarkMode={isDarkMode}
              onUpdateWater={handleUpdateWater}
              onAddMeal={handleAddMeal}
            />
          ) : activeNavTab === 'analytics' || activeNavTab === 'progress' || activeNavTab === 'goals' ? (
            <ProgressAnalyticsPage
              onLogNewEntry={() => handleOpenQuickLog('workout')}
              isDarkMode={isDarkMode}
            />
          ) : activeNavTab === 'reports' ? (
            <ActivityFeedSection
              workouts={workouts}
              meals={meals}
              onToggleWorkoutComplete={handleToggleWorkoutComplete}
              onDeleteWorkout={handleDeleteWorkout}
              onDeleteMeal={handleDeleteMeal}
              onOpenQuickLog={handleOpenQuickLog}
              onQuickAddWater={handleQuickAddWater}
              onOpenReport={() => setIsReportOpen(true)}
            />
          ) : activeNavTab === 'profile' || activeNavTab === 'settings' ? (
            <ProfileSettingsPage
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            />
          ) : activeNavTab === 'community' ? (
            <div className="max-w-2xl mx-auto w-full">
              <AiFitnessCoachCard
                onOpenWorkoutModal={() => handleOpenQuickLog('workout')}
              />
            </div>
          ) : (
            <>
              <DashboardHeader
                onOpenQuickLog={handleOpenQuickLog}
                onOpenReport={() => setIsReportOpen(true)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedDateRange={selectedDateRange}
                onDateRangeChange={setSelectedDateRange}
                isDarkMode={isDarkMode}
              />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-stretch">
                <div id="section-body-overview" className="md:col-span-5 lg:col-span-5 flex flex-col scroll-mt-24">
                  <BodyOverviewCard onOpenQuickLog={handleOpenQuickLog} />
                </div>
                <div id="section-kpi-metrics" className="md:col-span-7 lg:col-span-7 flex flex-col scroll-mt-24">
                  <KpiMetricsGrid
                    kpis={kpis}
                    onQuickAddWater={handleQuickAddWater}
                    onQuickAddCalories={handleQuickAddCalories}
                    onOpenQuickLog={handleOpenQuickLog}
                  />
                </div>
              </div>

              <div id="section-todays-workout" className="w-full scroll-mt-24">
                <TodaysWorkoutCard
                  onStartWorkout={() => setActiveNavTab('workouts')}
                  onCreateRoutine={() => setActiveNavTab('workouts')}
                />
              </div>

              <div id="section-recent-activity" className="flex justify-center scroll-mt-24">
                <div className="w-full">
                  <RecentActivityFeedCard
                    activities={activities}
                    onViewHistory={() => setActiveNavTab('reports')}
                    onOpenQuickLog={handleOpenQuickLog}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Floating Real-time Toast Notification Banner */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-5 right-4 sm:right-8 z-50 max-w-sm w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-3.5 sm:p-4 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.35)] border border-slate-700/80 dark:border-slate-200 flex items-start justify-between gap-3 select-none"
          >
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-white dark:text-slate-900 flex items-center gap-1.5">
                {toastNotification.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-300 dark:text-slate-600 leading-relaxed">
                {toastNotification.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-white dark:hover:text-slate-900 transition-colors p-1 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigation Bar for Mobile */}
      {!isAiCoachOpen && (
        <BottomFloatingBar
          activeTab={activeNavTab}
          onTabChange={setActiveNavTab}
          onOpenQuickLog={() => handleOpenQuickLog('workout')}
          isDarkMode={isDarkMode}
          isHidden={isAiCoachOpen}
        />
      )}

      {/* Quick Log Modal */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        initialType={quickLogType}
        onAddWorkout={handleAddWorkout}
        onAddMeal={handleAddMeal}
        onUpdateWater={handleUpdateWater}
        onUpdateWeight={handleUpdateWeight}
      />

      {/* Report Generator Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        dateRange={selectedDateRange}
        totalCalories={kpis.calories?.value || 2450}
        totalWorkouts={workouts.length}
        currentWeight={kpis.weight?.value || 74.2}
      />

      {/* Onboarding Welcome & Profile Setup Modal with 3D Celebration */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
        onCancel={handleOnboardingCancel}
        initialName={user?.name || ''}
        isDarkMode={isDarkMode}
      />

      {/* Right-Docked Notifications Sidebar matching AI Coach Design System */}
      <NotificationsSidebar
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkNotificationsRead}
        isDarkMode={isDarkMode}
      />

      {/* Interactive AI Fitness Coach Floating Chatbot (Bottom-Right, Logged-in only) */}
      <AiCoachWidget
        onNavigateTab={(tab) => {
          setActiveNavTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenQuickLog={(type) => handleOpenQuickLog(type)}
        onQuickAddWater={handleQuickAddWater}
        isDarkMode={isDarkMode}
        onOpenChange={setIsAiCoachOpen}
        userData={{
          name: user?.name,
          fitnessGoal: user?.fitnessGoal,
          weight: user?.weight,
          targetWeight: user?.targetWeight,
          weightUnit: user?.weightUnit,
          calorieGoal: user?.calorieGoal || kpis.calories.goal,
          waterGoalMl: user?.waterGoalMl || kpis.water.goal,
          currentCalories: kpis.calories.value,
          currentWaterMl: kpis.water.value,
          workoutsCount: workouts.length,
        }}
      />
    </div>
  );
}
