import React, { useState, useMemo } from 'react';
import { Dumbbell, Clock, Flame, ArrowRight, Plus, CalendarX2 } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useUnits } from '../context/UnitContext';

export interface PlannedRoutineData {
  title: string;
  exerciseCount: number;
  estimatedMins: number;
  caloriesBurned: number;
  exercises: string[];
  imageUrl?: string;
}

interface TodaysWorkoutCardProps {
  routine?: PlannedRoutineData | null;
  onStartWorkout?: (title: string) => void;
  onCreateRoutine?: () => void;
}

export const TodaysWorkoutCard: React.FC<TodaysWorkoutCardProps> = ({
  routine,
  onStartWorkout,
  onCreateRoutine,
}) => {
  const { routines } = useWorkouts();
  const { formatEnergy } = useUnits();
  const [isRestDayManual, setIsRestDayManual] = useState(false);

  const dynamicRoutine = useMemo<PlannedRoutineData | null>(() => {
    if (routine) return routine;

    if (!routines || routines.length === 0) {
      return null;
    }

    let savedOrder: string[] = [];
    try {
      const stored = localStorage.getItem('fitness_routines_order');
      if (stored) savedOrder = JSON.parse(stored);
    } catch {}

    const sorted: any[] = [];
    const remaining = [...routines];
    savedOrder.forEach((id) => {
      const idx = remaining.findIndex((r) => r._id === id);
      if (idx >= 0) {
        sorted.push(remaining[idx]);
        remaining.splice(idx, 1);
      }
    });
    const ordered = [...sorted, ...remaining];

    const todayDayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const activeIdx = ((todayDayNumber % ordered.length) + ordered.length) % ordered.length;
    const r = ordered[activeIdx] || ordered[0];

    const exList = (r.exercises || []).map((e: any) => e.name || 'Exercise');

    return {
      title: r.name || 'Custom Routine',
      exerciseCount: exList.length,
      estimatedMins: r.durationMinutes || Math.max(20, exList.length * 10),
      caloriesBurned: r.caloriesBurned || Math.max(150, exList.length * 80 + 50),
      exercises: exList,
      imageUrl: r.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=900&auto=format&fit=crop',
    };
  }, [routine, routines]);

  if (isRestDayManual) {
    return (
      <div
        id="todays-workout-rest-card"
        className="w-full rounded-[32px] sm:rounded-[36px] bg-[#E8F3EE] dark:bg-[#12231B] p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all border border-emerald-100/60 dark:border-emerald-900/30"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-2xs">
            <CalendarX2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-['Outfit'] block mb-1">
              Today's Schedule
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white font-['Outfit'] tracking-tight">
              Rest &amp; Recovery Day
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md font-medium">
              Rest day is active. Muscles recover and grow during rest periods.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsRestDayManual(false)}
            className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:underline px-2 py-1 cursor-pointer"
          >
            Resume Workout
          </button>
          <button
            id="todays-workout-view-btn"
            type="button"
            onClick={onCreateRoutine}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs sm:text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-98 transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            <span>View All Routines</span>
          </button>
        </div>
      </div>
    );
  }

  if (!dynamicRoutine) {
    return (
      <div
        id="todays-workout-empty-card"
        className="w-full rounded-[32px] sm:rounded-[36px] bg-[#E8F3EE] dark:bg-[#12231B] p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all border border-emerald-100/60 dark:border-emerald-900/30"
      >
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider font-['Outfit'] mb-3">
            <Dumbbell className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Today's Active Routine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white font-['Outfit'] tracking-tight">
            No Workout Routine Added Yet
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-lg font-medium leading-relaxed">
            You haven't created any custom workout routines yet. Add your first routine on the Workouts page with target exercises, sets, and reps to start tracking your sessions.
          </p>
          <div className="mt-6">
            <button
              id="todays-workout-create-first-btn"
              type="button"
              onClick={onCreateRoutine}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs sm:text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-98 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Your Routine</span>
            </button>
          </div>
        </div>

        <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 z-10 flex justify-center">
          <div className="relative w-full aspect-[1.32/1] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/60 dark:border-slate-800 bg-slate-200 dark:bg-slate-800">
            <img
              src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=900&auto=format&fit=crop"
              alt="Gym workout training"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="todays-workout-active-card"
      className="w-full rounded-[32px] sm:rounded-[36px] bg-[#E8F3EE] dark:bg-[#12231B] p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-10 relative overflow-hidden transition-all shadow-xs border border-emerald-100/60 dark:border-emerald-900/30"
    >
      <div className="flex-1 w-full flex flex-col justify-between z-10 min-w-0">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-['Outfit']">
              Today&apos;s Active Routine
            </span>
            <button
              type="button"
              onClick={() => setIsRestDayManual(true)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Set Rest Day
            </button>
          </div>

          <h2
            id="todays-workout-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-950 dark:text-white font-['Outfit'] leading-[1.15] tracking-tight"
          >
            {dynamicRoutine.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 mt-4">
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-slate-800 dark:text-slate-200 stroke-[2.4]" />
              <span>{dynamicRoutine.exerciseCount} Exercises</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-800 dark:text-slate-200 stroke-[2.4]" />
              <span>Est. {dynamicRoutine.estimatedMins} mins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#FF5722] fill-[#FF5722] stroke-[2]" />
              <span>~{formatEnergy(dynamicRoutine.caloriesBurned)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-5">
            {dynamicRoutine.exercises.map((exercise) => (
              <span
                key={exercise}
                className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-slate-200 text-xs font-semibold border border-white dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
              >
                {exercise}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <button
            id="todays-workout-start-btn"
            type="button"
            onClick={() => onStartWorkout?.(dynamicRoutine.title)}
            className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs sm:text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-98 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.12)] cursor-pointer group"
          >
            <span>Start Workout Session</span>
            <ArrowRight className="w-4 h-4 stroke-[2.4] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {dynamicRoutine.imageUrl && (
        <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 z-10 flex justify-center">
          <div className="relative w-full aspect-[1.32/1] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/60 dark:border-slate-800 bg-slate-200 dark:bg-slate-800">
            <img
              src={dynamicRoutine.imageUrl}
              alt={dynamicRoutine.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
