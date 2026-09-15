import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Flame,
  Droplets,
  Dumbbell,
  Target,
  User,
  Scale,
  Ruler,
  Briefcase,
  Activity,
  Heart,
  TrendingUp,
  Zap,
  LogOut,
} from 'lucide-react';
import {
  MdPartyMode,
  MdSchool,
  MdComputer,
  MdDirectionsRun,
  MdFitnessCenter,
} from 'react-icons/md';
import { userApi } from '../lib/api';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (userData: any) => void;
  onCancel?: () => void;
  initialName?: string;
  isDarkMode?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onCancel,
  initialName = '',
  isDarkMode = false,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState(initialName || '');
  const [age, setAge] = useState<number | string>(24);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [weight, setWeight] = useState<number | string>(72);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [height, setHeight] = useState<number | string>(175);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');

  // Daily Routine & Activity
  const [occupationType, setOccupationType] = useState<string>('desk_worker');
  const [activityLevel, setActivityLevel] = useState<string>('moderately_active');

  // Goals & Workout Routine
  const [fitnessGoal, setFitnessGoal] = useState<string>('build_muscle');
  const [workoutDaysPerWeek, setWorkoutDaysPerWeek] = useState<number>(4);
  const [targetWeight, setTargetWeight] = useState<number | string>(75);
  const [targetTimeframeValue, setTargetTimeframeValue] = useState<number | string>(3);
  const [targetTimeframeUnit, setTargetTimeframeUnit] = useState<'months' | 'years'>('months');
  const [preferredRoutine, setPreferredRoutine] = useState<string>('Single Body Part (6 Days)');

  // Calculate Real Metric Projections (Mifflin-St Jeor TDEE & Timeframe-based Deficit/Surplus)
  const calculation = useMemo(() => {
    const rawWeight = parseFloat(String(weight)) || 70;
    const weightInKg = weightUnit === 'lbs' ? rawWeight * 0.453592 : rawWeight;

    const rawTargetWeight = parseFloat(String(targetWeight)) || rawWeight;
    const targetWeightInKg = weightUnit === 'lbs' ? rawTargetWeight * 0.453592 : rawTargetWeight;

    let heightInCm = parseFloat(String(height)) || 175;
    if (heightUnit === 'ft') {
      heightInCm = heightInCm * 30.48;
    }

    const numAge = parseFloat(String(age)) || 25;

    // BMR Formula (Mifflin-St Jeor)
    let bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * numAge;
    if (gender === 'female') {
      bmr -= 161;
    } else {
      bmr += 5;
    }

    // Activity Multiplier
    let activityMultiplier = 1.35;
    if (occupationType === 'desk_worker' && activityLevel === 'sedentary') activityMultiplier = 1.2;
    else if (occupationType === 'desk_worker' && activityLevel === 'moderately_active') activityMultiplier = 1.4;
    else if (occupationType === 'standing' || occupationType === 'teacher') activityMultiplier = 1.5;
    else if (occupationType === 'active_field') activityMultiplier = 1.65;
    else if (occupationType === 'heavy_labor') activityMultiplier = 1.85;

    // Additional gym day boost
    const gymBoost = (workoutDaysPerWeek - 3) * 0.04;
    activityMultiplier += Math.max(-0.1, gymBoost);

    const tdee = Math.round(bmr * activityMultiplier);

    // Timeframe calculation
    const numTimeframe = Math.max(1, parseFloat(String(targetTimeframeValue)) || 3);
    const totalMonths = targetTimeframeUnit === 'years' ? numTimeframe * 12 : numTimeframe;
    const totalDays = Math.max(14, Math.round(totalMonths * 30.4));
    const totalWeeks = Math.max(2, totalDays / 7);

    // Weight difference in user's unit and in kg
    const weightDiffKg = targetWeightInKg - weightInKg;
    const rawWeightDiff = rawTargetWeight - rawWeight;
    const weeklyRateInUnit = Math.abs(rawWeightDiff) / totalWeeks;

    let dailyAdjustment = 0;
    if (Math.abs(weightDiffKg) > 0.2) {
      if (weightDiffKg < 0) {
        // Fat loss: ~7,700 kcal deficit per 1 kg fat loss
        const totalDeficit = Math.abs(weightDiffKg) * 7700;
        dailyAdjustment = -Math.round(totalDeficit / totalDays);
        // Safe cap: between -200 and -800 kcal/day
        dailyAdjustment = Math.max(-800, Math.min(-200, dailyAdjustment));
      } else {
        // Muscle / weight gain: ~4,500 kcal surplus per 1 kg lean mass
        const totalSurplus = weightDiffKg * 4500;
        dailyAdjustment = Math.round(totalSurplus / totalDays);
        // Safe cap: between +150 and +600 kcal/day
        dailyAdjustment = Math.min(600, Math.max(150, dailyAdjustment));
      }
    } else {
      // Maintain goal
      if (fitnessGoal === 'lose_weight') dailyAdjustment = -350;
      else if (fitnessGoal === 'build_muscle') dailyAdjustment = 250;
      else dailyAdjustment = 0;
    }

    let calculatedCalories = Math.round(tdee + dailyAdjustment);
    const minSafeCalories = gender === 'female' ? 1250 : 1500;
    calculatedCalories = Math.max(minSafeCalories, calculatedCalories);

    // Dynamic Macros
    let proteinMultiplier = 1.8;
    if (weightDiffKg < 0 || fitnessGoal === 'lose_weight') proteinMultiplier = 2.2;
    else if (fitnessGoal === 'build_muscle') proteinMultiplier = 2.0;
    else if (fitnessGoal === 'strength') proteinMultiplier = 1.9;

    const proteinGrams = Math.round(weightInKg * proteinMultiplier);
    const fatsGrams = Math.round((calculatedCalories * 0.25) / 9);
    const carbsGrams = Math.round((calculatedCalories - proteinGrams * 4 - fatsGrams * 9) / 4);

    // Water Goal
    const calculatedWaterMl = Math.min(
      5500,
      Math.max(2200, Math.round(weightInKg * 38 + (workoutDaysPerWeek >= 5 ? 400 : 200)))
    );

    return {
      tdee,
      calories: calculatedCalories,
      dailyAdjustment,
      weightDiffKg,
      rawWeightDiff,
      weeklyRateInUnit,
      totalMonths,
      protein: proteinGrams,
      carbs: Math.max(75, carbsGrams),
      fats: Math.max(35, fatsGrams),
      waterMl: calculatedWaterMl,
    };
  }, [
    weight,
    weightUnit,
    targetWeight,
    targetTimeframeValue,
    targetTimeframeUnit,
    height,
    heightUnit,
    age,
    gender,
    occupationType,
    activityLevel,
    workoutDaysPerWeek,
    fitnessGoal,
  ]);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const numTimeframe = Math.max(1, parseFloat(String(targetTimeframeValue)) || 3);
      const totalMonths = targetTimeframeUnit === 'years' ? numTimeframe * 12 : numTimeframe;
      const initialWeightNum = Number(weight) || 70;

      localStorage.setItem('fitness_starting_weight', String(initialWeightNum));

      const payload = {
        name: name.trim() || 'Athlete',
        age: Number(age) || 24,
        gender,
        weight: initialWeightNum,
        startingWeight: initialWeightNum,
        weightUnit,
        height: Number(height) || 175,
        heightUnit,
        occupationType,
        activityLevel,
        fitnessGoal,
        workoutDaysPerWeek,
        targetWeight: Number(targetWeight) || initialWeightNum,
        targetTimeframeMonths: totalMonths,
        targetTimeframeUnit,
        preferredRoutine,
        dailyCalorieGoal: calculation.calories,
        calorieGoal: calculation.calories,
        proteinGoal: calculation.protein,
        carbsGoal: calculation.carbs,
        fatsGoal: calculation.fats,
        waterGoalMl: calculation.waterMl,
        isOnboardingCompleted: true,
      };

      await userApi.updateProfile(payload);
      onComplete(payload);
    } catch (err) {
      console.error('Failed to save onboarding data:', err);
      const fallbackWeight = Number(weight) || 70;
      localStorage.setItem('fitness_starting_weight', String(fallbackWeight));
      onComplete({
        name: name || 'Athlete',
        weight: fallbackWeight,
        startingWeight: fallbackWeight,
        weightUnit,
        targetWeight: Number(targetWeight) || fallbackWeight,
        calorieGoal: calculation.calories,
        proteinGoal: calculation.protein,
        carbsGoal: calculation.carbs,
        fatsGoal: calculation.fats,
        waterGoalMl: calculation.waterMl,
        preferredRoutine,
        isOnboardingCompleted: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-['Outfit',sans-serif]">
      {/* Dynamic Animated Glass Backdrop */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity animate-in fade-in duration-300" />

      {/* Animated Party Poppers & Dynamic Falling Confetti Particles - Shown ONLY when all steps are completed! */}
      {step === 5 && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {/* Left Party Popper Cannon */}
          <div className="absolute -bottom-2 sm:bottom-8 left-2 sm:left-8 text-5xl sm:text-6xl animate-bounce select-none z-10 filter drop-shadow-[0_8px_18px_rgba(255,85,0,0.4)]">
            🎉
          </div>

          {/* Right Party Popper Cannon */}
          <div
            className="absolute -bottom-2 sm:bottom-8 right-2 sm:right-8 text-5xl sm:text-6xl animate-bounce select-none z-10 filter drop-shadow-[0_8px_18px_rgba(196,250,42,0.4)]"
            style={{ animationDelay: '300ms' }}
          >
            🎊
          </div>

          {/* Dynamic Falling Confetti Particles */}
          {Array.from({ length: 52 }).map((_, i) => {
            const colors = ['#FF5500', '#C4FA2A', '#38BDF8', '#A855F7', '#EC4899', '#F59E0B', '#10B981', '#6366F1'];
            const color = colors[i % colors.length];
            const left = (i * 2.1 + (i % 7) * 3) % 100;
            const size = (i % 3) * 3 + 6;
            const isRibbon = i % 2 === 0;
            const animDuration = 2.4 + (i % 5) * 0.4;
            const animDelay = (i % 8) * 0.25;

            return (
              <span
                key={i}
                className="absolute rounded-xs opacity-90 animate-fall"
                style={{
                  left: `${left}%`,
                  top: '-24px',
                  width: `${size}px`,
                  height: `${isRibbon ? size * 2.2 : size}px`,
                  backgroundColor: color,
                  animation: `confetti-fall ${animDuration}s linear ${animDelay}s infinite`,
                  transform: `rotate(${(i * 55) % 360}deg)`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* 3D Perspective Modal Card Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[36px] shadow-[0_24px_60px_rgba(0,0,0,0.35)] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 z-10 animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Progress Bar & Header Pill */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Personalize Your Profile ({step} of 5)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Stepper Dots */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-gradient-to-r from-[#FF5500] to-orange-400'
                      : s < step
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Cancel & Log Out Button */}
            {onCancel && (
              <button
                type="button"
                id="onboarding-header-cancel-btn"
                onClick={onCancel}
                title="Cancel onboarding and log out to login page"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* STEP 1: WELCOME & 3D INTRODUCTION */}
        {step === 1 && (
          <div className="text-center space-y-5 py-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* 3D Floating Fitness Setup Badge */}
            <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF5500] via-orange-500 to-[#C4FA2A] p-1 shadow-[0_12px_28px_rgba(255,85,0,0.35)] transform hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              <div className="w-full h-full bg-white/20 dark:bg-slate-950/40 rounded-[22px] backdrop-blur-xs flex items-center justify-center text-white">
                <Target className="w-12 h-12 text-white stroke-[2.2]" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Welcome to PulseFit!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Let's set up your personalized fitness baseline in 4 simple steps. We will calculate your exact daily calories, macro ratios, hydration targets, and training routine!
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-[#FAF3EE] dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/30 text-center space-y-1">
                <Flame className="w-5 h-5 mx-auto text-[#FF5500]" />
                <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Custom Calories
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F3EEFE] dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/30 text-center space-y-1">
                <Dumbbell className="w-5 h-5 mx-auto text-purple-600" />
                <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Workout Splits
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#EFF8F2] dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/30 text-center space-y-1">
                <Droplets className="w-5 h-5 mx-auto text-emerald-600" />
                <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Daily Hydration
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-3">
              {onCancel && (
                <button
                  type="button"
                  id="onboarding-cancel-step1-btn"
                  onClick={onCancel}
                  className="py-4 px-5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-4 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-lg active:scale-[0.99]"
              >
                <span>Let's Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BODY STATS & BIOMETRICS */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Tell Us About Yourself
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your body measurements help us accurately estimate your metabolism.
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5500]"
                />
              </div>
            </div>

            {/* Age & Gender Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min={12}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['male', 'female'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                        gender === g
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {g === 'male' ? '👨 Male' : '👩 Female'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Weight & Height Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Weight */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Current Weight
                  </label>
                  <div className="flex rounded-md bg-slate-100 dark:bg-slate-800 p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setWeightUnit('kg')}
                      className={`px-1.5 py-0.5 rounded ${weightUnit === 'kg' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-400'}`}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeightUnit('lbs')}
                      className={`px-1.5 py-0.5 rounded ${weightUnit === 'lbs' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-400'}`}
                    >
                      lbs
                    </button>
                  </div>
                </div>
                <div className="relative flex items-center">
                  <Scale className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="number"
                    step="any"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>

              {/* Height */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Height
                  </label>
                  <div className="flex rounded-md bg-slate-100 dark:bg-slate-800 p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setHeightUnit('cm')}
                      className={`px-1.5 py-0.5 rounded ${heightUnit === 'cm' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-400'}`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeightUnit('ft')}
                      className={`px-1.5 py-0.5 rounded ${heightUnit === 'ft' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-400'}`}
                    >
                      ft
                    </button>
                  </div>
                </div>
                <div className="relative flex items-center">
                  <Ruler className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="number"
                    step="any"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>
            </div>

            {/* Nav Buttons */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Back
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="py-3 px-4 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-md"
              >
                <span>Continue: Daily Routine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: OCCUPATION & DAILY LIFESTYLE */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Your Daily Routine &amp; Occupation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                How much do you move during your typical working day?
              </p>
            </div>

            {/* Occupation Types */}
            <div className="space-y-2">
              {[
                {
                  id: 'desk_worker',
                  icon: MdComputer,
                  title: 'Desk / Office Worker',
                  desc: 'Sitting most of the day at a computer or desk',
                },
                {
                  id: 'standing',
                  icon: MdSchool,
                  title: 'Teacher / Retail / Standing',
                  desc: 'On your feet often, light intermittent walking',
                },
                {
                  id: 'active_field',
                  icon: MdDirectionsRun,
                  title: 'Active / Field Worker',
                  desc: 'Constantly moving, traveling, outdoors, or walking',
                },
                {
                  id: 'heavy_labor',
                  icon: MdFitnessCenter,
                  title: 'Heavy Physical Labor',
                  desc: 'Construction, warehouse lifting, high physical demand',
                },
              ].map(({ id, icon: Icon, title, desc }) => {
                const isSelected = occupationType === id;
                return (
                  <div
                    key={id}
                    onClick={() => setOccupationType(id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {desc}
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'border-slate-300 dark:border-slate-700'}`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Activity Level Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Non-Workout Daily Activity Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'sedentary', label: 'Sedentary (Little steps)' },
                  { id: 'lightly_active', label: 'Light (5k-7k steps)' },
                  { id: 'moderately_active', label: 'Moderate (8k-10k steps)' },
                  { id: 'very_active', label: 'High (12k+ steps)' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActivityLevel(id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                      activityLevel === id
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nav Buttons */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Back
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="py-3 px-4 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-3 px-5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-md"
              >
                <span>Continue: Goals &amp; Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FITNESS GOAL, TARGET WEIGHT & WORKOUT FREQUENCY */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Goals &amp; Workout Frequency
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set your target weight, timeline, and preferred routine sequence.
              </p>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'lose_weight', emoji: '🔥', label: 'Lose Fat', desc: 'Calorie deficit & definition' },
                { id: 'build_muscle', emoji: '💪', label: 'Build Muscle', desc: 'Hypertrophy & weight gain' },
                { id: 'maintain', emoji: '⚖️', label: 'Maintain Weight', desc: 'Fitness, tone & vitality' },
                { id: 'strength', emoji: '⚡', label: 'Build Strength', desc: 'Athletic power & stamina' },
              ].map(({ id, emoji, label, desc }) => {
                const isSelected = fitnessGoal === id;
                return (
                  <div
                    key={id}
                    onClick={() => {
                      setFitnessGoal(id);
                      if (id === 'lose_weight' && Number(targetWeight) >= Number(weight)) {
                        setTargetWeight(Math.max(40, Math.round(Number(weight) - 5)));
                      } else if (id === 'build_muscle' && Number(targetWeight) <= Number(weight)) {
                        setTargetWeight(Math.round(Number(weight) + 4));
                      } else if (id === 'maintain') {
                        setTargetWeight(Number(weight));
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      {label}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Target Goal Weight & Estimated Timeframe Section */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              {/* Target Weight Row */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>Target Goal Weight</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Current: {weight} {weightUnit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.5"
                      min="30"
                      max="250"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5500]"
                      placeholder="e.g. 70"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                      {weightUnit}
                    </span>
                  </div>
                  {/* Dynamic Difference Pill */}
                  <div className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shrink-0">
                    {calculation.rawWeightDiff < -0.2 ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        📉 Lose {Math.abs(calculation.rawWeightDiff).toFixed(1)} {weightUnit}
                      </span>
                    ) : calculation.rawWeightDiff > 0.2 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        📈 Gain {Math.abs(calculation.rawWeightDiff).toFixed(1)} {weightUnit}
                      </span>
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400">
                        ⚖️ Maintain Weight
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Estimated Timeframe Row */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    In how much time do you want to achieve this?
                  </label>
                  <span className="text-[11px] font-bold text-[#FF5500]">
                    ~{calculation.weeklyRateInUnit.toFixed(2)} {weightUnit}/wk pace
                  </span>
                </div>
                
                {/* Timeframe Presets */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { val: 1, unit: 'months' as const, label: '1 Mo' },
                    { val: 3, unit: 'months' as const, label: '3 Mo' },
                    { val: 6, unit: 'months' as const, label: '6 Mo' },
                    { val: 1, unit: 'years' as const, label: '1 Yr' },
                    { val: 2, unit: 'years' as const, label: '2 Yr' },
                  ].map((preset) => {
                    const isSelected =
                      Number(targetTimeframeValue) === preset.val &&
                      targetTimeframeUnit === preset.unit;
                    return (
                      <button
                        key={`${preset.val}-${preset.unit}`}
                        type="button"
                        onClick={() => {
                          setTargetTimeframeValue(preset.val);
                          setTargetTimeframeUnit(preset.unit);
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Number Input & Unit Switcher */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Custom:</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={targetTimeframeValue}
                    onChange={(e) => setTargetTimeframeValue(Math.max(1, Number(e.target.value)))}
                    className="w-20 py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                  <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => setTargetTimeframeUnit('months')}
                      className={`px-3 py-1 font-bold cursor-pointer transition-colors ${
                        targetTimeframeUnit === 'months'
                          ? 'bg-[#FF5500] text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Months
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetTimeframeUnit('years')}
                      className={`px-3 py-1 font-bold cursor-pointer transition-colors ${
                        targetTimeframeUnit === 'years'
                          ? 'bg-[#FF5500] text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Years
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Days Per Week Slider / Buttons */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  How many days a week will you workout?
                </label>
                <span className="text-xs font-bold text-[#FF5500]">
                  {workoutDaysPerWeek} Days / Week
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[2, 3, 4, 5, 6].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setWorkoutDaysPerWeek(days)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      workoutDaysPerWeek === days
                        ? 'bg-[#FF5500] text-white shadow-2xs scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Routine Split with "Single Body Part (6 Days)" */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Recommended Routine Sequence
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Single Body Part (6 Days)',
                  'Push / Pull / Legs',
                  'Upper / Lower Body',
                  'Full Body (3-Day)',
                  'Cardio & Functional',
                ].map((routine) => (
                  <button
                    key={routine}
                    type="button"
                    onClick={() => {
                      setPreferredRoutine(routine);
                      if (routine.includes('6 Days')) {
                        setWorkoutDaysPerWeek(6);
                      }
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                      preferredRoutine === routine
                        ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {routine}
                  </button>
                ))}
              </div>
            </div>

            {/* Nav Buttons */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Back
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="py-3 px-4 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep(5)}
                className="flex-1 py-3 px-5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-md"
              >
                <span>Calculate My Targets</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: PERSONALIZED RESULTS, CONFETTI & SAVE */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Celebration Header with Party Poppers */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 via-emerald-100 to-amber-100 dark:from-amber-950/60 dark:via-emerald-950/60 dark:to-amber-950/60 border border-emerald-300/80 dark:border-emerald-700/50 text-emerald-900 dark:text-emerald-200 text-xs font-extrabold shadow-sm animate-pulse">
                <span className="text-base">🎉</span>
                <span>All Steps Completed! Plan Created for {name || 'You'}!</span>
                <span className="text-base">🎊</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Your Custom Daily Plan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculated scientifically based on your body weight, target goal, timeframe, and routine.
              </p>
            </div>

            {/* Goal Timeline & Target Pill */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#FF5500] shrink-0" />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Target: {targetWeight} {weightUnit} in {targetTimeframeValue} {targetTimeframeUnit}
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                ~{calculation.weeklyRateInUnit.toFixed(1)} {weightUnit}/wk pace
              </span>
            </div>

            {/* 3D Calorie Hero Badge */}
            <div className="rounded-3xl bg-gradient-to-br from-[#FF5500] to-orange-600 p-5 text-white shadow-xl text-center space-y-2 transform hover:scale-[1.01] transition-transform">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-200">
                Daily Calorie Target
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                {calculation.calories.toLocaleString()}
                <span className="text-lg font-medium text-orange-200 ml-1">kcal</span>
              </div>
              <p className="text-xs text-orange-100">
                Maintenance: ~{calculation.tdee.toLocaleString()} kcal • Daily adjustment:{' '}
                {calculation.dailyAdjustment >= 0
                  ? `+${calculation.dailyAdjustment}`
                  : calculation.dailyAdjustment}{' '}
                kcal
              </p>
            </div>

            {/* 3 Macro Cards & Water Intake */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-[#F3EEFE] dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/30">
                <span className="text-sm sm:text-base font-bold text-purple-700 dark:text-purple-300">
                  {calculation.protein}g
                </span>
                <span className="block text-[10px] font-semibold text-purple-600/80 uppercase mt-0.5">
                  Protein
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FFF5E5] dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/30">
                <span className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-300">
                  {calculation.carbs}g
                </span>
                <span className="block text-[10px] font-semibold text-amber-600/80 uppercase mt-0.5">
                  Carbs
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#E6F8F6] dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-900/30">
                <span className="text-sm sm:text-base font-bold text-teal-700 dark:text-teal-300">
                  {calculation.fats}g
                </span>
                <span className="block text-[10px] font-semibold text-teal-600/80 uppercase mt-0.5">
                  Fats
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#80CBEB]/20 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900/30">
                <span className="text-sm sm:text-base font-bold text-sky-700 dark:text-sky-300">
                  {(calculation.waterMl / 1000).toFixed(1)}L
                </span>
                <span className="block text-[10px] font-semibold text-sky-600/80 uppercase mt-0.5">
                  Water
                </span>
              </div>
            </div>

            {/* Routine & Schedule Pill Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Routine &amp; Frequency
                </span>
                <div className="font-bold text-slate-900 dark:text-white">
                  {preferredRoutine} ({workoutDaysPerWeek} Days / Week)
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                ✓ Ready
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="py-3 px-5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Back
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="py-3 px-4 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="flex-1 py-4 px-6 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-xl active:scale-[0.99]"
              >
                <span>{isSubmitting ? 'Saving Profile...' : 'Save & Enter Fitness Tracker'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
