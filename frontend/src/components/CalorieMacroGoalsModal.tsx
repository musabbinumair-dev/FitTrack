import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Info, Beef, Wheat, Droplet } from 'lucide-react';
import { useUnits } from '../context/UnitContext';

interface CalorieMacroGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCalories: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  onSaveGoals: (newGoals: {
    targetCalories: number;
    proteinTarget: number;
    carbsTarget: number;
    fatsTarget: number;
  }) => void;
}

export const CalorieMacroGoalsModal: React.FC<CalorieMacroGoalsModalProps> = ({
  isOpen,
  onClose,
  targetCalories: initialCalories,
  proteinTarget: initialProtein,
  carbsTarget: initialCarbs,
  fatsTarget: initialFats,
  onSaveGoals,
}) => {
  const { energyUnit, formatEnergy } = useUnits();
  const [calories, setCalories] = useState<number>(initialCalories || 2400);
  const [protein, setProtein] = useState<number>(initialProtein || 160);
  const [carbs, setCarbs] = useState<number>(initialCarbs || 250);
  const [fats, setFats] = useState<number>(initialFats || 70);

  useEffect(() => {
    setCalories(initialCalories || 2400);
    setProtein(initialProtein || 160);
    setCarbs(initialCarbs || 250);
    setFats(initialFats || 70);
  }, [initialCalories, initialProtein, initialCarbs, initialFats, isOpen]);

  // Calculate percentages (4 cal per g Protein, 4 cal per g Carb, 9 cal per g Fat)
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatsCals = fats * 9;
  const calculatedTotalCals = proteinCals + carbsCals + fatsCals;

  const proteinPct = calories > 0 ? Math.round((proteinCals / calories) * 100) : 0;
  const carbsPct = calories > 0 ? Math.round((carbsCals / calories) * 100) : 0;
  const fatsPct = calories > 0 ? Math.round((fatsCals / calories) * 100) : 0;
  const totalPct = proteinPct + carbsPct + fatsPct;

  const handleResetToDefault = () => {
    setCalories(2400);
    setProtein(160);
    setCarbs(250);
    setFats(70);
  };

  const handleSave = () => {
    onSaveGoals({
      targetCalories: calories || 2400,
      proteinTarget: protein || 160,
      carbsTarget: carbs || 250,
      fatsTarget: fats || 70,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['Outfit',sans-serif]">
          {/* Dark Translucent Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5"
          >
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-tight">
              Calorie & Macro Goals
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Set your daily targets
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Section 1: Daily Calorie Target */}
        <div className="space-y-1.5">
          <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-['Outfit']">
            Daily Calorie Target (kcal)
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              value={calories || ''}
              onChange={(e) => setCalories(parseInt(e.target.value, 10) || 0)}
              className="w-full pl-4 pr-11 py-3 bg-[#F5F7F6] dark:bg-slate-800/80 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
            />
            <Flame className="w-4 h-4 text-slate-700 dark:text-slate-300 absolute right-4 pointer-events-none" />
          </div>
        </div>

        {/* Section 2: Macro Ratio Split */}
        <div className="space-y-2.5">
          <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-['Outfit']">
            Macro Ratio Split
          </label>

          {/* Protein Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] shrink-0" />
              <Beef className="w-3.5 h-3.5 text-[#A855F7] shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                Protein
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={protein || ''}
                  onChange={(e) => setProtein(parseInt(e.target.value, 10) || 0)}
                  className="w-20 px-3 py-1.5 bg-[#F5F7F6] dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <span className="text-xs font-semibold text-slate-500 pr-2 absolute right-1">g</span>
              </div>
              <span className="min-w-[48px] text-center px-2.5 py-1 rounded-full bg-[#F3EDFF] dark:bg-purple-950/60 text-[#8B5CF6] dark:text-purple-300 text-xs font-bold">
                {proteinPct}%
              </span>
            </div>
          </div>

          {/* Carbs Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shrink-0" />
              <Wheat className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                Carbs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={carbs || ''}
                  onChange={(e) => setCarbs(parseInt(e.target.value, 10) || 0)}
                  className="w-20 px-3 py-1.5 bg-[#F5F7F6] dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <span className="text-xs font-semibold text-slate-500 pr-2 absolute right-1">g</span>
              </div>
              <span className="min-w-[48px] text-center px-2.5 py-1 rounded-full bg-[#FEF3C7] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-300 text-xs font-bold">
                {carbsPct}%
              </span>
            </div>
          </div>

          {/* Fats Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6] shrink-0" />
              <Droplet className="w-3.5 h-3.5 text-[#14B8A6] shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                Fats
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={fats || ''}
                  onChange={(e) => setFats(parseInt(e.target.value, 10) || 0)}
                  className="w-20 px-3 py-1.5 bg-[#F5F7F6] dark:bg-slate-800/80 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <span className="text-xs font-semibold text-slate-500 pr-2 absolute right-1">g</span>
              </div>
              <span className="min-w-[48px] text-center px-2.5 py-1 rounded-full bg-[#CCFBF1] dark:bg-teal-950/60 text-[#0D9488] dark:text-teal-300 text-xs font-bold">
                {fatsPct}%
              </span>
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-3 bg-[#F5F7F6] dark:bg-slate-800/60 rounded-2xl flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Total Macro Split: {totalPct}% ({calculatedTotalCals.toLocaleString()} kcal total)
            </span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Reset to Default
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs sm:text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Save New Goals
          </button>
        </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
