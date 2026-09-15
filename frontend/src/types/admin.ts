import { User } from './fitness';

export interface AdminUserStats {
  totalUsers: number;
  activeUsers7d: number;
  newUsersThisMonth: number;
  adminCount: number;
}

export interface AdminPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  role?: 'all' | 'user' | 'admin';
  sortBy?: 'joinDate' | 'lastActive' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminUsersResponse {
  users: User[];
  pagination: AdminPagination;
  stats: AdminUserStats;
}

export interface UserGrowthPoint {
  date: string;
  count: number;
  total: number;
}

export interface ActivityTrendPoint {
  day: string;
  workouts: number;
  meals: number;
}

export interface PopularExerciseItem {
  id: string;
  name: string;
  category: string;
  count: number;
  percentage: number;
  muscleGroup?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  avgCalories?: number;
  avgSets?: string;
  isTrending?: boolean;
}

export interface NutritionBreakdown {
  proteinPercent: number;
  carbsPercent: number;
  fatsPercent: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
}

export interface UserStatusBreakdown {
  activeCount: number;
  inactiveCount: number;
  activePercent: number;
  inactivePercent: number;
  growthPercent?: number;
}

export interface UserRetentionBreakdown {
  newUsersCount: number;
  returningUsersCount: number;
  newUsersPercent: number;
  returningUsersPercent: number;
  growthPercent?: number;
}

export interface WeeklyActivityBar {
  day: string;
  fullDate: string;
  count: number;
  percent: number;
  isLatest: boolean;
}

export interface AdminAnalyticsData {
  kpis: {
    totalWorkoutsLogged: number;
    totalMealsLogged: number;
    totalCaloriesBurned: number;
    avgWorkoutsPerUserWeek: number;
    workoutsTrendPercent?: number;
    mealsTrendPercent?: number;
    caloriesTrendPercent?: number;
  };
  userGrowth: {
    last30Days: UserGrowthPoint[];
    last6Months: UserGrowthPoint[];
  };
  activityTrends: {
    last7Days: ActivityTrendPoint[];
    last30Days: ActivityTrendPoint[];
  };
  weeklyActivityBars?: WeeklyActivityBar[];
  activityVsYesterdayPercent?: number;
  popularExercises: PopularExerciseItem[];
  nutritionBreakdown: NutritionBreakdown;
  userStatusBreakdown: UserStatusBreakdown;
  userRetentionBreakdown?: UserRetentionBreakdown;
}
