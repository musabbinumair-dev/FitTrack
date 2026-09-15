import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUnits } from '../context/UnitContext';

interface BodyOverviewCardProps {
  onOpenQuickLog?: (type: 'workout' | 'meal' | 'water' | 'weight') => void;
}

export const BodyOverviewCard: React.FC<BodyOverviewCardProps> = ({ onOpenQuickLog }) => {
  const { user } = useAuth();
  const { energyUnit, convertEnergy, formatWeight } = useUnits();
  const [timeRange, setTimeRange] = useState<'Monthly' | 'Weekly' | 'Daily'>('Monthly');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Dynamic user data from onboarding
  const rawCalorieTarget = user?.calorieGoal || user?.dailyCalorieGoal || 2400;
  const calorieTarget = convertEnergy(rawCalorieTarget);
  const proteinGoal = user?.proteinGoal || 160;
  const carbsGoal = user?.carbsGoal || 250;
  const fatsGoal = user?.fatsGoal || 70;
  const userWeight = user?.weight || 72;
  const targetWeight = user?.targetWeight || userWeight;
  const fitnessGoal = user?.fitnessGoal || 'maintain';

  // SVG Gauge calculations
  const size = 72;
  const strokeWidth = 6.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const totalMacroGrams = proteinGoal + carbsGoal + fatsGoal;
  const proteinPercent = Math.round((proteinGoal / totalMacroGrams) * 100);
  const carbsPercent = Math.round((carbsGoal / totalMacroGrams) * 100);
  const fatsPercent = Math.round((fatsGoal / totalMacroGrams) * 100);

  const macros = [
    {
      label: 'Protein',
      percent: proteinPercent,
      grams: `${proteinGoal}g`,
      color: '#C6F432',
    },
    {
      label: 'Carbs',
      percent: carbsPercent,
      grams: `${carbsGoal}g`,
      color: '#FFC82C',
    },
    {
      label: 'Fat',
      percent: fatsPercent,
      grams: `${fatsGoal}g`,
      color: '#FF4D36',
    },
  ];

  const weightDiff = Math.abs(userWeight - targetWeight);

  return (
    <div id="body-overview-card-container" className="flex flex-col h-full select-none">
      {/* Outer Header: "Body Overview" Title + "Monthly v" Dropdown Pill */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
          Body Overview
        </h2>

        {/* Dropdown Pill Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span>{timeRange}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg z-30 py-1 overflow-hidden">
              {(['Daily', 'Weekly', 'Monthly'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setTimeRange(option);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    timeRange === option
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Dark Card Container */}
      <div
        id="body-overview-main-card"
        onClick={() => onOpenQuickLog?.('meal')}
        className="bg-[#131418] dark:bg-[#0D0E11] text-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 lg:p-7 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between flex-1 cursor-pointer group border border-slate-800/40"
      >
        {/* Top Motivational Copy based on User Goal */}
        <div className="text-center pt-1">
          {fitnessGoal === 'lose_weight' ? (
            <>
              <p className="text-sm sm:text-[15px] font-normal text-slate-200 tracking-tight leading-snug">
                Target: <span className="font-bold text-[#C6F432]">{formatWeight(targetWeight)}</span> • Current: {formatWeight(userWeight)}
              </p>
              <span className="text-xs sm:text-[13px] font-normal text-slate-400 block mt-1 tracking-tight">
                {weightDiff > 0 ? `${formatWeight(weightDiff)} to lose • Keep it up!` : 'At your goal weight • Keep it up!'}
              </span>
            </>
          ) : fitnessGoal === 'build_muscle' ? (
            <>
              <p className="text-sm sm:text-[15px] font-normal text-slate-200 tracking-tight leading-snug">
                Building lean mass to <span className="font-bold text-[#C6F432]">{formatWeight(targetWeight)}</span>
              </p>
              <span className="text-xs sm:text-[13px] font-normal text-slate-400 block mt-1 tracking-tight">
                {weightDiff > 0 ? `${formatWeight(weightDiff)} to gain • Stay consistent!` : 'At your goal weight • Crushing it!'}
              </span>
            </>
          ) : (
            <>
              <p className="text-sm sm:text-[15px] font-normal text-slate-200 tracking-tight leading-snug">
                Maintaining <span className="font-bold text-[#C6F432]">{formatWeight(userWeight)}</span> vitality &amp; strength
              </p>
              <span className="text-xs sm:text-[13px] font-normal text-slate-400 block mt-1 tracking-tight">
                Daily customized fuel target
              </span>
            </>
          )}
        </div>

        {/* Center Big Hero Metric */}
        <div className="text-center my-4 sm:my-6">
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-white tracking-tight font-['Outfit'] leading-none">
            {calorieTarget.toLocaleString()} <span className="font-normal text-3xl sm:text-4xl lg:text-[42px] text-white">{energyUnit}</span>
          </h1>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mt-1.5 block">
            Target Daily Intake
          </span>
        </div>

        {/* Bottom 3 Macro Progress Gauges */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60">
          {macros.map((macro) => {
            const offset = circumference - (macro.percent / 100) * circumference;
            return (
              <div key={macro.label} className="flex flex-col items-center">
                {/* SVG Gauge */}
                <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                  <svg width={size} height={size} className="-rotate-90 overflow-visible">
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#282A30"
                      strokeWidth={strokeWidth}
                    />
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke={macro.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <span className="absolute text-xs sm:text-[13px] font-bold text-white font-['Outfit']">
                    {macro.percent}%
                  </span>
                </div>

                {/* Macro Label & Grams */}
                <div className="text-center mt-1.5">
                  <span className="text-xs font-bold text-white block">
                    {macro.grams}
                  </span>
                  <span className="text-[11px] font-normal text-slate-400 block tracking-tight">
                    {macro.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
