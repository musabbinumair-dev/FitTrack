import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sets: { type: mongoose.Schema.Types.Mixed, default: 3 },
  reps: { type: mongoose.Schema.Types.Mixed, default: 10 },
  weight: { type: Number, default: 0 },
  notes: { type: String, default: "" }
});

const workoutRoutineSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.Mixed, required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "" },
    tags: [String],
    exercises: [exerciseSchema],
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true, collection: "workoutroutines" }
);

const WorkoutRoutine = mongoose.models.WorkoutRoutine || mongoose.model("WorkoutRoutine", workoutRoutineSchema);

export default WorkoutRoutine;
