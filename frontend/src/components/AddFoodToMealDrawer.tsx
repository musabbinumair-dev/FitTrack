import React, { useState } from 'react';
import {
  X,
  Search,
  Check,
  Plus,
  Minus,
  ArrowRight,
  Flame,
  ChevronDown,
} from 'lucide-react';
import {
  MdFreeBreakfast,
  MdLunchDining,
  MdDinnerDining,
  MdCookie,
} from 'react-icons/md';
import { MealType } from '../types/fitness';
import { COMPREHENSIVE_FOOD_DATABASE, FoodOption, ServingUnit } from '../data/foodDatabase';
import { motion, AnimatePresence } from 'motion/react';
import { useUnits } from '../context/UnitContext';

interface SelectedFoodConfig {
  unit: string;
  amount: number;
}

interface AddFoodToMealDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: MealType;
  onAddMealItems: (
    items: Array<{ name: string; calories: number; protein: number; carbs: number; fats: number }>,
    mealType: MealType
  ) => void;
}

export const AddFoodToMealDrawer: React.FC<AddFoodToMealDrawerProps> = ({
  isOpen,
  onClose,
  mealType,
  onAddMealItems,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedFoodConfigs, setSelectedFoodConfigs] = useState<Record<string, SelectedFoodConfig>>({});
  const { formatEnergy, energyLabel } = useUnits();

  const targetCaloriesMap: Record<MealType, number> = {
    Breakfast: 550,
    Lunch: 700,
    Dinner: 650,
    Snacks: 300,
  };

  const targetCal = targetCaloriesMap[mealType] || 500;

  const toggleItemSelection = (food: FoodOption) => {
    setSelectedFoodConfigs((prev) => {
      const copy = { ...prev };
      if (copy[food.id] !== undefined) {
        delete copy[food.id];
      } else {
        const defaultUnit = food.units[0];
        copy[food.id] = {
          unit: defaultUnit.unit,
          amount: defaultUnit.defaultAmount,
        };
      }
      return copy;
    });
  };

  const handleChangeUnit = (food: FoodOption, newUnitName: string) => {
    const targetUnit = food.units.find((u) => u.unit === newUnitName) || food.units[0];
    setSelectedFoodConfigs((prev) => ({
      ...prev,
      [food.id]: {
        unit: targetUnit.unit,
        amount: targetUnit.defaultAmount,
      },
    }));
  };

  const handleDeltaAmount = (food: FoodOption, delta: number) => {
    setSelectedFoodConfigs((prev) => {
      const current = prev[food.id];
      if (!current) return prev;
      const activeUnit = food.units.find((u) => u.unit === current.unit) || food.units[0];
      const nextAmount = Math.max(activeUnit.step, Math.round((current.amount + delta) * 100) / 100);
      return {
        ...prev,
        [food.id]: {
          ...current,
          amount: nextAmount,
        },
      };
    });
  };

  const handleSetExactAmount = (foodId: string, amount: number) => {
    setSelectedFoodConfigs((prev) => {
      const current = prev[foodId];
      if (!current) return prev;
      return {
        ...prev,
        [foodId]: {
          ...current,
          amount: Math.max(0.1, amount),
        },
      };
    });
  };

  const filterCategories = [
    'All',
    'Pakistani',
    'High Protein',
    'Breakfast',
    'Carbs',
    'Low Carb',
    'Snacks',
  ];

  const filteredFoods = COMPREHENSIVE_FOOD_DATABASE.filter((food) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      food.name.toLowerCase().includes(q) ||
      food.serving.toLowerCase().includes(q) ||
      food.tags.some((t) => t.toLowerCase().includes(q));

    const matchesFilter =
      activeCategory === 'All' ? true : food.tags.includes(activeCategory);

    return matchesSearch && matchesFilter;
  });

  const selectedFoods = COMPREHENSIVE_FOOD_DATABASE.filter(
    (food) => selectedFoodConfigs[food.id] !== undefined
  );

  const totalCalories = selectedFoods.reduce((sum, food) => {
    const config = selectedFoodConfigs[food.id];
    if (!config) return sum;
    const activeUnit = food.units.find((u) => u.unit === config.unit) || food.units[0];
    const multiplier = activeUnit.ratio * config.amount;
    return sum + Math.round(food.calories * multiplier);
  }, 0);

  const totalItemCount = selectedFoods.length;

  const handleAddItems = () => {
    if (selectedFoods.length === 0) return;

    const itemsToAdd = selectedFoods.map((food) => {
      const config = selectedFoodConfigs[food.id];
      const activeUnit = food.units.find((u) => u.unit === config.unit) || food.units[0];
      const amount = config.amount;
      const multiplier = activeUnit.ratio * amount;

      return {
        name: `${food.name} (${amount} ${activeUnit.unit})`,
        calories: Math.round(food.calories * multiplier),
        protein: Math.round(food.protein * multiplier),
        carbs: Math.round(food.carbs * multiplier),
        fats: Math.round(food.fats * multiplier),
      };
    });

    onAddMealItems(itemsToAdd, mealType);
    setSelectedFoodConfigs({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-['Outfit',sans-serif]">
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Slide-Over Drawer Container with safe right offset and breathing space */}
          <div className="fixed inset-y-0 right-0 sm:right-3 md:right-4 max-w-full flex pl-4 sm:pl-10 my-0 sm:my-3">
            <motion.div
              initial={{ x: '100%', opacity: 0.7 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-[calc(100vw-16px)] sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between rounded-l-3xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
            >
              {/* 1. Header Section */}
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between shrink-0 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {mealType === 'Breakfast' ? (
                      <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        <MdFreeBreakfast size={18} />
                      </span>
                    ) : mealType === 'Lunch' ? (
                      <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <MdLunchDining size={18} />
                      </span>
                    ) : mealType === 'Dinner' ? (
                      <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        <MdDinnerDining size={18} />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                        <MdCookie size={18} />
                      </span>
                    )}
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Add to {mealType}
                    </h2>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      <Flame className="w-3 h-3 text-[#FF5722] fill-[#FF5722]" />
                      Target: ~{formatEnergy(targetCal)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

          {/* 2. Scrollable Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Search Input Bar */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Biryani, Roti, Chicken, Karahi, Milk..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7F6] dark:bg-slate-800/80 border border-transparent focus:border-slate-300 dark:focus:border-slate-600 rounded-full text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {filterCategories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs font-semibold'
                        : 'bg-[#F2F4F3] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Food Items List */}
            <div className="space-y-2.5 pt-1">
              {filteredFoods.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                  No food items found matching your search.
                </div>
              ) : (
                filteredFoods.map((food) => {
                  const config = selectedFoodConfigs[food.id];
                  const isSelected = config !== undefined;
                  const activeUnit = food.units.find((u) => u.unit === config?.unit) || food.units[0];
                  const currentAmount = config?.amount ?? activeUnit.defaultAmount;
                  const multiplier = activeUnit.ratio * currentAmount;

                  const currentCals = Math.round(food.calories * multiplier);
                  const currentProtein = Math.round(food.protein * multiplier);
                  const currentCarbs = Math.round(food.carbs * multiplier);
                  const currentFats = Math.round(food.fats * multiplier);

                  return (
                    <div
                      key={food.id}
                      className={`rounded-2xl transition-all border ${
                        isSelected
                          ? 'bg-white dark:bg-slate-800/90 border-slate-900/30 dark:border-slate-500 shadow-xs'
                          : 'bg-[#F7F9F8] dark:bg-slate-800/60 border-slate-100 dark:border-slate-800/80 hover:bg-[#F2F4F3] dark:hover:bg-slate-800'
                      }`}
                    >
                      {/* Top Clickable Row */}
                      <div
                        onClick={() => toggleItemSelection(food)}
                        className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                              {food.name}
                            </h4>
                            {food.tags.includes('Pakistani') && (
                              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                                Pakistani
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                            {isSelected
                              ? `${formatEnergy(currentCals)} • ${currentAmount} ${activeUnit.unit}`
                              : `${formatEnergy(food.calories)} • ${food.serving}`}
                            &nbsp;•&nbsp;{' '}
                            {isSelected ? currentProtein : food.protein}g P,{' '}
                            {isSelected ? currentCarbs : food.carbs}g C,{' '}
                            {isSelected ? currentFats : food.fats}g F
                          </p>
                        </div>

                        {/* Right Toggle Button */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                              : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          )}
                        </div>
                      </div>

                      {/* Precise Measurement & Unit Selector Controls */}
                      {isSelected && (
                        <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 mt-0.5 space-y-2.5 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            {/* Measurement Unit Dropdown */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Unit:
                              </span>
                              <div className="relative">
                                <select
                                  value={activeUnit.unit}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleChangeUnit(food, e.target.value);
                                  }}
                                  className="appearance-none pl-2.5 pr-7 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none hover:bg-slate-200/80 dark:hover:bg-slate-800"
                                >
                                  {food.units.map((u) => (
                                    <option key={u.unit} value={u.unit}>
                                      {u.unit}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>

                            {/* Quantity Stepper & Manual Input */}
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeltaAmount(food, -activeUnit.step);
                                }}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Decrease"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <input
                                type="number"
                                step="any"
                                value={currentAmount}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (!isNaN(val)) {
                                    handleSetExactAmount(food.id, val);
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-14 text-center font-bold text-xs bg-transparent text-slate-900 dark:text-white focus:outline-none"
                              />

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeltaAmount(food, activeUnit.step);
                                }}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Increase"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Quick Amount Suggestion Chips */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {activeUnit.quickAmounts.map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetExactAmount(food.id, amt);
                                }}
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                                  currentAmount === amt
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                {amt} {activeUnit.unit.split(' ')[0]}
                              </button>
                            ))}
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold ml-auto">
                              = {formatEnergy(currentCals)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. Sticky Bottom Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 shrink-0">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                Total Selected
              </span>
              <span className="text-base font-bold text-slate-950 dark:text-white">
                {formatEnergy(totalCalories)}
              </span>
            </div>

            <button
              onClick={handleAddItems}
              disabled={totalItemCount === 0}
              className={`w-full py-3.5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.99] ${
                totalItemCount > 0
                  ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>
                {totalItemCount === 0
                  ? 'Select Items to Add'
                  : `Add ${totalItemCount} Item${totalItemCount > 1 ? 's' : ''}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
