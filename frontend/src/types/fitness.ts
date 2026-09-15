export type MetricCategory = 'calories' | 'water' | 'sleep' | 'weight';

export interface KpiCardData {
  id: MetricCategory;
  title: string;
  value: number;
  unit: string;
  formattedValue: string;
  goal?: number;
  progressPercent: number;
  deltaText?: string;
  deltaPositive?: boolean;
  history: number[];
}

export type WorkoutCategory = 'Strength' | 'Cardio' | 'HIIT' | 'Hypertrophy' | 'Flexibility' | 'Recovery';

export interface WorkoutLog {
  id: string;
  name: string;
  category: WorkoutCategory;
  sets: number;
  reps: number;
  weightKg?: number;
  durationMinutes: number;
  caloriesBurned: number;
  timestamp: string;
  completed: boolean;
  notes?: string;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface MealLog {
  id: string;
  mealType: MealType;
  name: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  servingSize: string;
  timestamp: string;
}

export interface AiCoachInsight {
  id: string;
  headline: string;
  querySuggestion: string;
  description: string;
  metricComparison: string;
  highlightCategory: string;
  growthPercent: number;
}

export interface VolumeDataPoint {
  month: string;
  year2023: number;
  year2024: number;
  target: number;
  isPeak?: boolean;
  peakLabel?: string;
}

export interface WaveTrendPoint {
  timeLabel: string;
  caloriesBurned: number;
  intensityScore: number;
  isHighlighted?: boolean;
  highlightValue?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  unread: boolean;
  type: 'workout' | 'meal' | 'achievement' | 'reminder';
}

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  height?: string;
  weight?: string;
  fitnessGoal?: string;
  totalWorkoutsLogged: number;
  totalMealsLogged: number;
  totalCaloriesBurned?: number;
  joinDate: string;
  lastActive: string;
  createdAt?: string;
}

