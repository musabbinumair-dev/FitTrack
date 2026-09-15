import React, { useState } from 'react';
import heroWorkoutImg from '../assets/images/fitness_hero_banner_1787262643800.jpg';
import {
  Flame,
  ArrowRight,
  Play,
  Moon,
  ChevronLeft,
  ChevronRight,
  Plus,
  ThumbsUp,
  Scale,
  Sparkles,
} from 'lucide-react';

interface ActivityChartsSectionProps {
  onOpenWorkout?: () => void;
  onOpenQuickLog?: (type: 'workout' | 'meal' | 'water' | 'weight') => void;
}

export const ActivityChartsSection: React.FC<ActivityChartsSectionProps> = ({
  onOpenWorkout,
  onOpenQuickLog,
}) => {
  // Hydration toggle (D, W, M)
  const [hydrationRange, setHydrationRange] = useState<'D' | 'W' | 'M'>('D');
  // 6 columns x 4 rows = 24 cups initial state matching exact image pattern
  const [cupsState, setCupsState] = useState<boolean[]>([
    true, true, true, true, true, false, // Row 1: 5 dark, 1 white
    true, false, true, false, true, false, // Row 2: dark, white, dark, white, dark, white
    false, false, false, false, false, false, // Row 3: all white
    false, false, false, false, false, false, // Row 4: all white
  ]);

  const handleToggleCup = (index: number) => {
    setCupsState((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // Sleep card carousel state
  const [sleepTipIndex, setSleepTipIndex] = useState(1);
  const sleepTips = [
    {
      title: 'Experience the Goodness of Deep Sleep',
      text: 'Discover tips and techniques for better, deeper sleep. Wake up refreshed and experience the true benefits of restful nights.',
      tag: 'Deep sleep',
    },
    {
      title: 'Optimize REM Recovery Cycles',
      text: 'Maintain consistent sleep hygiene. Lower blue light exposure 1 hour before bedtime to increase natural melatonin production.',
      tag: 'REM Sleep',
    },
    {
      title: 'Post-Workout Nervous System Rest',
      text: 'Adequate hydration and magnesium supplementation promote rapid muscle fiber repair during stage-3 non-REM rest.',
      tag: 'Muscle Repair',
    },
  ];

  const handleNextSleepTip = () => {
    setSleepTipIndex((prev) => (prev + 1) % sleepTips.length);
  };

  const handlePrevSleepTip = () => {
    setSleepTipIndex((prev) => (prev === 0 ? sleepTips.length - 1 : prev - 1));
  };

  return (
    <div id="ui-kit-showcase-section" className="space-y-4 sm:space-y-5 select-none">
      {/* ========================================================================= */}
      {/* UNIFIED RESPONSIVE GRID layout:
          - Mobile (< md): 2 columns.
            Hero Workout: col-span-2 (Full Width Row 1)
            Hydration Status + Deep Sleep: col-span-1 each (SAME ROW 2 on mobile!)
            Calories Breakdown + Weight Progress: col-span-1 each (SAME ROW 3 on mobile!)
          - Desktop (md:): 12 columns.
            Hero Workout (md:col-span-7) + Hydration Status (md:col-span-5) in Row 1
            Deep Sleep (md:col-span-4) + Calories (md:col-span-4) + Weight (md:col-span-4) in Row 2
      ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-12 gap-2.5 sm:gap-4 lg:gap-5">
        {/* 1. Hero Workout Banner */}
        <div
          id="home-workout-hero-card"
          className="col-span-2 md:col-span-7 relative overflow-hidden bg-[#D3E8EC] dark:bg-[#1E3B45] rounded-[22px] sm:rounded-[28px] lg:rounded-[36px] p-4 sm:p-6 lg:p-9 shadow-xs flex flex-col justify-between min-h-[230px] sm:min-h-[280px] lg:min-h-[350px] select-none group"
        >
          {/* Athlete Fitness Image Composition matching the exact reference */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src={heroWorkoutImg}
              alt="Woman athlete doing workout"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-95 dark:opacity-85"
            />
            {/* Smooth linear gradient overlay matching card background for seamless text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#B5D7DE] via-[#B5D7DE]/60 to-transparent dark:from-[#1E3B45] dark:via-[#1E3B45]/60 pointer-events-none w-[75%]" />
          </div>

          {/* Top-Left Headline: "Your Home Workout Starts Here!" in Crisp White */}
          <div className="relative z-20 max-w-xs">
            <h2 className="text-xl sm:text-2xl md:text-[28px] lg:text-[40px] font-medium text-white tracking-tight leading-[1.12] font-['Outfit'] drop-shadow-2xs">
              Your Home Workout<br />Starts Here!
            </h2>
          </div>

          {/* Center Frosted Glass Play Button + "Explore Now" Label */}
          <div className="absolute left-[45%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer">
            <button
              type="button"
              onClick={onOpenWorkout}
              className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-white/40 dark:bg-white/20 backdrop-blur-md border border-white/70 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-sm cursor-pointer group"
              title="Explore Now"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-4.5 lg:h-4.5 fill-white text-white ml-0.5" />
            </button>
            <span
              onClick={onOpenWorkout}
              className="text-white text-[10px] sm:text-[12px] lg:text-[13px] font-medium tracking-tight drop-shadow-xs hover:underline cursor-pointer"
            >
              Explore Now
            </span>
          </div>

          {/* Bottom Row: Join program with (Left) + Start Free Trial (Right) */}
          <div className="relative z-20 flex flex-row items-end justify-between gap-2 sm:gap-3 lg:gap-4 mt-6 sm:mt-8 lg:mt-12 pt-2">
            {/* Bottom-Left: Join program with + 3 Overlapping Avatars + 5.8k+ Members */}
            <div>
              <span className="text-white text-[9px] sm:text-[10px] lg:text-[11px] font-normal block mb-1 lg:mb-1.5 tracking-tight opacity-90">
                Join program with:
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5">
                <div className="flex -space-x-1.5 sm:-space-x-2">
                  <img
                    className="inline-block h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                    alt="Member 1"
                  />
                  <img
                    className="inline-block h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80"
                    alt="Member 2"
                  />
                  <img
                    className="inline-block h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                    alt="Member 3"
                  />
                </div>
                <div className="text-white leading-none">
                  <span className="text-xs sm:text-sm font-bold block leading-none font-['Outfit']">
                    5.8k+
                  </span>
                  <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-white/90 font-normal block mt-0.5 leading-none">
                    Members
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom-Right: Exact Black Pill "Start Free Trial" with White Circular Arrow */}
            <button
              id="hero-start-trial-btn"
              type="button"
              onClick={onOpenWorkout}
              className="inline-flex items-center gap-1.5 sm:gap-2 lg:gap-3 pl-3 sm:pl-4 lg:pl-6 pr-1.5 sm:pr-2 py-1 sm:py-1.5 lg:py-2 bg-black hover:bg-slate-900 text-white rounded-full text-[10px] sm:text-xs lg:text-[13px] font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <span className="tracking-tight whitespace-nowrap">Start Free Trial</span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 stroke-[2.5]" />
              </div>
            </button>
          </div>
        </div>

        {/* 2. Hydration Status Card */}
        <div
          id="hydration-status-sky-card"
          className="col-span-1 md:col-span-5 bg-[#80CBEB] dark:bg-[#1B4660] rounded-[22px] sm:rounded-[28px] lg:rounded-[32px] p-3.5 sm:p-5 lg:p-7 shadow-xs flex flex-col justify-between min-h-[220px] sm:min-h-[280px] lg:min-h-[300px] text-white select-none transition-colors"
        >
          {/* Top Section: Title, Subtitle, Well Done Badge & 6x4 Grid of Tapered Glasses */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
              <div>
                <h3 className="text-xs sm:text-[15px] font-medium text-white tracking-tight font-['Outfit']">
                  Hydration Status:
                </h3>
                <p className="text-[9px] sm:text-[11px] text-white/85 mt-0.5 sm:mt-1 max-w-[170px] leading-[1.25] hidden xs:block">
                  Drinking water daily boosts energy and focus.
                </p>

                {/* Well Done Badge */}
                <div className="mt-2 sm:mt-4">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-[#DEFA28] text-slate-950 font-bold text-[9px] sm:text-[11px] rounded-full shadow-2xs">
                    <span>Well Done</span>
                    <ThumbsUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-slate-950 text-slate-950 stroke-[2]" />
                  </span>
                </div>
              </div>

              {/* Matrix of Glasses Grid (6 cols x 4 rows = 24 tapered cups) */}
              <div className="pt-1 sm:pt-0.5">
                <div className="grid grid-cols-6 gap-x-1 gap-y-1 sm:gap-x-1.5 sm:gap-y-1.5">
                  {cupsState.map((isFilled, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleToggleCup(i)}
                      className="cursor-pointer focus:outline-none"
                      title={`Cup ${i + 1} (${isFilled ? 'Hydrated' : 'Click to log'})`}
                    >
                      <svg viewBox="0 0 16 19" className="w-2.5 h-3.5 sm:w-3.5 sm:h-4.5 transition-transform hover:scale-110">
                        <path
                          d="M 1.2 1.5 L 2.8 15.8 C 2.95 17.2 4.1 18.2 5.5 18.2 L 10.5 18.2 C 11.9 18.2 13.05 17.2 13.2 15.8 L 14.8 1.5 C 14.95 0.5 14.2 0 13.2 0 L 2.8 0 C 1.8 0 1.05 0.5 1.2 1.5 Z"
                          fill={isFilled ? '#477797' : '#FFFFFF'}
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: D W M Circular Buttons (Left) + 2.15L /Day (Right) */}
          <div className="flex items-end justify-between pt-3 sm:pt-6 mt-2 sm:mt-4">
            {/* D W M Circular Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {(['D', 'W', 'M'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setHydrationRange(mode)}
                  className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-semibold transition-all cursor-pointer ${
                    hydrationRange === mode
                      ? 'bg-white text-slate-900 shadow-xs scale-105'
                      : 'bg-white/25 hover:bg-white/35 text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Big 2.15L /Day Metric */}
            <div className="text-right">
              <div className="text-lg sm:text-3xl lg:text-[46px] font-light text-white tracking-tight leading-none font-['Outfit']">
                2.15L
              </div>
              <div className="text-[9px] sm:text-xs font-normal text-white/85 mt-0.5 sm:mt-1 tracking-tight">
                /Day
              </div>
            </div>
          </div>
        </div>

        {/* 3. Deep Sleep Card */}
        <div
          id="deep-sleep-ui-card"
          className="col-span-1 md:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[22px] sm:rounded-[28px] lg:rounded-[32px] p-3.5 sm:p-5 lg:p-7 shadow-xs flex flex-col justify-between min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] select-none transition-all"
        >
          <div>
            {/* Top Avatars Cluster with Soft Tinted Rings */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3 lg:mb-4">
              <div className="flex -space-x-1.5 sm:-space-x-2">
                <img
                  className="w-5 h-5 sm:w-6.5 sm:h-6.5 lg:w-7 lg:h-7 rounded-full ring-2 ring-[#FDE8E8] object-cover"
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80"
                  alt="Sleep coach 1"
                />
                <img
                  className="w-5 h-5 sm:w-6.5 sm:h-6.5 lg:w-7 lg:h-7 rounded-full ring-2 ring-[#EDE7F6] object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                  alt="Sleep coach 2"
                />
                <img
                  className="w-5 h-5 sm:w-6.5 sm:h-6.5 lg:w-7 lg:h-7 rounded-full ring-2 ring-[#FCE4EC] object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                  alt="Sleep coach 3"
                />
              </div>
            </div>

            {/* Title: Experience the Goodness of Deep Sleep */}
            <h3 className="text-xs sm:text-[17px] lg:text-[20px] font-medium text-slate-900 dark:text-white tracking-tight leading-[1.2] font-['Outfit']">
              Experience the Goodness<br className="hidden sm:inline" /> of Deep Sleep
            </h3>

            {/* Black Pill Badge: Moon icon + Deep sleep */}
            <div className="mt-2 sm:mt-3.5 mb-2 sm:mb-3">
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 lg:px-3.5 lg:py-1.5 bg-black dark:bg-slate-800 text-white text-[8.5px] sm:text-[10px] lg:text-[11px] font-medium rounded-full shadow-2xs">
                <Moon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white fill-white" />
                <span>Deep sleep</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-[8.5px] sm:text-[11px] lg:text-[11.5px] text-slate-400 dark:text-slate-400 font-normal leading-[1.3] sm:leading-[1.45] line-clamp-2 sm:line-clamp-none">
              Discover tips and techniques for better, deeper sleep. Wake up refreshed.
            </p>
          </div>

          {/* Footer: Indicator 2 /3 & Soft Square Navigation Arrows */}
          <div className="flex items-end justify-between pt-2 sm:pt-3 lg:pt-4 mt-1 sm:mt-2">
            <div className="flex items-baseline">
              <span className="text-lg sm:text-[24px] lg:text-[30px] font-light text-slate-900 dark:text-white font-['Outfit'] leading-none">
                {sleepTipIndex + 1}
              </span>
              <span className="text-[8px] sm:text-[10px] text-slate-300 dark:text-slate-500 font-light ml-0.5">
                /{sleepTips.length}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={handlePrevSleepTip}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label="Previous tip"
              >
                <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2]" />
              </button>
              <button
                type="button"
                onClick={handleNextSleepTip}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label="Next tip"
              >
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Calories Breakdown Card */}
        <div
          id="calories-breakdown-ui-card"
          className="col-span-1 md:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[22px] sm:rounded-[28px] lg:rounded-[32px] p-3.5 sm:p-5 lg:p-7 shadow-xs flex flex-col justify-between min-h-[220px] sm:min-h-[280px] lg:min-h-[310px] select-none transition-all"
        >
          <div>
            {/* Header: Flame Calories (Left) ... 2.350 Kcal / Daily dose (Right) */}
            <div className="flex items-start justify-between gap-1">
              <div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <div className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Flame className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-slate-900 dark:text-white fill-slate-900 dark:fill-white" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white font-['Outfit']">
                    Calories
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-slate-400 font-normal block mt-0.5 sm:mt-1">
                  Lack of activity
                </span>
              </div>

              <div className="text-right">
                <div className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white font-['Outfit']">
                  2.350 <span className="font-normal text-[8px] sm:text-[9px] lg:text-[10px] text-slate-400">Kcal</span>
                </div>
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-slate-400 font-normal block mt-0.5 sm:mt-1">
                  Daily dose
                </span>
              </div>
            </div>

            {/* Big Main Metric: 2.040 /Kcal */}
            <div className="mt-2 sm:mt-3.5 lg:mt-4 mb-1.5 sm:mb-2 flex items-baseline">
              <span className="text-lg sm:text-[30px] lg:text-[38px] font-light text-slate-900 dark:text-white tracking-tight leading-none font-['Outfit']">
                2.040
              </span>
              <span className="text-[10px] sm:text-xs lg:text-[13px] font-normal text-slate-400 ml-1">
                /Kcal
              </span>
            </div>

            {/* Dense Lime-Green Vertical Bar Chart (0 on left, 2.350 on right) */}
            <div className="mt-1 sm:mt-2.5">
              <div className="flex justify-between text-[8px] sm:text-[9px] text-slate-400 font-normal mb-1 sm:mb-1.5 px-0.5">
                <span>0</span>
                <span>2.350</span>
              </div>
              <div className="flex items-center gap-[1.5px] sm:gap-[2.5px] lg:gap-[3px] h-4 sm:h-6 lg:h-7 w-full">
                {Array.from({ length: 30 }).map((_, i) => {
                  const isFilled = i < 22;
                  return (
                    <div
                      key={i}
                      className={`flex-1 h-full rounded-full transition-all ${
                        isFilled
                          ? 'bg-[#96BA28] dark:bg-[#A4C932]'
                          : 'bg-slate-100 dark:bg-slate-800/70'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Macro Breakdown: 269 Gram Carbs, 164 Gram Proteins, 110 Gram Fats */}
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1 pt-2 sm:pt-3 lg:pt-3.5 mt-1 sm:mt-2 text-left">
            <div>
              <div className="text-[9px] sm:text-[11px] lg:text-xs font-bold text-slate-900 dark:text-white font-['Outfit']">
                269 <span className="font-normal text-[7.5px] sm:text-[9px] lg:text-[10px] text-slate-400">g</span>
              </div>
              <span className="text-[7.5px] sm:text-[8.5px] lg:text-[9px] text-slate-400 font-normal block mt-0.5 truncate">
                Carbs
              </span>
            </div>
            <div>
              <div className="text-[9px] sm:text-[11px] lg:text-xs font-bold text-slate-900 dark:text-white font-['Outfit']">
                164 <span className="font-normal text-[7.5px] sm:text-[9px] lg:text-[10px] text-slate-400">g</span>
              </div>
              <span className="text-[7.5px] sm:text-[8.5px] lg:text-[9px] text-slate-400 font-normal block mt-0.5 truncate">
                Proteins
              </span>
            </div>
            <div>
              <div className="text-[9px] sm:text-[11px] lg:text-xs font-bold text-slate-900 dark:text-white font-['Outfit']">
                110 <span className="font-normal text-[7.5px] sm:text-[9px] lg:text-[10px] text-slate-400">g</span>
              </div>
              <span className="text-[7.5px] sm:text-[8.5px] lg:text-[9px] text-slate-400 font-normal block mt-0.5 truncate">
                Fats
              </span>
            </div>
          </div>
        </div>

        {/* 5. Weight Progress Card */}
        <div
          id="weight-progress-ui-card"
          className="col-span-1 md:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[22px] sm:rounded-[28px] lg:rounded-[32px] p-3.5 sm:p-5 lg:p-7 shadow-xs flex flex-col justify-between min-h-[220px] sm:min-h-[280px] lg:min-h-[310px] select-none transition-all"
        >
          <div>
            {/* Header: Weight Healthy range (Left) ... 188 Cm / Tall body (Right) */}
            <div className="flex items-start justify-between gap-1">
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-lg sm:rounded-xl bg-slate-100/90 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shadow-2xs">
                    <span className="text-[10px] sm:text-xs lg:text-[13px] font-bold leading-none select-none">↔</span>
                  </div>
                  <span className="text-xs sm:text-base lg:text-[17px] font-bold text-slate-900 dark:text-white font-['Outfit']">
                    Weight
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9.5px] lg:text-[10px] text-slate-400 font-normal block mt-1">
                  Healthy: 68-84 Kg
                </span>
              </div>

              <div className="text-right">
                <div className="text-xs sm:text-base lg:text-[18px] font-bold text-slate-900 dark:text-white font-['Outfit'] leading-tight">
                  188<span className="font-normal text-[8px] sm:text-[10px] lg:text-[11px] text-slate-400 ml-0.5">Cm</span>
                </div>
                <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-slate-400 font-normal block mt-0.5">
                  Tall body
                </span>
              </div>
            </div>

            {/* Smooth Intertwining Cyan Ribbon Wave Spline Curves matching exact reference */}
            <div className="relative h-10 sm:h-16 lg:h-20 w-full my-1.5 sm:my-2.5 lg:my-3">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 240 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveFadeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#89D3E6" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#89D3E6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#89D3E6" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <path
                  d="M 25 58 C 55 58, 65 34, 88 34 C 118 34, 138 60, 168 58 C 195 56, 208 42, 230 50"
                  fill="none"
                  stroke="url(#waveFadeGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M 12 50 C 28 35, 40 16, 54 16 C 76 16, 95 54, 120 56 C 148 58, 178 36, 215 50"
                  fill="none"
                  stroke="#80CBEB"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <circle
                  cx="54"
                  cy="16"
                  r="5.5"
                  className="fill-[#80CBEB] stroke-white dark:stroke-slate-900 stroke-[2.5]"
                />
              </svg>
            </div>
          </div>

          {/* Bottom Section: Big 82 kg Metric (Left) + Of the weekly plan completed / Keep it up! (Right) */}
          <div className="flex items-end justify-between pt-1">
            <div className="flex items-baseline">
              <span className="text-xl sm:text-[44px] lg:text-[64px] font-light text-slate-900 dark:text-white tracking-tight leading-none font-['Outfit']">
                82
              </span>
              <span className="text-[10px] sm:text-xs lg:text-sm font-normal text-slate-900 dark:text-white ml-0.5 sm:ml-1 leading-none">
                kg
              </span>
            </div>

            <div className="text-right max-w-[90px] sm:max-w-[120px] lg:max-w-[130px]">
              <span className="text-[7.5px] sm:text-[9px] lg:text-[9.5px] text-slate-400 leading-[1.2] block font-normal">
                Weekly plan<br />completed
              </span>
              <span className="text-[9px] sm:text-[11px] lg:text-[12px] font-bold text-slate-900 dark:text-white block mt-0.5 sm:mt-1">
                Keep it up!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
