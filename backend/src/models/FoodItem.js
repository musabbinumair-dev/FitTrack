import mongoose from "mongoose";

const macrosSchema = new mongoose.Schema(
  {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  { _id: false }
);

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    defaultServingSize: { type: String, default: "" },
    caloriesPerServing: { type: Number, required: true },
    macrosPerServing: macrosSchema,
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true, collection: "fooditems" }
);

const FoodItem = mongoose.model("FoodItem", foodItemSchema);

export default FoodItem;
