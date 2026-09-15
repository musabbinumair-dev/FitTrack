import React, { useState } from 'react';
import {
  Dumbbell,
  Clock,
  Flame,
  CheckCircle2,
  Circle,
  Play,
  Check,
  Utensils,
  ChevronRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { AiCoachInsight } from '../types/fitness';

interface AiFitnessCoachCardProps {
  coachData?: AiCoachInsight;
  onRefreshAdvice?: () => void;
  onOpenWorkoutModal?: () => void;
}

interface ExerciseItem {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  weightKg: number;
  completedSets: number;
  category: string;
}

export const AiFitnessCoachCard: React.FC<AiFitnessCoachCardProps> = ({
  onOpenWorkoutModal,
}) => {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [exercises, setExercises] = useState<ExerciseItem[]>([
    {
      id: 'ex-1',
      name: 'Incline Barbell Bench Press',
      targetSets: 4,
      targetReps: 10,
      weightKg: 82.5,
      completedSets: 4,
      category: 'Chest',
    },
    {
      id: 'ex-2',
      name: 'Standing Overhead DB Press',
      targetSets: 3,
      targetReps: 12,
      weightKg: 24.0,
      completedSets: 3,
      category: 'Shoulders',
    },
    {
      id: 'ex-3',
      name: 'Incline Dumbbell Flyes',
      targetSets: 3,
      targetReps: 12,
      weightKg: 18.0,
      completedSets: 1,
      category: 'Chest',
    },
    {
      id: 'ex-4',
      name: 'Cable Lateral Raises',
      targetSets: 4,
      targetReps: 15,
      weightKg: 12.5,
      completedSets: 0,
      category: 'Shoulders',
    },
    {
      id: 'ex-5',
      name: 'Triceps Rope Pushdown',
      targetSets: 3,
      targetReps: 15,
      weightKg: 27.5,
      completedSets: 0,
      category: 'Triceps',
    },
  ]);

  const toggleSetCompletion = (id: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === id) {
          const next = ex.completedSets >= ex.targetSets ? 0 : ex.completedSets + 1;
          return { ...ex, completedSets: next };
        }
        return ex;
      })
    );
  };

  const totalSets = exercises.reduce((acc, curr) => acc + curr.targetSets, 0);
  const completedTotalSets = exercises.reduce((acc, curr) => acc + curr.completedSets, 0);
  const percentComplete = Math.round((completedTotalSets / totalSets) * 100);

  const recentActivity = [
    {
      id: 'a1',
      title: 'Upper Body Push Session',
      subtitle: '4 sets Bench • 3 sets OHP',
      calories: '420 kcal',
      time: '08:30 AM',
      type: 'workout',
      icon: Dumbbell,
      tag: 'Completed',
      tagColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'a2',
      title: 'Grilled Salmon Bowl & Rice',
      subtitle: '52g Protein • 64g Carbs',
      calories: '640 kcal',
      time: '12:45 PM',
      type: 'meal',
      icon: Utensils,
      tag: 'Logged',
      tagColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    {
      id: 'a3',
      title: 'Post-Workout Whey & Berries',
      subtitle: '34g Protein • 22g Carbs',
      calories: '280 kcal',
      time: '03:15 PM',
      type: 'meal',
      icon: Utensils,
      tag: 'Logged',
      tagColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
  ];

  return (
    <div id="ai-fitness-coach-column" className="flex flex-col gap-5">
      {/* 1. Today's Planned Workout Card (Clean, structured list with sets, reps, weight & bold Start Workout CTA) */}
      <div
        id="planned-workout-card"
        className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
      >
        {/* Header with Title and Session Badges */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-xs">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
                  Today's Planned Workout
                </h2>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Upper Body Push & Hypertrophy
                </span>
              </div>
            </div>

            <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
              {percentComplete}% Done
            </span>
          </div>

          {/* Session Metadata Summary */}
          <div className="grid grid-cols-3 gap-2 my-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">Duration</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" /> 45 min
              </span>
            </div>
            <div className="border-x border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Est. Energy</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-3 h-3 text-orange-500" /> 420 kcal
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Total Sets</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3 text-emerald-500" /> {completedTotalSets}/{totalSets}
              </span>
            </div>
          </div>

          {/* Structured Exercise Target List */}
          <div className="space-y-2 mt-3">
            {exercises.map((ex, index) => {
              const isFinished = ex.completedSets >= ex.targetSets;
              return (
                <div
                  key={ex.id}
                  onClick={() => toggleSetCompletion(ex.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isFinished
                      ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {isFinished ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                      ) : ex.completedSets > 0 ? (
                        <div className="w-4 h-4 rounded-full border-2 border-emerald-500 flex items-center justify-center text-[9px] font-bold text-emerald-600">
                          {ex.completedSets}
                        </div>
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">0{index + 1}</span>
                        <h4
                          className={`text-xs font-semibold truncate ${
                            isFinished ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {ex.name}
                        </h4>
                      </div>
                      <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                        <span>
                          {ex.targetSets} sets × {ex.targetReps} reps
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {ex.weightKg} kg
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {ex.completedSets}/{ex.targetSets} sets
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary Start Workout CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            id="start-workout-action-btn"
            onClick={() => setIsWorkoutActive(!isWorkoutActive)}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
              isWorkoutActive
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-slate-950 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white active:scale-99'
            }`}
          >
            {isWorkoutActive ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Session in Progress • 24:18 (Pause)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Workout</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Recent Activity Log Card */}
      <div
        id="recent-activity-feed-card"
        className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
              Recent Activity Feed
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Today's logged exercises & nutrition
            </span>
          </div>

          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            3 Items Today
          </span>
        </div>

        {/* List of Recent Activities */}
        <div className="space-y-2 mb-2">
          {recentActivity.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center shadow-2xs">
                    <Icon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                      {act.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {act.subtitle} • {act.time}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {act.calories}
                  </span>
                  <span
                    className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded-md border ${act.tagColor}`}
                  >
                    {act.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Link */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">Daily Target Met: <strong>88%</strong></span>
          <button
            onClick={onOpenWorkoutModal}
            className="text-slate-900 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
          >
            View complete history <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
