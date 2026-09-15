import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  TrendingUp,
  Zap,
  LogOut,
  Clock,
  ShieldCheck,
  Apple,
  HeartPulse,
  Activity,
  CheckCircle2,
  MessageSquare,
  X,
  ChevronRight,
} from 'lucide-react';
import {
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

// Smooth Count-Up component for numerical reveal
function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const startTime = performance.now();
    const durationMs = duration * 1000;

    let frameId: number;
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.round(start + (end - start) * ease));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onCancel,
  initialName = '',
  isDarkMode = false,
}) => {
  // Step 0: Welcome / Overview
  // Step 1: Identity (Name, Sex, Age)
  // Step 2: Body Baseline (Weight, Height)
  // Step 3: Daily Routine & Occupation
  // Step 4: Primary Goal & Target Weight
  // Step 5: Timeline & Workout Schedule
  // Step 6: Custom Plan Blueprint Reveal
  const [step, setStep] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

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

  // Sync URL history state so onboarding functions as a dedicated full-screen page route
  useEffect(() => {
    if (isOpen) {
      const prevPath = window.location.pathname;
      window.history.pushState({ inOnboarding: true }, '', '/onboarding');
      return () => {
        if (window.location.pathname === '/onboarding') {
          window.history.replaceState({}, '', prevPath === '/onboarding' ? '/' : prevPath);
        }
      };
    }
  }, [isOpen]);

  // Navigate steps with motion direction
  const goToStep = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    if (nextStep === 6) {
      setIsCalculating(true);
      setStep(6);
      setTimeout(() => {
        setIsCalculating(false);
      }, 1000);
    } else {
      setStep(nextStep);
    }
  };

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
        const totalDeficit = Math.abs(weightDiffKg) * 7700;
        dailyAdjustment = -Math.round(totalDeficit / totalDays);
        dailyAdjustment = Math.max(-800, Math.min(-200, dailyAdjustment));
      } else {
        const totalSurplus = weightDiffKg * 4500;
        dailyAdjustment = Math.round(totalSurplus / totalDays);
        dailyAdjustment = Math.min(600, Math.max(150, dailyAdjustment));
      }
    } else {
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

  const totalSteps = 6;
  const progressRatio = step === 0 ? 0.08 : step / totalSteps;

  const getNextButtonLabel = () => {
    switch (step) {
      case 0:
        return 'Start Setup';
      case 1:
        return 'Continue to Body Metrics';
      case 2:
        return 'Continue to Daily Routine';
      case 3:
        return 'Continue to Fitness Goal';
      case 4:
        return 'Continue to Schedule';
      case 5:
        return 'Generate My Blueprint';
      case 6:
        return isSubmitting ? 'Saving Blueprint...' : 'Enter FitTrack Hub';
      default:
        return 'Continue';
    }
  };

  const handleNextClick = () => {
    if (step < 6) {
      goToStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const currentWeightNum = Number(weight) || 70;
  const currentHeightNum = Number(height) || 175;

  return (
    <div
      id="fittrack-onboarding-page"
      className={`fixed inset-0 z-50 w-full h-full min-h-screen overflow-x-hidden overflow-y-auto flex flex-col font-['Plus_Jakarta_Sans',sans-serif] select-none transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[#141519] text-white'
          : 'bg-[#F8F9FA] text-neutral-900'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP BAR: Back Button saying 'Back to Login' & Clean Progress Bar       */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F8F9FA]/90 dark:bg-[#141519]/90 border-b border-neutral-200/90 dark:border-neutral-800/90 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
        {/* Left: Back Button saying Back to Login */}
        <div className="flex items-center gap-3">
          <button
            id="btn-onboarding-back"
            type="button"
            onClick={() => {
              if (step === 0 && onCancel) {
                onCancel();
              } else if (step > 0) {
                goToStep(step - 1);
              } else if (onCancel) {
                onCancel();
              }
            }}
            className="text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAECEF] dark:bg-neutral-800 hover:bg-[#dfe2e6] dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-2xs active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{step === 0 ? 'Back to Login' : 'Back'}</span>
          </button>
        </div>

        {/* Center: Slim Progress Indicator with Percentage */}
        <div className="flex-1 max-w-xs sm:max-w-md mx-4">
          <div className="flex items-center justify-between mb-1.5 text-[10px] sm:text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            <span>
              {step === 0 ? 'Welcome' : `Step ${step} of ${totalSteps}`}
            </span>
            <span className="text-neutral-900 dark:text-white font-extrabold">
              {Math.round(progressRatio * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-neutral-900 dark:bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${progressRatio * 100}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Right side spacer for balanced centering (No Cross Icon) */}
        <div className="w-16 hidden sm:block" />
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN SCROLLABLE CONTENT BODY                                           */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, y: direction > 0 ? 12 : -12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction > 0 ? -12 : 12, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center"
          >
            {/* ========================================================================= */}
            {/* STEP 0: WELCOME & COACH SPECIALIST OVERVIEW                                */}
            {/* ========================================================================= */}
            {step === 0 && (
              <div className="w-full max-w-2xl space-y-6">
                {/* Heading Block matching AI Coach Title & Sparkle + Dashed Pill */}
                <div className="flex items-end justify-between gap-3 pt-1">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-1">
                      FitTrack Setup
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.08]">
                      Personalize Your<br />Fitness Blueprint
                    </h1>
                  </div>

                  <div className="flex items-center gap-1.5 pb-0.5 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#EFFCA7] text-neutral-900 flex items-center justify-center shadow-2xs">
                      <Sparkles className="w-5 h-5 fill-neutral-900 text-neutral-900" />
                    </div>
                    <div className="border border-dashed border-neutral-900 dark:border-neutral-400 rounded-full py-1.5 px-3 flex items-center gap-1.5 bg-white/80 dark:bg-neutral-800/80 shadow-2xs">
                      <div className="w-5 h-5 rounded-md bg-[#F9C3C8] text-neutral-900 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-3 h-3 fill-neutral-900 text-neutral-900" />
                      </div>
                      <span className="text-[11px] font-extrabold tracking-wider text-neutral-900 dark:text-white uppercase">
                        AI ENGINE
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                  Connect your personal metrics to build your exact calorie deficit or surplus, dynamic macronutrient breakdown, and optimal training split tailored to your lifestyle.
                </p>

                {/* 4 Specialty Pillars using the exact AI Coach Pastel Cards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Coaching Pillars Configured
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      4 Modules
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Workout / Coral */}
                    <div className="bg-[#FED4CF] rounded-[28px] p-4 flex flex-col justify-between h-[175px] shadow-2xs border border-black/5">
                      <div className="w-10 h-10 rounded-full bg-[#FBAEA5] flex items-center justify-center shadow-2xs">
                        <Dumbbell className="w-5 h-5 text-neutral-900" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-neutral-900 leading-tight">
                          Training Splits
                        </div>
                        <div className="text-[10px] text-neutral-700/80 font-medium mt-1 leading-snug">
                          Targeted frequency &amp; volume
                        </div>
                      </div>
                    </div>

                    {/* Nutrition / Lime */}
                    <div className="bg-[#EFFCA7] rounded-[28px] p-4 flex flex-col justify-between h-[175px] shadow-2xs border border-black/5">
                      <div className="w-10 h-10 rounded-full bg-[#DCEB7A] flex items-center justify-center shadow-2xs">
                        <Apple className="w-5 h-5 text-neutral-900" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-neutral-900 leading-tight">
                          Nutrition &amp; Macros
                        </div>
                        <div className="text-[10px] text-neutral-700/80 font-medium mt-1 leading-snug">
                          Calorie deficit &amp; protein targets
                        </div>
                      </div>
                    </div>

                    {/* Hydration / Sky */}
                    <div className="bg-[#D2EEFF] rounded-[28px] p-4 flex flex-col justify-between h-[175px] shadow-2xs border border-black/5">
                      <div className="w-10 h-10 rounded-full bg-[#B2E0FD] flex items-center justify-center shadow-2xs">
                        <Droplets className="w-5 h-5 text-neutral-900" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-neutral-900 leading-tight">
                          Hydration
                        </div>
                        <div className="text-[10px] text-neutral-700/80 font-medium mt-1 leading-snug">
                          Optimal electrolyte &amp; ml goals
                        </div>
                      </div>
                    </div>

                    {/* Goals / Lilac */}
                    <div className="bg-[#EAD5FB] rounded-[28px] p-4 flex flex-col justify-between h-[175px] shadow-2xs border border-black/5">
                      <div className="w-10 h-10 rounded-full bg-[#D6B5F9] flex items-center justify-center shadow-2xs">
                        <TrendingUp className="w-5 h-5 text-neutral-900" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-neutral-900 leading-tight">
                          Weight Trajectory
                        </div>
                        <div className="text-[10px] text-neutral-700/80 font-medium mt-1 leading-snug">
                          Paced progress forecasting
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 1: IDENTITY (NAME, GENDER, AGE)                                     */}
            {/* ========================================================================= */}
            {step === 1 && (
              <div className="w-full max-w-xl space-y-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Step 1 of {totalSteps}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
                    Tell us about yourself
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    Your biological profile determines your baseline basal metabolic rate (BMR).
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Name input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 pl-1">
                      Preferred Name
                    </label>
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 h-13 sm:h-14 rounded-full px-4 flex items-center shadow-2xs">
                      <User className="w-4 h-4 text-neutral-400 mr-3 shrink-0" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-transparent text-sm font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Biological sex selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 pl-1">
                      Biological Sex (for metabolic calculations)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`p-4 rounded-[24px] border text-left transition-all cursor-pointer active:scale-98 flex items-center justify-between ${
                          gender === 'male'
                            ? 'bg-black text-white dark:bg-white dark:text-neutral-900 border-black dark:border-white shadow-xs'
                            : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">👨</span>
                          <div>
                            <div className="text-sm font-extrabold leading-tight">Male</div>
                            <div className={`text-[10.5px] mt-0.5 ${gender === 'male' ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400'}`}>
                              Standard BMR (+5 kcal)
                            </div>
                          </div>
                        </div>
                        {gender === 'male' && (
                          <div className="w-6 h-6 rounded-full bg-[#EFFCA7] text-neutral-900 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={`p-4 rounded-[24px] border text-left transition-all cursor-pointer active:scale-98 flex items-center justify-between ${
                          gender === 'female'
                            ? 'bg-black text-white dark:bg-white dark:text-neutral-900 border-black dark:border-white shadow-xs'
                            : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">👩</span>
                          <div>
                            <div className="text-sm font-extrabold leading-tight">Female</div>
                            <div className={`text-[10.5px] mt-0.5 ${gender === 'female' ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400'}`}>
                              Standard BMR (-161 kcal)
                            </div>
                          </div>
                        </div>
                        {gender === 'female' && (
                          <div className="w-6 h-6 rounded-full bg-[#EFFCA7] text-neutral-900 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Age Slider Card */}
                  <div className="p-4 sm:p-5 rounded-[24px] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        Age
                      </span>
                      <span className="text-sm font-extrabold text-neutral-900 dark:text-white px-3 py-1 rounded-full bg-[#EAECEF] dark:bg-neutral-800">
                        {age} years old
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <input
                        type="range"
                        min={14}
                        max={85}
                        value={Number(age) || 24}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-white"
                      />
                      <input
                        type="number"
                        min={14}
                        max={99}
                        value={age}
                        onChange={(e) => setAge(Math.max(12, Math.min(99, Number(e.target.value))))}
                        className="w-16 h-11 text-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-extrabold text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: BODY BASELINE (WEIGHT & HEIGHT)                                   */}
            {/* ========================================================================= */}
            {step === 2 && (
              <div className="w-full max-w-xl space-y-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Step 2 of {totalSteps}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
                    Physical Baseline
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    Used to accurately establish your lean mass needs and total daily energy expenditure.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Current Weight Card */}
                  <div className="p-4 sm:p-5 rounded-[24px] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#FED4CF] flex items-center justify-center">
                          <Scale className="w-4 h-4 text-neutral-900" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                          Current Weight
                        </span>
                      </div>

                      {/* kg / lbs Toggle */}
                      <div className="flex rounded-full bg-[#EAECEF] dark:bg-neutral-800 p-0.5 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            if (weightUnit === 'lbs') {
                              setWeightUnit('kg');
                              setWeight(Math.round(currentWeightNum * 0.453592));
                            }
                          }}
                          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                            weightUnit === 'kg' ? 'bg-black text-white dark:bg-white dark:text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          kg
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (weightUnit === 'kg') {
                              setWeightUnit('lbs');
                              setWeight(Math.round(currentWeightNum * 2.20462));
                            }
                          }}
                          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                            weightUnit === 'lbs' ? 'bg-black text-white dark:bg-white dark:text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          lbs
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <input
                        type="range"
                        min={weightUnit === 'kg' ? 35 : 75}
                        max={weightUnit === 'kg' ? 180 : 400}
                        step={0.5}
                        value={currentWeightNum}
                        onChange={(e) => setWeight(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-white"
                      />
                      <div className="relative min-w-[100px]">
                        <input
                          type="number"
                          step={0.5}
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full h-11 text-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-base font-extrabold text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-neutral-400 uppercase pointer-events-none">
                          {weightUnit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Height Card */}
                  <div className="p-4 sm:p-5 rounded-[24px] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#EFFCA7] flex items-center justify-center">
                          <Ruler className="w-4 h-4 text-neutral-900" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                          Height
                        </span>
                      </div>

                      {/* cm / ft Toggle */}
                      <div className="flex rounded-full bg-[#EAECEF] dark:bg-neutral-800 p-0.5 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            if (heightUnit === 'ft') {
                              setHeightUnit('cm');
                              setHeight(Math.round(currentHeightNum * 30.48));
                            }
                          }}
                          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                            heightUnit === 'cm' ? 'bg-black text-white dark:bg-white dark:text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          cm
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (heightUnit === 'cm') {
                              setHeightUnit('ft');
                              setHeight((currentHeightNum / 30.48).toFixed(1));
                            }
                          }}
                          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                            heightUnit === 'ft' ? 'bg-black text-white dark:bg-white dark:text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          ft
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <input
                        type="range"
                        min={heightUnit === 'cm' ? 120 : 4.0}
                        max={heightUnit === 'cm' ? 220 : 7.2}
                        step={heightUnit === 'cm' ? 1 : 0.1}
                        value={currentHeightNum}
                        onChange={(e) => setHeight(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-white"
                      />
                      <div className="relative min-w-[100px]">
                        <input
                          type="number"
                          step={heightUnit === 'cm' ? 1 : 0.1}
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="w-full h-11 text-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-base font-extrabold text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-neutral-400 uppercase pointer-events-none">
                          {heightUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: DAILY ROUTINE & OCCUPATION                                        */}
            {/* ========================================================================= */}
            {step === 3 && (
              <div className="w-full max-w-xl space-y-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Step 3 of {totalSteps}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
                    Daily Movement Routine
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    Non-exercise activity accounts for a substantial percentage of your daily energy output.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Occupation selection cards */}
                  <div className="space-y-2">
                    {[
                      {
                        id: 'desk_worker',
                        icon: MdComputer,
                        title: 'Desk / Remote Worker',
                        desc: 'Seated at a workstation for most of the workday',
                      },
                      {
                        id: 'standing',
                        icon: MdSchool,
                        title: 'Standing / Educator / Retail',
                        desc: 'On your feet with regular intermittent movement',
                      },
                      {
                        id: 'active_field',
                        icon: MdDirectionsRun,
                        title: 'Active / Field Work',
                        desc: 'Constantly walking, traveling, or on site outdoors',
                      },
                      {
                        id: 'heavy_labor',
                        icon: MdFitnessCenter,
                        title: 'Heavy Physical Labor',
                        desc: 'High demand lifting, warehouse, or construction work',
                      },
                    ].map(({ id, icon: Icon, title, desc }) => {
                      const isSelected = occupationType === id;
                      return (
                        <div
                          key={id}
                          onClick={() => setOccupationType(id)}
                          className={`p-3.5 sm:p-4 rounded-[22px] border transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-99 ${
                            isSelected
                              ? 'bg-black text-white dark:bg-white dark:text-neutral-900 border-black dark:border-white shadow-xs'
                              : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black'
                                  : 'bg-[#EAECEF] dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                              }`}
                            >
                              <Icon size={20} />
                            </div>
                            <div>
                              <div className="text-sm font-extrabold leading-tight">{title}</div>
                              <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}`}>
                                {desc}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[#EFFCA7] text-neutral-900 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* General Activity Level Chips */}
                  <div className="space-y-2 pt-1">
                    <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 pl-1">
                      Overall Baseline Activity
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'sedentary', label: 'Sedentary (<5k steps)' },
                        { id: 'lightly_active', label: 'Lightly Active (5k–8k steps)' },
                        { id: 'moderately_active', label: 'Moderately Active (8k–12k steps)' },
                        { id: 'very_active', label: 'Very Active (12k+ steps)' },
                      ].map(({ id, label }) => {
                        const isSel = activityLevel === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setActivityLevel(id)}
                            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              isSel
                                ? 'bg-black text-white dark:bg-white dark:text-neutral-900 shadow-2xs'
                                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 4: PRIMARY GOAL & TARGET BODY WEIGHT                                 */}
            {/* ========================================================================= */}
            {step === 4 && (
              <div className="w-full max-w-xl space-y-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Step 4 of {totalSteps}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
                    Your Primary Fitness Goal
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    Determines caloric surplus/deficit calculations, protein ratios, and volume targets.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Goal Cards */}
                  <div className="space-y-2">
                    {[
                      {
                        id: 'build_muscle',
                        icon: Dumbbell,
                        title: 'Muscle Hypertrophy & Growth',
                        desc: 'Lean caloric surplus with elevated protein synthesis',
                        colorBadge: 'bg-[#FED4CF]',
                      },
                      {
                        id: 'lose_weight',
                        icon: Flame,
                        title: 'Fat Loss & Definition',
                        desc: 'Controlled caloric deficit with muscle sparing protocols',
                        colorBadge: 'bg-[#EFFCA7]',
                      },
                      {
                        id: 'strength',
                        icon: Zap,
                        title: 'Raw Strength & Power',
                        desc: 'Performance-focused fueling with progressive overload',
                        colorBadge: 'bg-[#D2EEFF]',
                      },
                      {
                        id: 'endurance',
                        icon: HeartPulse,
                        title: 'Cardiovascular Endurance',
                        desc: 'Stamina, glycogen replenishment, and conditioning',
                        colorBadge: 'bg-[#EAD5FB]',
                      },
                      {
                        id: 'general_fitness',
                        icon: Target,
                        title: 'General Health & Mobility',
                        desc: 'Balanced maintenance calories with joint longevity',
                        colorBadge: 'bg-[#EFFCA7]',
                      },
                    ].map(({ id, icon: Icon, title, desc, colorBadge }) => {
                      const isSelected = fitnessGoal === id;
                      return (
                        <div
                          key={id}
                          onClick={() => setFitnessGoal(id)}
                          className={`p-3.5 sm:p-4 rounded-[22px] border transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-99 ${
                            isSelected
                              ? 'bg-black text-white dark:bg-white dark:text-neutral-900 border-black dark:border-white shadow-xs'
                              : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-full ${colorBadge} text-neutral-900 flex items-center justify-center shrink-0 shadow-2xs`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-sm font-extrabold leading-tight">{title}</div>
                              <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}`}>
                                {desc}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[#EFFCA7] text-neutral-900 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Target Weight Card */}
                  <div className="p-4 sm:p-5 rounded-[24px] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#EAD5FB] flex items-center justify-center">
                          <Target className="w-4 h-4 text-neutral-900" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                          Target Body Weight
                        </span>
                      </div>
                      <span className="text-xs font-bold text-neutral-500">
                        Current: {weight} {weightUnit}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <input
                        type="range"
                        min={weightUnit === 'kg' ? 35 : 75}
                        max={weightUnit === 'kg' ? 180 : 400}
                        step={0.5}
                        value={Number(targetWeight) || currentWeightNum}
                        onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-white"
                      />
                      <div className="relative min-w-[100px]">
                        <input
                          type="number"
                          step={0.5}
                          value={targetWeight}
                          onChange={(e) => setTargetWeight(e.target.value)}
                          className="w-full h-11 text-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-base font-extrabold text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-neutral-400 uppercase pointer-events-none">
                          {weightUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 5: TIMELINE & WORKOUT SPLIT                                          */}
            {/* ========================================================================= */}
            {step === 5 && (
              <div className="w-full max-w-xl space-y-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Step 5 of {totalSteps}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
                    Schedule &amp; Training Split
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    Structure your weekly workout frequency and milestone pacing.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Target Timeframe */}
                  <div className="p-4 sm:p-5 rounded-[24px] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#D2EEFF] flex items-center justify-center">
                          <Clock className="w-4 h-4 text-neutral-900" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                          Target Timeline
                        </span>
                      </div>

                      <div className="flex rounded-full bg-[#EAECEF] dark:bg-neutral-800 p-0.5 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setTargetTimeframeUnit('months')}
                          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                            targetTimeframeUnit === 'months' ? 'bg-black text-white dark:bg-white dark:text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          Months
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetTimeframeUnit('years')}
                          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                            targetTimeframeUnit === 'years' ? 'bg-black text-white dark:bg-white dark:text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          Years
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <input
                        type="range"
                        min={1}
                        max={targetTimeframeUnit === 'months' ? 24 : 5}
                        value={Number(targetTimeframeValue) || 3}
                        onChange={(e) => setTargetTimeframeValue(Number(e.target.value))}
                        className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-white"
                      />
                      <span className="text-sm font-extrabold text-neutral-900 dark:text-white px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 min-w-[90px] text-center">
                        {targetTimeframeValue} {targetTimeframeUnit}
                      </span>
                    </div>
                  </div>

                  {/* Workout Days Per Week */}
                  <div className="p-4 sm:p-5 rounded-[24px] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        Weekly Training Frequency
                      </span>
                      <span className="text-xs font-extrabold text-neutral-900 dark:text-white">
                        {workoutDaysPerWeek} Days / Week
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                        const isSel = workoutDaysPerWeek === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setWorkoutDaysPerWeek(num)}
                            className={`h-11 sm:h-12 rounded-2xl font-extrabold text-sm transition-all cursor-pointer flex items-center justify-center ${
                              isSel
                                ? 'bg-black text-white dark:bg-white dark:text-neutral-900 shadow-xs scale-105'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                            }`}
                          >
                            {num}d
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Split */}
                  <div className="space-y-2 pt-1">
                    <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 pl-1">
                      Preferred Workout Split Structure
                    </span>
                    <div className="space-y-2">
                      {[
                        'Single Body Part (6 Days)',
                        'Push / Pull / Legs (PPL - 6 Days)',
                        'Upper / Lower Split (4 Days)',
                        'Full Body Blast (3 Days)',
                        'High Intensity Cardio & Conditioning',
                      ].map((split) => {
                        const isSel = preferredRoutine === split;
                        return (
                          <div
                            key={split}
                            onClick={() => setPreferredRoutine(split)}
                            className={`p-3.5 rounded-[20px] border transition-all cursor-pointer flex items-center justify-between active:scale-99 ${
                              isSel
                                ? 'bg-black text-white dark:bg-white dark:text-neutral-900 border-black dark:border-white shadow-xs'
                                : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400'
                            }`}
                          >
                            <span className="text-xs sm:text-sm font-extrabold">{split}</span>
                            {isSel && (
                              <div className="w-5 h-5 rounded-full bg-[#EFFCA7] text-neutral-900 flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 6: CUSTOM PLAN BLUEPRINT REVEAL                                      */}
            {/* ========================================================================= */}
            {step === 6 && (
              <div className="w-full max-w-xl space-y-6">
                {isCalculating ? (
                  /* Calculating state with coach thinking indicator */
                  <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#EFFCA7] text-neutral-900 flex items-center justify-center shadow-md animate-bounce">
                      <Sparkles className="w-8 h-8 fill-neutral-900" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                        Synthesizing Your Blueprint...
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Calculating energy balance, macro distribution, and hydration targets
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                      <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#EFFCA7] text-neutral-900 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 fill-neutral-900" />
                        </div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
                          Custom Plan Ready
                        </span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.08]">
                        Your Daily Blueprint
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                        Tailored specifically for {name || 'Athlete'} to achieve peak results.
                      </p>
                    </div>

                    {/* Primary Hero Metric: Daily Calories Card */}
                    <div className="p-6 rounded-[28px] bg-black text-white dark:bg-white dark:text-neutral-900 shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                          Daily Energy Target
                        </span>
                        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
                          <AnimatedCounter value={calculation.calories} /> <span className="text-base font-bold text-neutral-400 dark:text-neutral-600">kcal / day</span>
                        </div>
                        <span className="text-[11px] text-neutral-300 dark:text-neutral-600 font-medium block mt-1">
                          {calculation.dailyAdjustment === 0
                            ? 'Caloric Maintenance (TDEE)'
                            : calculation.dailyAdjustment > 0
                            ? `+${calculation.dailyAdjustment} kcal lean mass surplus`
                            : `${calculation.dailyAdjustment} kcal fat loss deficit`}
                        </span>
                      </div>

                      <div className="w-14 h-14 rounded-full bg-[#EFFCA7] text-neutral-900 flex items-center justify-center shadow-xs shrink-0">
                        <Flame className="w-7 h-7 fill-neutral-900" />
                      </div>
                    </div>

                    {/* 3 Macro Cards */}
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                      {/* Protein */}
                      <div className="p-3.5 sm:p-4 rounded-[22px] bg-[#FED4CF] border border-black/5 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-neutral-700 uppercase tracking-wider block">
                          Protein
                        </span>
                        <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 mt-0.5">
                          <AnimatedCounter value={calculation.protein} />g
                        </div>
                        <span className="text-[10px] text-neutral-700 font-semibold block mt-0.5">
                          {Math.round((calculation.protein * 4 / calculation.calories) * 100)}% of intake
                        </span>
                      </div>

                      {/* Carbs */}
                      <div className="p-3.5 sm:p-4 rounded-[22px] bg-[#EFFCA7] border border-black/5 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-neutral-700 uppercase tracking-wider block">
                          Carbs
                        </span>
                        <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 mt-0.5">
                          <AnimatedCounter value={calculation.carbs} />g
                        </div>
                        <span className="text-[10px] text-neutral-700 font-semibold block mt-0.5">
                          {Math.round((calculation.carbs * 4 / calculation.calories) * 100)}% of intake
                        </span>
                      </div>

                      {/* Fats */}
                      <div className="p-3.5 sm:p-4 rounded-[22px] bg-[#D2EEFF] border border-black/5 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-neutral-700 uppercase tracking-wider block">
                          Healthy Fats
                        </span>
                        <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 mt-0.5">
                          <AnimatedCounter value={calculation.fats} />g
                        </div>
                        <span className="text-[10px] text-neutral-700 font-semibold block mt-0.5">
                          {Math.round((calculation.fats * 9 / calculation.calories) * 100)}% of intake
                        </span>
                      </div>
                    </div>

                    {/* Secondary Detail Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Hydration */}
                      <div className="p-4 rounded-[22px] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#D2EEFF] flex items-center justify-center shrink-0">
                            <Droplets className="w-5 h-5 text-neutral-900" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              Hydration Target
                            </span>
                            <div className="text-base font-extrabold text-neutral-900 dark:text-white">
                              <AnimatedCounter value={calculation.waterMl} /> ml / day
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Workout Split */}
                      <div className="p-4 rounded-[22px] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#FED4CF] flex items-center justify-center shrink-0">
                            <Dumbbell className="w-5 h-5 text-neutral-900" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              Training Split
                            </span>
                            <div className="text-xs font-extrabold text-neutral-900 dark:text-white truncate max-w-[150px]">
                              {preferredRoutine}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM ACTION BAR: Capsule CTA with Instant Feedback                  */}
      {/* ========================================================================= */}
      <footer className="sticky bottom-0 z-40 w-full backdrop-blur-md bg-[#F8F9FA]/90 dark:bg-[#141519]/90 border-t border-neutral-200/90 dark:border-neutral-800/90 px-4 sm:px-8 py-4 flex items-center justify-center">
        <div className="w-full max-w-xl flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => goToStep(step - 1)}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
              title="Previous Step"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <button
            id="btn-onboarding-primary-next"
            type="button"
            disabled={isSubmitting}
            onClick={handleNextClick}
            className="flex-1 h-13 sm:h-14 rounded-full bg-black text-white dark:bg-white dark:text-neutral-900 font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
          >
            <span>{getNextButtonLabel()}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.8]" />
          </button>
        </div>
      </footer>
    </div>
  );
};
