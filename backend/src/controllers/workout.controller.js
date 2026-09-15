import WorkoutRoutine from "../models/WorkoutRoutine.js";
import WorkoutLog from "../models/WorkoutLog.js";

async function getRoutines(req, res) {
  try {
    const { search, category, isArchived } = req.query;
    const filter = {
      $or: [
        { userId: req.userId },
        { userId: String(req.userId) }
      ]
    };

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (category && category !== "All") {
      filter.category = category;
    }
    if (isArchived !== undefined) {
      filter.isArchived = isArchived === "true";
    } else {
      filter.isArchived = false;
    }

    let routines = await WorkoutRoutine.find(filter).sort({ createdAt: -1 });

    res.json({ routines });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong", error: error.message });
  }
}

async function createRoutine(req, res) {
  try {
    const { name, category, tags, exercises } = req.body;

    if (!name || !exercises || !exercises.length) {
      return res.status(400).json({ message: "Name and at least one exercise are required" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const formattedExercises = exercises.map((item) => ({
      name: item.name || "Exercise",
      sets: item.sets || 3,
      reps: item.reps || 10,
      weight: Number(item.weight) || 0,
      notes: item.notes || (item.equipment && item.targetMuscle ? `${item.equipment} • ${item.targetMuscle}` : item.rest || "")
    }));

    const routine = await WorkoutRoutine.create({
      userId: req.userId,
      name: name.trim(),
      category: category || "Strength",
      tags: tags || [],
      exercises: formattedExercises
    });

    res.status(201).json({ message: "Routine created", routine });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong", error: error.message });
  }
}

async function getRoutine(req, res) {
  try {
    const routine = await WorkoutRoutine.findOne({
      _id: req.params.id,
      $or: [{ userId: req.userId }, { userId: String(req.userId) }]
    });
    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }
    res.json({ routine });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong", error: error.message });
  }
}

async function updateRoutine(req, res) {
  try {
    const { name, category, tags, exercises, isArchived } = req.body;

    const routine = await WorkoutRoutine.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ userId: req.userId }, { userId: String(req.userId) }]
      },
      { name, category, tags, exercises, isArchived },
      { new: true, runValidators: true }
    );

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    res.json({ message: "Routine updated", routine });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong", error: error.message });
  }
}

async function deleteRoutine(req, res) {
  try {
    const routine = await WorkoutRoutine.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ userId: req.userId }, { userId: String(req.userId) }]
      },
      { isArchived: true },
      { new: true }
    );

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    res.json({ message: "Routine archived", routine });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong", error: error.message });
  }
}

async function createLog(req, res) {
  try {
    const { routineId, routineName, durationMinutes, exercisesPerformed, caloriesBurned, weightUnit } = req.body;

    if (!durationMinutes || !exercisesPerformed || !exercisesPerformed.length) {
      return res.status(400).json({ message: "Duration and exercises are required" });
    }

    const log = await WorkoutLog.create({
      userId: req.userId,
      routineId,
      routineName: routineName || "",
      durationMinutes,
      exercisesPerformed,
      caloriesBurned,
      weightUnit: weightUnit || "kg"
    });

    res.status(201).json({ message: "Workout logged", log });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function getLogs(req, res) {
  try {
    const filter = {
      $or: [
        { userId: req.userId },
        { userId: String(req.userId) }
      ]
    };

    const logs = await WorkoutLog.find(filter)
      .sort({ performedAt: -1, createdAt: -1 });

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function deleteLog(req, res) {
  try {
    const log = await WorkoutLog.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { userId: req.userId },
        { userId: String(req.userId) }
      ]
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.json({ message: "Log deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

export { getRoutines, createRoutine, getRoutine, updateRoutine, deleteRoutine, createLog, getLogs, deleteLog };