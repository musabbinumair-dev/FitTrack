import NutritionLog from "../models/NutritionLog.js";
import FoodItem from "../models/FoodItem.js";
import User from "../models/User.js";

function getCleanDate(dateInput) {
  if (!dateInput) {
    return new Date().toISOString().split("T")[0];
  }
  if (dateInput.includes("T")) {
    return dateInput.split("T")[0];
  }
  return dateInput.trim();
}

async function getLog(req, res) {
  try {
    const date = getCleanDate(req.params.date);
    const log = await NutritionLog.findOne({
      $or: [{ userId: req.userId }, { userId: String(req.userId) }],
      date
    });

    if (!log) {
      const user = await User.findById(req.userId);
      return res.json({
        log: {
          date,
          meals: [],
          totalCalories: 0,
          waterIntakeMl: 0,
          waterGoalMl: user?.waterGoalMl || 3000,
          calorieGoal: user?.calorieGoal || user?.dailyCalorieGoal || 2400,
          proteinGoal: user?.proteinGoal || 160,
          carbsGoal: user?.carbsGoal || 250,
          fatsGoal: user?.fatsGoal || 70
        }
      });
    }

    res.json({ log });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function getLogsRange(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      $or: [{ userId: req.userId }, { userId: String(req.userId) }],
    };

    if (startDate && endDate) {
      query.date = { $gte: String(startDate).slice(0, 10), $lte: String(endDate).slice(0, 10) };
    } else if (startDate) {
      query.date = { $gte: String(startDate).slice(0, 10) };
    } else if (endDate) {
      query.date = { $lte: String(endDate).slice(0, 10) };
    }

    const logs = await NutritionLog.find(query).sort({ date: -1 });
    res.json({ logs: logs || [] });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function addMealItem(req, res) {
  try {
    const date = getCleanDate(req.params.date);
    const { type, foodName, servingSize, calories, macros, items } = req.body;

    const mealType = (type || "breakfast").toLowerCase().trim();

    let log = await NutritionLog.findOne({
      $or: [{ userId: req.userId }, { userId: String(req.userId) }],
      date
    });

    if (!log) {
      const user = await User.findById(req.userId);
      log = await NutritionLog.create({
        userId: req.userId,
        date,
        meals: [],
        totalCalories: 0,
        calorieGoal: user?.calorieGoal || user?.dailyCalorieGoal || 2400,
        proteinGoal: user?.proteinGoal || 160,
        carbsGoal: user?.carbsGoal || 250,
        fatsGoal: user?.fatsGoal || 70,
        waterGoalMl: user?.waterGoalMl || 3000
      });
    }

    let mealIndex = log.meals.findIndex((m) => m.type === mealType);
    if (mealIndex === -1) {
      log.meals.push({ type: mealType, items: [] });
      mealIndex = log.meals.length - 1;
    }

    if (Array.isArray(items) && items.length > 0) {
      for (const it of items) {
        log.meals[mealIndex].items.push({
          foodName: it.foodName || it.name || "Food Item",
          servingSize: it.servingSize || it.serving || "1 serving",
          calories: Number(it.calories) || 0,
          macros: {
            protein: Number(it.protein || it.macros?.protein) || 0,
            carbs: Number(it.carbs || it.macros?.carbs) || 0,
            fat: Number(it.fats || it.fat || it.macros?.fat) || 0
          }
        });
      }
    } else {
      if (!foodName) {
        return res.status(400).json({ message: "Food name is required" });
      }

      log.meals[mealIndex].items.push({
        foodName: foodName.trim(),
        servingSize: servingSize || "1 serving",
        calories: Number(calories) || 0,
        macros: {
          protein: Number(macros?.protein) || 0,
          carbs: Number(macros?.carbs) || 0,
          fat: Number(macros?.fat || macros?.fats) || 0
        }
      });
    }

    log.totalCalories = log.meals.reduce(
      (sum, meal) => sum + meal.items.reduce((s, it) => s + (Number(it.calories) || 0), 0),
      0
    );

    await log.save();
    res.status(201).json({ message: "Meal saved", log });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function updateMealItem(req, res) {
  try {
    const date = getCleanDate(req.params.date);
    const { foodName, servingSize, calories, macros, type } = req.body;

    const log = await NutritionLog.findOne({
      $or: [{ userId: req.userId }, { userId: String(req.userId) }],
      date
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    let found = false;
    for (const meal of log.meals) {
      const item = meal.items.id(req.params.itemId);
      if (item) {
        if (foodName !== undefined) item.foodName = foodName;
        if (servingSize !== undefined) item.servingSize = servingSize;
        if (calories !== undefined) item.calories = Number(calories);
        if (macros) {
          if (macros.protein !== undefined) item.macros.protein = Number(macros.protein);
          if (macros.carbs !== undefined) item.macros.carbs = Number(macros.carbs);
          if (macros.fat !== undefined || macros.fats !== undefined) {
            item.macros.fat = Number(macros.fat !== undefined ? macros.fat : macros.fats);
          }
        }
        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ message: "Item not found" });
    }

    log.totalCalories = log.meals.reduce(
      (sum, meal) => sum + meal.items.reduce((s, it) => s + (Number(it.calories) || 0), 0),
      0
    );

    await log.save();
    res.json({ message: "Item updated", log });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function deleteMealItem(req, res) {
  try {
    const date = getCleanDate(req.params.date);

    const log = await NutritionLog.findOne({
      $or: [{ userId: req.userId }, { userId: String(req.userId) }],
      date
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    let found = false;
    for (const meal of log.meals) {
      const item = meal.items.id(req.params.itemId);
      if (item) {
        item.deleteOne();
        found = true;
        break;
      }
    }

    if (!found) {
      return res.status(404).json({ message: "Item not found" });
    }

    log.totalCalories = log.meals.reduce(
      (sum, meal) => sum + meal.items.reduce((s, it) => s + (Number(it.calories) || 0), 0),
      0
    );

    await log.save();
    res.json({ message: "Item deleted", log });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function updateWater(req, res) {
  try {
    const date = getCleanDate(req.params.date);
    const { waterIntakeMl, waterGoalMl } = req.body;

    let log = await NutritionLog.findOne({
      $or: [{ userId: req.userId }, { userId: String(req.userId) }],
      date
    });

    if (!log) {
      const user = await User.findById(req.userId);
      log = await NutritionLog.create({
        userId: req.userId,
        date,
        meals: [],
        totalCalories: 0,
        waterIntakeMl: Number(waterIntakeMl) || 0,
        waterGoalMl: Number(waterGoalMl) || user?.waterGoalMl || 3000,
        calorieGoal: user?.calorieGoal || user?.dailyCalorieGoal || 2400,
        proteinGoal: user?.proteinGoal || 160,
        carbsGoal: user?.carbsGoal || 250,
        fatsGoal: user?.fatsGoal || 70
      });
    } else {
      if (waterIntakeMl !== undefined) log.waterIntakeMl = Math.max(0, Number(waterIntakeMl));
      if (waterGoalMl !== undefined) log.waterGoalMl = Math.max(500, Number(waterGoalMl));
      await log.save();
    }

    res.json({ message: "Water intake updated", log });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function updateGoals(req, res) {
  try {
    const date = getCleanDate(req.params.date);
    const { calorieGoal, proteinGoal, carbsGoal, fatsGoal, waterGoalMl } = req.body;

    let log = await NutritionLog.findOne({
      $or: [{ userId: req.userId }, { userId: String(req.userId) }],
      date
    });

    if (!log) {
      log = await NutritionLog.create({
        userId: req.userId,
        date,
        meals: [],
        totalCalories: 0,
        calorieGoal: Number(calorieGoal) || 2400,
        proteinGoal: Number(proteinGoal) || 160,
        carbsGoal: Number(carbsGoal) || 250,
        fatsGoal: Number(fatsGoal) || 70,
        waterGoalMl: Number(waterGoalMl) || 3000
      });
    } else {
      if (calorieGoal !== undefined) log.calorieGoal = Number(calorieGoal);
      if (proteinGoal !== undefined) log.proteinGoal = Number(proteinGoal);
      if (carbsGoal !== undefined) log.carbsGoal = Number(carbsGoal);
      if (fatsGoal !== undefined) log.fatsGoal = Number(fatsGoal);
      if (waterGoalMl !== undefined) log.waterGoalMl = Number(waterGoalMl);
      await log.save();
    }

    res.json({ message: "Nutrition goals updated", log });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

const defaultFoodsList = [
  { name: "Chicken Biryani", defaultServingSize: "1 plate (250g)", caloriesPerServing: 420, macrosPerServing: { protein: 22, carbs: 58, fat: 12 } },
  { name: "Beef Biryani", defaultServingSize: "1 plate (250g)", caloriesPerServing: 480, macrosPerServing: { protein: 26, carbs: 56, fat: 16 } },
  { name: "Chicken Karahi", defaultServingSize: "1 cup (200g)", caloriesPerServing: 340, macrosPerServing: { protein: 28, carbs: 6, fat: 22 } },
  { name: "Mutton Karahi", defaultServingSize: "1 cup (200g)", caloriesPerServing: 410, macrosPerServing: { protein: 30, carbs: 5, fat: 28 } },
  { name: "Beef Nihari", defaultServingSize: "1 bowl (250g)", caloriesPerServing: 460, macrosPerServing: { protein: 32, carbs: 10, fat: 32 } },
  { name: "Chicken Haleem", defaultServingSize: "1 bowl (250g)", caloriesPerServing: 360, macrosPerServing: { protein: 24, carbs: 42, fat: 10 } },
  { name: "Beef Haleem", defaultServingSize: "1 bowl (250g)", caloriesPerServing: 410, macrosPerServing: { protein: 28, carbs: 40, fat: 14 } },
  { name: "Chicken Korma", defaultServingSize: "1 cup (200g)", caloriesPerServing: 370, macrosPerServing: { protein: 26, carbs: 8, fat: 26 } },
  { name: "Chicken Handi (Boneless)", defaultServingSize: "1 cup (200g)", caloriesPerServing: 360, macrosPerServing: { protein: 30, carbs: 7, fat: 24 } },
  { name: "Beef Paya", defaultServingSize: "1 bowl (300g)", caloriesPerServing: 420, macrosPerServing: { protein: 34, carbs: 4, fat: 30 } },
  { name: "Chicken Tikka (Breast)", defaultServingSize: "1 piece (150g)", caloriesPerServing: 230, macrosPerServing: { protein: 36, carbs: 2, fat: 8 } },
  { name: "Chicken Tikka (Leg)", defaultServingSize: "1 piece (180g)", caloriesPerServing: 260, macrosPerServing: { protein: 32, carbs: 1, fat: 14 } },
  { name: "Seekh Kabab (Beef)", defaultServingSize: "2 skewers (120g)", caloriesPerServing: 280, macrosPerServing: { protein: 24, carbs: 4, fat: 18 } },
  { name: "Chicken Seekh Kabab", defaultServingSize: "2 skewers (120g)", caloriesPerServing: 220, macrosPerServing: { protein: 26, carbs: 3, fat: 10 } },
  { name: "Chapli Kabab (Peshawari)", defaultServingSize: "1 piece (120g)", caloriesPerServing: 310, macrosPerServing: { protein: 22, carbs: 6, fat: 22 } },
  { name: "Shami Kabab", defaultServingSize: "2 patties (100g)", caloriesPerServing: 220, macrosPerServing: { protein: 18, carbs: 12, fat: 11 } },
  { name: "Tandoori Roti", defaultServingSize: "1 roti (60g)", caloriesPerServing: 120, macrosPerServing: { protein: 4, carbs: 24, fat: 0.5 } },
  { name: "Ghar Ki Chapati", defaultServingSize: "1 chapati (50g)", caloriesPerServing: 110, macrosPerServing: { protein: 3.5, carbs: 22, fat: 1 } },
  { name: "Sada Paratha", defaultServingSize: "1 paratha (80g)", caloriesPerServing: 290, macrosPerServing: { protein: 5, carbs: 34, fat: 15 } },
  { name: "Aloo Paratha", defaultServingSize: "1 paratha (120g)", caloriesPerServing: 350, macrosPerServing: { protein: 6, carbs: 48, fat: 14 } },
  { name: "Roghani Naan", defaultServingSize: "1 naan (100g)", caloriesPerServing: 280, macrosPerServing: { protein: 8, carbs: 48, fat: 6 } },
  { name: "Daal Chawal", defaultServingSize: "1 plate (dal + rice)", caloriesPerServing: 380, macrosPerServing: { protein: 14, carbs: 68, fat: 6 } },
  { name: "Daal Mash (Fry)", defaultServingSize: "1 bowl (200g)", caloriesPerServing: 240, macrosPerServing: { protein: 14, carbs: 30, fat: 7 } },
  { name: "Daal Moong / Masoor", defaultServingSize: "1 bowl (200g)", caloriesPerServing: 200, macrosPerServing: { protein: 12, carbs: 28, fat: 4 } },
  { name: "Chana Chaat", defaultServingSize: "1 bowl (200g)", caloriesPerServing: 240, macrosPerServing: { protein: 10, carbs: 42, fat: 3.5 } },
  { name: "Aloo Palak", defaultServingSize: "1 cup (200g)", caloriesPerServing: 210, macrosPerServing: { protein: 6, carbs: 20, fat: 12 } },
  { name: "Bhindi Masala", defaultServingSize: "1 cup (180g)", caloriesPerServing: 150, macrosPerServing: { protein: 3, carbs: 16, fat: 9 } },
  { name: "Mix Sabzi", defaultServingSize: "1 cup (200g)", caloriesPerServing: 160, macrosPerServing: { protein: 4, carbs: 22, fat: 7 } },
  { name: "Anda Ghotala / Khagina", defaultServingSize: "1 plate (2 eggs)", caloriesPerServing: 230, macrosPerServing: { protein: 14, carbs: 4, fat: 17 } },
  { name: "Halwa Puri", defaultServingSize: "2 puris + chana + halwa", caloriesPerServing: 620, macrosPerServing: { protein: 12, carbs: 82, fat: 28 } },
  { name: "Sweet Lassi", defaultServingSize: "1 glass (300ml)", caloriesPerServing: 220, macrosPerServing: { protein: 8, carbs: 32, fat: 6 } },
  { name: "Namkeen Lassi (Mint)", defaultServingSize: "1 glass (300ml)", caloriesPerServing: 110, macrosPerServing: { protein: 7, carbs: 10, fat: 4 } },
  { name: "Doodh Patti Chai", defaultServingSize: "1 cup (200ml)", caloriesPerServing: 130, macrosPerServing: { protein: 4, carbs: 16, fat: 5 } },
  { name: "Karak Chai", defaultServingSize: "1 cup (180ml)", caloriesPerServing: 120, macrosPerServing: { protein: 3.5, carbs: 15, fat: 4.5 } },
  { name: "Cake Rusk", defaultServingSize: "2 pieces", caloriesPerServing: 140, macrosPerServing: { protein: 3, carbs: 22, fat: 4 } },
  { name: "Potato Samosa", defaultServingSize: "1 piece (80g)", caloriesPerServing: 260, macrosPerServing: { protein: 4, carbs: 32, fat: 13 } },
  { name: "Chicken Samosa", defaultServingSize: "1 piece (70g)", caloriesPerServing: 210, macrosPerServing: { protein: 11, carbs: 20, fat: 9 } },
  { name: "Mix Pakora", defaultServingSize: "1 plate (100g)", caloriesPerServing: 280, macrosPerServing: { protein: 6, carbs: 26, fat: 17 } },
  { name: "Gulab Jamun", defaultServingSize: "2 pieces (80g)", caloriesPerServing: 300, macrosPerServing: { protein: 4, carbs: 52, fat: 9 } },
  { name: "Kheer / Firni", defaultServingSize: "1 small bowl (150g)", caloriesPerServing: 260, macrosPerServing: { protein: 6, carbs: 42, fat: 8 } },
  { name: "Grilled Chicken Breast", defaultServingSize: "100g", caloriesPerServing: 165, macrosPerServing: { protein: 31, carbs: 0, fat: 3.6 } },
  { name: "Boiled Eggs", defaultServingSize: "2 large (100g)", caloriesPerServing: 144, macrosPerServing: { protein: 12, carbs: 1, fat: 10 } },
  { name: "Egg Whites", defaultServingSize: "4 whites (130g)", caloriesPerServing: 68, macrosPerServing: { protein: 14, carbs: 1, fat: 0.2 } },
  { name: "Scrambled Eggs", defaultServingSize: "3 large", caloriesPerServing: 210, macrosPerServing: { protein: 18, carbs: 2, fat: 15 } },
  { name: "Egg Omelette", defaultServingSize: "2 eggs", caloriesPerServing: 190, macrosPerServing: { protein: 13, carbs: 3, fat: 14 } },
  { name: "Oatmeal with Honey & Banana", defaultServingSize: "1 bowl", caloriesPerServing: 260, macrosPerServing: { protein: 7, carbs: 52, fat: 4 } },
  { name: "Greek Yogurt (Plain)", defaultServingSize: "1 cup (200g)", caloriesPerServing: 120, macrosPerServing: { protein: 20, carbs: 6, fat: 1 } },
  { name: "Atlantic Salmon Fillet", defaultServingSize: "150g", caloriesPerServing: 280, macrosPerServing: { protein: 30, carbs: 0, fat: 18 } },
  { name: "Canned Tuna (in Water)", defaultServingSize: "1 can (120g)", caloriesPerServing: 130, macrosPerServing: { protein: 28, carbs: 0, fat: 1 } },
  { name: "Whey Protein Shake", defaultServingSize: "1 scoop (30g)", caloriesPerServing: 130, macrosPerServing: { protein: 25, carbs: 3, fat: 1.5 } },
  { name: "Brown Rice", defaultServingSize: "1 cup (195g)", caloriesPerServing: 215, macrosPerServing: { protein: 5, carbs: 45, fat: 1.8 } },
  { name: "White Basmati Rice", defaultServingSize: "1 cup (180g)", caloriesPerServing: 205, macrosPerServing: { protein: 4.2, carbs: 45, fat: 0.4 } },
  { name: "Boiled Potato", defaultServingSize: "1 medium (150g)", caloriesPerServing: 130, macrosPerServing: { protein: 3, carbs: 30, fat: 0.2 } },
  { name: "Sweet Potato", defaultServingSize: "1 medium (130g)", caloriesPerServing: 105, macrosPerServing: { protein: 2, carbs: 24, fat: 0.2 } },
  { name: "Whole Wheat Bread", defaultServingSize: "2 slices (56g)", caloriesPerServing: 160, macrosPerServing: { protein: 8, carbs: 28, fat: 2 } },
  { name: "Avocado Toast", defaultServingSize: "2 slices", caloriesPerServing: 305, macrosPerServing: { protein: 8, carbs: 32, fat: 16 } },
  { name: "Fresh Avocado", defaultServingSize: "1/2 fruit (100g)", caloriesPerServing: 160, macrosPerServing: { protein: 2, carbs: 9, fat: 15 } },
  { name: "Peanut Butter", defaultServingSize: "2 tbsp (32g)", caloriesPerServing: 190, macrosPerServing: { protein: 8, carbs: 7, fat: 16 } },
  { name: "Almonds", defaultServingSize: "30g", caloriesPerServing: 180, macrosPerServing: { protein: 6, carbs: 6, fat: 15 } },
  { name: "Banana", defaultServingSize: "1 medium", caloriesPerServing: 105, macrosPerServing: { protein: 1.3, carbs: 27, fat: 0.3 } },
  { name: "Apple", defaultServingSize: "1 medium", caloriesPerServing: 95, macrosPerServing: { protein: 0.5, carbs: 25, fat: 0.3 } },
  { name: "Steamed Broccoli", defaultServingSize: "1 cup", caloriesPerServing: 55, macrosPerServing: { protein: 4, carbs: 11, fat: 0.6 } },
  { name: "Fresh Green Salad", defaultServingSize: "1 bowl", caloriesPerServing: 45, macrosPerServing: { protein: 2, carbs: 8, fat: 0.5 } },
  { name: "Low Fat Milk", defaultServingSize: "1 glass (250ml)", caloriesPerServing: 120, macrosPerServing: { protein: 8, carbs: 12, fat: 4 } },
  { name: "Black Coffee", defaultServingSize: "1 cup (240ml)", caloriesPerServing: 5, macrosPerServing: { protein: 0, carbs: 1, fat: 0 } }
];

async function searchFoods(req, res) {
  try {
    const { q } = req.query;
    const searchWord = (q || "").trim().toLowerCase();

    let foods = [];
    if (searchWord) {
      foods = await FoodItem.find({ name: { $regex: searchWord, $options: "i" } })
        .limit(20)
        .select("name defaultServingSize caloriesPerServing macrosPerServing");
    } else {
      foods = await FoodItem.find()
        .limit(20)
        .select("name defaultServingSize caloriesPerServing macrosPerServing");
    }

    if (!foods || foods.length === 0) {
      if (!searchWord) {
        foods = defaultFoodsList;
      } else {
        foods = defaultFoodsList.filter((f) => f.name.toLowerCase().includes(searchWord));
      }
    }

    res.json({ foods });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

export {
  getLog,
  getLogsRange,
  addMealItem,
  updateMealItem,
  deleteMealItem,
  updateWater,
  updateGoals,
  searchFoods
};