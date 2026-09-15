import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Plus,
  Settings,
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  Clock,
  Trash2,
  ChevronRight,
  Info,
  FastForward,
} from 'lucide-react';

interface ActiveWorkoutSessionScreenProps {
  sessionTitle?: string;
  routine?: any;
  onFinishWorkout?: (summary?: any) => void;
  onClose?: () => void;
  isDarkMode?: boolean;
}

interface WorkoutSetItem {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

interface ExerciseItem {
  id: string;
  name: string;
  equipment: string;
  category: string;
  iconType: 'barbell' | 'dumbbell' | 'cable' | 'cable-tricep';
  sets: WorkoutSetItem[];
  tips?: string;
}

function detectIconType(name: string = '', equipment: string = ''): 'barbell' | 'dumbbell' | 'cable' | 'cable-tricep' {
  const text = (name + ' ' + equipment).toLowerCase();
  if (text.includes('tricep')) return 'cable-tricep';
  if (text.includes('cable') || text.includes('pulldown') || text.includes('row') || text.includes('fly')) return 'cable';
  if (text.includes('dumbbell') || text.includes('db')) return 'dumbbell';
  return 'barbell';
}

function buildExercisesFromRoutine(routine: any, fallbackTitle: string): ExerciseItem[] {
  if (!routine || !Array.isArray(routine.exercises) || routine.exercises.length === 0) {
    return [
      {
        id: 'default-ex-1',
        name: fallbackTitle || 'Workout Exercise',
        equipment: 'Barbell',
        category: 'Strength',
        iconType: 'barbell',
        tips: 'Keep shoulders retracted, feet planted firmly on floor, slight arch in lower back, lower bar to mid-chest with control.',
        sets: [
          { setNumber: 1, weight: 0, reps: 10, completed: false },
          { setNumber: 2, weight: 0, reps: 10, completed: false },
          { setNumber: 3, weight: 0, reps: 10, completed: false },
        ],
      },
    ];
  }

  return routine.exercises.map((ex: any, idx: number) => {
    const rawSets = typeof ex.sets === 'string' ? parseInt(ex.sets, 10) : Number(ex.sets);
    const numSets = Math.min(12, Math.max(1, isNaN(rawSets) ? 3 : rawSets));

    const rawReps = typeof ex.reps === 'string' ? parseInt(ex.reps, 10) : Number(ex.reps);
    const numReps = Math.min(100, Math.max(1, isNaN(rawReps) ? 10 : rawReps));

    const weightNum = Number(ex.weight) || 0;

    const sets: WorkoutSetItem[] = [];
    for (let s = 1; s <= numSets; s++) {
      sets.push({
        setNumber: s,
        weight: weightNum,
        reps: numReps,
        completed: false,
      });
    }

    const name = ex.name || `Exercise ${idx + 1}`;
    const notes = ex.notes || '';
    const equipment = ex.equipment || (notes.includes('•') ? notes.split('•')[0].trim() : 'Equipment');
    const category = ex.targetMuscle || (notes.includes('•') ? notes.split('•')[1].trim() : (routine.category || 'Strength'));

    return {
      id: ex._id || `routine-ex-${idx}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      equipment,
      category,
      iconType: detectIconType(name, equipment),
      tips: `Perform ${name} with controlled tempo and steady breathing throughout each set.`,
      sets,
    };
  });
}

export const ActiveWorkoutSessionScreen: React.FC<ActiveWorkoutSessionScreenProps> = ({
  sessionTitle = 'Workout Session',
  routine,
  onFinishWorkout,
  onClose,
  isDarkMode = false,
}) => {
  const displayTitle =
    (routine && routine.name) ||
    (typeof sessionTitle === 'string' && sessionTitle.trim() ? sessionTitle : 'Workout Session');

  // Exercises list state - dynamically built from the actual routine
  const [exercises, setExercises] = useState<ExerciseItem[]>(() =>
    buildExercisesFromRoutine(routine, displayTitle)
  );
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [activeSetNumber, setActiveSetNumber] = useState<number>(1);

  // Overall workout elapsed timer - starts fresh at 00:00
  const [workoutElapsedSeconds, setWorkoutElapsedSeconds] = useState(0);

  // Rest Timer State
  const [defaultRestDuration, setDefaultRestDuration] = useState(75);
  const [timerSeconds, setTimerSeconds] = useState(75);
  const [timerRunning, setTimerRunning] = useState(false);
  const [autoStartTimer, setAutoStartTimer] = useState(true);
  const isResting = timerRunning && timerSeconds > 0;

  // Weight Unit State: 'kg' vs 'lbs'
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>(() => {
    return (localStorage.getItem('fitness_weight_unit') as 'lbs' | 'kg') || 'kg';
  });

  const handleSetWeightUnit = (newUnit: 'lbs' | 'kg') => {
    if (newUnit === weightUnit) return;
    setWeightUnit(newUnit);
    localStorage.setItem('fitness_weight_unit', newUnit);
    setExercises((prev) =>
      prev.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({
          ...s,
          weight:
            s.weight > 0
              ? newUnit === 'kg'
                ? Math.round((s.weight / 2.20462) * 2) / 2
                : Math.round(s.weight * 2.20462)
              : 0,
        })),
      }))
    );
  };

  const handleToggleWeightUnit = () => {
    handleSetWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg');
  };

  // Synchronize when routine prop updates
  useEffect(() => {
    if (routine && routine.exercises && routine.exercises.length) {
      setExercises(buildExercisesFromRoutine(routine, displayTitle));
      setCurrentExerciseIndex(0);
      setActiveSetNumber(1);
    }
  }, [routine, displayTitle]);

  // Modals & Popups
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Session Notes
  const [sessionNotes, setSessionNotes] = useState('');

  const currentExercise = exercises[currentExerciseIndex] || exercises[0];

  // Workout duration counter
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkoutElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rest Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleAdd30s = () => {
    setTimerSeconds((prev) => prev + 30);
    setTimerRunning(true);
  };

  const handleSkipTimer = () => {
    setTimerSeconds(0);
    setTimerRunning(false);
  };

  const handleResetTimer = () => {
    setTimerSeconds(defaultRestDuration);
    setTimerRunning(true);
  };

  // Toggle set completed
  const toggleSetComplete = (setNumber: number) => {
    if (isResting) return;
    setExercises((prevExercises) => {
      const updated = [...prevExercises];
      const exercise = { ...updated[currentExerciseIndex] };
      const updatedSets = exercise.sets.map((s) => {
        if (s.setNumber === setNumber) {
          const nextCompleted = !s.completed;
          if (nextCompleted && autoStartTimer) {
            setTimerSeconds(defaultRestDuration);
            setTimerRunning(true);
          }
          return { ...s, completed: nextCompleted };
        }
        return s;
      });
      exercise.sets = updatedSets;
      updated[currentExerciseIndex] = exercise;
      return updated;
    });

    // Advance active set selection
    const nextIncomplete = currentExercise.sets.find(
      (s) => s.setNumber > setNumber && !s.completed
    );
    if (nextIncomplete) {
      setActiveSetNumber(nextIncomplete.setNumber);
    }
  };

  const updateSetWeight = (setNumber: number, weightValue: string | number) => {
    if (isResting) return;
    const num = Math.max(0, parseInt(weightValue.toString(), 10) || 0);
    setExercises((prevExercises) => {
      const updated = [...prevExercises];
      const exercise = { ...updated[currentExerciseIndex] };
      exercise.sets = exercise.sets.map((s) =>
        s.setNumber === setNumber ? { ...s, weight: num } : s
      );
      updated[currentExerciseIndex] = exercise;
      return updated;
    });
  };

  const updateSetReps = (setNumber: number, repsValue: string | number) => {
    if (isResting) return;
    const num = Math.max(0, parseInt(repsValue.toString(), 10) || 0);
    setExercises((prevExercises) => {
      const updated = [...prevExercises];
      const exercise = { ...updated[currentExerciseIndex] };
      exercise.sets = exercise.sets.map((s) =>
        s.setNumber === setNumber ? { ...s, reps: num } : s
      );
      updated[currentExerciseIndex] = exercise;
      return updated;
    });
  };

  const handleAddNewSet = () => {
    if (isResting) return;
    setExercises((prevExercises) => {
      const updated = [...prevExercises];
      const exercise = { ...updated[currentExerciseIndex] };
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const newSetNumber = (lastSet?.setNumber || 0) + 1;
      const newWeight = lastSet?.weight || 0;
      const newReps = lastSet?.reps || 10;

      exercise.sets = [
        ...exercise.sets,
        {
          setNumber: newSetNumber,
          weight: newWeight,
          reps: newReps,
          completed: false,
        },
      ];
      updated[currentExerciseIndex] = exercise;
      return updated;
    });
    setShowOptionsMenu(false);
  };

  const handleDeleteSet = (setNumber: number) => {
    if (isResting) return;
    if (currentExercise.sets.length <= 1) return;
    setExercises((prevExercises) => {
      const updated = [...prevExercises];
      const exercise = { ...updated[currentExerciseIndex] };
      const filtered = exercise.sets.filter((s) => s.setNumber !== setNumber);
      // Renumber
      exercise.sets = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      updated[currentExerciseIndex] = exercise;
      return updated;
    });
  };

  const handleMarkAllSetsCompleted = () => {
    if (isResting) return;
    setExercises((prevExercises) => {
      const updated = [...prevExercises];
      const exercise = { ...updated[currentExerciseIndex] };
      exercise.sets = exercise.sets.map((s) => ({ ...s, completed: true }));
      updated[currentExerciseIndex] = exercise;
      return updated;
    });
    setShowOptionsMenu(false);
  };

  const handleResetCurrentExerciseSets = () => {
    if (isResting) return;
    setExercises((prevExercises) => {
      const updated = [...prevExercises];
      const exercise = { ...updated[currentExerciseIndex] };
      exercise.sets = exercise.sets.map((s) => ({ ...s, completed: false }));
      updated[currentExerciseIndex] = exercise;
      return updated;
    });
    setShowOptionsMenu(false);
  };

  // Switch active exercise
  const handleSelectExercise = (index: number) => {
    if (isResting) return;
    setCurrentExerciseIndex(index);
    setShowOptionsMenu(false);
    const targetExercise = exercises[index];
    const firstIncomplete = targetExercise?.sets.find((s) => !s.completed);
    setActiveSetNumber(firstIncomplete ? firstIncomplete.setNumber : 1);
  };

  // Calculations for stats
  const totalCompletedSets = useMemo(() => {
    return exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    );
  }, [exercises]);

  const totalPossibleSets = useMemo(() => {
    return exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  }, [exercises]);

  const totalVolume = useMemo(() => {
    return exercises.reduce((acc, ex) => {
      const exVol = ex.sets
        .filter((s) => s.completed)
        .reduce((sum, s) => sum + s.weight * s.reps, 0);
      return acc + exVol;
    }, 0);
  }, [exercises]);

  const handleCloseClick = () => {
    if (totalCompletedSets > 0) {
      setShowExitConfirm(true);
    } else if (onClose) {
      onClose();
    }
  };

  const handleConfirmFinish = () => {
    setShowFinishModal(false);
    if (onFinishWorkout) {
      const completedExercises = exercises.map((ex) => {
        const completedSets = ex.sets.filter((s) => s.completed);
        const bestSet = completedSets.length > 0 ? completedSets[0] : ex.sets[0];
        return {
          name: ex.name,
          sets: completedSets.length || ex.sets.length,
          reps: bestSet?.reps || 10,
          weight: bestSet?.weight || 0,
        };
      });

      const totalCalories = Math.max(
        30,
        Math.round(totalCompletedSets * 30 + (workoutElapsedSeconds / 60) * 5)
      );

      onFinishWorkout({
        elapsedSeconds: workoutElapsedSeconds,
        caloriesBurned: totalCalories,
        exercisesPerformed: completedExercises,
        weightUnit: weightUnit,
      });
    }
  };

  const renderExerciseIcon = (iconType: ExerciseItem['iconType'], className = 'w-4 h-4') => {
    if (iconType === 'barbell') {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <line x1="4" y1="20" x2="20" y2="4" strokeLinecap="round" />
          <path d="M4 14l2-2" strokeLinecap="round" />
          <path d="M10 20l2-2" strokeLinecap="round" />
          <path d="M14 4l2 2" strokeLinecap="round" />
          <path d="M20 10l-2 2" strokeLinecap="round" />
          <line x1="2" y1="18" x2="6" y2="22" strokeLinecap="round" />
          <line x1="18" y1="2" x2="22" y2="6" strokeLinecap="round" />
        </svg>
      );
    }
    if (iconType === 'dumbbell') {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <line x1="4" y1="20" x2="20" y2="4" strokeLinecap="round" />
          <path d="M4 14l2-2" strokeLinecap="round" />
          <path d="M10 20l2-2" strokeLinecap="round" />
          <path d="M14 4l2 2" strokeLinecap="round" />
          <path d="M20 10l-2 2" strokeLinecap="round" />
        </svg>
      );
    }
    if (iconType === 'cable') {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="4" r="2" />
          <path d="M12 6v7" />
          <path d="M7 11h10" />
          <path d="M9 20l3-7 3 7" />
        </svg>
      );
    }
    // cable-tricep
    return (
      <div className="w-3.5 h-3.5 border-2 border-current rounded-xs" />
    );
  };

  // UP NEXT exercises are other exercises in list
  const upcomingExercises = exercises
    .map((ex, index) => ({ ...ex, originalIndex: index }))
    .filter((_, index) => index !== currentExerciseIndex);

  return (
    <div
      id="active-workout-screen"
      className="w-full max-w-[1240px] mx-auto flex flex-col gap-6 sm:gap-7 animate-in fade-in duration-200 select-none pb-8 relative"
    >
      {/* ========================================================================= */}
      {/* 1. TOP BAR: Close (X) + Active Session Title on Left, Elapsed Time & Finish Workout on Right */}
      {/* ========================================================================= */}
      <div className="w-full pb-4 sm:pb-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <button
            id="close-active-session-btn"
            onClick={handleCloseClick}
            className="text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Exit Session"
            aria-label="Exit Session"
          >
            <X className="w-5 h-5 stroke-[2.4]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-300 block leading-tight">
                Active Session
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {formatTime(workoutElapsedSeconds)}
              </span>
            </div>
            <h1
              id="active-session-title"
              className="text-[22px] md:text-[25px] font-bold text-slate-950 dark:text-white font-['Outfit'] tracking-tight leading-tight mt-0.5"
            >
              {displayTitle}
            </h1>
          </div>
        </div>

        {/* Right Actions: Volume pill + Unit Switcher + Finish Workout Neon Lime Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 font-['Outfit']">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>{totalVolume.toLocaleString()} {weightUnit}</span>
            <span className="text-slate-400">·</span>
            <span>{totalCompletedSets}/{totalPossibleSets} sets</span>
          </div>

          {/* Unit Switcher: kg vs lbs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-full border border-slate-200/70 dark:border-slate-700 text-xs font-bold font-['Outfit']">
            <button
              type="button"
              onClick={() => handleSetWeightUnit('kg')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                weightUnit === 'kg'
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-2xs font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Switch weights to kilograms"
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => handleSetWeightUnit('lbs')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                weightUnit === 'lbs'
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-2xs font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Switch weights to pounds"
            >
              lbs
            </button>
          </div>

          <button
            id="finish-workout-btn"
            onClick={() => setShowFinishModal(true)}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full bg-[#D4F81C] hover:bg-[#c3e810] active:scale-95 text-slate-950 font-bold text-xs sm:text-sm font-['Outfit'] transition-all cursor-pointer shadow-xs"
          >
            <span>Finish Workout</span>
            <Check className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SCREEN BODY: 2 Column Layout (Left: Active Exercise, Right: Timer & Notes) */}
      {/* ========================================================================= */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-7 items-start">
          {/* LEFT COLUMN: Active Exercise Card */}
          <div className="md:col-span-7 lg:col-span-7 xl:col-span-8 w-full">
            <div
              id="active-exercise-card"
              className="w-full rounded-[36px] bg-[#F2F6ED] dark:bg-[#132218] p-6 sm:p-8 lg:p-9 border border-[#E4EDE0] dark:border-[#1C3224] transition-colors relative"
            >
              {/* Resting Alert Banner with Skip Rest button */}
              {isResting && (
                <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-400/40 dark:border-amber-500/30 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold truncate">
                      Rest active ({formatTime(timerSeconds)}). Sets & exercises locked.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSkipTimer}
                    className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold font-['Outfit'] transition-all shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Skip Rest</span>
                  </button>
                </div>
              )}

              {/* Header: Exercise Name + Subtitle + 3-Dots */}
              <div className="flex items-start justify-between relative">
                <div>
                  <h2
                    id="current-exercise-heading"
                    className="text-[28px] sm:text-[32px] md:text-[36px] font-bold text-slate-950 dark:text-white font-['Outfit'] tracking-tight leading-tight"
                  >
                    {currentExercise.name}
                  </h2>
                  <div className="flex items-center gap-2 text-[13.5px] font-normal text-slate-800 dark:text-slate-300 mt-2">
                    {renderExerciseIcon(currentExercise.iconType, 'w-4 h-4 text-slate-800 dark:text-slate-300')}
                    <span>{currentExercise.equipment} · {currentExercise.category}</span>
                  </div>
                </div>

                {/* 3 dots menu button + Dropdown */}
                <div className="relative">
                  <button
                    id="exercise-options-menu-btn"
                    disabled={isResting}
                    onClick={() => !isResting && setShowOptionsMenu(!showOptionsMenu)}
                    className={`w-10 h-10 rounded-full bg-[#E0E8DC] dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center transition-all ${
                      isResting
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 cursor-pointer'
                    }`}
                    aria-label="Exercise Options"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {/* Options Dropdown Menu */}
                  {showOptionsMenu && (
                    <div
                      id="exercise-options-dropdown"
                      className="absolute right-0 top-12 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <button
                        onClick={handleAddNewSet}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span>Add New Set</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowTipsModal(true);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Info className="w-4 h-4 text-blue-600" />
                        <span>Form Tips & Technique</span>
                      </button>

                      <button
                        onClick={handleMarkAllSetsCompleted}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-[#3B541C] dark:text-lime-400" />
                        <span>Complete All Sets</span>
                      </button>

                      <button
                        onClick={handleResetCurrentExerciseSets}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-amber-600" />
                        <span>Reset All Sets</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sets List Container */}
              <div className={`mt-7 sm:mt-8 space-y-3.5 transition-opacity ${isResting ? 'opacity-50 pointer-events-none' : ''}`}>
                {currentExercise.sets.map((s) => {
                  const isActive = activeSetNumber === s.setNumber;

                  return (
                    <div
                      key={s.setNumber}
                      onClick={() => !isResting && setActiveSetNumber(s.setNumber)}
                      className={`w-full rounded-full border transition-all duration-150 p-2 pl-4 pr-2.5 flex items-center justify-between gap-3 ${
                        isResting ? 'cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        isActive
                          ? 'bg-white dark:bg-slate-900 border-white dark:border-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-2 ring-[#D4F81C]/40 dark:ring-[#D4F81C]/20'
                          : 'bg-white/75 dark:bg-slate-900/60 border-white/50 dark:border-slate-800/50 hover:bg-white/90 dark:hover:bg-slate-900/80'
                      }`}
                    >
                      {/* Left: Set number badge + SET */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-['Outfit'] transition-colors ${
                            s.completed
                              ? 'bg-[#3B541C] text-white'
                              : isActive
                              ? 'bg-[#D4F81C] text-slate-950 font-black'
                              : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {s.setNumber}
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 tracking-wider font-['Outfit']">
                          SET
                        </span>
                      </div>

                      {/* Middle: Weight & Reps Inputs / Capsules */}
                      <div
                        className="flex items-center gap-2 md:gap-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center bg-[#EEF4F0] dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-transparent focus-within:border-slate-400">
                          <input
                            type="number"
                            min="0"
                            step={weightUnit === 'kg' ? '2.5' : '5'}
                            disabled={isResting}
                            value={s.weight}
                            onChange={(e) => updateSetWeight(s.setNumber, e.target.value)}
                            className="w-10 sm:w-12 text-center text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white bg-transparent outline-none disabled:opacity-60"
                            aria-label={`Set ${s.setNumber} weight in ${weightUnit}`}
                          />
                          <button
                            type="button"
                            onClick={handleToggleWeightUnit}
                            className="text-xs text-slate-700 dark:text-slate-300 font-semibold ml-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                            title="Click to toggle between kg and lbs"
                          >
                            {weightUnit}
                          </button>
                        </div>

                        <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold px-0.5">
                          ✕
                        </span>

                        <div className="flex items-center bg-[#EEF4F0] dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-transparent focus-within:border-slate-400">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            disabled={isResting}
                            value={s.reps}
                            onChange={(e) => updateSetReps(s.setNumber, e.target.value)}
                            className="w-8 sm:w-10 text-center text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white bg-transparent outline-none disabled:opacity-60"
                            aria-label={`Set ${s.setNumber} reps`}
                          />
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium ml-1">
                            reps
                          </span>
                        </div>
                      </div>

                      {/* Right: Checkmark Button + Optional Delete on hover */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {currentExercise.sets.length > 1 && (
                          <button
                            disabled={isResting}
                            onClick={() => handleDeleteSet(s.setNumber)}
                            className="w-7 h-7 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                            title="Delete set"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          disabled={isResting}
                          onClick={() => toggleSetComplete(s.setNumber)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-90 ${
                            isResting ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
                          } ${
                            s.completed
                              ? 'bg-[#3B541C] hover:bg-[#324817] text-white shadow-xs'
                              : 'bg-[#DEE7DB] dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                          }`}
                          aria-label={`Toggle set ${s.setNumber} complete`}
                        >
                          <Check className="w-4 h-4 stroke-[2.8]" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Add Set Quick Button */}
                <button
                  disabled={isResting}
                  onClick={handleAddNewSet}
                  className={`w-full py-2.5 rounded-full border border-dashed border-[#BCD4B5] dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold font-['Outfit'] flex items-center justify-center gap-2 transition-all mt-2 ${
                    isResting
                      ? 'opacity-40 cursor-not-allowed pointer-events-none'
                      : 'hover:bg-white/60 dark:hover:bg-slate-800/60 cursor-pointer'
                  }`}
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Set</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Rest Timer Card + Session Notes Card */}
          <div className="md:col-span-5 lg:col-span-5 xl:col-span-4 w-full space-y-6">
            {/* 1. REST TIMER CARD */}
            <div
              id="rest-timer-card"
              className="w-full rounded-[36px] bg-[#DCF3FA] dark:bg-[#0D232C] p-6 sm:p-7 md:p-8 flex flex-col justify-between min-h-[250px] border border-cyan-100/70 dark:border-cyan-950/40 relative"
            >
              {/* Header: REST TIMER + Settings Gear Icon with minimal dropdown popup */}
              <div className="flex items-center justify-between relative">
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200 tracking-wider uppercase font-['Outfit']">
                  REST TIMER
                </span>

                <div className="relative">
                  <button
                    id="timer-settings-btn"
                    onClick={() => setShowSettingsModal(!showSettingsModal)}
                    className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-slate-800 dark:text-slate-200 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                    aria-label="Timer Settings"
                    title="Timer Settings"
                  >
                    <Settings className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  {/* Minimal Dropdown Popup */}
                  {showSettingsModal && (
                    <div
                      id="timer-options-dropdown"
                      className="absolute right-0 top-10 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2.5 z-40 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="px-2 py-1 mb-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Rest Duration
                        </span>
                        <button
                          onClick={() => {
                            handleResetTimer();
                            setShowSettingsModal(false);
                          }}
                          className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Reset</span>
                        </button>
                      </div>

                      {/* Quick Duration Presets Grid */}
                      <div className="grid grid-cols-3 gap-1 mb-2">
                        {[30, 60, 75, 90, 120, 180].map((secs) => (
                          <button
                            key={secs}
                            onClick={() => {
                              setDefaultRestDuration(secs);
                              setTimerSeconds(secs);
                              setTimerRunning(true);
                              setShowSettingsModal(false);
                            }}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold font-['Outfit'] text-center transition-all cursor-pointer ${
                              defaultRestDuration === secs
                                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-black'
                                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {secs >= 60 ? `${Math.floor(secs / 60)}m${secs % 60 ? ` ${secs % 60}s` : ''}` : `${secs}s`}
                          </button>
                        ))}
                      </div>

                      {/* Auto-start toggle row */}
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-1.5">
                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Auto-start timer
                        </span>
                        <input
                          type="checkbox"
                          checked={autoStartTimer}
                          onChange={(e) => setAutoStartTimer(e.target.checked)}
                          className="w-3.5 h-3.5 accent-slate-950 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Large Digital Clock with interactive play/pause click */}
              <div className="my-5 text-center">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  title={timerRunning ? 'Pause timer' : 'Start timer'}
                  id="rest-timer-display"
                  className="text-[64px] sm:text-[72px] md:text-[76px] font-black text-slate-950 dark:text-white font-['Outfit'] tracking-tight leading-none hover:opacity-80 transition-opacity cursor-pointer inline-block"
                >
                  {formatTime(timerSeconds)}
                </button>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {timerRunning ? (
                      <>
                        <Pause className="w-3 h-3" />
                        <span>Tap to pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Tap to resume</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons: + 30s dark pill | Skip pill */}
              <div className="flex items-center justify-center gap-3">
                <button
                  id="add-30s-timer-btn"
                  onClick={handleAdd30s}
                  className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#182928] dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold font-['Outfit'] active:scale-95 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>30s</span>
                </button>

                <button
                  id="skip-timer-btn"
                  onClick={handleSkipTimer}
                  className="px-6 py-2 rounded-full border border-slate-900 dark:border-slate-400 hover:bg-black/5 dark:hover:bg-white/10 text-slate-900 dark:text-white text-xs font-bold font-['Outfit'] active:scale-95 transition-all cursor-pointer"
                >
                  Skip
                </button>
              </div>
            </div>

            {/* 2. SESSION NOTES CARD */}
            <div
              id="session-notes-card"
              className="w-full rounded-[32px] bg-transparent border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col justify-start min-h-[175px]"
            >
              {/* Header: Icon + SESSION NOTES */}
              <div className="flex items-center justify-between text-slate-900 dark:text-slate-200 mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 stroke-[2.4]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="3" y1="6" x2="11" y2="6" strokeLinecap="round" />
                    <line x1="3" y1="12" x2="11" y2="12" strokeLinecap="round" />
                    <line x1="3" y1="18" x2="9" y2="18" strokeLinecap="round" />
                    <path d="M14 18l5-5 3 3-5 5h-3v-3z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[11px] font-bold tracking-wider uppercase font-['Outfit']">
                    SESSION NOTES
                  </span>
                </div>
                {sessionNotes && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Saved
                  </span>
                )}
              </div>

              {/* Textarea */}
              <textarea
                id="session-notes-input"
                rows={4}
                placeholder="Feeling strong today... barbell path smooth on set 2"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none resize-none pt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM "UP NEXT" DOCK (Interactive: Clicking any switches active exercise) */}
      {/* ========================================================================= */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl md:rounded-full px-5 sm:px-7 py-3.5 shadow-2xs mt-2">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* Label: UP NEXT */}
          <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200 tracking-wider uppercase font-['Outfit'] shrink-0">
            UP NEXT
          </span>

          {/* Exercise Pills Carousel (Click to switch current workout) */}
          <div className="flex flex-wrap items-center gap-3">
            {upcomingExercises.map((ex) => {
              const completedCount = ex.sets.filter((s) => s.completed).length;
              const allDone = completedCount === ex.sets.length;

              return (
                <button
                  key={ex.id}
                  id={`up-next-exercise-${ex.id}`}
                  disabled={isResting}
                  onClick={() => handleSelectExercise(ex.originalIndex)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all shadow-2xs active:scale-95 ${
                    isResting
                      ? 'opacity-40 cursor-not-allowed pointer-events-none'
                      : 'cursor-pointer'
                  } ${
                    allDone
                      ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white'
                  }`}
                  title={isResting ? 'Rest timer active - Skip rest to switch exercise' : `Switch to ${ex.name}`}
                >
                  <div className="w-7 h-7 rounded-xl bg-[#F0F5F2] dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 shrink-0">
                    {allDone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    ) : (
                      renderExerciseIcon(ex.iconType, 'w-3.5 h-3.5 text-slate-800 dark:text-slate-300')
                    )}
                  </div>
                  <span className="text-xs sm:text-[13px] font-bold leading-none font-['Outfit']">
                    {ex.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS: Form Tips, Finish Celebration, Exit Confirm */}
      {/* ========================================================================= */}

      {/* Form Tips & Technique Modal */}
      {showTipsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-950 dark:text-white font-['Outfit']">
                  {currentExercise.name} Form Guide
                </h3>
              </div>
              <button
                onClick={() => setShowTipsModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentExercise.tips || 'Focus on controlled eccentric contractions and steady breathing throughout each set.'}
            </p>

            <button
              onClick={() => setShowTipsModal(false)}
              className="w-full py-2.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-xs font-['Outfit'] cursor-pointer hover:bg-slate-800"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Finish Workout Celebration Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 shadow-2xl space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#D4F81C] text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-md">
                <Trophy className="w-7 h-7 stroke-[2.3]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white font-['Outfit']">
                Workout Complete!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {displayTitle} summary & performance
              </p>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-3 text-center border border-slate-100 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Duration</span>
                <span className="text-base font-bold text-slate-950 dark:text-white font-['Outfit'] mt-0.5 block">
                  {Math.floor(workoutElapsedSeconds / 60)} min
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-3 text-center border border-slate-100 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Volume</span>
                <span className="text-base font-bold text-slate-950 dark:text-white font-['Outfit'] mt-0.5 block">
                  {totalVolume.toLocaleString()} {weightUnit}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-3 text-center border border-slate-100 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Sets Done</span>
                <span className="text-base font-bold text-slate-950 dark:text-white font-['Outfit'] mt-0.5 block">
                  {totalCompletedSets}/{totalPossibleSets}
                </span>
              </div>
            </div>

            {sessionNotes && (
              <div className="p-3.5 rounded-2xl bg-[#F2F6ED] dark:bg-[#132218] text-xs text-slate-800 dark:text-slate-200">
                <span className="font-bold block mb-0.5">Notes:</span>
                <p className="italic">{sessionNotes}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 py-3 rounded-full border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs font-['Outfit'] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Keep Training
              </button>
              <button
                onClick={handleConfirmFinish}
                className="flex-1 py-3 rounded-full bg-[#D4F81C] hover:bg-[#c3e810] text-slate-950 font-bold text-xs font-['Outfit'] shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Save & Finish</span>
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white font-['Outfit']">
              Leave Workout Session?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              You have completed {totalCompletedSets} sets. Would you like to save your progress or discard this session?
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  handleConfirmFinish();
                }}
                className="w-full py-2.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-xs font-['Outfit'] cursor-pointer"
              >
                Save & Exit
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  if (onClose) onClose();
                }}
                className="w-full py-2.5 rounded-full border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold text-xs font-['Outfit'] hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
              >
                Discard Session
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-2 rounded-full text-slate-600 dark:text-slate-400 font-medium text-xs hover:underline cursor-pointer"
              >
                Continue Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


