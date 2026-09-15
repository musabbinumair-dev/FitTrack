import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ChevronDown } from 'lucide-react';
import { MealType } from '../types/fitness';
import { useUnits } from '../context/UnitContext';

export interface LoggedFoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  unit?: string;
  quantity?: number;
}

interface EditFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LoggedFoodItem | null;
  mealType: MealType;
  onUpdateItem: (updatedItem: LoggedFoodItem, mealType: MealType) => void;
  onRemoveItem: (itemId: string, mealType: MealType) => void;
}

const COMMON_UNITS = [
  'Grams (g)',
  'kg',
  'Plate',
  'Bowl',
  'Cup',
  'Tablespoon (tbsp)',
  'Teaspoon (tsp)',
  'Glass',
  'ml',
  'Litre (L)',
  'Piece / Roti',
  'Slice',
  'Serving',
];

export const EditFoodModal: React.FC<EditFoodModalProps> = ({
  isOpen,
  onClose,
  item,
  mealType,
  onUpdateItem,
  onRemoveItem,
}) => {
  const { energyUnit, formatEnergy } = useUnits();

  // Extract amount and unit from name like "Chicken Biryani (250 Grams (g))" or "Eggs (2 large)"
  const matchParen = item.name.match(/\(([\d.]+)\s*(.*?)\)/);
  const initialQuantity = matchParen ? parseFloat(matchParen[1]) : item.quantity || 1;
  const initialUnitMatched = matchParen ? matchParen[2].trim() : item.unit || 'Serving';

  const cleanName = item.name.replace(/\([\d.]+.*?\)/g, '').trim() || item.name;

  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [selectedUnit, setSelectedUnit] = useState<string>(initialUnitMatched);

  useEffect(() => {
    if (item) {
      const m = item.name.match(/\(([\d.]+)\s*(.*?)\)/);
      setQuantity(m ? parseFloat(m[1]) : item.quantity || 1);
      setSelectedUnit(m ? m[2].trim() : item.unit || 'Serving');
    }
  }, [item]);

  const baseQty = initialQuantity > 0 ? initialQuantity : 1;
  const baseCaloriesPerUnit = item.calories / baseQty;
  const baseProteinPerUnit = item.protein / baseQty;
  const baseCarbsPerUnit = item.carbs / baseQty;
  const baseFatsPerUnit = item.fats / baseQty;

  const currentQuantity = Math.max(0.1, quantity || 1);
  const totalCalories = Math.round(baseCaloriesPerUnit * currentQuantity);
  const totalProtein = Math.round(baseProteinPerUnit * currentQuantity);
  const totalCarbs = Math.round(baseCarbsPerUnit * currentQuantity);
  const totalFats = Math.round(baseFatsPerUnit * currentQuantity);

  const handleSaveUpdate = () => {
    const updatedName = `${cleanName} (${currentQuantity} ${selectedUnit})`;
    onUpdateItem(
      {
        ...item,
        name: updatedName,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fats: totalFats,
        quantity: currentQuantity,
        unit: selectedUnit,
      },
      mealType
    );
    onClose();
  };

  const handleRemove = () => {
    onRemoveItem(item.id, mealType);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && item && (
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

          {/* Centered Modal Content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5"
          >
            {/* 1. Header: Title + Meal Subtitle + Close Icon */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-tight">
                  Edit {cleanName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Logged under {mealType}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* 2. Serving Size Fields */}
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-['Outfit']">
                Measurement &amp; Unit
              </label>
              
              <div className="flex items-center gap-2">
                {/* Quantity Input Box */}
                <div className="w-24 shrink-0">
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#F5F7F6] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl py-3 px-3 text-center text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all font-['Outfit']"
                    placeholder="Qty"
                  />
                </div>

                {/* Serving Unit Dropdown */}
                <div className="relative flex-1">
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full appearance-none bg-[#F5F7F6] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl py-3 pl-4 pr-10 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all cursor-pointer font-['Outfit']"
                  >
                    {!COMMON_UNITS.includes(selectedUnit) && (
                      <option value={selectedUnit} className="dark:bg-slate-900">{selectedUnit}</option>
                    )}
                    {COMMON_UNITS.map((unit) => (
                      <option key={unit} value={unit} className="dark:bg-slate-900">
                        {unit}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Real-time Calculated Dynamic Macros */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Protein Pill */}
              <div className="bg-[#F3E8FF] dark:bg-purple-950/40 rounded-2xl py-3 px-2 text-center space-y-0.5 border border-purple-100/50 dark:border-purple-900/30">
                <div className="text-sm sm:text-base font-extrabold text-[#6B38FB] dark:text-purple-300 font-['Outfit']">
                  {totalProtein}g
                </div>
                <div className="text-[9px] font-bold text-[#6B38FB]/80 dark:text-purple-400 tracking-wider uppercase">
                  Protein
                </div>
              </div>

              {/* Carbs Pill */}
              <div className="bg-[#FFF5E5] dark:bg-amber-950/40 rounded-2xl py-3 px-2 text-center space-y-0.5 border border-amber-100/50 dark:border-amber-900/30">
                <div className="text-sm sm:text-base font-extrabold text-[#D97706] dark:text-amber-300 font-['Outfit']">
                  {totalCarbs}g
                </div>
                <div className="text-[9px] font-bold text-[#D97706]/80 dark:text-amber-400 tracking-wider uppercase">
                  Carbs
                </div>
              </div>

              {/* Fats Pill */}
              <div className="bg-[#E6F8F6] dark:bg-teal-950/40 rounded-2xl py-3 px-2 text-center space-y-0.5 border border-teal-100/50 dark:border-teal-900/30">
                <div className="text-sm sm:text-base font-extrabold text-[#0D9488] dark:text-teal-300 font-['Outfit']">
                  {totalFats}g
                </div>
                <div className="text-[9px] font-bold text-[#0D9488]/80 dark:text-teal-400 tracking-wider uppercase">
                  Fats
                </div>
              </div>
            </div>

            {/* 4. Total Calories Bar */}
            <div className="bg-[#F5F7F6] dark:bg-slate-800/80 rounded-2xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Total Energy
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-950 dark:text-white font-['Outfit']">
                {formatEnergy(totalCalories)}
              </span>
            </div>

            {/* 5. Bottom Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              {/* Remove Item Button */}
              <button
                onClick={handleRemove}
                className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 stroke-[2]" />
                <span>Remove Item</span>
              </button>

              {/* Update Portion Button */}
              <button
                onClick={handleSaveUpdate}
                className="px-5 py-2.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs sm:text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Update Portion
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
