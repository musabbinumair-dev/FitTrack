import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  UtensilsCrossed,
  Droplets,
  X,
  Check,
  Wheat,
  Salad,
  Apple,
  Flame,
  Dumbbell,
  ThumbsUp,
  Beef,
  Egg,
  EggFried,
  Coffee,
  Sun,
  SunMedium,
  Moon,
  CookingPot,
  Calendar,
  CalendarDays,
  Cookie,
  BarChart3,
  Filter,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { MdFreeBreakfast, MdLunchDining, MdDinnerDining, MdCookie, MdWaterDrop } from 'react-icons/md';
import { GiWheat, GiAvocado, GiSteak } from 'react-icons/gi';
import { MealLog, MealType } from '../types/fitness';
import { useNutrition } from '../hooks/useNutrition';
import { LogMealDrawer } from './LogMealDrawer';
import { AddFoodToMealDrawer } from './AddFoodToMealDrawer';
import { HydrationTrackerDrawer } from './HydrationTrackerDrawer';
import { EditFoodModal, LoggedFoodItem } from './EditFoodModal';
import { CalorieMacroGoalsModal } from './CalorieMacroGoalsModal';
import { CalendarModal } from './CalendarModal';
import { useAuth } from '../context/AuthContext';
import { useUnits } from '../context/UnitContext';
import { nutritionApi } from '../lib/api';

interface NutritionTrackerPageProps {
  isDarkMode?: boolean;
  onUpdateWater?: (amountMl: number) => void;
  onAddMeal?: (meal: Omit<MealLog, 'id' | 'timestamp'>) => void;
}

export const NutritionTrackerPage: React.FC<NutritionTrackerPageProps> = ({
  isDarkMode = false,
  onUpdateWater,
  onAddMeal,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const getCleanIsoDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFriendlyDateStr = (date: Date) => {
    const now = new Date();
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const monthShort = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();

    if (isSameDay(date, now)) return `Today, ${monthShort} ${day}`;
    if (isSameDay(date, yesterday)) return `Yesterday, ${monthShort} ${day}`;
    if (isSameDay(date, tomorrow)) return `Tomorrow, ${monthShort} ${day}`;
    return `${monthShort} ${day}, ${date.getFullYear()}`;
  };

  const { energyUnit, formatEnergy } = useUnits();

  // Date Range Filter State
  const [dateFilterMode, setDateFilterMode] = useState<'day' | 'range'>('day');
  const [rangePreset, setRangePreset] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom'>('today');
  const [customRangeStart, setCustomRangeStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [customRangeEnd, setCustomRangeEnd] = useState(() => new Date().toISOString().split('T')[0]);

  const [rangeLogs, setRangeLogs] = useState<any[]>([]);
  const [rangeLoading, setRangeLoading] = useState(false);

  const fetchRangeLogs = async (start: string, end: string) => {
    setRangeLoading(true);
    try {
      const res = await nutritionApi.getLogsRange(start, end);
      setRangeLogs(res?.logs || []);
    } catch (err) {
      console.error('Failed to fetch range logs:', err);
    } finally {
      setRangeLoading(false);
    }
  };

  const handleSelectPreset = (preset: 'today' | 'yesterday' | 'week' | 'month' | 'custom') => {
    setRangePreset(preset);
    const now = new Date();

    if (preset === 'today') {
      setDateFilterMode('day');
      setCurrentDate(now);
    } else if (preset === 'yesterday') {
      setDateFilterMode('day');
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      setCurrentDate(y);
    } else if (preset === 'week') {
      setDateFilterMode('range');
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      const startStr = getCleanIsoDate(start);
      const endStr = getCleanIsoDate(now);
      setCustomRangeStart(startStr);
      setCustomRangeEnd(endStr);
      fetchRangeLogs(startStr, endStr);
    } else if (preset === 'month') {
      setDateFilterMode('range');
      const start = new Date(now);
      start.setDate(now.getDate() - 29);
      const startStr = getCleanIsoDate(start);
      const endStr = getCleanIsoDate(now);
      setCustomRangeStart(startStr);
      setCustomRangeEnd(endStr);
      fetchRangeLogs(startStr, endStr);
    } else if (preset === 'custom') {
      setDateFilterMode('range');
      fetchRangeLogs(customRangeStart, customRangeEnd);
    }
  };

  const rangeAggregates = React.useMemo(() => {
    const totalCals = rangeLogs.reduce((acc, l) => acc + (Number(l.totalCalories) || 0), 0);
    const totalWaterMl = rangeLogs.reduce((acc, l) => acc + (Number(l.waterIntakeMl) || 0), 0);
    const totalProt = rangeLogs.reduce((acc, l) => acc + (Number(l.totalProtein) || 0), 0);
    const totalCarb = rangeLogs.reduce((acc, l) => acc + (Number(l.totalCarbs) || 0), 0);
    const totalFat = rangeLogs.reduce((acc, l) => acc + (Number(l.totalFat) || 0), 0);
    const loggedCount = rangeLogs.filter((l) => (l.totalCalories > 0 || l.waterIntakeMl > 0 || (l.meals && l.meals.length > 0))).length || (rangeLogs.length > 0 ? rangeLogs.length : 1);

    return {
      totalCalories: totalCals,
      avgCalories: Math.round(totalCals / loggedCount),
      totalWater: totalWaterMl,
      avgWater: Math.round(totalWaterMl / loggedCount),
      avgProtein: Math.round(totalProt / loggedCount),
      avgCarbs: Math.round(totalCarb / loggedCount),
      avgFats: Math.round(totalFat / loggedCount),
      loggedDaysCount: rangeLogs.filter((l) => (l.totalCalories > 0 || l.waterIntakeMl > 0)).length,
      totalDays: rangeLogs.length,
    };
  }, [rangeLogs]);

  const apiDateStr = getCleanIsoDate(currentDate);
  const selectedDate = getFriendlyDateStr(currentDate);

  const {
    log,
    loading,
    error,
    addMealItems,
    updateMealItem,
    deleteMealItem,
    updateWater,
    updateGoals,
  } = useNutrition(apiDateStr);

  const { user } = useAuth();
  const [waterTimeframe, setWaterTimeframe] = useState<'D' | 'W' | 'M'>('D');
  const waterMls = log?.waterIntakeMl ?? 0;
  const waterGoalMls = log?.waterGoalMl || user?.waterGoalMl || 3000;

  const calorieGoal = log?.calorieGoal || user?.calorieGoal || user?.dailyCalorieGoal || 2400;
  const proteinGoal = log?.proteinGoal || user?.proteinGoal || 160;
  const carbsGoal = log?.carbsGoal || user?.carbsGoal || 250;
  const fatsGoal = log?.fatsGoal || user?.fatsGoal || 70;

  const getMealItems = (type: string) => {
    const meal = log?.meals?.find((m: any) => m.type === type.toLowerCase());
    if (!meal || !Array.isArray(meal.items)) return [];
    return meal.items.map((it: any) => ({
      id: String(it._id || it.id || Math.random()),
      name: it.foodName || 'Food Item',
      calories: Number(it.calories) || 0,
      protein: Number(it.macros?.protein) || 0,
      carbs: Number(it.macros?.carbs) || 0,
      fats: Number(it.macros?.fat) || 0,
      unit: it.servingSize || '1 serving',
    }));
  };

  const breakfastItems = getMealItems('breakfast');
  const lunchItems = getMealItems('lunch');
  const dinnerItems = getMealItems('dinner');
  const snacksItems = getMealItems('snacks');

  const [isLogMealDrawerOpen, setIsLogMealDrawerOpen] = useState(false);
  const [isAddFoodToMealDrawerOpen, setIsAddFoodToMealDrawerOpen] = useState(false);
  const [isHydrationDrawerOpen, setIsHydrationDrawerOpen] = useState(false);
  const [isCalorieGoalsModalOpen, setIsCalorieGoalsModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [modalMealType, setModalMealType] = useState<MealType>('Breakfast');

  const [editingFoodState, setEditingFoodState] = useState<{
    item: LoggedFoodItem;
    mealType: MealType;
  } | null>(null);

  const handleOpenLogMeal = (mealType: MealType = 'Breakfast') => {
    setModalMealType(mealType);
    setIsLogMealDrawerOpen(true);
  };

  const handleOpenAddFoodForCard = (mealType: MealType = 'Breakfast') => {
    setModalMealType(mealType);
    setIsAddFoodToMealDrawerOpen(true);
  };

  const handleOpenEditModal = (item: LoggedFoodItem, mealType: MealType) => {
    setEditingFoodState({ item, mealType });
  };

  const handleUpdateLoggedFoodItem = async (updatedItem: LoggedFoodItem, mealType: MealType) => {
    try {
      await updateMealItem(updatedItem.id, {
        foodName: updatedItem.name,
        calories: updatedItem.calories,
        servingSize: updatedItem.unit || '1 serving',
        macros: {
          protein: updatedItem.protein,
          carbs: updatedItem.carbs,
          fat: updatedItem.fats,
        },
      });
    } catch (err) {
      console.error('Failed to update meal item:', err);
    }
  };

  const handleRemoveLoggedFoodItem = async (itemId: string, mealType: MealType) => {
    try {
      await deleteMealItem(itemId);
    } catch (err) {
      console.error('Failed to delete meal item:', err);
    }
  };

  const handleSaveGoals = async (newGoals: {
    targetCalories: number;
    proteinTarget: number;
    carbsTarget: number;
    fatsTarget: number;
  }) => {
    try {
      await updateGoals({
        calorieGoal: newGoals.targetCalories,
        proteinGoal: newGoals.proteinTarget,
        carbsGoal: newGoals.carbsTarget,
        fatsGoal: newGoals.fatsTarget,
      });
    } catch (err) {
      console.error('Failed to save goals:', err);
    }
  };

  const breakfastCals = breakfastItems.reduce((acc, item) => acc + item.calories, 0);
  const lunchCals = lunchItems.reduce((acc, item) => acc + item.calories, 0);
  const dinnerCals = dinnerItems.reduce((acc, item) => acc + item.calories, 0);
  const snacksCals = snacksItems.reduce((acc, item) => acc + item.calories, 0);

  const totalCaloriesConsumed = breakfastCals + lunchCals + dinnerCals + snacksCals;
  const caloriesRemaining = Math.max(calorieGoal - totalCaloriesConsumed, 0);
  const calorieProgressPercent = Math.min(Math.round((totalCaloriesConsumed / (calorieGoal || 1)) * 100), 100);

  const totalProtein =
    breakfastItems.reduce((acc, item) => acc + item.protein, 0) +
    lunchItems.reduce((acc, item) => acc + item.protein, 0) +
    dinnerItems.reduce((acc, item) => acc + item.protein, 0) +
    snacksItems.reduce((acc, item) => acc + item.protein, 0);

  const totalCarbs =
    breakfastItems.reduce((acc, item) => acc + item.carbs, 0) +
    lunchItems.reduce((acc, item) => acc + item.carbs, 0) +
    dinnerItems.reduce((acc, item) => acc + item.carbs, 0) +
    snacksItems.reduce((acc, item) => acc + item.carbs, 0);

  const totalFats =
    breakfastItems.reduce((acc, item) => acc + item.fats, 0) +
    lunchItems.reduce((acc, item) => acc + item.fats, 0) +
    dinnerItems.reduce((acc, item) => acc + item.fats, 0) +
    snacksItems.reduce((acc, item) => acc + item.fats, 0);

  const breakfastProtein = breakfastItems.reduce((acc, item) => acc + item.protein, 0);
  const breakfastCarbs = breakfastItems.reduce((acc, item) => acc + item.carbs, 0);
  const breakfastFats = breakfastItems.reduce((acc, item) => acc + item.fats, 0);

  const lunchProtein = lunchItems.reduce((acc, item) => acc + item.protein, 0);
  const lunchCarbs = lunchItems.reduce((acc, item) => acc + item.carbs, 0);
  const lunchFats = lunchItems.reduce((acc, item) => acc + item.fats, 0);

  const dinnerProtein = dinnerItems.reduce((acc, item) => acc + item.protein, 0);
  const dinnerCarbs = dinnerItems.reduce((acc, item) => acc + item.carbs, 0);
  const dinnerFats = dinnerItems.reduce((acc, item) => acc + item.fats, 0);

  const snacksProtein = snacksItems.reduce((acc, item) => acc + item.protein, 0);
  const snacksCarbs = snacksItems.reduce((acc, item) => acc + item.carbs, 0);
  const snacksFats = snacksItems.reduce((acc, item) => acc + item.fats, 0);

  const proteinPercent = Math.min(Math.round((totalProtein / (proteinGoal || 1)) * 100), 100);
  const carbsPercent = Math.min(Math.round((totalCarbs / (carbsGoal || 1)) * 100), 100);
  const fatsPercent = Math.min(Math.round((totalFats / (fatsGoal || 1)) * 100), 100);

  const handleAddWaterMls = async (amount: number) => {
    const newAmount = Math.max(0, Math.min(waterMls + amount, 6000));
    try {
      await updateWater(newAmount, waterGoalMls);
      if (onUpdateWater && amount > 0) {
        onUpdateWater(amount);
      }
    } catch (err) {
      console.error('Failed to update water:', err);
    }
  };

  const handleSetWaterMls = async (newMls: number) => {
    try {
      await updateWater(newMls, waterGoalMls);
    } catch (err) {
      console.error('Failed to set water:', err);
    }
  };

  const timeframeMultiplier = waterTimeframe === 'W' ? 7 : waterTimeframe === 'M' ? 30 : 1;
  const currentWaterDisplayMls = waterMls * timeframeMultiplier;
  const currentWaterTargetMls = waterGoalMls * timeframeMultiplier;
  const waterInLiters = (currentWaterDisplayMls / 1000).toFixed(2);
  const waterGoalLiters = (currentWaterTargetMls / 1000).toFixed(1);
  const isHydrationGoalReached = currentWaterDisplayMls >= currentWaterTargetMls;

  const handlePrevDate = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const handleNextDate = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const handleAddBatchMealItems = async (
    items: Array<{ name: string; calories: number; protein: number; carbs: number; fats: number }>,
    mealType: MealType
  ) => {
    try {
      const formattedForApi = items.map((it) => ({
        foodName: it.name,
        servingSize: '1 serving',
        calories: it.calories,
        macros: {
          protein: it.protein,
          carbs: it.carbs,
          fat: it.fats,
        },
      }));
      await addMealItems(mealType.toLowerCase(), formattedForApi);

      if (onAddMeal) {
        items.forEach((item) => {
          onAddMeal({
            mealType,
            name: item.name,
            calories: item.calories,
            proteinGrams: item.protein,
            carbsGrams: item.carbs,
            fatsGrams: item.fats,
            servingSize: '1 serving',
          });
        });
      }
    } catch (err) {
      console.error('Failed to add meal items:', err);
    }
  };

  return (
    <div
      id="nutrition-tracker-page"
      className="w-full max-w-[1240px] mx-auto space-y-6 sm:space-y-7 animate-in fade-in duration-200"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER ROW: Exact Title/Subtitle left + Date Pill & Log Meal Button right */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-1">
        {/* Left: Heading & Description */}
        <div className="shrink-0">
          <h1
            id="nutrition-page-title"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit']"
          >
            Nutrition &amp; Macro Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Log daily meals, monitor macros, and track daily water intake.
          </p>
        </div>

        {/* Right: Date Selector Pill + Calendar Button + Log Meal Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
          {/* Date Selector Pill */}
          <div
            id="date-selector-pill"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <button
              onClick={handlePrevDate}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="px-1 text-slate-800 dark:text-slate-100 font-medium hover:text-[#FF5500] dark:hover:text-orange-400 transition-colors cursor-pointer flex items-center gap-1"
              title="Click to open calendar"
            >
              <span>{selectedDate}</span>
            </button>
            <button
              onClick={handleNextDate}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Calendar Picker Button */}
          <button
            id="calendar-picker-btn"
            onClick={() => setIsCalendarModalOpen(true)}
            className="h-9 px-3.5 flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer text-xs font-bold font-['Outfit']"
            title="Select Date from Calendar"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 stroke-[2.2]" />
            <span className="hidden sm:inline">Calendar</span>
          </button>

          {/* + Log Meal Button */}
          <button
            id="log-meal-main-btn"
            onClick={() => handleOpenLogMeal('Breakfast')}
            className="h-9 px-4 flex items-center gap-1.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold font-['Outfit'] hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log Meal</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1B. NUTRITION TIMEFRAME & DATE RANGE FILTER BAR */}
      {/* ========================================================================= */}
      <div
        id="nutrition-filter-bar"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 shadow-2xs space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Timeframe:</span>
            </span>

            {[
              { key: 'today', label: 'Today' },
              { key: 'yesterday', label: 'Yesterday' },
              { key: 'week', label: 'Last 7 Days' },
              { key: 'month', label: 'Last 30 Days' },
              { key: 'custom', label: 'Custom Range' },
            ].map((p) => {
              const isActive = rangePreset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleSelectPreset(p.key as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-2xs'
                      : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Right indicator badge */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
            {dateFilterMode === 'day' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                ● Single Day View
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                ● Range Analysis View
              </span>
            )}
          </div>
        </div>

        {/* Custom Range Picker Drawer / Inputs when Custom Range is active */}
        {rangePreset === 'custom' && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">From:</span>
            <input
              type="date"
              value={customRangeStart}
              onChange={(e) => setCustomRangeStart(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="font-semibold text-slate-700 dark:text-slate-300">To:</span>
            <input
              type="date"
              value={customRangeEnd}
              onChange={(e) => setCustomRangeEnd(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => {
                setDateFilterMode('range');
                fetchRangeLogs(customRangeStart, customRangeEnd);
              }}
              className="px-3.5 py-1.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
            >
              Apply Custom Range
            </button>
          </div>
        )}
      </div>

      {dateFilterMode === 'range' ? (
        /* ========================================================================= */
        /* RANGE ANALYSIS VIEW */
        /* ========================================================================= */
        <div id="nutrition-range-analysis-view" className="space-y-6 animate-in fade-in duration-200">
          {/* Range Hero Card */}
          <div className="rounded-[28px] bg-gradient-to-br from-[#FAF3EE] to-[#F5EFEA] dark:from-[#28201C] dark:to-[#1F1916] border border-[#F3E5D8] dark:border-orange-950/60 p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-200/50 dark:border-orange-950/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/15 dark:bg-orange-500/25 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-['Outfit'] tracking-tight">
                      Range Nutrition Analysis
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 text-[10.5px] font-bold">
                      {rangeLogs.length} Days Evaluated
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                    Multi-day nutrition summary from <strong className="text-slate-700 dark:text-slate-300">{customRangeStart}</strong> to <strong className="text-slate-700 dark:text-slate-300">{customRangeEnd}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectPreset('today')}
                className="px-4 py-2 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold font-['Outfit'] hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
              >
                Switch to Today&apos;s Logger
              </button>
            </div>

            {/* Range KPI Aggregates Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Daily Average Energy</span>
                <span className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-['Outfit'] block">
                  {formatEnergy(rangeAggregates.avgCalories)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Total: {formatEnergy(rangeAggregates.totalCalories)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Avg Water Intake</span>
                <span className="text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-400 font-['Outfit'] block">
                  {rangeAggregates.avgWater} ml
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Total: {(rangeAggregates.totalWater / 1000).toFixed(1)} L
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Avg Daily Macros</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] block pt-0.5">
                  {rangeAggregates.avgProtein}g P • {rangeAggregates.avgCarbs}g C • {rangeAggregates.avgFats}g F
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Across tracked days
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Tracking Consistency</span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-['Outfit'] block">
                  {rangeAggregates.loggedDaysCount} / {rangeAggregates.totalDays}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Active log days
                </span>
              </div>
            </div>
          </div>

          {/* Daily Breakdown List */}
          <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white font-['Outfit']">
                  Daily Logs in Selected Range
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click on any day to open its detailed meal log and entries.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {rangeLogs.length} entries
              </span>
            </div>

            {rangeLoading ? (
              <div className="py-16 text-center text-xs font-medium text-slate-500">
                Loading date range logs...
              </div>
            ) : rangeLogs.length === 0 ? (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
                No logs recorded for this date range. Try switching presets or logging meals.
              </div>
            ) : (
              <div className="space-y-2.5">
                {rangeLogs.map((l: any) => {
                  const dayDate = new Date(l.date + 'T00:00:00');
                  const formattedDay = dayDate.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const isToday = l.date === getCleanIsoDate(new Date());

                  return (
                    <div
                      key={l._id || l.date}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-slate-200 shadow-2xs">
                          {dayDate.getDate()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-950 dark:text-white font-['Outfit']">
                              {formattedDay}
                            </h4>
                            {isToday && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                                Today
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {l.meals?.length || 0} meals logged • {l.waterIntakeMl || 0} ml water
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-950 dark:text-white font-['Outfit'] block">
                            {formatEnergy(l.totalCalories || 0)}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {l.totalProtein || 0}g P • {l.totalCarbs || 0}g C • {l.totalFat || 0}g F
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentDate(new Date(l.date + 'T00:00:00'));
                            setDateFilterMode('day');
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold font-['Outfit'] hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-2xs"
                        >
                          View Day
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* SINGLE DAY TRACKER VIEW */
        /* ========================================================================= */
        <>
          {/* ========================================================================= */}
          {/* 2A. CALORIE GOAL TRACKER (Hero Card) */}
          {/* ========================================================================= */}
          <div
            id="calories-goal-tracker-card"
            className="rounded-[24px] sm:rounded-[28px] bg-[#FAF3EE] dark:bg-[#28201C] border border-[#F3E5D8]/80 dark:border-orange-950/60 p-5 sm:p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3.5 transition-all"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                  <Flame className="w-4.5 h-4.5 text-[#FF5500] fill-[#FF5500]" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-['Outfit'] block">
                  CALORIE GOAL TRACKER
                </span>
              </div>

              {/* Remaining Calorie Pill Badge */}
              <button
                type="button"
                onClick={() => setIsCalorieGoalsModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-[#F3E5D8] dark:border-orange-900/40 text-[#D94800] dark:text-orange-300 text-xs font-bold tracking-tight font-['Outfit'] shadow-2xs cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
                title="Edit Calorie & Macro Goals"
              >
                {formatEnergy(caloriesRemaining)} remaining
              </button>
            </div>

            <div className="flex items-baseline gap-1.5 font-['Outfit'] pt-1">
              <span className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-slate-950 dark:text-white tracking-tight leading-none">
                {formatEnergy(totalCaloriesConsumed, false)}
              </span>
              <span className="text-sm sm:text-base font-semibold text-slate-500 dark:text-slate-400">
                / {formatEnergy(calorieGoal)}
              </span>
            </div>

            {/* Calorie Progress Bar */}
            <div
              onClick={() => setIsCalorieGoalsModalOpen(true)}
              className="space-y-1.5 pt-1 cursor-pointer group"
              title="Edit Calorie & Macro Goals"
            >
              <div className="w-full h-3 rounded-full bg-orange-200/50 dark:bg-orange-950/60 overflow-hidden p-0.5 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/80 transition-colors">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF5500] shadow-2xs transition-all duration-500 ease-out"
                  style={{ width: `${calorieProgressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 font-['Outfit'] px-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                <span>0 {energyUnit}</span>
                <span>{calorieProgressPercent}% of daily goal</span>
                <span>{formatEnergy(calorieGoal)}</span>
              </div>
            </div>
          </div>

      {/* ========================================================================= */}
      {/* 2B. 3 MACRO KPI CARDS ROW: Protein, Carbs, Fats (Reference image design) */}
      {/* ========================================================================= */}
      <div id="nutrition-macros-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
        <div
          id="nutrition-kpi-protein"
          className="rounded-[24px] sm:rounded-[28px] bg-[#F3EEFE] dark:bg-[#251E33] border border-purple-100/70 dark:border-purple-950/40 p-4.5 sm:p-5 md:p-6 flex flex-col justify-between min-h-[140px] sm:min-h-[150px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-0.5 duration-200"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#7C3AED] dark:text-purple-400 shrink-0">
                <GiSteak size={19} />
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
                Protein
              </span>
            </div>
            <span className="text-xs font-bold text-[#7C3AED] dark:text-purple-400 font-['Outfit'] bg-purple-100/80 dark:bg-purple-950/80 px-2.5 py-0.5 rounded-full">
              {proteinPercent}%
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#4C1D95] dark:text-purple-100 tracking-tight leading-none font-['Outfit']">
                {totalProtein}g
              </span>
              <span className="text-xs font-semibold text-[#8B5CF6] dark:text-purple-300">
                / {proteinGoal}g goal
              </span>
            </div>
            <div className="w-full bg-purple-200/60 dark:bg-purple-950/60 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-[#7C3AED] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div
          id="nutrition-kpi-carbs"
          className="rounded-[24px] sm:rounded-[28px] bg-[#FAF5ED] dark:bg-[#2B261D] border border-amber-100/70 dark:border-amber-950/40 p-4.5 sm:p-5 md:p-6 flex flex-col justify-between min-h-[140px] sm:min-h-[150px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-0.5 duration-200"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#D97706] dark:text-amber-400 shrink-0">
                <GiWheat size={19} />
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
                Carbs
              </span>
            </div>
            <span className="text-xs font-bold text-[#D97706] dark:text-amber-400 font-['Outfit'] bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full">
              {carbsPercent}%
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#9A3412] dark:text-amber-100 tracking-tight leading-none font-['Outfit']">
                {totalCarbs}g
              </span>
              <span className="text-xs font-semibold text-[#D97706] dark:text-amber-300">
                / {carbsGoal}g goal
              </span>
            </div>
            <div className="w-full bg-amber-200/60 dark:bg-amber-950/60 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-[#D97706] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div
          id="nutrition-kpi-fats"
          className="rounded-[24px] sm:rounded-[28px] bg-[#EFF8F2] dark:bg-[#1C2C23] border border-emerald-100/70 dark:border-emerald-950/40 p-4.5 sm:p-5 md:p-6 flex flex-col justify-between min-h-[140px] sm:min-h-[150px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-0.5 duration-200"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#0D9488] dark:text-teal-400 shrink-0">
                <GiAvocado size={19} />
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
                Fats
              </span>
            </div>
            <span className="text-xs font-bold text-[#0D9488] dark:text-teal-400 font-['Outfit'] bg-teal-100/80 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-full">
              {fatsPercent}%
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#115E59] dark:text-teal-100 tracking-tight leading-none font-['Outfit']">
                {totalFats}g
              </span>
              <span className="text-xs font-semibold text-[#0D9488] dark:text-teal-300">
                / {fatsGoal}g goal
              </span>
            </div>
            <div className="w-full bg-teal-200/60 dark:bg-teal-950/60 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-[#0D9488] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${fatsPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 2x2 GRID: Breakfast, Lunch, Dinner, Daily Water Intake (Tablet: md:grid-cols-2) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {/* CARD 1: BREAKFAST */}
        <div
          id="meal-card-breakfast"
          className="rounded-[28px] bg-white dark:bg-slate-900 p-6 sm:p-6.5 border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col justify-between min-h-[310px]"
        >
          {/* Top Row: Icon + Title + Calorie + Macro Badge */}
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                {/* Circle Icon Badge */}
                <div className="w-9 h-9 rounded-full bg-[#FEF3C7] dark:bg-amber-950/50 flex items-center justify-center text-[#D97706] dark:text-amber-400 shrink-0">
                  <MdFreeBreakfast size={18} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white font-['Outfit'] leading-tight">
                    Breakfast
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatEnergy(breakfastCals)}
                  </p>
                </div>
              </div>

              {/* Macro Capsule Pill */}
              <div className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300 tracking-tight shrink-0">
                {breakfastProtein}g P • {breakfastCarbs}g C • {breakfastFats}g F
              </div>
            </div>

            {/* Food Items List */}
            {breakfastItems.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200/90 dark:border-slate-800 rounded-2xl p-7 my-4 text-center flex flex-col items-center justify-center">
                <CookingPot className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  No items logged yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 my-2">
                {breakfastItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenEditModal(item, 'Breakfast')}
                    className="py-3.5 px-2 -mx-2 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                      {item.name}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-['Outfit'] shrink-0">
                      {formatEnergy(item.calories)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Button */}
          <div className="pt-3">
            <button
              onClick={() => handleOpenAddFoodForCard('Breakfast')}
              className="w-full py-2.5 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs font-bold font-['Outfit'] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Food</span>
            </button>
          </div>
        </div>

        {/* CARD 2: LUNCH */}
        <div
          id="meal-card-lunch"
          className="rounded-[28px] bg-white dark:bg-slate-900 p-6 sm:p-6.5 border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col justify-between min-h-[310px]"
        >
          {/* Top Row: Icon + Title + Calorie + Macro Badge */}
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                {/* Circle Icon Badge */}
                <div className="w-9 h-9 rounded-full bg-[#EAF7EE] dark:bg-emerald-950/50 flex items-center justify-center text-[#218341] dark:text-emerald-400 shrink-0">
                  <MdLunchDining size={18} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white font-['Outfit'] leading-tight">
                    Lunch
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatEnergy(lunchCals)}
                  </p>
                </div>
              </div>

              {/* Macro Capsule Pill */}
              <div className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300 tracking-tight shrink-0">
                {lunchProtein}g P • {lunchCarbs}g C • {lunchFats}g F
              </div>
            </div>

            {/* Food Items List */}
            {lunchItems.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200/90 dark:border-slate-800 rounded-2xl p-7 my-4 text-center flex flex-col items-center justify-center">
                <CookingPot className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  No items logged yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 my-2">
                {lunchItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenEditModal(item, 'Lunch')}
                    className="py-3.5 px-2 -mx-2 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                      {item.name}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-['Outfit'] shrink-0">
                      {formatEnergy(item.calories)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Button */}
          <div className="pt-3">
            <button
              onClick={() => handleOpenAddFoodForCard('Lunch')}
              className="w-full py-2.5 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs font-bold font-['Outfit'] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Food</span>
            </button>
          </div>
        </div>

        {/* CARD 3: DINNER */}
        <div
          id="meal-card-dinner"
          className="rounded-[28px] bg-white dark:bg-slate-900 p-6 sm:p-6.5 border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col justify-between min-h-[310px]"
        >
          {/* Top Row: Icon + Title + Calorie */}
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                {/* Circle Icon Badge */}
                <div className="w-9 h-9 rounded-full bg-[#F3EDFF] dark:bg-purple-950/50 flex items-center justify-center text-[#8B5CF6] dark:text-purple-400 shrink-0">
                  <MdDinnerDining size={18} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white font-['Outfit'] leading-tight">
                    Dinner
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {dinnerCals > 0 ? formatEnergy(dinnerCals) : `Planned ~${formatEnergy(600)}`}
                  </p>
                </div>
              </div>

              {/* Macro Capsule Pill */}
              {dinnerItems.length > 0 && (
                <div className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300 tracking-tight shrink-0">
                  {dinnerProtein}g P • {dinnerCarbs}g C • {dinnerFats}g F
                </div>
              )}
            </div>

            {/* Empty State / Food Items */}
            {dinnerItems.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200/90 dark:border-slate-800 rounded-2xl p-7 my-4 text-center flex flex-col items-center justify-center">
                <CookingPot className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  No items logged yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 my-2">
                {dinnerItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenEditModal(item, 'Dinner')}
                    className="py-3.5 px-2 -mx-2 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                      {item.name}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-['Outfit'] shrink-0">
                      {formatEnergy(item.calories)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Button */}
          <div className="pt-3">
            <button
              onClick={() => handleOpenAddFoodForCard('Dinner')}
              className="w-full py-3 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold font-['Outfit'] hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Log Dinner Now</span>
            </button>
          </div>
        </div>

        <div
          id="meal-card-snacks"
          className="rounded-[28px] bg-white dark:bg-slate-900 p-6 sm:p-6.5 border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col justify-between min-h-[310px]"
        >
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FFF7ED] dark:bg-orange-950/50 flex items-center justify-center text-[#EA580C] dark:text-orange-400 shrink-0">
                  <MdCookie size={18} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white font-['Outfit'] leading-tight">
                    Snacks
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatEnergy(snacksCals)}
                  </p>
                </div>
              </div>

              {snacksItems.length > 0 && (
                <div className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300 tracking-tight shrink-0">
                  {snacksProtein}g P • {snacksCarbs}g C • {snacksFats}g F
                </div>
              )}
            </div>

            {snacksItems.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200/90 dark:border-slate-800 rounded-2xl p-7 my-4 text-center flex flex-col items-center justify-center">
                <CookingPot className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  No items logged yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 my-2">
                {snacksItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenEditModal(item, 'Snacks')}
                    className="py-3.5 px-2 -mx-2 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                      {item.name}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-['Outfit'] shrink-0">
                      {formatEnergy(item.calories)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3">
            <button
              onClick={() => handleOpenAddFoodForCard('Snacks')}
              className="w-full py-2.5 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs font-bold font-['Outfit'] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Food to Snacks</span>
            </button>
          </div>
        </div>

        <div
          id="daily-water-intake-card"
          onClick={() => setIsHydrationDrawerOpen(true)}
          className="md:col-span-2 rounded-[28px] sm:rounded-[32px] bg-[#80CBEB] dark:bg-[#1B4660] border border-[#A0D4EE]/60 dark:border-sky-900/50 p-5 sm:p-6.5 shadow-[0_4px_24px_rgba(128,203,235,0.3)] dark:shadow-none flex flex-col justify-between min-h-[330px] transition-all relative overflow-hidden cursor-pointer hover:scale-[1.005] hover:shadow-xl group"
        >
          {/* Top Section: Title & Quote on Left, Cup Grid Matrix on Right */}
          <div className="grid grid-cols-12 gap-3 sm:gap-4 items-start">
            {/* Left Column (7 Cols): Hydration Status Title & Motivational Text */}
            <div className="col-span-7">
              <h3 className="text-[15px] font-normal text-white tracking-tight font-['Outfit']">
                Hydration Status:
              </h3>
              <p className="text-[11px] font-normal text-white/80 mt-1 max-w-[170px] leading-[1.35]">
                Drinking enough water daily boosts your energy and keeps you focused.
              </p>

              {/* Status Badge (Exact yellow-lime pill) */}
              <div className="mt-4">
                {isHydrationGoalReached ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#DEFA28] text-slate-950 font-bold text-[11px] rounded-full shadow-2xs">
                    <span>Well Done</span>
                    <ThumbsUp className="w-3 h-3 fill-slate-950 text-slate-950 stroke-[2]" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/20 text-white font-medium text-[11px] rounded-full backdrop-blur-xs border border-white/25">
                    <span>On Track</span>
                    <span className="text-xs">💧</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right Column (5 Cols): Matrix Cup Grid (24 Cups in 6x4 Grid) */}
            <div className="col-span-5 flex justify-end">
              <div className="grid grid-cols-6 gap-x-1.5 gap-y-1.5 p-1 bg-white/10 rounded-2xl backdrop-blur-xs">
                {Array.from({ length: 24 }).map((_, idx) => {
                  const targetFilledIndex = Math.min(
                    Math.floor((waterMls / (waterGoalMls || 1)) * 24),
                    24
                  );
                  const isCupFilled = idx < targetFilledIndex;

                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        const newMls = Math.round(((idx + 1) / 24) * waterGoalMls);
                        handleSetWaterMls(newMls);
                      }}
                      title={`Set water to ${Math.round(((idx + 1) / 24) * waterGoalMls)} ml`}
                      className="cursor-pointer focus:outline-none transition-transform hover:scale-110"
                    >
                      <svg viewBox="0 0 16 19" className="w-3.5 h-4.5">
                        <path
                          d="M 1.2 1.5 L 2.8 15.8 C 2.95 17.2 4.1 18.2 5.5 18.2 L 10.5 18.2 C 11.9 18.2 13.05 17.2 13.2 15.8 L 14.8 1.5 C 14.95 0.5 14.2 0 13.2 0 L 2.8 0 C 1.8 0 1.05 0.5 1.2 1.5 Z"
                          fill={isCupFilled ? '#477797' : '#FFFFFF'}
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Section: D/W/M + Add Buttons on Left, Big Liter Display on Right */}
          <div className="pt-5 flex flex-wrap items-end justify-between gap-4 mt-auto border-t border-white/20">
            {/* Left Controls: Timeframe Selector (D W M) + Log Buttons */}
            <div className="space-y-3">
              {/* D / W / M Toggle Circles */}
              <div className="flex items-center gap-2">
                {(['D', 'W', 'M'] as const).map((tf) => {
                  const isActive = waterTimeframe === tf;
                  return (
                    <button
                      key={tf}
                      onClick={(e) => {
                        e.stopPropagation();
                        setWaterTimeframe(tf);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${isActive
                          ? 'bg-white text-slate-900 shadow-xs scale-105'
                          : 'bg-white/25 hover:bg-white/35 text-white'
                        }`}
                    >
                      {tf}
                    </button>
                  );
                })}
              </div>

              {/* Quick Adjustment Pill Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddWaterMls(-250);
                  }}
                  className="px-2.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white text-xs font-semibold font-['Outfit'] transition-all cursor-pointer backdrop-blur-xs border border-white/20"
                  title="Remove 250ml"
                >
                  - 250ml
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddWaterMls(250);
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/30 hover:bg-white/40 active:scale-95 text-white text-xs font-semibold font-['Outfit'] transition-all cursor-pointer backdrop-blur-xs border border-white/20"
                >
                  + 250ml
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddWaterMls(500);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white text-slate-900 hover:bg-white/95 active:scale-95 text-xs font-bold font-['Outfit'] transition-all cursor-pointer shadow-2xs"
                >
                  + 500ml
                </button>
              </div>
            </div>

            {/* Right Display: Big Liters + /Day or /Week or /Month */}
            <div className="text-right">
              <div className="text-4xl sm:text-[46px] font-light text-white tracking-tight leading-none font-['Outfit']">
                {waterInLiters}L
              </div>
              <div className="text-xs font-normal text-white/85 mt-1 tracking-tight">
                /{waterTimeframe === 'W' ? 'Week' : waterTimeframe === 'M' ? 'Month' : 'Day'}
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. SIDEBAR DRAWERS: Log Meal & Specific Add Food To Meal Drawers */}
      {/* ========================================================================= */}
      {/* Main Multi-Category Food Search Drawer */}
      <LogMealDrawer
        isOpen={isLogMealDrawerOpen}
        onClose={() => setIsLogMealDrawerOpen(false)}
        selectedMealType={modalMealType}
        onSelectMealType={(type) => setModalMealType(type)}
        onAddMealItems={handleAddBatchMealItems}
      />

      {/* Specific Meal Drawer matching exact uploaded screenshot layout */}
      <AddFoodToMealDrawer
        isOpen={isAddFoodToMealDrawerOpen}
        onClose={() => setIsAddFoodToMealDrawerOpen(false)}
        mealType={modalMealType}
        onAddMealItems={handleAddBatchMealItems}
      />

      {/* Hydration Tracker Drawer matching exact uploaded screenshot layout */}
      <HydrationTrackerDrawer
        isOpen={isHydrationDrawerOpen}
        onClose={() => setIsHydrationDrawerOpen(false)}
        waterMls={waterMls}
        waterGoalMls={waterGoalMls}
        onUpdateWater={handleAddWaterMls}
      />

      {/* Edit Logged Food Item Modal matching exact uploaded screenshot layout */}
      {editingFoodState && (
        <EditFoodModal
          isOpen={!!editingFoodState}
          onClose={() => setEditingFoodState(null)}
          item={editingFoodState.item}
          mealType={editingFoodState.mealType}
          onUpdateItem={handleUpdateLoggedFoodItem}
          onRemoveItem={handleRemoveLoggedFoodItem}
        />
      )}

      {/* Calorie & Macro Goals Modal matching exact uploaded screenshot layout */}
      <CalorieMacroGoalsModal
        isOpen={isCalorieGoalsModalOpen}
        onClose={() => setIsCalorieGoalsModalOpen(false)}
        targetCalories={calorieGoal}
        proteinTarget={proteinGoal}
        carbsTarget={carbsGoal}
        fatsTarget={fatsGoal}
        onSaveGoals={handleSaveGoals}
      />

      {/* Interactive Calendar Date Picker Modal */}
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedDateStr={selectedDate}
        onSelectDate={(_newDate, dateObj) => {
          if (dateObj) {
            setCurrentDate(dateObj);
          }
        }}
      />
    </div>
  );
};
