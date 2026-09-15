import BodyMetric from "../models/BodyMetric.js";
import WorkoutLog from "../models/WorkoutLog.js";
import NutritionLog from "../models/NutritionLog.js";
import User from "../models/User.js";

function normalizeDate(dateString) {
  const d = new Date(dateString);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

async function createMetric(req, res) {
  try {
    const { date, weight, measurements, performanceMetrics } = req.body;

    if (!date || weight === undefined) {
      return res.status(400).json({ message: "Date and weight are required" });
    }

    const metricDate = normalizeDate(date);

    const metric = await BodyMetric.findOneAndUpdate(
      { userId: req.userId, date: metricDate },
      { weight, measurements, performanceMetrics },
      { new: true, upsert: true, runValidators: true }
    );

    if (weight !== undefined) {
      await User.findByIdAndUpdate(req.userId, { weight });
    }

    res.status(201).json({ message: "Body metric logged", metric });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function getMetrics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const filter = { userId: req.userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = normalizeDate(startDate);
      if (endDate) filter.date.$lte = normalizeDate(endDate);
    }

    const metrics = await BodyMetric.find(filter).sort({ date: 1 });
    res.json({ metrics });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function getWeightAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const filter = { userId: req.userId, weight: { $ne: null } };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = normalizeDate(startDate);
      if (endDate) filter.date.$lte = normalizeDate(endDate);
    }

    let metrics = await BodyMetric.find(filter).sort({ date: 1 }).select("date weight");
    if (!metrics || metrics.length === 0) {
      const user = await User.findById(req.userId);
      if (user && user.weight) {
        metrics = [{ date: new Date(), weight: user.weight }];
      }
    }
    res.json({ data: metrics });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function getWorkoutAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const filter = { userId: req.userId };

    if (startDate || endDate) {
      filter.performedAt = {};
      if (startDate) filter.performedAt.$gte = new Date(startDate);
      if (endDate) filter.performedAt.$lte = new Date(endDate);
    }

    const logs = await WorkoutLog.find(filter).sort({ performedAt: 1 });

    const byDate = {};
    for (const log of logs) {
      const key = log.performedAt.toISOString().split("T")[0];
      if (!byDate[key]) byDate[key] = { count: 0, totalDuration: 0, totalCalories: 0, exercises: 0 };
      byDate[key].count++;
      byDate[key].totalDuration += log.durationMinutes || 0;
      byDate[key].totalCalories += log.caloriesBurned || 0;
      byDate[key].exercises += log.exercisesPerformed?.length || 0;
    }

    const frequency = Object.entries(byDate).map(([date, stats]) => ({ date, ...stats }));

    const totalVolume = logs.reduce((sum, l) => sum + (l.exercisesPerformed?.reduce((s, e) => s + (e.sets * e.reps * (e.weight || 0), 0), 0) || 0), 0);

    res.json({ frequency, totalLogs: logs.length, totalVolume });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function getNutritionAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const filter = { userId: req.userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = String(startDate).split("T")[0];
      if (endDate) filter.date.$lte = String(endDate).split("T")[0];
    }

    const logs = await NutritionLog.find(filter).sort({ date: 1 });

    const trends = logs.map((log) => ({
      date: log.date,
      totalCalories: log.totalCalories,
      meals: log.meals.map((m) => ({
        type: m.type,
        calories: m.items.reduce((s, i) => s + i.calories, 0),
        protein: m.items.reduce((s, i) => s + (i.macros?.protein || 0), 0),
        carbs: m.items.reduce((s, i) => s + (i.macros?.carbs || 0), 0),
        fat: m.items.reduce((s, i) => s + (i.macros?.fat || 0), 0)
      }))
    }));

    res.json({ trends });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

export { createMetric, getMetrics, getWeightAnalytics, getWorkoutAnalytics, getNutritionAnalytics };