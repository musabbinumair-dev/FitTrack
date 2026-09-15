import React from 'react';
import { Droplets, Flame, Scale } from 'lucide-react';
import { KpiCardData } from '../types/fitness';
import { useAuth } from '../context/AuthContext';
import { useUnits } from '../context/UnitContext';

interface KpiMetricsGridProps {
  kpis: Record<string, KpiCardData>;
  onQuickAddWater: () => void;
  onQuickAddCalories: () => void;
  onOpenQuickLog: (type: 'workout' | 'meal' | 'water' | 'weight') => void;
}

export const KpiMetricsGrid: React.FC<KpiMetricsGridProps> = ({
  kpis,
  onOpenQuickLog,
}) => {
  const { user } = useAuth();
  const { weightUnit, energyUnit, formatEnergy, formatWeight } = useUnits();

  const waterGoal = user?.waterGoalMl || kpis.water?.goal || 3000;
  const waterVal = kpis.water?.value ?? 0;
  const waterPercent = Math.min(Math.round((waterVal / (waterGoal || 1)) * 100), 100);

  const calorieGoal = user?.calorieGoal || kpis.calories?.goal || 2400;
  const calorieVal = kpis.calories?.value ?? 0;
  const caloriePercent = Math.min(Math.round((calorieVal / (calorieGoal || 1)) * 100), 100);

  const weightVal = user?.weight || kpis.weight?.value || 70;
  const targetWeight = user?.targetWeight || kpis.weight?.goal || weightVal;

  const startingWeight = Number(
    user?.startingWeight ||
    localStorage.getItem('fitness_starting_weight') ||
    user?.weight ||
    weightVal ||
    52
  );
  const currentWeight = Number(weightVal || startingWeight);
  const goalWeight = Number(targetWeight || startingWeight);

  let weightProgress = 0;
  if (goalWeight > startingWeight) {
    const totalToGain = goalWeight - startingWeight;
    const gained = currentWeight - startingWeight;
    weightProgress = Math.max(0, Math.min(Math.round((gained / totalToGain) * 100), 100));
  } else if (goalWeight < startingWeight) {
    const totalToLose = startingWeight - goalWeight;
    const lost = startingWeight - currentWeight;
    weightProgress = Math.max(0, Math.min(Math.round((lost / totalToLose) * 100), 100));
  } else {
    weightProgress = currentWeight === goalWeight ? 100 : 0;
  }

  const weightDiff = Math.abs(currentWeight - goalWeight);

  return (
    <div id="kpi-metrics-grid-section" className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
          My Daily Target
        </h2>
        <button
          type="button"
          onClick={() => onOpenQuickLog('workout')}
          className="text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          See All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 flex-1">
        <div
          id="kpi-card-water"
          onClick={() => onOpenQuickLog('water')}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
              Water
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
              <Droplets className="w-6 h-6 sm:w-7 sm:h-7 text-[#00B4D8] fill-[#00B4D8]" />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] sm:text-xs font-normal text-slate-400 dark:text-slate-400 block">
                Total Cons
              </span>
              <span className="text-[11px] font-semibold text-[#00B4D8]">
                {waterPercent}%
              </span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit'] mt-0.5">
              {waterVal.toLocaleString()} ml
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#00B4D8] h-full rounded-full transition-all duration-300"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
            <span className="text-[10.5px] text-slate-400 dark:text-slate-500 block mt-1">
              Goal: {waterGoal.toLocaleString()} ml
            </span>
          </div>
        </div>

        <div
          id="kpi-card-calories"
          onClick={() => onOpenQuickLog('meal')}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
              Calories
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF5722] fill-[#FF5722]" />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] sm:text-xs font-normal text-slate-400 dark:text-slate-400 block">
                Total Cons
              </span>
              <span className="text-[11px] font-semibold text-[#FF5722]">
                {caloriePercent}%
              </span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit'] mt-0.5">
              {formatEnergy(calorieVal)}
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#FF5722] h-full rounded-full transition-all duration-300"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
            <span className="text-[10.5px] text-slate-400 dark:text-slate-500 block mt-1">
              Goal: {formatEnergy(calorieGoal)}
            </span>
          </div>
        </div>

        <div
          id="kpi-card-weight"
          onClick={() => onOpenQuickLog('weight')}
          className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
                <Scale className="w-6 h-6 sm:w-7 sm:h-7 text-[#22C55E]" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit'] block leading-none">
                  Weight Target
                </span>
                <span className="text-[11.5px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Starting: {formatWeight(startingWeight)} • Goal: {formatWeight(goalWeight)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
                {formatWeight(currentWeight)}
              </div>
              <span className="text-[11px] font-semibold text-[#22C55E] block">
                {weightProgress}% completed
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#22C55E] h-full rounded-full transition-all duration-300"
                style={{ width: `${weightProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
              <span>{weightDiff === 0 ? 'Goal Reached!' : `${formatWeight(weightDiff)} remaining`}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Log weight &rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
