import User from "../models/User.js";
import WorkoutLog from "../models/WorkoutLog.js";
import NutritionLog from "../models/NutritionLog.js";
import BodyMetric from "../models/BodyMetric.js";

function normalizeDate(dateString) {
  const d = new Date(dateString);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

function getStartOfDay(date) {
  const d = new Date(date);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

function getEndOfDay(date) {
  const d = new Date(date);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

async function getSummary(req, res) {
  try {
    const today = new Date();
    const todayStart = getStartOfDay(today);
    const todayEnd = getEndOfDay(today);

    const user = await User.findById(req.userId).select("dailyCalorieGoal preferences");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const todaysNutrition = await NutritionLog.findOne({ userId: req.userId, date: todayStart });

    const nutritionCalories = todaysNutrition?.totalCalories || 0;
    const calorieGoal = user.dailyCalorieGoal || 2000;
    const caloriesRemaining = calorieGoal - nutritionCalories;

    const todaysWorkouts = await WorkoutLog.find({
      userId: req.userId,
      performedAt: { $gte: todayStart, $lte: todayEnd }
    });

    const workoutsToday = todaysWorkouts.length;
    const workoutMinutesToday = todaysWorkouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
    const workoutCaloriesToday = todaysWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    const latestMetric = await BodyMetric.findOne({ userId: req.userId }).sort({ date: -1 });
    const currentWeight = latestMetric?.weight || null;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStart = getStartOfDay(sevenDaysAgo);

    const recentWorkouts = await WorkoutLog.find({
      userId: req.userId,
      performedAt: { $gte: sevenDaysAgoStart }
    });
    const workoutsThisWeek = recentWorkouts.length;

    const recentNutrition = await NutritionLog.find({
      userId: req.userId,
      date: { $gte: sevenDaysAgoStart }
    });
    const avgDailyCalories = recentNutrition.length
      ? Math.round(recentNutrition.reduce((sum, n) => sum + n.totalCalories, 0) / recentNutrition.length)
      : 0;

    res.json({
      summary: {
        calories: {
          consumed: nutritionCalories,
          goal: calorieGoal,
          remaining: Math.max(0, caloriesRemaining)
        },
        workouts: {
          today: workoutsToday,
          thisWeek: workoutsThisWeek,
          minutesToday: workoutMinutesToday,
          caloriesBurnedToday: workoutCaloriesToday
        },
        weight: {
          current: currentWeight,
          unit: user.preferences?.units || "kg"
        },
        nutrition: {
          avgDailyCalories: avgDailyCalories
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

export { getSummary };