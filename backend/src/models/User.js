import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema(
  {
    units: { type: String, enum: ["kg", "lbs"], default: "kg" },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    notificationsEnabled: { type: Boolean, default: true },
    adminSupportEmail: { type: String, default: "", trim: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, default: "", select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    phone: { type: String, default: "" },
    lastActive: { type: Date, default: Date.now },
    preferences: preferencesSchema,
    dailyCalorieGoal: { type: Number, default: 2000 },
    calorieGoal: { type: Number, default: 2000 },
    proteinGoal: { type: Number, default: 150 },
    carbsGoal: { type: Number, default: 220 },
    fatsGoal: { type: Number, default: 65 },
    waterGoalMl: { type: Number, default: 3000 },
    age: { type: Number, default: null },
    gender: { type: String, default: "" },
    weight: { type: Number, default: null },
    startingWeight: { type: Number, default: null },
    weightUnit: { type: String, default: "kg" },
    height: { type: Number, default: null },
    heightUnit: { type: String, default: "cm" },
    workoutDaysPerWeek: { type: Number, default: 4 },
    activityLevel: { type: String, default: "moderately_active" },
    occupationType: { type: String, default: "office_worker" },
    fitnessGoal: { type: String, default: "maintain" },
    targetWeight: { type: Number, default: null },
    targetTimeframeMonths: { type: Number, default: 3 },
    targetTimeframeUnit: { type: String, default: "months" },
    preferredRoutine: { type: String, default: "Push / Pull / Legs" },
    isOnboardingCompleted: { type: Boolean, default: false },
    profilePhotoUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    refreshTokens: { type: [String], default: [] }
  },
  { timestamps: true, collection: "users" }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
