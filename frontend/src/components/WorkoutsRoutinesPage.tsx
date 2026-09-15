import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Flame,
  ArrowRight,
  Plus,
  History,
  Dumbbell,
  FileEdit,
  Check,
  X,
  GripVertical,
  Search,
  Trash2,
  ChevronLeft,
  Sparkles,
  Calendar,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import {
  MdFitnessCenter,
  MdSportsGymnastics,
  MdDirectionsRun,
  MdEditNote,
  MdOutlineSportsGymnastics,
  MdTimer,
  MdLocalFireDepartment,
} from 'react-icons/md';
import {
  GiMuscleUp,
  GiChestArmor,
  GiBiceps,
  GiLeg,
  GiShoulderArmor,
} from 'react-icons/gi';
import { ActiveWorkoutSessionScreen } from './ActiveWorkoutSessionScreen';
import { useWorkouts } from '../hooks/useWorkouts';
import { useUnits } from '../context/UnitContext';

interface RoutineExerciseItem {
  id: string;
  name: string;
  equipment: string;
  targetMuscle: string;
  sets: string;
  reps: string;
  rest: string;
}

interface ExerciseLibraryItem {
  id: string;
  name: string;
  category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';
  equipment: string;
  targetMuscle: string;
  defaultSets: string;
  defaultReps: string;
  defaultRest: string;
}

const ALL_EXERCISES_LIBRARY: ExerciseLibraryItem[] = [
  // Chest
  { id: 'lib-1', name: 'Barbell Bench Press', category: 'Chest', equipment: 'Barbell', targetMuscle: 'Chest', defaultSets: '4', defaultReps: '8-10', defaultRest: '90s' },
  { id: 'lib-2', name: 'Incline Dumbbell Press', category: 'Chest', equipment: 'Dumbbell', targetMuscle: 'Upper Chest', defaultSets: '3', defaultReps: '10-12', defaultRest: '60s' },
  { id: 'lib-3', name: 'Cable Chest Flyes', category: 'Chest', equipment: 'Cable', targetMuscle: 'Lower Chest', defaultSets: '3', defaultReps: '12-15', defaultRest: '45s' },
  { id: 'lib-4', name: 'Chest Dips', category: 'Chest', equipment: 'Bodyweight', targetMuscle: 'Lower Chest / Triceps', defaultSets: '3', defaultReps: '10-12', defaultRest: '60s' },

  // Back
  { id: 'lib-5', name: 'Barbell Deadlift', category: 'Back', equipment: 'Barbell', targetMuscle: 'Lower Back / Hamstrings', defaultSets: '4', defaultReps: '5', defaultRest: '120s' },
  { id: 'lib-6', name: 'Lat Pulldown', category: 'Back', equipment: 'Cable', targetMuscle: 'Lats', defaultSets: '4', defaultReps: '10-12', defaultRest: '60s' },
  { id: 'lib-7', name: 'Barbell Bent-Over Row', category: 'Back', equipment: 'Barbell', targetMuscle: 'Upper Back', defaultSets: '4', defaultReps: '8-10', defaultRest: '90s' },
  { id: 'lib-8', name: 'Pull-Ups', category: 'Back', equipment: 'Bodyweight', targetMuscle: 'Lats', defaultSets: '3', defaultReps: '8-12', defaultRest: '90s' },
  { id: 'lib-9', name: 'Single-Arm Dumbbell Row', category: 'Back', equipment: 'Dumbbell', targetMuscle: 'Mid Back', defaultSets: '3', defaultReps: '10-12', defaultRest: '60s' },

  // Shoulders
  { id: 'lib-10', name: 'Overhead Barbell Press', category: 'Shoulders', equipment: 'Barbell', targetMuscle: 'Front Delts', defaultSets: '4', defaultReps: '8', defaultRest: '90s' },
  { id: 'lib-11', name: 'Dumbbell Lateral Raises', category: 'Shoulders', equipment: 'Dumbbell', targetMuscle: 'Side Delts', defaultSets: '4', defaultReps: '15', defaultRest: '45s' },
  { id: 'lib-12', name: 'Face Pulls', category: 'Shoulders', equipment: 'Cable', targetMuscle: 'Rear Delts', defaultSets: '3', defaultReps: '15', defaultRest: '45s' },
  { id: 'lib-13', name: 'Arnold Dumbbell Press', category: 'Shoulders', equipment: 'Dumbbell', targetMuscle: 'Deltoids', defaultSets: '3', defaultReps: '10-12', defaultRest: '60s' },

  // Legs
  { id: 'lib-14', name: 'Barbell Back Squat', category: 'Legs', equipment: 'Barbell', targetMuscle: 'Quads / Glutes', defaultSets: '4', defaultReps: '8-10', defaultRest: '120s' },
  { id: 'lib-15', name: 'Romanian Deadlift', category: 'Legs', equipment: 'Barbell', targetMuscle: 'Hamstrings', defaultSets: '4', defaultReps: '10', defaultRest: '90s' },
  { id: 'lib-16', name: 'Leg Press', category: 'Legs', equipment: 'Machine', targetMuscle: 'Quads', defaultSets: '3', defaultReps: '12', defaultRest: '60s' },
  { id: 'lib-17', name: 'Walking Dumbbell Lunges', category: 'Legs', equipment: 'Dumbbell', targetMuscle: 'Quads / Glutes', defaultSets: '3', defaultReps: '12 each', defaultRest: '60s' },
  { id: 'lib-18', name: 'Standing Calf Raises', category: 'Legs', equipment: 'Machine', targetMuscle: 'Calves', defaultSets: '4', defaultReps: '15', defaultRest: '45s' },

  // Arms
  { id: 'lib-19', name: 'Barbell Bicep Curl', category: 'Arms', equipment: 'Barbell', targetMuscle: 'Biceps', defaultSets: '3', defaultReps: '10-12', defaultRest: '60s' },
  { id: 'lib-20', name: 'Tricep Rope Pushdowns', category: 'Arms', equipment: 'Cable', targetMuscle: 'Triceps', defaultSets: '3', defaultReps: '12-15', defaultRest: '45s' },
  { id: 'lib-21', name: 'Hammer Curls', category: 'Arms', equipment: 'Dumbbell', targetMuscle: 'Brachialis', defaultSets: '3', defaultReps: '12', defaultRest: '45s' },
  { id: 'lib-22', name: 'Skull Crushers (EZ Bar)', category: 'Arms', equipment: 'EZ Bar', targetMuscle: 'Triceps', defaultSets: '3', defaultReps: '10', defaultRest: '60s' },

  // Core
  { id: 'lib-23', name: 'Hanging Leg Raises', category: 'Core', equipment: 'Bodyweight', targetMuscle: 'Abs', defaultSets: '3', defaultReps: '15', defaultRest: '45s' },
  { id: 'lib-24', name: 'Cable Woodchoppers', category: 'Core', equipment: 'Cable', targetMuscle: 'Obliques', defaultSets: '3', defaultReps: '12 each side', defaultRest: '45s' },
  { id: 'lib-25', name: 'Plank Hold', category: 'Core', equipment: 'Bodyweight', targetMuscle: 'Core Stability', defaultSets: '3', defaultReps: '60 sec', defaultRest: '45s' },

  // Cardio
  { id: 'lib-26', name: 'Treadmill HIIT Sprints', category: 'Cardio', equipment: 'Treadmill', targetMuscle: 'Full Body', defaultSets: '8', defaultReps: '30s sprint', defaultRest: '60s' },
  { id: 'lib-27', name: 'Rowing Machine Intervals', category: 'Cardio', equipment: 'Rower', targetMuscle: 'Full Body', defaultSets: '5', defaultReps: '500m', defaultRest: '90s' },
  { id: 'lib-28', name: 'Kettlebell Swings', category: 'Cardio', equipment: 'Kettlebell', targetMuscle: 'Posterior Chain', defaultSets: '4', defaultReps: '20', defaultRest: '45s' },
];

const cardThemes = [
  {
    bg: 'bg-[#FDF2E8] dark:bg-[#22160F]',
    badgeBg: 'bg-[#FCE3D3] dark:bg-[#341F14]',
    badgeText: 'text-[#D96424] dark:text-orange-300',
    iconBg: 'bg-[#FCE3D3] dark:bg-[#341F14]',
    iconText: 'text-[#E06429] dark:text-orange-400',
    tagBg: 'bg-[#FCE3D3]/80 dark:bg-[#341F14]/80 text-[#D96424] dark:text-orange-300',
  },
  {
    bg: 'bg-[#E8F2FD] dark:bg-[#101B2B]',
    badgeBg: 'bg-[#D5E7FA] dark:bg-[#182A45]',
    badgeText: 'text-[#2563EB] dark:text-blue-300',
    iconBg: 'bg-[#D5E7FA] dark:bg-[#182A45]',
    iconText: 'text-[#2563EB] dark:text-blue-400',
    tagBg: 'bg-[#D5E7FA]/80 dark:bg-[#182A45]/80 text-[#2563EB] dark:text-blue-300',
  },
  {
    bg: 'bg-[#EAF7EE] dark:bg-[#102317]',
    badgeBg: 'bg-[#D1F1DC] dark:bg-[#1A3A26]',
    badgeText: 'text-[#10B981] dark:text-emerald-300',
    iconBg: 'bg-[#D1F1DC] dark:bg-[#1A3A26]',
    iconText: 'text-[#10B981] dark:text-emerald-400',
    tagBg: 'bg-[#D7F3E2] dark:bg-[#1D422C] text-slate-800 dark:text-emerald-200',
  },
  {
    bg: 'bg-[#F3E8FF] dark:bg-[#231535]',
    badgeBg: 'bg-[#E9D5FF] dark:bg-[#351C54]',
    badgeText: 'text-[#9333EA] dark:text-purple-300',
    iconBg: 'bg-[#E9D5FF] dark:bg-[#351C54]',
    iconText: 'text-[#9333EA] dark:text-purple-400',
    tagBg: 'bg-[#E9D5FF]/80 dark:bg-[#351C54]/80 text-[#9333EA] dark:text-purple-300',
  },
];

function getRoutineIcon(name: string = '', category: string = '') {
  const text = (name + ' ' + category).toLowerCase();
  if (text.includes('chest') || text.includes('push')) return <GiChestArmor size={22} />;
  if (text.includes('back') || text.includes('pull') || text.includes('arm') || text.includes('bicep')) return <GiBiceps size={22} />;
  if (text.includes('leg') || text.includes('squat') || text.includes('lower')) return <GiLeg size={22} />;
  if (text.includes('shoulder')) return <GiShoulderArmor size={22} />;
  if (text.includes('cardio') || text.includes('run')) return <MdDirectionsRun size={22} />;
  if (text.includes('mobility') || text.includes('yoga')) return <MdSportsGymnastics size={22} />;
  return <MdFitnessCenter size={22} />;
}

interface WorkoutsRoutinesPageProps {
  onStartSession?: (routineName: string) => void;
  onLogQuickSet?: (exercise: string, sets: number, reps: number, weight: number) => void;
  isDarkMode?: boolean;
}

export const WorkoutsRoutinesPage: React.FC<WorkoutsRoutinesPageProps> = ({
  onStartSession,
  onLogQuickSet,
  isDarkMode = false,
}) => {
  const {
    routines,
    logs,
    loading,
    logsLoading,
    error,
    createRoutine,
    deleteRoutine,
    logWorkout,
    deleteLog,
  } = useWorkouts();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Strength' | 'Cardio' | 'Mobility'>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [quickExercise, setQuickExercise] = useState('');
  const [quickSets, setQuickSets] = useState<number | string>('3');
  const [quickReps, setQuickReps] = useState<number | string>('10');
  const [quickWeight, setQuickWeight] = useState<number | string>('50');
  const [quickLogSuccess, setQuickLogSuccess] = useState(false);
  const [activeSessionActive, setActiveSessionActive] = useState(false);
  const [activeSessionTitle, setActiveSessionTitle] = useState('Upper Body Strength');
  const [activeRoutineData, setActiveRoutineData] = useState<any>(null);

  const { weightUnit, energyUnit, formatEnergy, formatWeight } = useUnits();

  // Routines Filter Bar State
  const [routineSearchQuery, setRoutineSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('All');
  const [routineSortBy, setRoutineSortBy] = useState<'sequence' | 'newest' | 'oldest' | 'name' | 'exercises'>('sequence');

  // Workout Logs History Modal Filter State
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logSortBy, setLogSortBy] = useState<'newest' | 'oldest'>('newest');

  const [routineName, setRoutineName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Strength' | 'Cardio' | 'Mobility'>('Strength');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [routineSavedSuccess, setRoutineSavedSuccess] = useState(false);

  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [selectedExerciseCategory, setSelectedExerciseCategory] = useState<
    'All' | 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio'
  >('All');

  const [routineExercises, setRoutineExercises] = useState<RoutineExerciseItem[]>([
    {
      id: '1',
      name: 'Bench Press',
      equipment: 'Barbell',
      targetMuscle: 'Chest',
      sets: '4',
      reps: '8-10',
      rest: '90s',
    },
    {
      id: '2',
      name: 'Incline Dumbbell Press',
      equipment: 'Dumbbell',
      targetMuscle: 'Upper Chest',
      sets: '3',
      reps: '10-12',
      rest: '60s',
    },
    {
      id: '3',
      name: 'Tricep Extensions',
      equipment: 'Cable',
      targetMuscle: 'Triceps',
      sets: '3',
      reps: '12',
      rest: '60s',
    },
  ]);

  const filterOptions: ('All' | 'Strength' | 'Cardio' | 'Mobility')[] = [
    'All',
    'Strength',
    'Cardio',
    'Mobility',
  ];

  const exerciseCategoryOptions: (
    | 'All'
    | 'Chest'
    | 'Back'
    | 'Legs'
    | 'Shoulders'
    | 'Arms'
    | 'Core'
    | 'Cardio'
  )[] = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

  // Routine sequence order state (persisted in localStorage)
  const [routinesOrder, setRoutinesOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fitness_routines_order');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [manualTodayId, setManualTodayId] = useState<string | null>(null);

  // Drag and drop state for routine sequence cards
  const [draggedRoutineIndex, setDraggedRoutineIndex] = useState<number | null>(null);
  const [dragOverRoutineIndex, setDragOverRoutineIndex] = useState<number | null>(null);

  // Order routines based on saved user sequence
  const orderedRoutines = React.useMemo(() => {
    if (!routines || routines.length === 0) return [];
    if (routinesOrder.length === 0) return routines;

    const sorted: any[] = [];
    const remaining = [...routines];

    routinesOrder.forEach((id) => {
      const foundIdx = remaining.findIndex((r) => r._id === id);
      if (foundIdx >= 0) {
        sorted.push(remaining[foundIdx]);
        remaining.splice(foundIdx, 1);
      }
    });

    return [...sorted, ...remaining];
  }, [routines, routinesOrder]);

  const handleRoutineDragStart = (e: React.DragEvent, index: number) => {
    setDraggedRoutineIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleRoutineDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverRoutineIndex !== index) {
      setDragOverRoutineIndex(index);
    }
  };

  const handleRoutineDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedRoutineIndex === null || draggedRoutineIndex === dropIndex) {
      setDraggedRoutineIndex(null);
      setDragOverRoutineIndex(null);
      return;
    }

    const updated = [...orderedRoutines];
    const [draggedItem] = updated.splice(draggedRoutineIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);

    const newOrderIds = updated.map((r) => r._id);
    setRoutinesOrder(newOrderIds);
    localStorage.setItem('fitness_routines_order', JSON.stringify(newOrderIds));

    setDraggedRoutineIndex(null);
    setDragOverRoutineIndex(null);
  };

  // Day rotation calculation: advances by 1 every new day
  const todayDayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const autoTodayIndex =
    orderedRoutines.length > 0
      ? ((todayDayNumber % orderedRoutines.length) + orderedRoutines.length) % orderedRoutines.length
      : 0;

  const heroRoutine = React.useMemo(() => {
    if (orderedRoutines.length === 0) return null;
    if (manualTodayId) {
      const manual = orderedRoutines.find((r) => r._id === manualTodayId);
      if (manual) return manual;
    }
    return orderedRoutines[autoTodayIndex] || orderedRoutines[0];
  }, [orderedRoutines, manualTodayId, autoTodayIndex]);

  const activeSeqIndex = heroRoutine
    ? orderedRoutines.findIndex((r) => r._id === heroRoutine._id)
    : -1;

  const nextSeqIndex =
    orderedRoutines.length > 1 && activeSeqIndex >= 0
      ? (activeSeqIndex + 1) % orderedRoutines.length
      : -1;

  const nextRoutine = nextSeqIndex >= 0 ? orderedRoutines[nextSeqIndex] : null;

  const filteredRoutines = React.useMemo(() => {
    let result = [...orderedRoutines];

    // 1. Category Filter
    if (selectedFilter !== 'All') {
      result = result.filter((r) => r.category?.toLowerCase() === selectedFilter.toLowerCase());
    }

    // 2. Tag / Difficulty Filter
    if (selectedTagFilter !== 'All') {
      const tagLower = selectedTagFilter.toLowerCase();
      result = result.filter((r) => {
        const hasTag = Array.isArray(r.tags) && r.tags.some((t: string) => t.toLowerCase() === tagLower);
        const matchesDiff = r.difficulty?.toLowerCase() === tagLower;
        const matchesName = r.name?.toLowerCase().includes(tagLower);
        return hasTag || matchesDiff || matchesName;
      });
    }

    // 3. Search Query
    if (routineSearchQuery.trim()) {
      const q = routineSearchQuery.toLowerCase().trim();
      result = result.filter((r) => {
        const matchName = (r.name || '').toLowerCase().includes(q);
        const matchCategory = (r.category || '').toLowerCase().includes(q);
        const matchTag = Array.isArray(r.tags) && r.tags.some((t: string) => t.toLowerCase().includes(q));
        const matchExercise = (r.exercises || []).some((ex: any) =>
          (ex.name || '').toLowerCase().includes(q) ||
          (ex.targetMuscle || '').toLowerCase().includes(q) ||
          (ex.equipment || '').toLowerCase().includes(q)
        );
        return matchName || matchCategory || matchTag || matchExercise;
      });
    }

    // 4. Sort
    if (routineSortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime());
    } else if (routineSortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt || a.updatedAt || 0).getTime() - new Date(b.createdAt || b.updatedAt || 0).getTime());
    } else if (routineSortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (routineSortBy === 'exercises') {
      result.sort((a, b) => (b.exercises?.length || 0) - (a.exercises?.length || 0));
    }
    // 'sequence' preserves user's custom drag-and-drop order

    return result;
  }, [orderedRoutines, selectedFilter, selectedTagFilter, routineSearchQuery, routineSortBy]);

  const filteredLogs = React.useMemo(() => {
    let result = [...logs];
    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase().trim();
      result = result.filter((l: any) => {
        const nameMatch = (l.routineName || '').toLowerCase().includes(q);
        const exMatch = (l.exercisesPerformed || []).some((ex: any) => (ex.name || '').toLowerCase().includes(q));
        return nameMatch || exMatch;
      });
    }
    if (logSortBy === 'oldest') {
      result.sort((a: any, b: any) => new Date(a.performedAt || a.createdAt).getTime() - new Date(b.performedAt || b.createdAt).getTime());
    } else {
      result.sort((a: any, b: any) => new Date(b.performedAt || b.createdAt).getTime() - new Date(a.performedAt || a.createdAt).getTime());
    }
    return result;
  }, [logs, logSearchQuery, logSortBy]);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickExercise.trim()) {
      alert('Please enter an exercise name (e.g. Deadlift, Push-ups, Bench Press)');
      return;
    }

    const sets = Number(quickSets) || 1;
    const reps = Number(quickReps) || 1;
    const weight = Number(quickWeight) || 0;
    const exercise = quickExercise.trim();

    try {
      await logWorkout({
        routineName: 'Quick Log',
        durationMinutes: 15,
        exercisesPerformed: [{ name: exercise, sets, reps, weight }],
        caloriesBurned: Math.round(sets * reps * 2) || 120,
        weightUnit: weightUnit,
      });

      if (onLogQuickSet) {
        onLogQuickSet(exercise, sets, reps, weight);
      }

      setQuickLogSuccess(true);
      setTimeout(() => {
        setQuickLogSuccess(false);
        setQuickExercise('');
        setQuickSets('3');
        setQuickReps('10');
        setQuickWeight('50');
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to save workout log');
    }
  };

  const handleStartWorkout = (routineToStart?: any) => {
    let target = routineToStart;
    if (typeof target === 'string') {
      target = routines.find((r) => r.name === target) || { name: target };
    } else if (!target && heroRoutine) {
      target = heroRoutine;
    }
    setActiveRoutineData(target || null);
    const validTitle = target?.name || 'Workout Session';
    setActiveSessionTitle(validTitle);
    setActiveSessionActive(true);
    if (onStartSession) {
      onStartSession(validTitle);
    }
  };

  const handleRemoveExercise = (id: string) => {
    setRoutineExercises(routineExercises.filter((item) => item.id !== id));
  };

  const handleUpdateExerciseField = (id: string, field: 'sets' | 'reps' | 'rest', value: string) => {
    setRoutineExercises((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleToggleExerciseFromLibrary = (libItem: ExerciseLibraryItem) => {
    const existingIndex = routineExercises.findIndex(
      (item) => item.name.toLowerCase() === libItem.name.toLowerCase()
    );

    if (existingIndex >= 0) {
      const updated = [...routineExercises];
      updated.splice(existingIndex, 1);
      setRoutineExercises(updated);
    } else {
      const newEx: RoutineExerciseItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        name: libItem.name,
        equipment: libItem.equipment,
        targetMuscle: libItem.targetMuscle,
        sets: libItem.defaultSets,
        reps: libItem.defaultReps,
        rest: libItem.defaultRest,
      };
      setRoutineExercises([...routineExercises, newEx]);
    }
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...routineExercises];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);
    setRoutineExercises(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      alert('Please enter a routine name');
      return;
    }

    if (routineExercises.length === 0) {
      alert('Please add at least one exercise to your routine');
      return;
    }

    try {
      await createRoutine({
        name: routineName.trim(),
        category: selectedCategory,
        tags: [selectedDifficulty.toUpperCase()],
        exercises: routineExercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets || '3',
          reps: ex.reps || '10',
          weight: 0,
          rest: ex.rest || '60s',
          notes: [ex.equipment, ex.targetMuscle, ex.rest ? `Rest: ${ex.rest}` : ''].filter(Boolean).join(' • '),
        })),
      });

      setRoutineSavedSuccess(true);
      setTimeout(() => {
        setRoutineSavedSuccess(false);
        setIsSidebarOpen(false);
        setRoutineName('');
        setRoutineExercises([]);
      }, 700);
    } catch (err: any) {
      alert(err.message || 'Failed to create routine');
    }
  };

  if (activeSessionActive) {
    return (
      <div id="workouts-routines-page" className="w-full max-w-[1240px] mx-auto animate-in fade-in duration-200">
        <ActiveWorkoutSessionScreen
          sessionTitle={activeSessionTitle}
          routine={activeRoutineData}
          isDarkMode={isDarkMode}
          onClose={() => setActiveSessionActive(false)}
          onFinishWorkout={(summary) => {
            setActiveSessionActive(false);
            const durationMins = Math.max(1, Math.round((summary?.elapsedSeconds || 60) / 60));
            const exercisesToLog =
              summary?.exercisesPerformed && summary.exercisesPerformed.length > 0
                ? summary.exercisesPerformed
                : activeRoutineData?.exercises && activeRoutineData.exercises.length > 0
                ? activeRoutineData.exercises.map((ex: any) => ({
                    name: ex.name,
                    sets: Number(ex.sets) || 3,
                    reps: Number(ex.reps) || 10,
                    weight: Number(ex.weight) || 0,
                  }))
                : [{ name: activeSessionTitle, sets: 3, reps: 10, weight: 0 }];

            const calories = summary?.caloriesBurned || Math.max(50, Math.round(durationMins * 8));

            logWorkout({
              routineId: activeRoutineData?._id || undefined,
              routineName: activeRoutineData?.name || activeSessionTitle || 'Custom Routine',
              durationMinutes: durationMins,
              exercisesPerformed: exercisesToLog,
              caloriesBurned: calories,
              weightUnit: summary?.weightUnit || weightUnit || 'kg',
            }).catch(console.error);

            if (onLogQuickSet) {
              onLogQuickSet(`${activeSessionTitle} (Routine Session)`, exercisesToLog.length, 10, 0);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div id="workouts-routines-page" className="w-full max-w-[1240px] mx-auto space-y-7 sm:space-y-8 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER ROW: Exact Title/Subtitle left + Capsule Filters & Create Button right */}
      {/* Matches Dashboard Header typography & button scaling */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-1">
        {/* Left: Heading & Description (Exact match to Dashboard Header) */}
        <div className="shrink-0">
          <h1
            id="workouts-page-title"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit']"
          >
            Workouts & Routines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Track your active sessions and planned workout routines.
          </p>
        </div>

        {/* Right: Capsule Filter Segmented Pill + Workout Logs Button + Create Routine Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start md:self-auto shrink-0">
          {/* Segmented Filter Pill */}
          <div
            id="routine-filter-capsule"
            className="flex items-center p-1 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
          >
            {filterOptions.map((filter) => {
              const isSelected = selectedFilter === filter;
              return (
                <button
                  key={filter}
                  id={`filter-btn-${filter.toLowerCase()}`}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 sm:px-3.5 py-1 rounded-full text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Workout Logs Button */}
          <button
            id="open-workout-logs-btn"
            onClick={() => setIsLogsModalOpen(true)}
            className="h-9 px-3.5 flex items-center gap-1.5 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100/80 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-2xs cursor-pointer whitespace-nowrap"
          >
            <History className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Workout Logs</span>
            {logs.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                {logs.length}
              </span>
            )}
          </button>

          {/* + Create Routine Button */}
          <button
            id="create-routine-btn"
            onClick={() => setIsSidebarOpen(true)}
            className="h-9 px-3.5 flex items-center gap-1.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Routine</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN HERO CARD */}
      {/* If routine exists: Show active routine | If no routine: Show Add Routine CTA */}
      {/* ========================================================================= */}
      {!heroRoutine ? (
        <div
          id="hero-empty-routine-card"
          className="w-full rounded-[36px] bg-[#E8F3EE] dark:bg-[#12231B] p-7 sm:p-10 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12 relative overflow-hidden transition-colors border border-emerald-100/70 dark:border-emerald-900/30"
        >
          <div className="flex-1 w-full flex flex-col justify-between z-10 min-w-0">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider font-['Outfit'] mb-3">
                <Dumbbell className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Routines</span>
              </div>
              <h2
                id="hero-routine-title"
                className="text-[26px] sm:text-[32px] lg:text-[36px] font-bold text-slate-950 dark:text-white font-['Outfit'] leading-tight tracking-tight"
              >
                No Workout Routine Added Yet
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal mt-2.5 max-w-lg leading-relaxed">
                You haven&apos;t created any workout routines yet. Add your first routine with your target exercises, sets, and reps to start your training sessions.
              </p>
            </div>

            <div className="mt-7">
              <button
                id="hero-add-first-routine-btn"
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.12)] cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Workout Routine</span>
              </button>
            </div>
          </div>

          <div className="w-full md:w-[380px] lg:w-[440px] shrink-0 z-10 flex justify-center">
            <div className="relative w-full aspect-[1.32/1] rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/60 dark:border-slate-800 bg-slate-200 dark:bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=900&auto=format&fit=crop"
                alt="Gym workout training"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          id="hero-active-routine-card"
          className="w-full rounded-[36px] bg-[#E8F3EE] dark:bg-[#12231B] p-7 sm:p-10 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12 relative overflow-hidden transition-colors"
        >
          {/* Left Column: Heading, Metadata, Exercise Pills, CTA */}
          <div className="flex-1 w-full flex flex-col justify-between z-10 min-w-0">
            <div>
              {/* Rotation & Sequence Info Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider font-['Outfit'] shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Today's Active Routine</span>
                </span>
                {orderedRoutines.length > 1 && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                    Split Day {activeSeqIndex + 1} of {orderedRoutines.length}
                  </span>
                )}
                {nextRoutine && (
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    • Tomorrow: <strong className="text-slate-900 dark:text-white font-semibold">{nextRoutine.name}</strong>
                  </span>
                )}
                {manualTodayId && (
                  <button
                    type="button"
                    onClick={() => setManualTodayId(null)}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer ml-1"
                    title="Switch back to daily automatic sequence rotation"
                  >
                    (Reset to Auto Cycle)
                  </button>
                )}
              </div>

              {/* Display Title */}
              <h2
                id="hero-routine-title"
                className="text-[28px] sm:text-[34px] lg:text-[38px] font-bold text-slate-950 dark:text-white font-['Outfit'] leading-[1.12] tracking-tight"
              >
                {heroRoutine.name}
              </h2>

              {/* Metrics Row */}
              <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-xs sm:text-[13.5px] font-semibold text-slate-800 dark:text-slate-200 mt-5">
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-slate-800 dark:text-slate-200 stroke-[2.4]" />
                  <span>{heroRoutine.exercises?.length || 0} Exercises</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-800 dark:text-slate-200 stroke-[2.4]" />
                  <span>Est. {Math.max(20, (heroRoutine.exercises?.length || 4) * 10)} mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#FF5722] fill-[#FF5722] stroke-[2]" />
                  <span>~{formatEnergy(Math.max(150, (heroRoutine.exercises?.length || 4) * 80 + 50))}</span>
                </div>
              </div>

              {/* Exercise Pills Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-5">
                {(heroRoutine.exercises || []).slice(0, 5).map((exercise: any, i: number) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-slate-200 text-xs font-semibold border border-white dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
                  >
                    {exercise.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Large CTA Button: Start Workout Session -> */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                id="hero-start-workout-btn"
                onClick={() => handleStartWorkout(heroRoutine)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.12)] cursor-pointer"
              >
                <span>Start Workout Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Right Column: High Quality Gym Fitness Workout Image with matching aspect ratio */}
          <div className="w-full md:w-[380px] lg:w-[440px] shrink-0 z-10 flex justify-center">
            <div className="relative w-full aspect-[1.32/1] rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/60 dark:border-slate-800 bg-slate-200 dark:bg-slate-800">
              <img
                src={heroRoutine.imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=900&auto=format&fit=crop'}
                alt={heroRoutine.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN WORKOUTS & ROUTINES SECTION WITH DEDICATED FILTER BAR */}
      {/* Left: Routine Sequence Cards | Right: Sticky Quick Logger Card */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start">
        {/* LEFT COLUMN: Routine Sequence Cards (lg:col-span-8) */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white font-['Outfit'] flex items-center gap-2">
                <span>Workout Split Sequence</span>
                {orderedRoutines.length > 0 && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                    {orderedRoutines.length} {orderedRoutines.length === 1 ? 'Routine' : 'Routines'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Grab <span className="font-semibold text-slate-700 dark:text-slate-300">⋮⋮ handle</span> to reorder sequence (e.g. Push → Pull → Legs or Mon–Sat).
              </p>
            </div>

            {nextRoutine && (
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full w-fit">
                Daily Rotation: Tomorrow is <span className="font-bold text-slate-900 dark:text-white">{nextRoutine.name}</span>
              </div>
            )}
          </div>

          {/* Workouts & Routines Filter Bar */}
          <div
            id="workouts-filter-bar"
            className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 space-y-2.5 shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="routine-filter-search"
                  type="text"
                  placeholder="Search routines by title, exercise, or equipment..."
                  value={routineSearchQuery}
                  onChange={(e) => setRoutineSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs font-normal text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                {routineSearchQuery && (
                  <button
                    onClick={() => setRoutineSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="relative flex items-center">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                  <select
                    id="routine-filter-sort"
                    value={routineSortBy}
                    onChange={(e) => setRoutineSortBy(e.target.value as any)}
                    className="pl-8 pr-7 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none"
                  >
                    <option value="sequence">Custom Sequence</option>
                    <option value="newest">Date (Newest)</option>
                    <option value="oldest">Date (Oldest)</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="exercises">Most Exercises</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tag / Difficulty Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Difficulty:</span>
              </span>
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((tag) => {
                const isSelected = selectedTagFilter === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTagFilter(tag)}
                    className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-2xs'
                        : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}

              <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 ml-auto shrink-0">
                {filteredRoutines.length} {filteredRoutines.length === 1 ? 'result' : 'results'}
              </span>

              {(routineSearchQuery || selectedTagFilter !== 'All' || selectedFilter !== 'All' || routineSortBy !== 'sequence') && (
                <button
                  type="button"
                  onClick={() => {
                    setRoutineSearchQuery('');
                    setSelectedTagFilter('All');
                    setSelectedFilter('All');
                    setRoutineSortBy('sequence');
                  }}
                  className="text-[10px] font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 ml-2 shrink-0 cursor-pointer underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Grid of Routine Cards with Drag & Drop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {loading && routines.length === 0 ? (
              <div className="col-span-full py-12 text-center text-sm font-medium text-slate-500">
                Loading routines...
              </div>
            ) : filteredRoutines.length === 0 ? (
              <div className="col-span-full rounded-[28px] border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  No routines found for "{selectedFilter}".
                </p>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="mt-3 px-4 py-2 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer"
                >
                  + Create Routine
                </button>
              </div>
            ) : (
              filteredRoutines.map((routine, index) => {
                const isTodayActive = heroRoutine?._id === routine._id;
                const theme = cardThemes[index % cardThemes.length];
                const isDragging = draggedRoutineIndex === index;
                const isOver = dragOverRoutineIndex === index;

                return (
                  <div
                    key={routine._id || index}
                    id={`routine-card-${index}`}
                    draggable
                    onDragStart={(e) => handleRoutineDragStart(e, index)}
                    onDragOver={(e) => handleRoutineDragOver(e, index)}
                    onDrop={(e) => handleRoutineDrop(e, index)}
                    onClick={() => handleStartWorkout(routine)}
                    className={`rounded-[28px] ${theme.bg} p-6 flex flex-col justify-between min-h-[220px] transition-all cursor-pointer relative group border-2 ${
                      isTodayActive
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                        : isOver
                        ? 'border-dashed border-emerald-500 scale-[1.02]'
                        : 'border-transparent hover:shadow-md hover:scale-[1.01]'
                    } ${isDragging ? 'opacity-40' : 'opacity-100'}`}
                  >
                    {/* Top row: Drag Handle + Sequence Step + Badge + Delete */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Drag Handle */}
                        <div
                          className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Drag to reorder sequence"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Sequence step pill */}
                        <span className={`px-2.5 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} text-[10px] font-black tracking-wider uppercase font-['Outfit']`}>
                          #{index + 1} {routine.tags?.[0] || routine.category || 'SPLIT'}
                        </span>

                        {isTodayActive && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9.5px] font-extrabold uppercase tracking-wider font-['Outfit'] shadow-2xs">
                            ★ TODAY
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {!isTodayActive && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setManualTodayId(routine._id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-[10px] font-bold px-2 py-1 rounded-full bg-black/10 dark:bg-white/10 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                            title="Set as Today's Active Routine"
                          >
                            Set Today
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${routine.name}" routine?`)) {
                              deleteRoutine(routine._id);
                            }
                          }}
                          title="Delete routine"
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-8 h-8 rounded-xl ${theme.iconBg} ${theme.iconText} flex items-center justify-center shrink-0`}>
                          {getRoutineIcon(routine.name, routine.category)}
                        </div>
                        <h3 className="text-xl font-bold text-slate-950 dark:text-white font-['Outfit'] tracking-tight line-clamp-1">
                          {routine.name}
                        </h3>
                      </div>
                      <p className="text-[12.5px] text-slate-700 dark:text-slate-300 font-medium">
                        {routine.exercises?.length || 0} Exercises • {routine.category || 'Strength'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-4">
                      {routine.exercises?.slice(0, 3).map((ex: any, i: number) => (
                        <span
                          key={i}
                          className={`px-2.5 py-1 rounded-md ${theme.tagBg} text-xs font-semibold`}
                        >
                          {ex.name}
                        </span>
                      ))}
                      {(routine.exercises?.length || 0) > 3 && (
                        <span className={`px-2.5 py-1 rounded-md ${theme.tagBg} text-xs font-semibold`}>
                          +{(routine.exercises?.length || 0) - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Logger (Permanently Fixed/Sticky on Side) */}
        <div className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-6 self-start space-y-4">
          <div
            id="routine-card-quick-logger"
            className="rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-all"
          >
            {/* Header: Icon + Quick Logger + History button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center">
                  <MdEditNote size={19} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white font-['Outfit'] leading-tight">
                    Quick Logger
                  </h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                    Fast set entry • Always accessible
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLogsModalOpen(true)}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                title="View all workout logs"
              >
                <History className="w-3 h-3" />
                <span>History ({logs.length})</span>
              </button>
            </div>

            {/* Logger Form */}
            <form onSubmit={handleQuickSubmit} className="mt-4 flex-1 flex flex-col justify-between">
              <div>
                {/* Exercise Name Input */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                    Exercise Name
                  </label>
                  <input
                    id="quick-log-exercise-input"
                    type="text"
                    placeholder="e.g. Deadlift, Push-ups..."
                    value={quickExercise}
                    onChange={(e) => setQuickExercise(e.target.value)}
                    className="w-full text-xs text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent border-b border-slate-200 dark:border-slate-800 py-1.5 outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>

                {/* 3 Numerical Stats Row: Sets, Reps, Weight */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-[#F0F5F2] dark:bg-slate-800/70 rounded-xl p-1.5">
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block">
                      Sets
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={quickSets}
                      onChange={(e) => setQuickSets(e.target.value)}
                      className="w-full text-center text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-transparent outline-none py-0.5"
                    />
                  </div>
                  <div className="bg-[#F0F5F2] dark:bg-slate-800/70 rounded-xl p-1.5">
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block">
                      Reps
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={quickReps}
                      onChange={(e) => setQuickReps(e.target.value)}
                      className="w-full text-center text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-transparent outline-none py-0.5"
                    />
                  </div>
                  <div className="bg-[#F0F5F2] dark:bg-slate-800/70 rounded-xl p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const next = weightUnit === 'kg' ? 'lbs' : 'kg';
                        setWeightUnit(next);
                        localStorage.setItem('fitness_weight_unit', next);
                      }}
                      className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mx-auto hover:underline cursor-pointer uppercase tracking-wider"
                      title="Click to toggle kg / lbs"
                    >
                      {weightUnit}
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={quickWeight}
                      onChange={(e) => setQuickWeight(e.target.value)}
                      className="w-full text-center text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-transparent outline-none py-0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button: Log Set */}
              <button
                id="quick-log-set-btn"
                type="submit"
                className={`w-full py-2.5 rounded-full text-xs font-semibold transition-all mt-4 cursor-pointer flex items-center justify-center gap-1.5 ${
                  quickLogSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-98'
                }`}
              >
                {quickLogSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Set Logged!</span>
                  </>
                ) : (
                  <span>Log Set</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. WORKOUT ACTIVITY & LOGS SECTION (Full details & info) */}
      {/* ========================================================================= */}
      <div
        id="workout-activity-logs-section"
        className="rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-['Outfit']">
                Workout Activity & Logs
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                {logs.length} Logged
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal">
              Review your logged workouts with full exercise sets, reps, weights, and calories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="view-all-logs-btn"
              onClick={() => setIsLogsModalOpen(true)}
              className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>View Complete History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Logs list or empty state */}
        {logsLoading ? (
          <div className="py-12 text-center text-sm font-medium text-slate-500">
            Loading workout logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <History className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No workout logs recorded yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              Use the Quick Logger above or start a workout session to log exercises. They will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
            {logs.slice(0, 6).map((log: any) => {
              const logDate = new Date(log.performedAt || log.createdAt);
              const formattedDate = logDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const formattedTime = logDate.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              });

              return (
                <div
                  key={log._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 px-3 rounded-2xl transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-bold text-sm">
                      <MdFitnessCenter size={20} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {formattedDate} at {formattedTime}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {log.routineName || (log.routineId ? (routines.find((r: any) => r._id === log.routineId)?.name) : '') || 'Workout Session'}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {log.exercisesPerformed?.map((ex: any, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{ex.name}:</span>
                            <span>{ex.sets} sets × {ex.reps} reps</span>
                            {Number(ex.weight) > 0 && (
                              <span className="text-slate-500 font-semibold">@{ex.weight} {log.weightUnit || 'kg'}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.durationMinutes || 15} mins</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11.5px] font-medium text-orange-600 dark:text-orange-400 mt-0.5">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>{log.caloriesBurned || 0} kcal</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this workout log?')) {
                          deleteLog(log._id);
                        }
                      }}
                      title="Delete log"
                      className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. CREATE ROUTINE SLIDE-OVER SIDEBAR WITH EXERCISE PICKER STATE */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="create-routine-backdrop"
            id="create-routine-sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsSidebarOpen(false);
                setIsExercisePickerOpen(false);
              }
            }}
          >
            <motion.div
              key="create-routine-panel"
              id="create-routine-sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-[480px] sm:max-w-[500px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden rounded-tl-[36px] border-l border-t border-slate-200/80 dark:border-slate-800 relative z-50"
            >
            {/* IF IN EXERCISE PICKER STATE */}
            {isExercisePickerOpen ? (
              <>
                {/* Header: Back Button + Title + Close Button */}
                <div className="p-6 sm:p-7 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsExercisePickerOpen(false)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      title="Back to Routine"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                    </button>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-['Outfit'] tracking-tight flex items-center gap-2">
                        <span>Select Exercises</span>
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {routineExercises.length}
                        </span>
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsExercisePickerOpen(false);
                      setIsSidebarOpen(false);
                    }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </div>

                {/* Body: Search + Category Filter + Available Exercises Grid */}
                <div className="p-6 sm:p-7 space-y-5 flex-1 overflow-y-auto">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search 28+ exercises by name or muscle..."
                      value={exerciseSearchQuery}
                      onChange={(e) => setExerciseSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-9 py-3 rounded-xl bg-[#F2F6F3] dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-sm font-normal text-slate-950 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-slate-400 transition-all"
                    />
                    {exerciseSearchQuery && (
                      <button
                        onClick={() => setExerciseSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {exerciseCategoryOptions.map((cat) => {
                        const isSelected = selectedExerciseCategory === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedExerciseCategory(cat)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-2xs'
                                : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Exercises Library List */}
                  <div className="space-y-3 pt-1">
                    {ALL_EXERCISES_LIBRARY.filter((ex) => {
                      const matchesCategory =
                        selectedExerciseCategory === 'All' || ex.category === selectedExerciseCategory;
                      const matchesSearch =
                        !exerciseSearchQuery.trim() ||
                        ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
                        ex.targetMuscle.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
                        ex.equipment.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
                      return matchesCategory && matchesSearch;
                    }).map((ex) => {
                      const isAdded = routineExercises.some(
                        (item) => item.name.toLowerCase() === ex.name.toLowerCase()
                      );
                      return (
                        <div
                          key={ex.id}
                          className={`p-4 rounded-[20px] border transition-all flex items-center justify-between gap-3 ${
                            isAdded
                              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="text-sm font-bold text-slate-950 dark:text-white font-['Outfit']">
                                {ex.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                                {ex.equipment}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              Target: <span className="text-slate-700 dark:text-slate-300 font-semibold">{ex.targetMuscle}</span> • {ex.defaultSets} sets x {ex.defaultReps} reps ({ex.defaultRest} rest)
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleExerciseFromLibrary(ex)}
                            className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700 active:scale-95'
                                : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer: Done Button */}
                <div className="p-6 sm:p-7 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsExercisePickerOpen(false)}
                    className="w-full py-3.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-sm font-semibold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    <span>Done ({routineExercises.length} Exercises Selected)</span>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </>
            ) : (
              /* MAIN CREATE ROUTINE FORM VIEW */
              <>
                {/* Header: Title + Close Button */}
                <div className="p-6 sm:p-7 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <h2
                    id="create-routine-sidebar-title"
                    className="text-2xl font-bold text-slate-950 dark:text-white font-['Outfit'] tracking-tight"
                  >
                    Create New Routine
                  </h2>
                  <button
                    id="close-create-routine-sidebar-btn"
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                    aria-label="Close Sidebar"
                  >
                    <X className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </div>

                {/* Scrollable Form Body */}
                <div className="p-6 sm:p-7 space-y-6 flex-1 overflow-y-auto">
                  {/* Routine Name Field */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-wider uppercase block mb-2 font-['Outfit']">
                      ROUTINE NAME
                    </label>
                    <input
                      id="routine-name-input"
                      type="text"
                      placeholder="e.g. Upper Body Power"
                      value={routineName}
                      onChange={(e) => setRoutineName(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#F2F6F3] dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-[15px] font-normal text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-slate-400 transition-all"
                    />
                  </div>

                  {/* Category Segmented Pills */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-wider uppercase block mb-2.5 font-['Outfit']">
                      CATEGORY
                    </label>
                    <div className="flex items-center gap-2.5">
                      {(['Strength', 'Cardio', 'Mobility'] as const).map((cat) => {
                        const isSelected = selectedCategory === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2 rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#BEEFE3] dark:bg-emerald-950 text-slate-950 dark:text-emerald-300 shadow-2xs'
                                : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Difficulty Segmented Pills */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-wider uppercase block mb-2.5 font-['Outfit']">
                      DIFFICULTY
                    </label>
                    <div className="flex items-center gap-2.5">
                      {(['Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => {
                        const isSelected = selectedDifficulty === diff;
                        return (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setSelectedDifficulty(diff)}
                            className={`px-5 py-2 rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#9FE7EC] dark:bg-cyan-950 text-slate-950 dark:text-cyan-300 shadow-2xs'
                                : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            {diff}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="border-t border-slate-200/80 dark:border-slate-800 my-5" />

                  {/* Routine Exercises Header */}
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <h3 className="text-[18px] font-bold text-slate-950 dark:text-white font-['Outfit'] tracking-tight flex items-center gap-2">
                        <span>Routine Exercises</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {routineExercises.length}
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsExercisePickerOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>+ Add Exercise</span>
                      </button>
                    </div>

                    {/* Exercises List */}
                    <div className="space-y-3.5">
                      {routineExercises.map((exercise, index) => {
                        const isDragging = draggedIndex === index;
                        const isOver = dragOverIndex === index && draggedIndex !== index;
                        return (
                          <div
                            key={exercise.id}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`p-4 sm:p-4.5 rounded-[22px] border bg-white dark:bg-slate-900/90 shadow-2xs flex items-start gap-3.5 transition-all ${
                              isDragging
                                ? 'opacity-40 scale-[0.98] border-dashed border-slate-500 bg-slate-50 dark:bg-slate-800'
                                : isOver
                                ? 'border-2 border-slate-900 dark:border-white scale-[1.01] shadow-md bg-slate-50 dark:bg-slate-800'
                                : 'border-[#CBD7CA] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                            }`}
                          >
                            {/* Left: 6-dot ordering drag handle icon */}
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragEnd={handleDragEnd}
                              title="Drag to reorder exercises"
                              className="mt-0.5 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white shrink-0 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
                            >
                              <GripVertical className="w-4 h-4 stroke-[2.2]" />
                            </div>

                            {/* Right: Exercise Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-[15px] font-bold text-slate-950 dark:text-white font-['Outfit'] leading-tight">
                                    {exercise.name}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                    {exercise.equipment} • {exercise.targetMuscle}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExercise(exercise.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Remove exercise"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* 3 Metric Pills: SETS, REPS, REST (Editable) */}
                              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                                <div className="bg-[#F0F5F2] dark:bg-slate-800/80 rounded-xl py-1.5 px-2 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                                  <label className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase block">
                                    SETS
                                  </label>
                                  <input
                                    type="text"
                                    value={exercise.sets}
                                    onChange={(e) =>
                                      handleUpdateExerciseField(exercise.id, 'sets', e.target.value)
                                    }
                                    className="w-full text-center bg-transparent border-0 text-[13px] font-bold text-slate-900 dark:text-white focus:outline-none p-0 mt-0.5"
                                    placeholder="3"
                                  />
                                </div>
                                <div className="bg-[#F0F5F2] dark:bg-slate-800/80 rounded-xl py-1.5 px-2 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                                  <label className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase block">
                                    REPS
                                  </label>
                                  <input
                                    type="text"
                                    value={exercise.reps}
                                    onChange={(e) =>
                                      handleUpdateExerciseField(exercise.id, 'reps', e.target.value)
                                    }
                                    className="w-full text-center bg-transparent border-0 text-[13px] font-bold text-slate-900 dark:text-white focus:outline-none p-0 mt-0.5"
                                    placeholder="10"
                                  />
                                </div>
                                <div className="bg-[#F0F5F2] dark:bg-slate-800/80 rounded-xl py-1.5 px-2 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                                  <label className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase block">
                                    REST
                                  </label>
                                  <input
                                    type="text"
                                    value={exercise.rest}
                                    onChange={(e) =>
                                      handleUpdateExerciseField(exercise.id, 'rest', e.target.value)
                                    }
                                    className="w-full text-center bg-transparent border-0 text-[13px] font-bold text-slate-900 dark:text-white focus:outline-none p-0 mt-0.5"
                                    placeholder="60s"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Dashed "+ Add Exercise" Card Button */}
                      <button
                        type="button"
                        onClick={() => setIsExercisePickerOpen(true)}
                        className="w-full py-4 rounded-[22px] border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-500 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 active:scale-98"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add Exercise from All Library (28+)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer: Save & Create Routine Button */}
                <div className="p-6 sm:p-7 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                  <button
                    id="save-and-create-routine-btn"
                    type="button"
                    onClick={handleSaveRoutine}
                    className="w-full py-4 rounded-full bg-[#242827] dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-950 text-sm font-semibold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    <span>{routineSavedSuccess ? 'Routine Saved!' : 'Save & Create Routine'}</span>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. WORKOUT LOGS FULL DETAIL MODAL / DRAWER WITH ANIMATION & FILTER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isLogsModalOpen && (
          <motion.div
            key="workout-logs-backdrop"
            id="workout-logs-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsLogsModalOpen(false);
              }
            }}
          >
            <motion.div
              key="workout-logs-panel"
              id="workout-logs-modal"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-[540px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden rounded-tl-[36px] border-l border-t border-slate-200/80 dark:border-slate-800 relative z-50"
            >
              {/* Header */}
              <div className="p-6 sm:p-7 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-['Outfit'] tracking-tight flex items-center gap-2">
                      <span>Workout Logs History</span>
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {filteredLogs.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                      Complete records of your workouts, sets, and progress.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLogsModalOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>

              {/* Quick Stats Bar */}
              <div className="grid grid-cols-3 gap-2 px-6 sm:px-7 py-3.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 shrink-0 text-center">
                <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium block">Total Workouts</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">{logs.length}</span>
                </div>
                <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium block">Total Minutes</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                    {logs.reduce((sum: number, l: any) => sum + (Number(l.durationMinutes) || 0), 0)}
                  </span>
                </div>
                <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium block">Calories Burned</span>
                  <span className="text-base font-bold text-orange-600 dark:text-orange-400 font-['Outfit']">
                    ~{formatEnergy(logs.reduce((sum: number, l: any) => sum + (Number(l.caloriesBurned) || 0), 0))}
                  </span>
                </div>
              </div>

              {/* Logs Search & Sort Filter Bar */}
              <div className="px-6 py-2.5 bg-slate-50/60 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search logs by routine or exercise..."
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {logSearchQuery && (
                    <button
                      onClick={() => setLogSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <select
                  value={logSortBy}
                  onChange={(e) => setLogSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-7 space-y-4 flex-1 overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="py-16 text-center flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                      <History className="w-7 h-7 stroke-[1.5]" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                      {logSearchQuery ? 'No matching logs found' : 'No workout logs yet'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1.5">
                      {logSearchQuery ? 'Try clearing your search query to see all logs.' : 'Start by recording single exercises using the Quick Logger, or complete a full workout session.'}
                    </p>
                  </div>
                ) : (
                  filteredLogs.map((log: any) => {
                    const logDate = new Date(log.performedAt || log.createdAt);
                    const formattedDate = logDate.toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const formattedTime = logDate.toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={log._id}
                        className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 relative group transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex items-center justify-center shadow-2xs font-semibold">
                              <MdFitnessCenter size={16} />
                            </div>
                            <div>
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                                {formattedDate} • {formattedTime}
                              </span>
                              <h4 className="text-sm font-bold text-slate-950 dark:text-white font-['Outfit'] mt-0.5">
                                {log.routineName || (log.routineId ? (routines.find((r: any) => r._id === log.routineId)?.name) : '') || 'Workout Log'}
                              </h4>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete this workout log?')) {
                                deleteLog(log._id);
                              }
                            }}
                            className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-950 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Exercises detailed list */}
                        <div className="mt-3 space-y-2">
                          {log.exercisesPerformed?.map((ex: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {ex.name}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400">
                                {ex.sets} sets × {ex.reps} reps {ex.weight ? `• ${ex.weight} ${log.weightUnit || weightUnit}` : ''}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Footer: duration + calories */}
                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Duration: {log.durationMinutes || 15} mins</span>
                          </div>
                          <div className="flex items-center gap-1 font-semibold text-orange-600 dark:text-orange-400">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            <span>~{formatEnergy(log.caloriesBurned || 0)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLogsModalOpen(false)}
                  className="w-full py-3 rounded-full bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Close History
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
