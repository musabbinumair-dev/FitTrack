import User from "../models/User.js";

async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId).select("-refreshTokens -passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function updateMe(req, res) {
  try {
    const {
      name,
      bio,
      profilePhotoUrl,
      age,
      gender,
      weight,
      startingWeight,
      weightUnit,
      height,
      heightUnit,
      workoutDaysPerWeek,
      activityLevel,
      occupationType,
      fitnessGoal,
      targetWeight,
      targetTimeframeMonths,
      targetTimeframeUnit,
      waterGoalMl,
      dailyCalorieGoal,
      calorieGoal,
      proteinGoal,
      carbsGoal,
      fatsGoal,
      preferredRoutine,
      isOnboardingCompleted
    } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (profilePhotoUrl !== undefined) updateFields.profilePhotoUrl = profilePhotoUrl;
    if (age !== undefined) updateFields.age = Number(age);
    if (gender !== undefined) updateFields.gender = gender;
    if (weight !== undefined) updateFields.weight = Number(weight);
    if (startingWeight !== undefined) updateFields.startingWeight = Number(startingWeight);
    if (weightUnit !== undefined) updateFields.weightUnit = weightUnit;
    if (height !== undefined) updateFields.height = Number(height);
    if (heightUnit !== undefined) updateFields.heightUnit = heightUnit;
    if (workoutDaysPerWeek !== undefined) updateFields.workoutDaysPerWeek = Number(workoutDaysPerWeek);
    if (activityLevel !== undefined) updateFields.activityLevel = activityLevel;
    if (occupationType !== undefined) updateFields.occupationType = occupationType;
    if (fitnessGoal !== undefined) updateFields.fitnessGoal = fitnessGoal;
    if (targetWeight !== undefined) updateFields.targetWeight = Number(targetWeight);
    if (targetTimeframeMonths !== undefined) updateFields.targetTimeframeMonths = Number(targetTimeframeMonths);
    if (targetTimeframeUnit !== undefined) updateFields.targetTimeframeUnit = targetTimeframeUnit;
    if (waterGoalMl !== undefined) updateFields.waterGoalMl = Number(waterGoalMl);
    if (dailyCalorieGoal !== undefined) updateFields.dailyCalorieGoal = Number(dailyCalorieGoal);
    if (calorieGoal !== undefined) updateFields.calorieGoal = Number(calorieGoal);
    if (proteinGoal !== undefined) updateFields.proteinGoal = Number(proteinGoal);
    if (carbsGoal !== undefined) updateFields.carbsGoal = Number(carbsGoal);
    if (fatsGoal !== undefined) updateFields.fatsGoal = Number(fatsGoal);
    if (preferredRoutine !== undefined) updateFields.preferredRoutine = preferredRoutine;
    if (isOnboardingCompleted !== undefined) updateFields.isOnboardingCompleted = Boolean(isOnboardingCompleted);

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateFields,
      { new: true, runValidators: true }
    ).select("-refreshTokens -passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated", user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username or email already taken" });
    }
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function updatePreferences(req, res) {
  try {
    const { units, theme, notificationsEnabled, adminSupportEmail } = req.body;

    const updateFields = {};
    if (units !== undefined) updateFields["preferences.units"] = units;
    if (theme !== undefined) updateFields["preferences.theme"] = theme;
    if (notificationsEnabled !== undefined) updateFields["preferences.notificationsEnabled"] = notificationsEnabled;
    if (adminSupportEmail !== undefined) updateFields["preferences.adminSupportEmail"] = String(adminSupportEmail).trim();

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateFields,
      { new: true, runValidators: true }
    ).select("-refreshTokens -passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Preferences updated", preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo uploaded" });
    }

    const photoUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePhotoUrl: photoUrl },
      { new: true }
    ).select("-refreshTokens -passwordHash");

    res.json({ message: "Photo uploaded", profilePhotoUrl: photoUrl, user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

export { getMe, updateMe, updatePreferences, uploadPhoto };