import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Check,
  Plus,
  Minus,
  ArrowRight,
  ScanLine,
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
import { useUnits } from '../context/UnitContext';

interface SelectedFoodConfig {
  unit: string;
  amount: number;
}

interface LogMealDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMealType: MealType;
  onSelectMealType: (mealType: MealType) => void;
  onAddMealItems: (
    items: Array<{ name: string; calories: number; protein: number; carbs: number; fats: number }>,
    mealType: MealType
  ) => void;
}

export const LogMealDrawer: React.FC<LogMealDrawerProps> = ({
  isOpen,
  onClose,
  selectedMealType,
  onSelectMealType,
  onAddMealItems,
}) => {
  const { energyUnit, formatEnergy } = useUnits();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedFoodConfigs, setSelectedFoodConfigs] = useState<Record<string, SelectedFoodConfig>>({});
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Custom Food Form State
  const [customName, setCustomName] = useState('');
  const [customServingUnit, setCustomServingUnit] = useState('serving');
  const [customAmount, setCustomAmount] = useState('1');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFats, setCustomFats] = useState('');

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
    'Low Fat',
    'Snacks',
    'Dessert / Drinks',
  ];

  const filteredFoods = COMPREHENSIVE_FOOD_DATABASE.filter((food) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      food.name.toLowerCase().includes(q) ||
      food.serving.toLowerCase().includes(q) ||
      food.tags.some((t) => t.toLowerCase().includes(q));

    const matchesFilter =
      activeFilter === 'All' ? true : food.tags.includes(activeFilter);

    return matchesSearch && matchesFilter;
  });

  const selectedFoods = COMPREHENSIVE_FOOD_DATABASE.filter(
    (food) => selectedFoodConfigs[food.id] !== undefined
  );

  const totalSelectedCalories = selectedFoods.reduce((sum, food) => {
    const config = selectedFoodConfigs[food.id];
    if (!config) return sum;
    const activeUnit = food.units.find((u) => u.unit === config.unit) || food.units[0];
    const multiplier = activeUnit.ratio * config.amount;
    return sum + Math.round(food.calories * multiplier);
  }, 0);

  const totalItemsCount = selectedFoods.length + (customName.trim() ? 1 : 0);

  const handleAddToMealLog = () => {
    if (selectedFoods.length === 0 && !customName.trim()) return;

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

    if (customName.trim()) {
      const multiplier = parseFloat(customAmount) || 1;
      itemsToAdd.push({
        name: `${customName.trim()} (${customAmount} ${customServingUnit})`,
        calories: Math.round((parseInt(customCalories, 10) || 200) * multiplier),
        protein: Math.round((parseInt(customProtein, 10) || 15) * multiplier),
        carbs: Math.round((parseInt(customCarbs, 10) || 20) * multiplier),
        fats: Math.round((parseInt(customFats, 10) || 5) * multiplier),
      });
    }

    onAddMealItems(itemsToAdd, selectedMealType);
    setSelectedFoodConfigs({});
    onClose();
  };

  const handleSaveCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const multiplier = parseFloat(customAmount) || 1;
    onAddMealItems(
      [
        {
          name: `${customName.trim()} (${customAmount} ${customServingUnit})`,
          calories: Math.round((parseInt(customCalories, 10) || 200) * multiplier),
          protein: Math.round((parseInt(customProtein, 10) || 15) * multiplier),
          carbs: Math.round((parseInt(customCarbs, 10) || 20) * multiplier),
          fats: Math.round((parseInt(customFats, 10) || 5) * multiplier),
        },
      ],
      selectedMealType
    );
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFats('');
    setIsCreatingCustom(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-['Outfit',sans-serif]">
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Right Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-[calc(100vw-16px)] sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between border-l border-slate-200/80 dark:border-slate-800"
            >
          
          {/* 1. Drawer Header */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Log Meal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select food &amp; measure in grams, kg, plates, bowls, cups, spoons, or ml.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Meal Type Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { type: 'Breakfast' as MealType, icon: MdFreeBreakfast },
                { type: 'Lunch' as MealType, icon: MdLunchDining },
                { type: 'Dinner' as MealType, icon: MdDinnerDining },
                { type: 'Snacks' as MealType, icon: MdCookie },
              ].map(({ type, icon: Icon }) => {
                const isActive = selectedMealType === type;
                return (
                  <button
                    key={type}
                    onClick={() => onSelectMealType(type)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`flex items-center justify-center ${isActive ? 'text-amber-300 dark:text-slate-900' : 'text-slate-500'}`}>
                      <Icon size={14} />
                    </span>
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input Bar with Scan Barcode Icon */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Biryani, Roti, Chicken, Karahi, Milk..."
                className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-[#F5F7F6] dark:bg-slate-800/80 border border-transparent focus:border-slate-300 dark:focus:border-slate-600 rounded-full text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
              />
              <button
                type="button"
                className="absolute right-3.5 p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Scan Barcode"
              >
                <ScanLine className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {filterCategories.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs font-semibold'
                        : 'bg-[#F2F4F3] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{filter}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Food Toggle / Inline Form */}
            {isCreatingCustom ? (
              <form onSubmit={handleSaveCustomItem} className="p-4 rounded-2xl bg-[#F7F9F8] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Create Custom Food Item
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustom(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Food Name (e.g. Homemade Smoothie)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Amount (e.g. 250)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g. grams, ml, tbsp, cup)"
                    value={customServingUnit}
                    onChange={(e) => setCustomServingUnit(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="number"
                    placeholder="kcal"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white text-center"
                    required
                  />
                  <input
                    type="number"
                    placeholder="P (g)"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white text-center"
                  />
                  <input
                    type="number"
                    placeholder="C (g)"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white text-center"
                  />
                  <input
                    type="number"
                    placeholder="F (g)"
                    value={customFats}
                    onChange={(e) => setCustomFats(e.target.value)}
                    className="px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white text-center"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Custom Item
                </button>
              </form>
            ) : null}

            {/* Food Items List Cards */}
            <div className="space-y-2.5">
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

                      {/* Precise Measurement & Unit Selector Row */}
                      {isSelected && (
                        <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 mt-0.5 space-y-2.5 animate-in fade-in duration-150">
                          {/* Unit & Amount Stepper Controls */}
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
                              = {currentCals} kcal
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

          {/* 3. Drawer Sticky Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-3.5 bg-white dark:bg-slate-900 shrink-0">
            {/* Create Custom Food Item Link */}
            {!isCreatingCustom && (
              <button
                onClick={() => setIsCreatingCustom(true)}
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Custom Food Item</span>
              </button>
            )}

            {/* Selected Count & Calories Summary Bar */}
            <div className="bg-[#F2F4F3] dark:bg-slate-800/80 rounded-2xl px-4 py-3 flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200">
              <span>{totalItemsCount} items selected</span>
              <span className="font-semibold">• {formatEnergy(totalSelectedCalories)}</span>
            </div>

            {/* Main Action Button */}
            <button
              onClick={handleAddToMealLog}
              disabled={totalItemsCount === 0}
              className={`w-full py-3.5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.99] ${
                totalItemsCount > 0
                  ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Add to Meal Log</span>
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
