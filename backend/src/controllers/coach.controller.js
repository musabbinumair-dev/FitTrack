import User from "../models/User.js";

/**
 * Knowledge Base & Intent Rules for FitTrack AI Coach
 * Designed for beginner-friendly demonstration and clear explanation to judges.
 */
const PROJECT_KEYWORDS = [
  // Fitness & Workouts
  "workout", "exercise", "routine", "gym", "train", "training", "lift", "reps", "sets",
  "weight", "dumbbell", "barbell", "cardio", "hiit", "chest", "back", "legs", "shoulders",
  "biceps", "triceps", "abs", "core", "stretch", "warmup", "cooldown", "bench press", "squat",
  "deadlift", "pushup", "pullup", "session", "run", "running", "rest day",
  // Nutrition & Meals
  "nutrition", "food", "meal", "breakfast", "lunch", "dinner", "snack", "calorie", "calories",
  "macro", "macros", "protein", "carbs", "carbohydrates", "fat", "fats", "diet", "healthy",
  // Hydration
  "water", "hydration", "drink", "fluid", "liters", "ml", "bottle",
  // Progress, Goals & App
  "goal", "goals", "target", "progress", "analytics", "scale", "track", "history", "log",
  "dashboard", "report", "streak", "profile", "setting", "settings", "theme", "dark mode",
  "fittrack", "app", "navigate", "help", "coach", "bmi", "gain", "lose", "loss", "burn"
];

const OUT_OF_SCOPE_FALLBACK = {
  reply: "I am your dedicated FitTrack AI Coach! I specialize exclusively in your fitness journey, workouts, nutrition, daily targets, and navigating the FitTrack platform.\n\nAsk me about logging workouts, meal tracking, hydration, or navigating to any part of your fitness dashboard!",
  actions: [
    { type: "navigate", target: "workouts", label: "Explore Workouts →" },
    { type: "navigate", target: "nutrition", label: "Nutrition Tracker →" },
    { type: "quick-log", target: "workout", label: "+ Quick Log Workout" }
  ]
};

function isWithinProjectScope(query) {
  const normalized = query.toLowerCase();
  // Check if any keyword matches
  return PROJECT_KEYWORDS.some((kw) => normalized.includes(kw));
}

function generateCoachResponse(query, user) {
  const q = query.toLowerCase();
  const userName = user?.name ? user.name.split(" ")[0] : "Athlete";
  const userCalGoal = user?.calorieGoal || 2400;
  const userWaterGoal = user?.waterGoalMl || 3200;
  const userWeight = user?.weight || 72;
  const userWeightUnit = user?.weightUnit || "kg";

  // 1. Workouts & Exercises
  if (
    q.includes("workout") ||
    q.includes("exercise") ||
    q.includes("routine") ||
    q.includes("lift") ||
    q.includes("gym") ||
    q.includes("chest") ||
    q.includes("leg") ||
    q.includes("back") ||
    q.includes("cardio") ||
    q.includes("hiit")
  ) {
    let specificTip = "Aim for progressive overload: increase your weight or reps by 2-5% every 1 to 2 weeks while maintaining strict form.";
    if (q.includes("chest")) {
      specificTip = "For chest development, pair flat or incline bench presses with dumbbell flyes or dips. Rest 60-90s between sets.";
    } else if (q.includes("leg") || q.includes("squat")) {
      specificTip = "Leg training burns maximum calories! Focus on full range of motion during squats, lunges, and Romanian deadlifts.";
    } else if (q.includes("cardio") || q.includes("hiit")) {
      specificTip = "A 20-minute HIIT circuit can elevate your metabolic rate for hours. Try 40 seconds of effort followed by 20 seconds of rest.";
    }

    return {
      reply: `Hey ${userName}! Great focus on your physical training.\n\n${specificTip}\n\nYou can start a session, build new custom routines, or log past sets in your Workouts section.`,
      actions: [
        { type: "navigate", target: "workouts", label: "Open Workouts & Routines →" },
        { type: "quick-log", target: "workout", label: "+ Log Workout Session" }
      ]
    };
  }

  // 2. Nutrition & Meals
  if (
    q.includes("food") ||
    q.includes("meal") ||
    q.includes("nutrition") ||
    q.includes("calorie") ||
    q.includes("macro") ||
    q.includes("protein") ||
    q.includes("carb") ||
    q.includes("fat") ||
    q.includes("diet")
  ) {
    return {
      reply: `Nutrition is 80% of your body composition success, ${userName}!\n\n• Your active daily target is ${userCalGoal.toLocaleString()} kcal.\n• Protein target: Aim for roughly 1.6g to 2.0g per kg of body weight (~${Math.round(userWeight * 1.8)}g) to preserve and repair lean muscle tissue.\n• Emphasize whole foods, lean proteins, fibrous greens, and complex carbohydrates.\n\nLog your meals daily to keep your macronutrient breakdown in sync!`,
      actions: [
        { type: "navigate", target: "nutrition", label: "View Nutrition & Meals →" },
        { type: "quick-log", target: "meal", label: "+ Log a Meal" }
      ]
    };
  }

  // 3. Hydration & Water
  if (q.includes("water") || q.includes("drink") || q.includes("hydration")) {
    return {
      reply: `Hydration powers muscle contraction, energy, and nutrient absorption, ${userName}!\n\nYour target intake is ${(userWaterGoal / 1000).toFixed(1)} Liters (${userWaterGoal} ml) per day. If you have an intense workout session, add an extra 500ml to replace sweat loss.`,
      actions: [
        { type: "quick-log", target: "water", label: "+ Quick Add Water (250 ml)" },
        { type: "navigate", target: "nutrition", label: "Check Hydration Gauge →" }
      ]
    };
  }

  // 4. Weight Tracking & Scale Progress
  if (
    q.includes("weight") ||
    q.includes("scale") ||
    q.includes("kg") ||
    q.includes("lbs") ||
    q.includes("fat loss") ||
    q.includes("gain")
  ) {
    return {
      reply: `Tracking your scale weight regularly provides insight into your long-term trend.\n\nYour current recorded baseline is ${userWeight} ${userWeightUnit}. Weigh yourself in the morning before breakfast for the most consistent reading. Remember: daily fluctuations of 0.5-1.5kg are normal due to water balance!`,
      actions: [
        { type: "quick-log", target: "weight", label: "+ Update Scale Weight" },
        { type: "navigate", target: "progress", label: "View Weight Trend Chart →" }
      ]
    };
  }

  // 5. Progress, Analytics & Reports
  if (
    q.includes("progress") ||
    q.includes("analytic") ||
    q.includes("chart") ||
    q.includes("history") ||
    q.includes("streak") ||
    q.includes("report")
  ) {
    return {
      reply: `Consistency breeds results, ${userName}! In your Progress & Analytics area, you can review weekly workout volume, calorie consistency, and active performance streaks.`,
      actions: [
        { type: "navigate", target: "progress", label: "Open Progress Analytics →" },
        { type: "navigate", target: "reports", label: "View Activity Feed →" }
      ]
    };
  }

  // 6. Navigation / Where to go / How to use
  if (
    q.includes("where") ||
    q.includes("how do i") ||
    q.includes("how to") ||
    q.includes("page") ||
    q.includes("find") ||
    q.includes("setting") ||
    q.includes("profile") ||
    q.includes("goal")
  ) {
    return {
      reply: `Here's a quick guide to navigating FitTrack, ${userName}:\n\n• **Workouts**: View workout routines, exercise libraries, and start active sessions.\n• **Nutrition**: Log daily meals, view protein/carb/fat balances, and track hydration.\n• **Progress**: In-depth analytics, trend charts, and consistency stats.\n• **Settings**: Customize calorie goals, target weight, and notification preferences.\n\nWhere would you like to go right now?`,
      actions: [
        { type: "navigate", target: "workouts", label: "Workouts Page" },
        { type: "navigate", target: "nutrition", label: "Nutrition Page" },
        { type: "navigate", target: "progress", label: "Progress Page" },
        { type: "navigate", target: "profile", label: "Profile & Goals" }
      ]
    };
  }

  // 7. General Fitness & Motivational Coaching
  return {
    reply: `Hello ${userName}! As your FitTrack Coach, I'm here to help you stay accountable and hit your peak performance.\n\nWhether you need help choosing a workout routine, dialing in your daily nutrition targets (${userCalGoal.toLocaleString()} kcal), or recording your latest set, just let me know!`,
    actions: [
      { type: "quick-log", target: "workout", label: "+ Quick Log Workout" },
      { type: "quick-log", target: "meal", label: "+ Log a Meal" },
      { type: "navigate", target: "dashboard", label: "Go to Dashboard →" }
    ]
  };
}

async function askCoach(req, res) {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message query is required" });
    }

    const trimmedQuery = message.trim();

    // 1. Check project boundary guardrails
    if (!isWithinProjectScope(trimmedQuery)) {
      return res.json(OUT_OF_SCOPE_FALLBACK);
    }

    // 2. Fetch logged-in user context if authenticated
    let user = null;
    if (req.userId) {
      user = await User.findById(req.userId).select("name username calorieGoal waterGoalMl weight weightUnit targetWeight");
    }

    // 3. Generate domain-grounded response with deep actions
    const response = generateCoachResponse(trimmedQuery, user);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "Coach service error", error: error.message });
  }
}

export { askCoach };
