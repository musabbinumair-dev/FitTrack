import mongoose from "mongoose";

const macrosSchema = new mongoose.Schema(
  {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  { _id: false }
);

const mealItemSchema = new mongoose.Schema({
  foodName: { type: String, required: true, trim: true },
  servingSize: { type: String, default: "1 serving" },
  calories: { type: Number, default: 0 },
  macros: { type: macrosSchema, default: () => ({ protein: 0, carbs: 0, fat: 0 }) }
});

const mealSchema = new mongoose.Schema({
  type: { type: String, required: true, lowercase: true, trim: true },
  items: [mealItemSchema]
});

const nutritionLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.Mixed, required: true },
    date: { type: String, required: true },
    meals: [mealSchema],
    totalCalories: { type: Number, default: 0 },
    waterIntakeMl: { type: Number, default: 0 },
    waterGoalMl: { type: Number, default: 3000 },
    calorieGoal: { type: Number, default: 2400 },
    proteinGoal: { type: Number, default: 160 },
    carbsGoal: { type: Number, default: 250 },
    fatsGoal: { type: Number, default: 70 }
  },
  { timestamps: true, collection: "nutritionlogs" }
);

nutritionLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const NutritionLog = mongoose.models.NutritionLog || mongoose.model("NutritionLog", nutritionLogSchema);

export default NutritionLog;
