import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Utensils,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Droplets,
  Scale,
  Trash2,
  FileText,
  RefreshCw,
  Loader2,
  Activity,
  Calendar,
} from 'lucide-react';
import { WorkoutLog, MealLog } from '../types/fitness';
import { useUnits } from '../context/UnitContext';
import { workoutApi, nutritionApi } from '../lib/api';

interface ActivityFeedSectionProps {
  workouts: WorkoutLog[];
  meals: MealLog[];
  onToggleWorkoutComplete: (id: string) => void;
  onDeleteWorkout: (id: string) => void;
  onDeleteMeal: (id: string) => void;
  onOpenQuickLog: (type: 'workout' | 'meal' | 'water' | 'weight') => void;
  onQuickAddWater: () => void;
  onOpenReport?: () => void;
}

export const ActivityFeedSection: React.FC<ActivityFeedSectionProps> = ({
  workouts: propWorkouts,
  meals: propMeals,
  onToggleWorkoutComplete,
  onDeleteWorkout,
  onDeleteMeal,
  onOpenQuickLog,
  onQuickAddWater,
  onOpenReport,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'workouts' | 'meals'>('all');
  const [localWorkouts, setLocalWorkouts] = useState<WorkoutLog[]>(propWorkouts || []);
  const [localMeals, setLocalMeals] = useState<MealLog[]>(propMeals || []);
  const [isLoading, setIsLoading] = useState(false);
  const { formatEnergy } = useUnits();

  // Keep synced with parent props if provided
  useEffect(() => {
    if (propWorkouts) setLocalWorkouts(propWorkouts);
  }, [propWorkouts]);

  useEffect(() => {
    if (propMeals) setLocalMeals(propMeals);
  }, [propMeals]);

  // Load real dynamic data directly from backend on mount
  const fetchLiveActivities = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [wRes, nRes] = await Promise.allSettled([
        workoutApi.getLogs(),
        nutritionApi.getLog(today),
      ]);

      if (wRes.status === 'fulfilled' && wRes.value?.logs) {
        const mappedWorkouts: WorkoutLog[] = wRes.value.logs.map((l: any) => ({
          id: l._id,
          name: l.routineName || (l.exercisesPerformed?.[0]?.name ? `${l.exercisesPerformed[0].name} Session` : 'Workout Session'),
          category: l.exercisesPerformed?.[0]?.category || 'Strength',
          sets: l.exercisesPerformed?.reduce((acc: number, ex: any) => acc + (ex.sets?.length || 3), 0) || 3,
          reps: l.exercisesPerformed?.[0]?.sets?.[0]?.reps || 10,
          weightKg: l.exercisesPerformed?.[0]?.sets?.[0]?.weightKg || 0,
          durationMinutes: l.durationMinutes || 45,
          caloriesBurned: l.caloriesBurned || 300,
          timestamp: l.performedAt
            ? new Date(l.performedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Today',
          completed: true,
        }));
        setLocalWorkouts(mappedWorkouts);
      }

      if (nRes.status === 'fulfilled' && nRes.value?.log) {
        const log = nRes.value.log;
        if (log.meals && Array.isArray(log.meals)) {
          const mappedMeals: MealLog[] = log.meals.flatMap((m: any) =>
            (m.items || []).map((item: any, idx: number) => ({
              id: item._id || `${m._id}-${idx}`,
              mealType: m.type ? m.type.charAt(0).toUpperCase() + m.type.slice(1) : 'Lunch',
              name: item.foodName || item.name || 'Meal Item',
              calories: item.calories || 0,
              proteinGrams: item.macros?.protein || item.protein || 0,
              carbsGrams: item.macros?.carbs || item.carbs || 0,
              fatsGrams: item.macros?.fat || item.fats || 0,
              servingSize: item.servingSize || '1 serving',
              timestamp: 'Today',
            }))
          );
          setLocalMeals(mappedMeals);
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveActivities();
  }, []);

  const totalWorkoutCalories = localWorkouts.reduce((acc, curr) => acc + curr.caloriesBurned, 0);
  const totalProtein = localMeals.reduce((acc, curr) => acc + curr.proteinGrams, 0);
  const completedCount = localWorkouts.filter((w) => w.completed).length;

  const handleToggleWorkout = (workoutId: string) => {
    setLocalWorkouts((prev) =>
      prev.map((w) => (w.id === workoutId ? { ...w, completed: !w.completed } : w))
    );
    onToggleWorkoutComplete(workoutId);
  };

  const handleDeleteWorkoutItem = async (workoutId: string) => {
    setLocalWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    onDeleteWorkout(workoutId);
    try {
      if (!workoutId.startsWith('w-')) {
        await workoutApi.deleteLog(workoutId);
      }
    } catch {}
  };

  const handleDeleteMealItem = async (mealId: string) => {
    setLocalMeals((prev) => prev.filter((m) => m.id !== mealId));
    onDeleteMeal(mealId);
    try {
      const today = new Date().toISOString().split('T')[0];
      if (!mealId.startsWith('m-')) {
        await nutritionApi.deleteMeal(today, mealId);
      }
    } catch {}
  };

  return (
    <div
      id="activity-feed-section"
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-6 sm:p-7 shadow-xs space-y-6"
    >
      {/* ========================================================================= */}
      {/* QUICK ACTIONS & LIVE HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
              Activity & Nutrition Log
            </h3>
            <button
              type="button"
              onClick={fetchLiveActivities}
              disabled={isLoading}
              title="Refresh live activity"
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {completedCount}/{localWorkouts.length} workouts logged • {localMeals.length} meals recorded today
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quick Log Workout */}
          <button
            id="quick-action-log-workout"
            type="button"
            onClick={() => onOpenQuickLog('workout')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-full text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>+ Log Workout</span>
          </button>

          {/* Quick Log Meal */}
          <button
            id="quick-action-log-meal"
            type="button"
            onClick={() => onOpenQuickLog('meal')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>+ Log Meal</span>
          </button>

          {/* Quick Add Water */}
          <button
            id="quick-action-add-water"
            type="button"
            onClick={onQuickAddWater}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 rounded-full text-xs font-bold hover:bg-sky-100 transition-colors cursor-pointer"
            title="Quick add 250ml water"
          >
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>+250ml</span>
          </button>

          {/* Quick Log Weight */}
          <button
            id="quick-action-log-weight"
            type="button"
            onClick={() => onOpenQuickLog('weight')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 text-slate-500" />
            <span>Weight</span>
          </button>

          {/* Download Report Button */}
          {onOpenReport && (
            <button
              id="activity-feed-download-report-btn"
              type="button"
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer ml-auto sm:ml-0"
              title="Download Fitness Activity & Progress Report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Activity
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('workouts')}
            className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
              activeFilter === 'workouts'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Workouts ({localWorkouts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('meals')}
            className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
              activeFilter === 'meals'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Meals ({localMeals.length})
          </button>
        </div>

        {/* Daily Summary Stat Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 font-bold border border-orange-200 dark:border-orange-900/50">
            🔥 {formatEnergy(totalWorkoutCalories)} burned
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-900/50">
            🥗 {totalProtein}g protein
          </span>
        </div>
      </div>

      {/* Dual Column Feed: Latest Workouts (Left) & Recent Meals (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ========================================================================= */}
        {/* LATEST WORKOUTS LIST */}
        {/* ========================================================================= */}
        {(activeFilter === 'all' || activeFilter === 'workouts') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
                Latest Workouts
              </span>
              <button
                type="button"
                onClick={() => onOpenQuickLog('workout')}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>+ Add</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {isLoading && localWorkouts.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span>Loading recorded workouts...</span>
                </div>
              ) : localWorkouts.length === 0 ? (
                <div className="py-10 px-4 text-center rounded-3xl bg-slate-50/70 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2.5 shadow-2xs">
                    <Dumbbell className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                    No workouts logged yet
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Record your exercises, sets, reps, and calories to build your live training log.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenQuickLog('workout')}
                    className="mt-4 px-4 py-2 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold rounded-full shadow-xs transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Log Workout Session</span>
                  </button>
                </div>
              ) : (
                localWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                      workout.completed
                        ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                        : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Completion toggle checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleWorkout(workout.id)}
                        className="cursor-pointer text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                        title={workout.completed ? 'Mark as pending' : 'Mark as completed'}
                      >
                        {workout.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                        ) : (
                          <Circle className="w-5 h-5 text-amber-500 hover:text-emerald-500" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold truncate ${
                              workout.completed
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-800 dark:text-slate-100'
                            }`}
                          >
                            {workout.name}
                          </span>
                          <span className="shrink-0 px-2 py-0.5 text-[9px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                            {workout.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span>
                            {workout.sets} sets × {workout.reps} reps
                            {workout.weightKg ? ` @ ${workout.weightKg}kg` : ''}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-orange-600 dark:text-orange-400">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {formatEnergy(workout.caloriesBurned)}
                          </span>
                          <span>•</span>
                          <span className="text-[10px] text-slate-400">{workout.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteWorkoutItem(workout.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-all p-1 cursor-pointer"
                        title="Delete workout log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RECENT MEALS LIST */}
        {/* ========================================================================= */}
        {(activeFilter === 'all' || activeFilter === 'meals') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-orange-500" />
                Recent Meals & Nutrition
              </span>
              <button
                type="button"
                onClick={() => onOpenQuickLog('meal')}
                className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>+ Add</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {isLoading && localMeals.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                  <span>Loading recorded meals...</span>
                </div>
              ) : localMeals.length === 0 ? (
                <div className="py-10 px-4 text-center rounded-3xl bg-slate-50/70 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100/70 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-2.5 shadow-2xs">
                    <Utensils className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                    No meals recorded today
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Track your daily breakfast, lunch, dinner, or snacks to monitor calories and macros in real-time.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenQuickLog('meal')}
                    className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-full shadow-xs transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Log Meal & Macros</span>
                  </button>
                </div>
              ) : (
                localMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 transition-all flex items-center justify-between gap-3 group hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-orange-100/80 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {meal.mealType[0]}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {meal.name}
                          </span>
                          <span className="shrink-0 px-2 py-0.5 text-[9px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-md">
                            {meal.mealType}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          <span className="text-slate-900 dark:text-white font-bold">
                            {formatEnergy(meal.calories)}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{meal.proteinGrams}g P</span>
                          <span className="text-sky-600 dark:text-sky-400 font-semibold">{meal.carbsGrams}g C</span>
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">{meal.fatsGrams}g F</span>
                          <span>•</span>
                          <span className="text-[10px] text-slate-400">{meal.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteMealItem(meal.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-all p-1 cursor-pointer"
                        title="Delete meal log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
