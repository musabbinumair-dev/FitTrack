import mongoose from "mongoose";

const exercisePerformedSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sets: { type: Number, default: 0 },
  reps: { type: Number, default: 0 },
  weight: { type: Number, default: 0 }
});

const workoutLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.Mixed, required: true },
    routineId: { type: mongoose.Schema.Types.Mixed, default: null },
    routineName: { type: String, default: "" },
    performedAt: { type: Date, default: Date.now },
    durationMinutes: { type: Number, required: true },
    exercisesPerformed: [exercisePerformedSchema],
    caloriesBurned: { type: Number, default: 0 },
    weightUnit: { type: String, default: "kg" }
  },
  { timestamps: true, collection: "workoutlogs" }
);

const WorkoutLog = mongoose.models.WorkoutLog || mongoose.model("WorkoutLog", workoutLogSchema);

export default WorkoutLog;
