import BodyMetric from "../models/BodyMetric.js";
import WorkoutLog from "../models/WorkoutLog.js";
import NutritionLog from "../models/NutritionLog.js";
import User from "../models/User.js";

function formatDate(val) {
  if (!val) return "";
  if (typeof val === "string") return val.split("T")[0];
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toISOString().split("T")[0];
  } catch {
    return String(val);
  }
}

function toCSV(headers, rows) {
  const headerLine = headers.join(",");
  const rowLines = rows.map((row) => headers.map((h) => JSON.stringify(row[h] !== undefined && row[h] !== null ? row[h] : "")).join(","));
  return [headerLine, ...rowLines].join("\n");
}

async function exportProgress(req, res) {
  try {
    const { format = "csv", startDate, endDate } = req.query;

    const user = await User.findById(req.userId).select("-passwordHash -refreshTokens");

    const metricFilter = { userId: req.userId };
    const workoutFilter = { userId: req.userId };
    const nutritionFilter = { userId: req.userId };

    if (startDate || endDate) {
      metricFilter.date = {};
      workoutFilter.performedAt = {};
      nutritionFilter.date = {};
      if (startDate) {
        metricFilter.date.$gte = new Date(startDate);
        workoutFilter.performedAt.$gte = new Date(startDate);
        nutritionFilter.date.$gte = String(startDate);
      }
      if (endDate) {
        metricFilter.date.$lte = new Date(endDate);
        workoutFilter.performedAt.$lte = new Date(endDate);
        nutritionFilter.date.$lte = String(endDate);
      }
    }

    const metrics = await BodyMetric.find(metricFilter).sort({ date: 1 });
    const workouts = await WorkoutLog.find(workoutFilter).sort({ performedAt: 1 });
    const nutrition = await NutritionLog.find(nutritionFilter).sort({ date: 1 });

    if (format === "csv") {
      let csv = "";

      csv += "=== FITNESS TRACKER PROGRESS REPORT ===\n";
      csv += `Generated On,${new Date().toISOString().split("T")[0]}\n`;
      csv += `User Name,${user ? user.name : "Athlete"}\n`;
      csv += `Email,${user ? user.email : ""}\n\n`;

      csv += "=== BODY WEIGHT LOGS ===\n";
      csv += toCSV(
        ["date", "weight", "unit"],
        metrics.map((m) => ({
          date: formatDate(m.date),
          weight: m.weight != null ? m.weight : "",
          unit: user?.weightUnit || "kg"
        }))
      ) + "\n\n";

      csv += "=== WORKOUT SESSIONS ===\n";
      csv += toCSV(
        ["date", "routine", "durationMinutes", "caloriesBurned", "exerciseCount"],
        workouts.map((w) => ({
          date: formatDate(w.performedAt || w.createdAt),
          routine: w.routineName || "Workout Routine",
          durationMinutes: w.durationMinutes || 0,
          caloriesBurned: w.caloriesBurned || 0,
          exerciseCount: Array.isArray(w.exercisesPerformed) ? w.exercisesPerformed.length : 0
        }))
      ) + "\n\n";

      csv += "=== NUTRITION & HYDRATION ===\n";
      csv += toCSV(
        ["date", "totalCalories", "waterIntakeMl", "mealsCount", "waterGoalMl", "calorieGoal"],
        nutrition.map((n) => ({
          date: formatDate(n.date),
          totalCalories: n.totalCalories || 0,
          waterIntakeMl: n.waterIntakeMl || 0,
          mealsCount: Array.isArray(n.meals) ? n.meals.length : 0,
          waterGoalMl: n.waterGoalMl || 3000,
          calorieGoal: n.calorieGoal || 2000
        }))
      );

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="fitness-progress.csv"');
      return res.send(csv);
    }

    res.status(400).json({ message: "Supported format is csv. Use format=csv" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

export { exportProgress };