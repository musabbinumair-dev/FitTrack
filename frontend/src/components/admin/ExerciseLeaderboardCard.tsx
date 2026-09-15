import React, { useState } from 'react';
import { Star, Sparkles } from 'lucide-react';
import {
  GiWeightLiftingUp,
  GiSprint,
  GiMuscleUp,
  GiWeight,
  GiRunningShoe,
  GiBiceps,
  GiGymBag,
  GiPulleyHook,
} from 'react-icons/gi';
import { TbBarbell, TbDumbbell, TbTreadmill } from 'react-icons/tb';
import { FaDumbbell } from 'react-icons/fa6';
import { IoBarbell } from 'react-icons/io5';
import { PopularExerciseItem } from '../../types/admin';

interface ExerciseLeaderboardCardProps {
  exercises: PopularExerciseItem[];
  onSelectExercise: (exercise: PopularExerciseItem) => void;
  isDarkMode?: boolean;
}

export type ExerciseElementKey =
  | 'barbell-bench'
  | 'hiit-sprint'
  | 'pullup-lat'
  | 'deadlift-kettlebell'
  | 'hex-dumbbells'
  | 'cable-pulley';

interface ExercisePreset {
  rank: number;
  exerciseName: string;
  category: string;
  score: string;
  stars: number;
  halfStar?: boolean;
  bgGradient: string;
  cardShadow: string;
  elementKey: ExerciseElementKey;
  defaultLogs: number;
  muscleGroup: string;
  trend: string;
  avgCalories: number;
  avgSets: string;
  equipmentBadge: string;
}

const EXERCISE_PRESETS: ExercisePreset[] = [
  {
    rank: 1,
    exerciseName: 'Barbell Incline Bench Press',
    category: 'Strength',
    score: '98/100',
    stars: 5,
    halfStar: false,
    bgGradient: 'bg-gradient-to-r from-[#F04D4E] to-[#FA6363]',
    cardShadow: 'hover:shadow-red-500/25',
    elementKey: 'barbell-bench',
    defaultLogs: 428,
    muscleGroup: 'Upper Chest & Triceps',
    trend: '+14%',
    avgCalories: 240,
    avgSets: '4 sets × 8-10 reps',
    equipmentBadge: 'Olympic Barbell',
  },
  {
    rank: 2,
    exerciseName: 'High Intensity Intervals (HIIT)',
    category: 'Cardio',
    score: '94/100',
    stars: 5,
    halfStar: false,
    bgGradient: 'bg-gradient-to-r from-[#4E6DFA] to-[#6380FF]',
    cardShadow: 'hover:shadow-blue-500/25',
    elementKey: 'hiit-sprint',
    defaultLogs: 392,
    muscleGroup: 'Full Body Endurance & Agility',
    trend: '+19%',
    avgCalories: 385,
    avgSets: '25 mins · 8 intervals',
    equipmentBadge: 'Cardio Sprint',
  },
  {
    rank: 3,
    exerciseName: 'Weighted Pull-Ups & Lat Pulldown',
    category: 'Hypertrophy',
    score: '90/100',
    stars: 5,
    halfStar: false,
    bgGradient: 'bg-gradient-to-r from-[#38B26A] to-[#4ECB82]',
    cardShadow: 'hover:shadow-emerald-500/25',
    elementKey: 'pullup-lat',
    defaultLogs: 356,
    muscleGroup: 'Lats, Rhomboids & Biceps',
    trend: '+8%',
    avgCalories: 215,
    avgSets: '4 sets × 10 reps',
    equipmentBadge: 'Bodyweight & Lat Rig',
  },
  {
    rank: 4,
    exerciseName: 'Barbell Romanian Deadlift',
    category: 'Strength',
    score: '87/100',
    stars: 5,
    halfStar: true,
    bgGradient: 'bg-gradient-to-r from-[#F69E3D] to-[#FAB15B]',
    cardShadow: 'hover:shadow-amber-500/25',
    elementKey: 'deadlift-kettlebell',
    defaultLogs: 314,
    muscleGroup: 'Hamstrings & Glutes',
    trend: '+5%',
    avgCalories: 260,
    avgSets: '3 sets × 8 reps',
    equipmentBadge: 'Heavy Free Weights',
  },
  {
    rank: 5,
    exerciseName: 'Dumbbell Walking Lunges',
    category: 'Hypertrophy',
    score: '80/100',
    stars: 4,
    halfStar: false,
    bgGradient: 'bg-gradient-to-r from-[#E056A0] to-[#F07DB8]',
    cardShadow: 'hover:shadow-pink-500/25',
    elementKey: 'hex-dumbbells',
    defaultLogs: 280,
    muscleGroup: 'Quads, Calves & Balance',
    trend: '+11%',
    avgCalories: 195,
    avgSets: '3 sets × 12 reps/leg',
    equipmentBadge: 'Hex Dumbbells',
  },
  {
    rank: 6,
    exerciseName: 'Cable Lateral Raises & Face Pulls',
    category: 'Hypertrophy',
    score: '78/100',
    stars: 4,
    halfStar: false,
    bgGradient: 'bg-gradient-to-r from-[#8E44AD] to-[#A569BD]',
    cardShadow: 'hover:shadow-purple-500/25',
    elementKey: 'cable-pulley',
    defaultLogs: 245,
    muscleGroup: 'Lateral Deltoids & Traps',
    trend: '+7%',
    avgCalories: 160,
    avgSets: '4 sets × 15 reps',
    equipmentBadge: 'Cable Machine',
  },
];

// ============================================================================
// REAL FITNESS EXERCISE ICONS FROM ICON LIBRARIES
// ============================================================================

export const RealExerciseIconBadge: React.FC<{
  elementKey: ExerciseElementKey;
  className?: string;
}> = ({ elementKey, className = '' }) => {
  switch (elementKey) {
    // 1. Incline Bench & Barbell Lifting
    case 'barbell-bench':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          {/* Circular badge container */}
          <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
            <GiWeightLiftingUp className="w-7 sm:w-9 h-7 sm:h-9 text-white drop-shadow-md" />
          </div>
          {/* Sub-badge: Olympic Barbell Icon from Tabler Icons */}
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-white text-[#F04D4E] flex items-center justify-center shadow-md border border-white/60">
            <TbBarbell className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      );

    // 2. High Intensity Interval Sprinting
    case 'hiit-sprint':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
            <GiSprint className="w-7 sm:w-9 h-7 sm:h-9 text-white drop-shadow-md" />
          </div>
          {/* Sub-badge: Running Trainer Shoe Icon */}
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-white text-[#4E6DFA] flex items-center justify-center shadow-md border border-white/60">
            <GiRunningShoe className="w-4 h-4" />
          </div>
        </div>
      );

    // 3. Weighted Pull-Ups & Lat Pulldowns
    case 'pullup-lat':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
            <GiMuscleUp className="w-7 sm:w-9 h-7 sm:h-9 text-white drop-shadow-md" />
          </div>
          {/* Sub-badge: Biceps / Back Muscle Icon */}
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-white text-[#38B26A] flex items-center justify-center shadow-md border border-white/60">
            <GiBiceps className="w-3.5 h-3.5" />
          </div>
        </div>
      );

    // 4. Barbell Romanian Deadlift & Heavy Weights
    case 'deadlift-kettlebell':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
            <GiWeight className="w-7 sm:w-9 h-7 sm:h-9 text-white drop-shadow-md" />
          </div>
          {/* Sub-badge: Barbell Icon from Ionicons */}
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-white text-[#F69E3D] flex items-center justify-center shadow-md border border-white/60">
            <IoBarbell className="w-3.5 h-3.5" />
          </div>
        </div>
      );

    // 5. Hex Dumbbells & Lunges
    case 'hex-dumbbells':
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
            <TbDumbbell className="w-7 sm:w-9 h-7 sm:h-9 text-white drop-shadow-md stroke-[2]" />
          </div>
          {/* Sub-badge: Solid Dumbbell Icon from FontAwesome6 */}
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-white text-[#E056A0] flex items-center justify-center shadow-md border border-white/60">
            <FaDumbbell className="w-3 h-3" />
          </div>
        </div>
      );

    // 6. Cable Pulley & Gym Bag / Machine
    default:
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
            <GiPulleyHook className="w-7 sm:w-9 h-7 sm:h-9 text-white drop-shadow-md" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-white text-[#8E44AD] flex items-center justify-center shadow-md border border-white/60">
            <GiGymBag className="w-3.5 h-3.5" />
          </div>
        </div>
      );
  }
};

const getExerciseTheme = (name: string, index: number): {
  elementKey: ExerciseElementKey;
  bgGradient: string;
  cardShadow: string;
} => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('bench') || lower.includes('chest') || lower.includes('press')) {
    return {
      elementKey: 'barbell-bench',
      bgGradient: 'bg-gradient-to-r from-[#F04D4E] to-[#FA6363]',
      cardShadow: 'hover:shadow-red-500/25',
    };
  }
  if (lower.includes('hiit') || lower.includes('sprint') || lower.includes('run') || lower.includes('cardio') || lower.includes('interval')) {
    return {
      elementKey: 'hiit-sprint',
      bgGradient: 'bg-gradient-to-r from-[#4E6DFA] to-[#6380FF]',
      cardShadow: 'hover:shadow-blue-500/25',
    };
  }
  if (lower.includes('pull') || lower.includes('lat') || lower.includes('back')) {
    return {
      elementKey: 'pullup-lat',
      bgGradient: 'bg-gradient-to-r from-[#38B26A] to-[#4ECB82]',
      cardShadow: 'hover:shadow-emerald-500/25',
    };
  }
  if (lower.includes('deadlift') || lower.includes('squat') || lower.includes('hamstring') || lower.includes('kettlebell')) {
    return {
      elementKey: 'deadlift-kettlebell',
      bgGradient: 'bg-gradient-to-r from-[#F69E3D] to-[#FAB15B]',
      cardShadow: 'hover:shadow-amber-500/25',
    };
  }
  if (lower.includes('lunge') || lower.includes('dumbbell') || lower.includes('arm') || lower.includes('curl')) {
    return {
      elementKey: 'hex-dumbbells',
      bgGradient: 'bg-gradient-to-r from-[#E056A0] to-[#F07DB8]',
      cardShadow: 'hover:shadow-pink-500/25',
    };
  }
  return {
    elementKey: 'cable-pulley',
    bgGradient: 'bg-gradient-to-r from-[#8E44AD] to-[#A569BD]',
    cardShadow: 'hover:shadow-purple-500/25',
  };
};

export const ExerciseLeaderboardCard: React.FC<ExerciseLeaderboardCardProps> = ({
  exercises,
  onSelectExercise,
  isDarkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'top5' | 'all' | 'new' | 'release'>('top5');

  // Build real dynamic rows from MongoDB exercise records
  const leaderboardRows = React.useMemo(() => {
    if (exercises && exercises.length > 0) {
      const topCount = exercises[0]?.count || 1;
      return exercises.map((ex, index) => {
        const theme = getExerciseTheme(ex.name, index);
        const scoreVal = Math.min(99, Math.max(68, Math.round((ex.count / topCount) * 98)));
        return {
          rank: index + 1,
          exerciseName: ex.name,
          category: ex.category,
          score: `${scoreVal}/100`,
          stars: scoreVal >= 90 ? 5 : scoreVal >= 75 ? 4 : 3,
          halfStar: scoreVal >= 85 && scoreVal < 90,
          bgGradient: theme.bgGradient,
          cardShadow: theme.cardShadow,
          elementKey: theme.elementKey,
          defaultLogs: ex.count,
          muscleGroup: ex.muscleGroup || 'Full Body',
          trend: ex.trend || '+12%',
          avgCalories: ex.avgCalories || 240,
          avgSets: ex.avgSets || '3 sets × 10 reps',
          equipmentBadge: ex.category,
          displayName: ex.name,
          logsCount: ex.count,
          liveExercise: ex,
        };
      });
    }

    return EXERCISE_PRESETS.map((preset) => ({
      ...preset,
      displayName: preset.exerciseName,
      logsCount: preset.defaultLogs,
      liveExercise: null,
    }));
  }, [exercises]);

  // Dynamic filtered tabs
  const displayItems = React.useMemo(() => {
    if (activeTab === 'top5') return leaderboardRows.slice(0, 5);
    if (activeTab === 'all') return leaderboardRows;
    if (activeTab === 'new') {
      return [...leaderboardRows]
        .sort((a, b) => (parseInt(b.trend) || 0) - (parseInt(a.trend) || 0))
        .slice(0, 5);
    }
    return [...leaderboardRows].reverse().slice(0, 5);
  }, [activeTab, leaderboardRows]);

  const handleRowClick = (item: (typeof leaderboardRows)[0]) => {
    if (item.liveExercise) {
      onSelectExercise(item.liveExercise);
    } else {
      onSelectExercise({
        id: `ex-${item.rank}`,
        name: item.displayName,
        category: item.category,
        count: item.logsCount,
        percentage: parseInt(item.score.split('/')[0], 10),
        muscleGroup: item.muscleGroup,
        trend: item.trend,
        trendDirection: 'up',
        avgCalories: item.avgCalories,
        avgSets: item.avgSets,
        isTrending: item.rank <= 2,
      });
    }
  };

  return (
    <div
      id="exercise-leaderboard-card-container"
      className="bg-white dark:bg-[#131418] rounded-[32px] border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-7 shadow-xs flex flex-col justify-between transition-all"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER NAVIGATION TABS (MATCHING ATTACHED SCREENSHOT UI) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        {/* Horizontal Navigation: Top 5, All, New, Relase Date */}
        <div className="flex items-center gap-5 sm:gap-7 select-none">
          <button
            id="tab-leaderboard-top5"
            onClick={() => setActiveTab('top5')}
            className={`text-base sm:text-lg font-['Outfit'] transition-colors cursor-pointer ${
              activeTab === 'top5'
                ? 'font-extrabold text-slate-900 dark:text-white'
                : 'font-medium text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            Top 5
          </button>

          <button
            id="tab-leaderboard-all"
            onClick={() => setActiveTab('all')}
            className={`text-base sm:text-lg font-['Outfit'] transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'font-extrabold text-slate-900 dark:text-white'
                : 'font-medium text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            All
          </button>

          <button
            id="tab-leaderboard-new"
            onClick={() => setActiveTab('new')}
            className={`text-base sm:text-lg font-['Outfit'] transition-colors cursor-pointer ${
              activeTab === 'new'
                ? 'font-extrabold text-slate-900 dark:text-white'
                : 'font-medium text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            New
          </button>

          <button
            id="tab-leaderboard-release"
            onClick={() => setActiveTab('release')}
            className={`text-base sm:text-lg font-['Outfit'] transition-colors cursor-pointer ${
              activeTab === 'release'
                ? 'font-extrabold text-slate-900 dark:text-white'
                : 'font-medium text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            Relase Date
          </button>
        </div>

        {/* Live Platform Badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-2xl border border-slate-200/60 dark:border-slate-800 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-['Outfit']">
            Live Platform Telemetry
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE 5 VIBRANT COLOR BANNER CARDS WITH REAL FITNESS EXERCISE ICONS */}
      {/* ========================================================================= */}
      <div className="space-y-3.5 sm:space-y-4">
        {displayItems.map((item) => {
          return (
            <div
              key={item.rank}
              id={`leaderboard-banner-card-${item.rank}`}
              onClick={() => handleRowClick(item)}
              className={`group relative ${item.bgGradient} rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 text-white cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${item.cardShadow} overflow-visible`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left Side: Large Number + Title + Stars */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  {/* Big White Number (Exact typography from design) */}
                  <span className="text-2xl sm:text-4xl font-extrabold font-['Outfit'] tracking-tight w-6 sm:w-8 text-center shrink-0 drop-shadow-xs">
                    {item.rank}
                  </span>

                  {/* Title & Star Rating */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-lg font-bold font-['Outfit'] text-white tracking-wide truncate leading-tight drop-shadow-xs">
                      {item.displayName}
                    </h4>

                    {/* Subtitle with muscle recruitment, equipment badge & live session logs */}
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/90 font-medium truncate mt-0.5">
                      <span>{item.muscleGroup}</span>
                      <span>•</span>
                      <span className="font-mono font-bold">{item.logsCount} logs</span>
                      <span>•</span>
                      <span className="font-semibold text-white/95">{item.trend}</span>
                    </div>

                    {/* 5 White Star Ratings */}
                    <div className="flex items-center gap-0.5 sm:gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((starIndex) => {
                        const isFilled = starIndex <= item.stars;
                        return (
                          <Star
                            key={starIndex}
                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${
                              isFilled
                                ? 'fill-white text-white drop-shadow-xs'
                                : 'fill-white/30 text-white/30'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side: Score + Real Exercise Icon from Icon Library */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0 pl-1">
                  {/* Score: 98/100 (98 is large, /100 is medium bold) */}
                  <div className="text-right select-none">
                    <span className="text-2xl sm:text-4xl font-extrabold font-['Outfit'] tracking-tight text-white drop-shadow-xs">
                      {item.score.split('/')[0]}
                    </span>
                    <span className="text-sm sm:text-lg font-bold text-white/90 font-['Outfit']">
                      /{item.score.split('/')[1] || '100'}
                    </span>
                  </div>

                  {/* Real Fitness Icon from Exercise Icon Library */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    <RealExerciseIconBadge elementKey={item.elementKey} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. CARD FOOTER NOTE */}
      {/* ========================================================================= */}
      <div className="pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-[#C4FA2A]" />
          <span>Exercise Protocol & Volume Leaderboard</span>
        </span>
        <span className="text-[10px] font-medium text-slate-400">Click any card for full movement drilldown</span>
      </div>
    </div>
  );
};
