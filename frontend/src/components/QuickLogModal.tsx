import React, { useState } from 'react';
import { X, Dumbbell, Droplets, Scale, Check, Plus, Flame } from 'lucide-react';
import {
  MdFreeBreakfast,
  MdLunchDining,
  MdDinnerDining,
  MdCookie,
  MdLocalFireDepartment,
  MdWaterDrop,
  MdMonitorWeight,
} from 'react-icons/md';
import { WorkoutCategory, MealType, WorkoutLog, MealLog } from '../types/fitness';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'workout' | 'meal' | 'water' | 'weight';
  onAddWorkout: (workout: Omit<WorkoutLog, 'id' | 'timestamp'>) => void;
  onAddMeal: (meal: Omit<MealLog, 'id' | 'timestamp'>) => void;
  onUpdateWater: (amountMl: number) => void;
  onUpdateWeight: (newWeightKg: number) => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  initialType = 'workout',
  onAddWorkout,
  onAddMeal,
  onUpdateWater,
  onUpdateWeight,
}) => {
  const [activeTab, setActiveTab] = useState<'workout' | 'meal' | 'water' | 'weight'>(initialType);

  // Workout state
  const [workoutName, setWorkoutName] = useState('');
  const [category, setCategory] = useState<WorkoutCategory>('Strength');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weightKg, setWeightKg] = useState(60);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [caloriesBurned, setCaloriesBurned] = useState(250);
  const [workoutNotes, setWorkoutNotes] = useState('');

  // Meal state
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<MealType>('Lunch');
  const [mealCalories, setMealCalories] = useState(550);
  const [protein, setProtein] = useState(35);
  const [carbs, setCarbs] = useState(60);
  const [fats, setFats] = useState(18);
  const [servingSize, setServingSize] = useState('1 serving (350g)');

  // Water & Weight states
  const [waterAddMl, setWaterAddMl] = useState(350);
  const [targetWeight, setTargetWeight] = useState(74.0);

  if (!isOpen) return null;

  const handleWorkoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutName.trim()) return;
    onAddWorkout({
      name: workoutName,
      category,
      sets: Number(sets),
      reps: Number(reps),
      weightKg: Number(weightKg),
      durationMinutes: Number(durationMinutes),
      caloriesBurned: Number(caloriesBurned),
      completed: true,
      notes: workoutNotes,
    });
    setWorkoutName('');
    onClose();
  };

  const handleMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;
    onAddMeal({
      name: mealName,
      mealType,
      calories: Number(mealCalories),
      proteinGrams: Number(protein),
      carbsGrams: Number(carbs),
      fatsGrams: Number(fats),
      servingSize,
    });
    setMealName('');
    onClose();
  };

  const handleWaterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWater(Number(waterAddMl));
    onClose();
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWeight(Number(targetWeight));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="quick-log-modal-card"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 relative overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-[#C4FA2A] text-white dark:text-[#131418] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">Quick Fitness Logger</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Record workouts, meals, water or weight</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 gap-2 bg-slate-100/80 dark:bg-slate-800 p-1 rounded-2xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('workout')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
              activeTab === 'workout'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Workout</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('meal')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
              activeTab === 'meal'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MdLunchDining size={15} />
            <span>Meal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('water')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
              activeTab === 'water'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="text-sky-500 flex items-center justify-center">
              <MdWaterDrop size={15} />
            </span>
            <span>Water</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('weight')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
              activeTab === 'weight'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <MdMonitorWeight size={15} />
            </span>
            <span>Weight</span>
          </button>
        </div>

        {/* Workout Form */}
        {activeTab === 'workout' && (
          <form onSubmit={handleWorkoutSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Exercise / Routine Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Barbell Squats, 5km Run, Dumbbell Curls"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as WorkoutCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 font-medium bg-white"
                >
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Hypertrophy">Hypertrophy</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Recovery">Recovery</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sets</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={sets}
                  onChange={(e) => setSets(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reps</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Calories Burned (kcal)</label>
              <input
                type="number"
                min="10"
                max="2500"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm mt-2"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Save Workout</span>
            </button>
          </form>
        )}

        {/* Meal Form */}
        {activeTab === 'meal' && (
          <form onSubmit={handleMealSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Meal / Food Item Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Chicken Rice Bowl, Whey Isolate Shake"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Meal Timing</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { type: 'Breakfast' as MealType, icon: MdFreeBreakfast, label: 'Breakfast' },
                  { type: 'Lunch' as MealType, icon: MdLunchDining, label: 'Lunch' },
                  { type: 'Dinner' as MealType, icon: MdDinnerDining, label: 'Dinner' },
                  { type: 'Snacks' as MealType, icon: MdCookie, label: 'Snacks' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = mealType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setMealType(item.type)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`flex items-center justify-center ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                        <Icon size={16} />
                      </span>
                      <span className="mt-1">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1 font-bold text-slate-700 mb-1">
                <Flame className="w-3.5 h-3.5 text-[#FF5722] fill-[#FF5722]" />
                <span>Calories (kcal)</span>
              </label>
              <input
                type="number"
                min="10"
                max="4000"
                value={mealCalories}
                onChange={(e) => setMealCalories(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-emerald-700 mb-1">Protein (g)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-sky-700 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-amber-700 mb-1">Fats (g)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={fats}
                  onChange={(e) => setFats(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm mt-2"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Save Meal</span>
            </button>
          </form>
        )}

        {/* Water Form */}
        {activeTab === 'water' && (
          <form onSubmit={handleWaterSubmit} className="space-y-4 text-xs">
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-center gap-3">
              <Droplets className="w-8 h-8 text-sky-500 fill-sky-500" />
              <div>
                <div className="font-bold text-slate-900 text-sm">Add Hydration</div>
                <div className="text-slate-500">Quickly add water to your daily progress ring.</div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Volume to add (ml)</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[250, 500, 750].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWaterAddMl(amt)}
                    className={`py-2 rounded-xl border font-bold transition-colors ${
                      waterAddMl === amt
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    +{amt} ml
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="50"
                max="2000"
                step="50"
                value={waterAddMl}
                onChange={(e) => setWaterAddMl(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm mt-2"
            >
              <Check className="w-4 h-4" />
              <span>Log +{waterAddMl} ml Water</span>
            </button>
          </form>
        )}

        {/* Weight Form */}
        {activeTab === 'weight' && (
          <form onSubmit={handleWeightSubmit} className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <Scale className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="font-bold text-slate-900 text-sm">Update Body Weight</div>
                <div className="text-slate-500">Record today's morning weigh-in measurement.</div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 font-medium text-base font-bold text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm mt-2"
            >
              <Check className="w-4 h-4" />
              <span>Update Weight to {targetWeight} kg</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
