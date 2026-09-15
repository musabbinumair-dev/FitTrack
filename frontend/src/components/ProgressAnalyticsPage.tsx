import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  ChevronDown,
  Plus,
  Calendar,
  Flame,
  Check,
  Dumbbell,
  Footprints,
  Waves,
  X,
  Activity,
} from 'lucide-react';
import {
  MdFreeBreakfast,
  MdLunchDining,
  MdDinnerDining,
  MdCookie,
} from 'react-icons/md';
import { GiWheat, GiAvocado, GiSteak } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { progressApi, workoutApi, nutritionApi, userApi } from '../lib/api';

interface ProgressAnalyticsPageProps {
  onLogNewEntry?: () => void;
  isDarkMode?: boolean;
}

export const ActiveCaloriesCard: React.FC<{
  periods: Array<{ label: string; calories: number }>;
  isDarkMode?: boolean;
}> = ({ periods, isDarkMode = false }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const values = periods.map((p) => p.calories);
  const total = values.reduce((sum, val) => sum + val, 0);
  const avg = Math.round(total / (periods.length || 1));
  const maxVal = Math.max(...values, 500);

  const activeIdx = hoveredIdx !== null ? hoveredIdx : periods.length - 1;
  const activeItem = periods[activeIdx] || { label: 'Today', calories: 0 };

  return (
    <div className="bg-[#121314] text-white border border-white/10 shadow-2xl rounded-[32px] p-6 flex flex-col justify-between transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col">
          <h3 className="text-lg sm:text-xl font-extrabold text-white font-['Outfit'] tracking-tight">Active Calories</h3>
          <span className="text-xs sm:text-[13px] font-medium text-[#8E8E93] font-sans">
            {activeItem.label}: {activeItem.calories.toLocaleString()} cal
          </span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center shrink-0 text-2xl select-none">
          🔥
        </div>
      </div>

      <div className="mb-4">
        <span className="text-xs sm:text-[13px] font-medium text-[#8E8E93] block font-sans mb-0.5">
          Avg this period
        </span>
        <div className="flex items-baseline">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
            {avg.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-[#8E8E93] ml-1.5 font-sans">
            cal
          </span>
        </div>
      </div>

      <div className="relative w-full h-28 mt-2">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
          <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="0" y="44" fill="#64748B" fontSize="9" fontWeight="bold" className="uppercase">{Math.round(maxVal)} CAL</text>

          {periods.map((item, i) => {
            const h = item.calories > 0 ? Math.max(8, (item.calories / maxVal) * 75) : 3;
            const w = 26;
            const x = 16 + i * 48;
            const y = 95 - h;
            const isHovered = i === activeIdx;

            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx="6"
                  fill={isHovered ? '#A3E635' : item.calories > 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}
                  className="transition-all duration-200"
                />
                <rect
                  x={x - 4}
                  y={10}
                  width={w + 8}
                  height={100}
                  fill="transparent"
                />
              </g>
            );
          })}

          <line x1="0" y1="96" x2="400" y2="96" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeOpacity="0.5" />

          {periods.map((item, i) => {
            const isHovered = i === activeIdx;
            const xCenter = 16 + i * 48 + 13;

            if (isHovered) {
              return (
                <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)}>
                  <rect
                    x={xCenter - 14}
                    y="102"
                    width="28"
                    height="16"
                    rx="8"
                    fill="#A3E635"
                  />
                  <text
                    x={xCenter}
                    y="114"
                    fill="#0D0D0D"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {item.label.slice(0, 3)}
                  </text>
                </g>
              );
            }

            return (
              <text
                key={i}
                x={xCenter}
                y="114"
                fill="#8E8E93"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
              >
                {item.label.slice(0, 3)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export const WeightTrendCard: React.FC<{
  entries: Array<{ date: string; weight: number }>;
  currentWeight: number;
  isDarkMode?: boolean;
  onOpenLogModal: () => void;
}> = ({ entries, currentWeight, isDarkMode = false, onOpenLogModal }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const dataList = entries.length > 0 ? entries : (currentWeight > 0 ? [{ date: 'Current', weight: currentWeight }] : []);
  const weights = dataList.map((d) => d.weight);
  const total = weights.reduce((sum, val) => sum + val, 0);
  const avg = weights.length > 0 ? (total / weights.length).toFixed(1) : (currentWeight || 0).toFixed(1);

  const minVal = weights.length > 0 ? Math.floor(Math.min(...weights) - 2) : 50;
  const maxVal = weights.length > 0 ? Math.ceil(Math.max(...weights) + 2) : 90;

  const getWeightY = (val: number) => {
    return 95 - ((val - minVal) / (maxVal - minVal || 1)) * 70;
  };

  const activeIdx = hoveredIdx !== null && hoveredIdx < dataList.length ? hoveredIdx : dataList.length - 1;
  const activeEntry = dataList[activeIdx] || { date: 'Current', weight: currentWeight || 0 };

  return (
    <div className="bg-white text-slate-900 border border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-[32px] p-6 flex flex-col justify-between transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">Weight Trend</h3>
          <span className="text-xs sm:text-[13px] font-medium text-slate-400 font-sans">
            {activeEntry.date}: {activeEntry.weight} kg
          </span>
        </div>
        <button
          onClick={onOpenLogModal}
          className="w-10 h-10 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          title="Log new weight"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <span className="text-xs sm:text-[13px] font-medium text-slate-400 block font-sans mb-0.5">
          Average
        </span>
        <div className="flex items-baseline">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
            {avg}
          </span>
          <span className="text-sm font-semibold text-slate-500 ml-1.5 font-sans">
            kg
          </span>
        </div>
      </div>

      <div className="relative w-full h-28 mt-2">
        {dataList.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">No weight entries logged yet</p>
            <button
              onClick={onOpenLogModal}
              className="mt-1 text-xs font-bold text-sky-600 dark:text-[#A3E635]"
            >
              + Log Weight Now
            </button>
          </div>
        ) : (
          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
            <g>
              <line x1="24" y1={getWeightY(maxVal)} x2="400" y2={getWeightY(maxVal)} stroke={isDarkMode ? '#334155' : '#E2E8F0'} strokeWidth="1" strokeDasharray="3 3" />
              <text x="0" y={getWeightY(maxVal) + 3} fill="#94A3B8" fontSize="9" fontWeight="bold">{maxVal}</text>
            </g>
            <g>
              <line x1="24" y1={getWeightY(minVal)} x2="400" y2={getWeightY(minVal)} stroke={isDarkMode ? '#334155' : '#E2E8F0'} strokeWidth="1" strokeDasharray="3 3" />
              <text x="0" y={getWeightY(minVal) + 3} fill="#94A3B8" fontSize="9" fontWeight="bold">{minVal}</text>
            </g>

            {dataList.length > 1 && (() => {
              const step = 370 / (dataList.length - 1);
              const points = dataList.map((entry, i) => {
                const x = 20 + i * step;
                const y = getWeightY(entry.weight);
                return `${x},${y}`;
              }).join(' ');

              return (
                <polyline
                  points={points}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })()}

            {dataList.map((entry, i) => {
              const step = dataList.length > 1 ? 370 / (dataList.length - 1) : 0;
              const x = dataList.length > 1 ? 20 + i * step : 200;
              const y = getWeightY(entry.weight);
              const isHovered = i === activeIdx;

              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    fill="#F59E0B"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all"
                  />
                  {isHovered && (
                    <g transform={`translate(${x}, ${y - 12})`}>
                      <rect
                        x="-24"
                        y="-20"
                        width="48"
                        height="18"
                        rx="9"
                        fill={isDarkMode ? '#1E293B' : '#0F172A'}
                      />
                      <text
                        x="0"
                        y="-8"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {entry.weight}kg
                      </text>
                    </g>
                  )}
                  <rect
                    x={x - 15}
                    y={10}
                    width={30}
                    height={100}
                    fill="transparent"
                  />
                </g>
              );
            })}

            <line x1="0" y1="96" x2="400" y2="96" stroke={isDarkMode ? '#334155' : '#E2E8F0'} strokeWidth="1" strokeOpacity="0.8" />

            {dataList.map((entry, i) => {
              const step = dataList.length > 1 ? 370 / (dataList.length - 1) : 0;
              const x = dataList.length > 1 ? 20 + i * step : 200;
              const isHovered = i === activeIdx;

              return (
                <text
                  key={i}
                  x={x}
                  y="114"
                  fill={isHovered ? (isDarkMode ? '#FFFFFF' : '#0F172A') : '#94A3B8'}
                  fontSize="9"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  textAnchor="middle"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                >
                  {entry.date.slice(0, 6)}
                </text>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};

export const ProgressAnalyticsPage: React.FC<ProgressAnalyticsPageProps> = ({
  onLogNewEntry,
  isDarkMode = false,
}) => {
  const { user } = useAuth();

  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '3M' | '6M' | '1Y'>('30D');
  const [selectedExercise, setSelectedExercise] = useState('Bench Press');
  const [isExerciseDropdownOpen, setIsExerciseDropdownOpen] = useState(false);
  const [selectedCalorieDayIdx, setSelectedCalorieDayIdx] = useState<number>(() => {
    const todayDay = (new Date().getDay() + 6) % 7;
    return todayDay;
  });
  const [hoveredStrengthIdx, setHoveredStrengthIdx] = useState<number | null>(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [metricDate, setMetricDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [metricWeight, setMetricWeight] = useState(user?.weight?.toString() || '');
  const [isSavingMetric, setIsSavingMetric] = useState(false);

  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [nutritionTrends, setNutritionTrends] = useState<any[]>([]);
  const [todayNutrition, setTodayNutrition] = useState<any>(null);

  const loadData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      const [metricsRes, logsRes, nutRes, todayNut] = await Promise.allSettled([
        progressApi.getMetrics(),
        workoutApi.getLogs(),
        progressApi.getNutritionAnalytics(),
        nutritionApi.getLog(todayStr),
      ]);

      if (metricsRes.status === 'fulfilled' && metricsRes.value?.metrics) {
        setMetricsHistory(metricsRes.value.metrics);
      }
      if (logsRes.status === 'fulfilled') {
        const logs = Array.isArray(logsRes.value) ? logsRes.value : logsRes.value?.data || logsRes.value?.logs || [];
        setWorkoutLogs(logs);
      }
      if (nutRes.status === 'fulfilled' && nutRes.value?.trends) {
        setNutritionTrends(nutRes.value.trends);
      }
      if (todayNut.status === 'fulfilled' && todayNut.value) {
        setTodayNutrition(todayNut.value);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const activeCaloriesPeriods = useMemo(() => {
    const now = new Date();
    const periodsCount = 8;
    const items: Array<{ label: string; calories: number }> = [];

    const daysInterval = timeRange === '7D' ? 1 : timeRange === '30D' ? 4 : timeRange === '3M' ? 11 : timeRange === '6M' ? 22 : 45;

    for (let i = periodsCount - 1; i >= 0; i--) {
      const pStart = new Date(now);
      pStart.setDate(now.getDate() - (i + 1) * daysInterval);
      const pEnd = new Date(now);
      pEnd.setDate(now.getDate() - i * daysInterval);

      const label = daysInterval === 1
        ? pEnd.toLocaleDateString('en-US', { weekday: 'short' })
        : pEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      let sumCals = 0;
      workoutLogs.forEach((log) => {
        const d = new Date(log.performedAt);
        if (d >= pStart && d <= pEnd) {
          sumCals += Number(log.caloriesBurned) || 0;
        }
      });

      items.push({ label, calories: sumCals });
    }

    return items;
  }, [workoutLogs, timeRange]);

  const weightTrendEntries = useMemo(() => {
    const entries: Array<{ date: string; weight: number }> = [];

    if (metricsHistory.length > 0) {
      metricsHistory.forEach((m) => {
        if (m.weight) {
          const dateStr = new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          entries.push({ date: dateStr, weight: Number(m.weight) });
        }
      });
    }

    if (entries.length === 0 && user?.weight) {
      if (user.startingWeight && user.startingWeight !== user.weight) {
        entries.push({ date: 'Start', weight: Number(user.startingWeight) });
      }
      entries.push({ date: 'Current', weight: Number(user.weight) });
    }

    return entries;
  }, [metricsHistory, user]);

  const exerciseOptions = useMemo(() => {
    const set = new Set<string>();
    workoutLogs.forEach((l) => {
      l.exercisesPerformed?.forEach((e: any) => {
        if (e.name) set.add(e.name);
      });
    });
    if (set.size === 0) {
      return ['Bench Press', 'Barbell Squat', 'Deadlift', 'Overhead Press', 'Pull-Ups'];
    }
    return Array.from(set);
  }, [workoutLogs]);

  useEffect(() => {
    if (exerciseOptions.length > 0 && !exerciseOptions.includes(selectedExercise)) {
      setSelectedExercise(exerciseOptions[0]);
    }
  }, [exerciseOptions, selectedExercise]);

  const activeExerciseData = useMemo(() => {
    const matchingSessions: Array<{ date: string; rawDate: Date; sets: string; weight: string; epley1RM: number }> = [];

    workoutLogs.forEach((log) => {
      const match = log.exercisesPerformed?.find(
        (e: any) => e.name?.toLowerCase().trim() === selectedExercise.toLowerCase().trim()
      );
      if (match) {
        const w = Number(match.weight) || 0;
        const r = Number(match.reps) || 1;
        const s = Number(match.sets) || 1;
        const epley = r > 1 ? w * (1 + r / 30) : w;
        const d = new Date(log.performedAt);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        matchingSessions.push({
          date: dateStr,
          rawDate: d,
          sets: `${s}×${r}`,
          weight: `${w}kg`,
          epley1RM: Math.round(epley),
        });
      }
    });

    matchingSessions.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    if (matchingSessions.length === 0) {
      return {
        best1RM: '0 kg',
        previous: '0 kg',
        progress: '0%',
        points: [] as Array<{ x: number; y: number; val: number; date: string }>,
        history: [] as Array<{ date: string; sets: string; weight: string; isPeak?: boolean }>,
      };
    }

    const max1RM = Math.max(...matchingSessions.map((s) => s.epley1RM));
    const latest1RM = matchingSessions[matchingSessions.length - 1].epley1RM;
    const prev1RM = matchingSessions.length > 1 ? matchingSessions[matchingSessions.length - 2].epley1RM : latest1RM;
    const progVal = prev1RM > 0 ? (((latest1RM - prev1RM) / prev1RM) * 100).toFixed(1) : '0';

    const history = [...matchingSessions].reverse().slice(0, 4).map((s) => ({
      date: s.date,
      sets: s.sets,
      weight: s.weight,
      isPeak: s.epley1RM === max1RM,
    }));

    return {
      best1RM: `${max1RM} kg`,
      previous: `${prev1RM} kg`,
      progress: `${Number(progVal) > 0 ? '+' : ''}${progVal}%`,
      points: matchingSessions.map((s) => ({
        val: s.epley1RM,
        date: s.date,
      })),
      history,
    };
  }, [workoutLogs, selectedExercise]);

  const currentMonthCalendar = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

    const days: Array<{
      id: string;
      date: number;
      type: 'rest' | 'dumbbell' | 'shoe' | 'waves' | 'bench';
      hasWorkout: boolean;
      isNextMonth?: boolean;
      isPrevMonth?: boolean;
    }> = [];

    const prevMonthTotal = new Date(year, month, 0).getDate();
    for (let p = firstDayIndex - 1; p >= 0; p--) {
      days.push({
        id: `prev-${prevMonthTotal - p}`,
        date: prevMonthTotal - p,
        type: 'rest',
        hasWorkout: false,
        isPrevMonth: true,
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasWorkouts = workoutLogs.filter((l) => {
        const d = new Date(l.performedAt).toISOString().split('T')[0];
        return d === dStr;
      });

      let type: 'rest' | 'dumbbell' | 'shoe' | 'waves' | 'bench' = 'rest';
      if (hasWorkouts.length > 0) {
        const first = hasWorkouts[0];
        const cat = (first.category || first.routineName || '').toLowerCase();
        if (cat.includes('run') || cat.includes('cardio')) type = 'shoe';
        else if (cat.includes('swim')) type = 'waves';
        else if (cat.includes('bench') || cat.includes('chest')) type = 'bench';
        else type = 'dumbbell';
      }

      days.push({
        id: `day-${i}`,
        date: i,
        type,
        hasWorkout: hasWorkouts.length > 0,
      });
    }

    while (days.length % 7 !== 0) {
      const nextDate = (days.length % 7) + 1;
      days.push({
        id: `next-${nextDate}`,
        date: nextDate,
        type: 'rest',
        hasWorkout: false,
        isNextMonth: true,
      });
    }

    const totalStreakActivities = days.filter((d) => !d.isPrevMonth && !d.isNextMonth && d.hasWorkout).length;
    const weekChunks = [0, 1, 2, 3, 4].filter((wIdx) => {
      const chunk = days.slice(wIdx * 7, (wIdx + 1) * 7);
      return chunk.some((d) => d.hasWorkout);
    }).length;

    return {
      monthName,
      days,
      totalStreakActivities,
      calculatedStreakWeeks: weekChunks,
    };
  }, [workoutLogs]);

  const calorieWeekDays = useMemo(() => {
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const now = new Date();
    const currDayIndex = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - currDayIndex);

    const goal = user?.calorieGoal || 2400;

    return dayLabels.map((day, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateNum = d.getDate();
      const dateStr = d.toISOString().split('T')[0];

      const matchingTrend = nutritionTrends.find((t) => t.date === dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const source = matchingTrend || (isToday ? todayNutrition : null);

      let totalCals = 0;
      let bCals = 0;
      let lCals = 0;
      let dCals = 0;
      let sCals = 0;
      let carbs = 0;
      let fats = 0;
      let protein = 0;

      if (source?.meals) {
        source.meals.forEach((m: any) => {
          const mType = (m.type || '').toLowerCase();
          const items = Array.isArray(m.items) ? m.items : [];
          const mCal = items.reduce((s: number, it: any) => s + (Number(it.calories) || 0), 0) || Number(m.calories) || 0;
          totalCals += mCal;

          if (mType === 'breakfast') bCals += mCal;
          else if (mType === 'lunch') lCals += mCal;
          else if (mType === 'dinner') dCals += mCal;
          else if (mType === 'snacks') sCals += mCal;

          items.forEach((it: any) => {
            carbs += Number(it.macros?.carbs) || 0;
            fats += Number(it.macros?.fat) || 0;
            protein += Number(it.macros?.protein) || 0;
          });
        });
      }

      if (totalCals === 0 && source?.totalCalories) {
        totalCals = Number(source.totalCalories) || 0;
      }

      const caloriesLeft = Math.max(0, goal - totalCals);

      return {
        day,
        date: dateNum,
        dateStr,
        totalCals,
        caloriesLeft,
        bCals,
        lCals,
        dCals,
        sCals,
        carbs,
        fats,
        protein,
      };
    });
  }, [nutritionTrends, todayNutrition, user]);

  const activeCalorieDay = calorieWeekDays[selectedCalorieDayIdx] || calorieWeekDays[0];

  const carbsGoal = user?.carbsGoal || 250;
  const fatsGoal = user?.fatsGoal || 70;
  const proteinGoal = user?.proteinGoal || 160;

  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricWeight) return;
    setIsSavingMetric(true);
    try {
      const weightNum = Number(metricWeight);
      await progressApi.createMetric({
        date: metricDate,
        weight: weightNum,
      });
      await userApi.updateProfile({
        weight: weightNum,
      });
      setIsLogModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save metric', err);
    } finally {
      setIsSavingMetric(false);
    }
  };

  const handleExport = () => {
    const content = `Fitness Progress Report\nDate: ${new Date().toLocaleDateString()}\nUser: ${user?.name || 'Athlete'}\nCurrent Weight: ${user?.weight || 0}kg\nSelected Exercise: ${selectedExercise}\nBest 1RM: ${activeExerciseData.best1RM}\nStreak: ${currentMonthCalendar.calculatedStreakWeeks} Weeks\nStreak Activities: ${currentMonthCalendar.totalStreakActivities}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="progress-analytics-page" className="w-full max-w-[1240px] mx-auto space-y-7 sm:space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-1">
        <div className="shrink-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit']">
            Progress & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Track your strength progression, weight trends, and nutritional balance over time.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <div className="bg-white dark:bg-[#202024] p-1 rounded-full flex items-center gap-1 border border-slate-200/90 dark:border-[#26262A] shadow-2xs">
            {(['7D', '30D', '3M', '6M', '1Y'] as const).map((range) => {
              const isActive = timeRange === range;
              return (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-950 dark:bg-[#A3E635] text-white dark:text-[#0D0D0D] font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {range}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleExport}
            title="Export Report"
            className="w-9 h-9 rounded-full bg-white dark:bg-[#202024] hover:bg-slate-100 dark:hover:bg-[#26262A] text-slate-700 dark:text-[#A1A1AA] hover:text-slate-950 dark:hover:text-white flex items-center justify-center border border-slate-200/90 dark:border-[#26262A] transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <Download className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
        <ActiveCaloriesCard periods={activeCaloriesPeriods} isDarkMode={isDarkMode} />
        <WeightTrendCard
          entries={weightTrendEntries}
          currentWeight={Number(user?.weight) || 0}
          isDarkMode={isDarkMode}
          onOpenLogModal={() => setIsLogModalOpen(true)}
        />
      </div>

      <div className="space-y-6 pt-2">
        <div className="space-y-5">
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white font-['Outfit'] tracking-tight">
            Training Analytics
          </h2>

          <div className={`rounded-[32px] p-6 space-y-6 relative overflow-hidden transition-all ${
            isDarkMode 
              ? "bg-[#18181B]/75 backdrop-blur-[24px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" 
              : "bg-white border border-[#F0F2F5] shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium font-sans">
                <span>Performance History ({timeRange})</span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsExerciseDropdownOpen(!isExerciseDropdownOpen)}
                  className="bg-[#F3F4F6] hover:bg-[#E5E7EB] dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent dark:border-slate-700 shadow-2xs font-sans"
                >
                  <span>{selectedExercise}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </button>

                {isExerciseDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#161618] border border-slate-200 dark:border-[#26262A] rounded-2xl shadow-xl py-1.5 z-20 font-sans max-h-56 overflow-y-auto">
                    {exerciseOptions.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setSelectedExercise(item);
                          setIsExerciseDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${
                          item === selectedExercise
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-0.5">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="text-xl sm:text-2xl md:text-[26px] font-extrabold text-[#111827] dark:text-white tracking-tight leading-none font-sans">
                  {activeExerciseData.best1RM}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal leading-tight font-sans">
                  Best 1RM
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="text-xl sm:text-2xl md:text-[26px] font-extrabold text-[#111827] dark:text-white tracking-tight leading-none font-sans">
                  {activeExerciseData.previous}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal leading-tight font-sans">
                  Previous
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="text-xl sm:text-2xl md:text-[26px] font-extrabold text-sky-600 dark:text-[#A3E635] tracking-tight leading-none font-sans">
                  {activeExerciseData.progress}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal leading-tight font-sans">
                  Progress
                </span>
              </div>
            </div>

            {(() => {
              const pts = activeExerciseData.points;
              if (pts.length === 0) {
                return (
                  <div className="w-full py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center">
                    <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No workout sessions recorded for {selectedExercise} yet.
                    </p>
                  </div>
                );
              }

              const svgWidth = 540;
              const svgHeight = 200;
              const xStart = 55;
              const xEnd = 515;
              const step = pts.length > 1 ? (xEnd - xStart) / (pts.length - 1) : 0;

              const maxVal = Math.max(...pts.map((p) => p.val), 50);
              const minVal = Math.max(0, Math.min(...pts.map((p) => p.val)) - 10);

              const coords = pts.map((p, idx) => ({
                x: pts.length > 1 ? xStart + idx * step : 285,
                y: Math.max(26, Math.min(155, 150 - ((p.val - minVal) / (maxVal - minVal || 1)) * 120)),
                val: p.val,
                date: p.date,
              }));

              const activeIdx = hoveredStrengthIdx !== null && hoveredStrengthIdx < coords.length
                ? hoveredStrengthIdx
                : coords.length - 1;
              const activePoint = coords[activeIdx];

              let polylineStr = coords.map((c) => `${c.x},${c.y}`).join(' ');

              return (
                <div className="w-full relative pt-1">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-auto overflow-visible select-none"
                  >
                    <defs>
                      <linearGradient id="strengthCurveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isDarkMode ? '#A3E635' : '#0284C7'} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={isDarkMode ? '#A3E635' : '#0284C7'} stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    {[
                      { y: 30, label: `${Math.round(maxVal)}kg` },
                      { y: 90, label: `${Math.round((maxVal + minVal) / 2)}kg` },
                      { y: 150, label: `${Math.round(minVal)}kg` },
                    ].map((lvl, idx) => (
                      <g key={idx}>
                        <text x="8" y={lvl.y + 3.5} fill={isDarkMode ? '#71717A' : '#9CA3AF'} fontSize="10">
                          {lvl.label}
                        </text>
                        <line x1="48" y1={lvl.y} x2="528" y2={lvl.y} stroke={isDarkMode ? '#27272A' : '#F1F5F9'} strokeWidth="1" strokeDasharray="3 4" />
                      </g>
                    ))}

                    {coords.length > 1 && (
                      <polyline
                        points={polylineStr}
                        fill="none"
                        stroke={isDarkMode ? '#A3E635' : '#0284C7'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {coords.map((pt, idx) => {
                      const isHovered = idx === activeIdx;
                      return (
                        <g
                          key={idx}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredStrengthIdx(idx)}
                          onMouseLeave={() => setHoveredStrengthIdx(null)}
                        >
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 6 : 4}
                            fill={isDarkMode ? '#A3E635' : '#0284C7'}
                            stroke="#FFFFFF"
                            strokeWidth="2"
                          />
                          <rect
                            x={pt.x - 20}
                            y={15}
                            width={40}
                            height={160}
                            fill="transparent"
                          />
                        </g>
                      );
                    })}

                    {activePoint && (
                      <g transform={`translate(${activePoint.x}, ${activePoint.y - 12})`}>
                        <rect
                          x="-30"
                          y="-24"
                          width="60"
                          height="20"
                          rx="10"
                          fill={isDarkMode ? '#1E1E22' : '#FFFFFF'}
                          stroke={isDarkMode ? '#2E2E34' : '#E2E8F0'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="-10"
                          textAnchor="middle"
                          fill={isDarkMode ? '#FFFFFF' : '#111827'}
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {activePoint.val} kg
                        </text>
                      </g>
                    )}

                    {coords.map((pt, idx) => (
                      <text
                        key={idx}
                        x={pt.x}
                        y="182"
                        textAnchor="middle"
                        fill={idx === activeIdx ? (isDarkMode ? '#FFFFFF' : '#111827') : (isDarkMode ? '#71717A' : '#9CA3AF')}
                        fontSize="10"
                        fontWeight={idx === activeIdx ? 'bold' : 'normal'}
                      >
                        {pt.date}
                      </text>
                    ))}
                  </svg>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-stretch">
            <div className={`rounded-[32px] p-5 sm:p-6 space-y-4 relative overflow-hidden transition-all flex flex-col justify-between ${
              isDarkMode 
                ? "bg-[#18181B]/75 backdrop-blur-[24px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" 
                : "bg-white border border-[#F0F2F5] shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit']">
                      Recent Activity
                    </h3>
                    <p className="text-xs sm:text-[13px] font-medium text-slate-400 dark:text-slate-400 font-sans mt-1">
                      {selectedExercise} · Latest logged sessions
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-sky-600 dark:text-[#A3E635] tracking-wider uppercase px-2.5 py-1 rounded-full bg-sky-50 dark:bg-white/5 border border-sky-100 dark:border-white/5 font-sans">
                    LOGS
                  </span>
                </div>

                {activeExerciseData.history.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-400">No workout logs found for this exercise</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 font-sans">
                    {activeExerciseData.history.map((hist, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100/80 dark:border-white/[0.03] last:border-0">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${hist.isPeak ? 'bg-sky-500 dark:bg-[#A3E635]' : 'bg-slate-200 dark:bg-[#26262A]'}`} />
                          <div>
                            <span className={`font-medium block ${hist.isPeak ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                              {hist.date}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              {hist.sets}
                            </span>
                          </div>
                        </div>
                        <strong className={`font-semibold text-sm ${hist.isPeak ? 'text-sky-600 dark:text-[#A3E635]' : 'text-slate-800 dark:text-white'}`}>
                          {hist.weight}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Personal Best</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{activeExerciseData.best1RM}</span>
              </div>
            </div>

            <div className="bg-[#121314] text-white border border-white/10 shadow-2xl rounded-[32px] p-6 sm:p-7 space-y-6 relative overflow-hidden transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white font-['Outfit']">
                  {currentMonthCalendar.monthName}
                </h3>
              </div>

              <div className="flex items-center gap-8 pt-1">
                <div>
                  <span className="text-xs sm:text-[13px] font-medium text-[#8E8E93] block font-sans">
                    Your Streak
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
                    {currentMonthCalendar.calculatedStreakWeeks} Weeks
                  </span>
                </div>
                <div>
                  <span className="text-xs sm:text-[13px] font-medium text-[#8E8E93] block font-sans">
                    Streak Activities
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
                    {currentMonthCalendar.totalStreakActivities}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4 pt-1">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                      <span key={idx} className="text-xs sm:text-[13px] font-bold text-slate-400 font-sans">
                        {day}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
                    {currentMonthCalendar.days.map((cell) => {
                      return (
                        <div
                          key={cell.id}
                          className="group relative flex items-center justify-center aspect-square rounded-full transition-all duration-150"
                        >
                          {!cell.hasWorkout ? (
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-[13px] font-semibold transition-colors ${
                              cell.isNextMonth || cell.isPrevMonth
                                ? 'bg-[#1C1C1E]/30 text-slate-600 border border-white/5'
                                : 'bg-[#222224] text-slate-400'
                            }`}>
                              {cell.date}
                            </div>
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-slate-950 flex items-center justify-center relative shadow-md shadow-white/10">
                              {cell.type === 'dumbbell' && <Dumbbell className="w-4 h-4 text-slate-900 stroke-[2.2]" />}
                              {cell.type === 'shoe' && <Footprints className="w-4 h-4 text-slate-900 stroke-[2.2]" />}
                              {cell.type === 'waves' && <Waves className="w-4 h-4 text-slate-900 stroke-[2.2]" />}
                              {cell.type === 'bench' && (
                                <svg className="w-4 h-4 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 17h18" />
                                  <path d="M5 17v3" />
                                  <path d="M19 17v3" />
                                  <path d="M4 12h16" />
                                  <path d="M8 7h8" />
                                  <path d="M12 7v5" />
                                </svg>
                              )}
                              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#C4FA2A] ring-2 ring-[#141416]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between py-1.5 px-1.5 rounded-full bg-[#18230F] border border-[#273D14] shadow-inner min-h-[250px] sm:min-h-[270px]">
                  {[0, 1, 2, 3].map((weekIdx) => {
                    const weekDays = currentMonthCalendar.days.slice(weekIdx * 7, (weekIdx + 1) * 7);
                    const hasWorkouts = weekDays.some((d) => d.hasWorkout);

                    return (
                      <div
                        key={weekIdx}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                          hasWorkouts
                            ? 'bg-[#C4FA2A] text-[#0D0D0D] font-black shadow-md shadow-[#C4FA2A]/30'
                            : 'bg-lime-950/40 text-lime-800/60'
                        }`}
                        title={`Week ${weekIdx + 1} status`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    );
                  })}

                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#C4FA2A] text-[#0D0D0D] flex items-center justify-center font-black shadow-lg shadow-[#C4FA2A]/30 gap-0.5 mt-1">
                    <Flame className="w-4.5 h-4.5 fill-[#0D0D0D] text-[#0D0D0D]" />
                    <span className="text-xs sm:text-[13px] leading-none font-sans font-black text-[#0D0D0D]">{currentMonthCalendar.calculatedStreakWeeks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white font-['Outfit'] tracking-tight">
            Nutrition Analytics
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
            <div className={`rounded-[32px] p-6 sm:p-7 space-y-6 relative overflow-hidden transition-all flex flex-col justify-between ${
              isDarkMode 
                ? "bg-[#141416] text-white border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]" 
                : "bg-white border border-[#F0F2F5] shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-slate-900"
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit']">
                    Calories
                  </h3>
                  <p className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1 font-sans">
                    Week Days ({activeCalorieDay.dateStr})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 sm:gap-3 md:gap-3.5 pt-1">
                {calorieWeekDays.map((item, idx) => {
                  const isSelected = selectedCalorieDayIdx === idx;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 sm:gap-2.5">
                      <span className="text-xs sm:text-[13px] font-bold text-slate-400 dark:text-slate-400 font-sans">
                        {item.day}
                      </span>

                      <button
                        onClick={() => setSelectedCalorieDayIdx(idx)}
                        className={`w-full max-w-[46px] sm:max-w-[56px] md:max-w-[64px] h-[115px] sm:h-[140px] md:h-[155px] lg:h-[165px] rounded-full flex flex-col items-center justify-between py-3.5 sm:py-4 px-1 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-[#F3F4F6] dark:bg-[#18230F] ring-1 ring-slate-200/50 dark:ring-[#273D14]'
                            : 'bg-[#F9FAFB] dark:bg-[#1C1C1F] hover:bg-[#F3F4F6] dark:hover:bg-[#25252A]'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 flex items-center justify-center mt-1">
                          <span
                            className={`rounded-full transition-colors ${
                              item.totalCals > 0
                                ? 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#000000] dark:bg-[#C4FA2A]'
                                : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-300 dark:bg-slate-700'
                            }`}
                          />
                        </div>

                        {isSelected ? (
                          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#BEE7EE] text-[#0F172A] dark:bg-[#C4FA2A] dark:text-[#0D0D0D] flex items-center justify-center font-bold text-[14px] sm:text-[15px] md:text-[16px] leading-none mb-0.5 shadow-xs">
                            {item.date}
                          </div>
                        ) : (
                          <span className="text-[14px] sm:text-[15px] md:text-[16px] font-normal text-[#1F2937] dark:text-slate-300 mb-2 sm:mb-2.5 leading-none">
                            {item.date}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <div className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 font-sans">
                      Calorie left
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
                        {activeCalorieDay.caloriesLeft.toLocaleString()}
                      </span>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 font-sans">
                        / {(user?.calorieGoal || 2400).toLocaleString()} kcal
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E0F2FE] text-[#0369A1] dark:bg-sky-950/60 dark:text-sky-300">
                      <MdFreeBreakfast size={13} />
                      <span>{activeCalorieDay.bCals} kcal</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300">
                      <MdLunchDining size={13} />
                      <span>{activeCalorieDay.lCals} kcal</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] dark:bg-amber-950/60 dark:text-amber-300">
                      <MdDinnerDining size={13} />
                      <span>{activeCalorieDay.dCals} kcal</span>
                    </span>
                    {activeCalorieDay.sCals > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFEDD5] text-[#C2410C] dark:bg-orange-950/60 dark:text-orange-300">
                        <MdCookie size={13} />
                        <span>{activeCalorieDay.sCals} kcal</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full h-8 rounded-2xl overflow-hidden flex bg-[#F9FAFB] dark:bg-[#1C1C1F] p-1 gap-1 border border-slate-100 dark:border-white/5">
                  {activeCalorieDay.totalCals === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-[11px] font-medium text-slate-400">
                      No meals logged for this day
                    </div>
                  ) : (
                    <>
                      {activeCalorieDay.bCals > 0 && (
                        <div
                          className="bg-[#BCE6F0] h-full rounded-xl flex items-center justify-center transition-all duration-500 text-[#0369A1] opacity-90"
                          style={{ width: `${(activeCalorieDay.bCals / activeCalorieDay.totalCals) * 100}%` }}
                          title={`Breakfast: ${activeCalorieDay.bCals} kcal`}
                        >
                          <MdFreeBreakfast size={14} />
                        </div>
                      )}
                      {activeCalorieDay.lCals > 0 && (
                        <div
                          className="bg-[#D2ECCB] h-full rounded-xl flex items-center justify-center transition-all duration-500 text-[#15803D] opacity-90"
                          style={{ width: `${(activeCalorieDay.lCals / activeCalorieDay.totalCals) * 100}%` }}
                          title={`Lunch: ${activeCalorieDay.lCals} kcal`}
                        >
                          <MdLunchDining size={14} />
                        </div>
                      )}
                      {activeCalorieDay.dCals > 0 && (
                        <div
                          className="bg-[#FBE89D] h-full rounded-xl flex items-center justify-center transition-all duration-500 text-[#B45309] opacity-90"
                          style={{ width: `${(activeCalorieDay.dCals / activeCalorieDay.totalCals) * 100}%` }}
                          title={`Dinner: ${activeCalorieDay.dCals} kcal`}
                        >
                          <MdDinnerDining size={14} />
                        </div>
                      )}
                      {activeCalorieDay.sCals > 0 && (
                        <div
                          className="bg-[#FED7AA] h-full rounded-xl flex items-center justify-center transition-all duration-500 text-[#C2410C] opacity-90"
                          style={{ width: `${(activeCalorieDay.sCals / activeCalorieDay.totalCals) * 100}%` }}
                          title={`Snacks: ${activeCalorieDay.sCals} kcal`}
                        >
                          <MdCookie size={14} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={`rounded-[32px] p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between transition-all ${
              isDarkMode 
                ? "bg-[#141416] text-white border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]" 
                : "bg-white text-slate-900 border border-[#F0F2F5] shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
                    Macronutrients
                  </h3>
                  <p className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1 font-sans">
                    Day Breakdown ({activeCalorieDay.dateStr})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-6 py-4 items-center my-auto">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                      <defs>
                        <linearGradient id="carbsProgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#A855F7" />
                          <stop offset="100%" stopColor="#9333EA" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="40"
                        cy="40"
                        r="31"
                        stroke="currentColor"
                        strokeWidth="7"
                        className="text-[#F3E8FF] dark:text-[#3B0764]/50 fill-none"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="31"
                        stroke="url(#carbsProgGrad)"
                        strokeWidth="7"
                        strokeDasharray={194.78}
                        strokeDashoffset={194.78 * (1 - Math.min(activeCalorieDay.carbs / (carbsGoal || 1), 1))}
                        strokeLinecap="round"
                        className="fill-none transition-all duration-700 ease-out"
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-purple-600 dark:text-purple-400 drop-shadow-xs">
                      <GiWheat size={28} />
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <span className="text-xs sm:text-[13px] font-medium text-slate-400 dark:text-slate-400 block font-sans">
                      Carbs
                    </span>
                    <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 block font-sans">
                      {Math.round(activeCalorieDay.carbs)} / {carbsGoal}g
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                      <defs>
                        <linearGradient id="fatsProgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FBBF24" />
                          <stop offset="100%" stopColor="#F59E0B" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="40"
                        cy="40"
                        r="31"
                        stroke="currentColor"
                        strokeWidth="7"
                        className="text-[#FEF9C3] dark:text-[#713F12]/40 fill-none"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="31"
                        stroke="url(#fatsProgGrad)"
                        strokeWidth="7"
                        strokeDasharray={194.78}
                        strokeDashoffset={194.78 * (1 - Math.min(activeCalorieDay.fats / (fatsGoal || 1), 1))}
                        strokeLinecap="round"
                        className="fill-none transition-all duration-700 ease-out"
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-amber-500 dark:text-amber-400 drop-shadow-xs">
                      <GiAvocado size={28} />
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <span className="text-xs sm:text-[13px] font-medium text-slate-400 dark:text-slate-400 block font-sans">
                      Fats
                    </span>
                    <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 block font-sans">
                      {Math.round(activeCalorieDay.fats)} / {fatsGoal}g
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                      <defs>
                        <linearGradient id="proteinProgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FB7185" />
                          <stop offset="100%" stopColor="#F43F5E" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="40"
                        cy="40"
                        r="31"
                        stroke="currentColor"
                        strokeWidth="7"
                        className="text-[#FCE7F3] dark:text-[#831843]/40 fill-none"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="31"
                        stroke="url(#proteinProgGrad)"
                        strokeWidth="7"
                        strokeDasharray={194.78}
                        strokeDashoffset={194.78 * (1 - Math.min(activeCalorieDay.protein / (proteinGoal || 1), 1))}
                        strokeLinecap="round"
                        className="fill-none transition-all duration-700 ease-out"
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-rose-500 dark:text-rose-400 drop-shadow-xs">
                      <GiSteak size={28} />
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <span className="text-xs sm:text-[13px] font-medium text-slate-400 dark:text-slate-400 block font-sans">
                      Protein
                    </span>
                    <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 block font-sans">
                      {Math.round(activeCalorieDay.protein)} / {proteinGoal}g
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 pb-8 flex justify-center">
        <button
          onClick={() => setIsLogModalOpen(true)}
          className="px-8 py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 dark:bg-[#C4FA2A] dark:hover:bg-[#d5ff48] text-white dark:text-[#0D0D0D] font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Weight Entry</span>
        </button>
      </div>

      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#18181B] text-slate-900 dark:text-white rounded-[32px] p-6 sm:p-8 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-['Outfit']">Log Weight</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Record your current body weight</p>
              </div>
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMetric} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={metricDate}
                  onChange={(e) => setMetricDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={metricWeight}
                  onChange={(e) => setMetricWeight(e.target.value)}
                  placeholder="e.g. 72.5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMetric}
                  className="flex-1 py-2.5 rounded-full bg-slate-950 dark:bg-[#A3E635] text-white dark:text-slate-950 text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {isSavingMetric ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
