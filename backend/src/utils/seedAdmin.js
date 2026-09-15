import bcrypt from "bcryptjs";
import User from "../models/User.js";
import WorkoutLog from "../models/WorkoutLog.js";
import NutritionLog from "../models/NutritionLog.js";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../config/env.js";

export async function seedAdminUser() {
  try {
    const email = (ADMIN_EMAIL || "admin@fittrack.com").toLowerCase().trim();
    const password = ADMIN_PASSWORD || "Admin@12345";

    let admin = await User.findOne({ email });
    const passwordHash = await bcrypt.hash(password, 10);

    if (!admin) {
      admin = await User.create({
        name: "System Administrator",
        username: "admin",
        email,
        passwordHash,
        role: "admin",
        status: "active",
        phone: "+1 (555) 019-2834",
        gender: "Prefer not to say",
        age: 30,
        height: 175,
        heightUnit: "cm",
        weight: 72,
        weightUnit: "kg",
        fitnessGoal: "Maintain Fitness & Health",
        calorieGoal: 2200,
        proteinGoal: 150,
        carbsGoal: 220,
        fatsGoal: 65,
        waterGoalMl: 3000,
        isOnboardingCompleted: true,
        profilePhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
        bio: "Fitness Tracker Lead System Administrator & Community Monitor",
        lastActive: new Date(),
      });
      console.log(`[Seed] Created initial Administrator account: ${email} (password: ${password})`);
    } else {
      let needsSave = false;
      if (admin.role !== "admin") {
        admin.role = "admin";
        needsSave = true;
      }
      if (admin.status !== "active") {
        admin.status = "active";
        needsSave = true;
      }
      if (!admin.passwordHash) {
        admin.passwordHash = passwordHash;
        needsSave = true;
      }
      if (needsSave) {
        await admin.save();
        console.log(`[Seed] Updated Administrator privileges for: ${email}`);
      }
    }

    // 1. Seed realistic demo users across the last 6 months
    const userCount = await User.countDocuments();
    const now = new Date();
    const defaultPassword = await bcrypt.hash("User@12345", 10);

    const demoUsers = [
      {
        name: "Jenny Wilson",
        username: "jenny.wilson",
        email: "jenny.wilson@example.com",
        role: "admin",
        status: "active",
        phone: "+1 (555) 234-5678",
        gender: "Female",
        age: 28,
        height: 172,
        weight: 64,
        fitnessGoal: "build_muscle",
        profilePhotoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        isOnboardingCompleted: true,
        daysAgo: 150,
        lastActiveDaysAgo: 1,
      },
      {
        name: "Marcus Vance",
        username: "marcus.vance",
        email: "marcus.vance@techfit.io",
        role: "admin",
        status: "active",
        phone: "+1 (555) 345-6789",
        gender: "Male",
        age: 32,
        height: 185,
        weight: 84,
        fitnessGoal: "strength",
        profilePhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        isOnboardingCompleted: true,
        daysAgo: 120,
        lastActiveDaysAgo: 0,
      },
      {
        name: "Sophia Chen",
        username: "sophia.chen",
        email: "sophia.chen@runworld.org",
        role: "user",
        status: "active",
        phone: "+1 (555) 987-6543",
        gender: "Female",
        age: 26,
        height: 165,
        weight: 55,
        fitnessGoal: "maintain",
        profilePhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        isOnboardingCompleted: true,
        daysAgo: 95,
        lastActiveDaysAgo: 2,
      },
      {
        name: "David Okafor",
        username: "david.okafor",
        email: "d.okafor@crossathletic.com",
        role: "user",
        status: "active",
        phone: "+1 (555) 432-1098",
        gender: "Male",
        age: 30,
        height: 180,
        weight: 79,
        fitnessGoal: "lose_weight",
        profilePhotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        isOnboardingCompleted: true,
        daysAgo: 70,
        lastActiveDaysAgo: 1,
      },
      {
        name: "Elena Rostova",
        username: "elena.rostova",
        email: "elena.rostova@balletfit.net",
        role: "user",
        status: "active",
        phone: "+1 (555) 678-9012",
        gender: "Female",
        age: 25,
        height: 168,
        weight: 58,
        fitnessGoal: "maintain",
        profilePhotoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        isOnboardingCompleted: true,
        daysAgo: 50,
        lastActiveDaysAgo: 0,
      },
      {
        name: "Liam Gallagher",
        username: "liam.gallagher",
        email: "liam.g@oasisiron.co.uk",
        role: "user",
        status: "inactive",
        phone: "+44 20 7946 0912",
        gender: "Male",
        age: 34,
        height: 178,
        weight: 82,
        fitnessGoal: "build_muscle",
        profilePhotoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
        isOnboardingCompleted: true,
        daysAgo: 42,
        lastActiveDaysAgo: 35,
      },
      {
        name: "Amina Al-Mansoor",
        username: "amina.almansoor",
        email: "amina.m@dubaifit.ae",
        role: "user",
        status: "active",
        phone: "+971 50 123 4567",
        gender: "Female",
        age: 29,
        height: 170,
        weight: 62,
        fitnessGoal: "strength",
        profilePhotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        isOnboardingCompleted: true,
        daysAgo: 25,
        lastActiveDaysAgo: 0,
      },
      {
        name: "Lucas Moretti",
        username: "lucas.moretti",
        email: "lucas.m@calisthenicsroma.it",
        role: "user",
        status: "active",
        phone: "+39 06 698 12345",
        gender: "Male",
        age: 27,
        height: 176,
        weight: 73,
        fitnessGoal: "build_muscle",
        profilePhotoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
        isOnboardingCompleted: true,
        daysAgo: 18,
        lastActiveDaysAgo: 1,
      },
      {
        name: "Zoe Kravitz",
        username: "zoe.kravitz",
        email: "zoe.k@nycpilates.com",
        role: "user",
        status: "inactive",
        phone: "+1 (555) 789-0123",
        gender: "Female",
        age: 31,
        height: 162,
        weight: 52,
        fitnessGoal: "lose_weight",
        profilePhotoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        isOnboardingCompleted: true,
        daysAgo: 12,
        lastActiveDaysAgo: 40,
      },
      {
        name: "Ethan Wright",
        username: "ethan.wright",
        email: "ethan.w@hybridathlete.org",
        role: "user",
        status: "active",
        phone: "+1 (555) 890-1234",
        gender: "Male",
        age: 29,
        height: 182,
        weight: 80,
        fitnessGoal: "strength",
        profilePhotoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
        isOnboardingCompleted: true,
        daysAgo: 5,
        lastActiveDaysAgo: 0,
      },
      {
        name: "Mia Tanaka",
        username: "mia.tanaka",
        email: "mia.tanaka@tokyowellness.jp",
        role: "user",
        status: "active",
        phone: "+81 3 5555 0143",
        gender: "Female",
        age: 24,
        height: 160,
        weight: 51,
        fitnessGoal: "maintain",
        profilePhotoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
        isOnboardingCompleted: true,
        daysAgo: 2,
        lastActiveDaysAgo: 0,
      }
    ];

    for (const u of demoUsers) {
      const existing = await User.findOne({ email: u.email });
      const joinDate = new Date(now.getTime() - u.daysAgo * 24 * 60 * 60 * 1000);
      const lastActiveDate = new Date(now.getTime() - u.lastActiveDaysAgo * 24 * 60 * 60 * 1000);

      if (!existing) {
        await User.create({
          name: u.name,
          username: u.username,
          email: u.email,
          role: u.role,
          status: u.status,
          phone: u.phone,
          gender: u.gender,
          age: u.age,
          height: u.height,
          heightUnit: "cm",
          weight: u.weight,
          weightUnit: "kg",
          fitnessGoal: u.fitnessGoal,
          profilePhotoUrl: u.profilePhotoUrl,
          isOnboardingCompleted: u.isOnboardingCompleted,
          passwordHash: defaultPassword,
          createdAt: joinDate,
          updatedAt: lastActiveDate,
          lastActive: lastActiveDate,
        });
      }
    }

    // 2. Seed realistic Workout Logs if low count
    const existingWorkouts = await WorkoutLog.countDocuments();
    if (existingWorkouts < 25) {
      const allUsers = await User.find({ status: "active" }).select("_id name");
      const sampleExercises = [
        { name: "Barbell Incline Bench Press", category: "Strength", avgCal: 320, sets: 4, reps: 10, weight: 75 },
        { name: "High Intensity Intervals (HIIT)", category: "Cardio", avgCal: 380, sets: 8, reps: 1, weight: 0 },
        { name: "Weighted Pull-Ups & Lat Pulldown", category: "Hypertrophy", avgCal: 280, sets: 4, reps: 10, weight: 15 },
        { name: "Barbell Romanian Deadlift", category: "Strength", avgCal: 350, sets: 3, reps: 8, weight: 100 },
        { name: "Dumbbell Walking Lunges", category: "Hypertrophy", avgCal: 240, sets: 3, reps: 12, weight: 22 },
        { name: "Cable Lateral Raises & Face Pulls", category: "Hypertrophy", avgCal: 210, sets: 4, reps: 15, weight: 14 }
      ];

      const newLogs = [];
      // Distribute workouts over the last 28 days
      for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
        const logDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
        // 1 to 3 workouts per day across random active users
        const workoutsOnThisDay = 2 + (dayOffset % 3);

        for (let i = 0; i < workoutsOnThisDay; i++) {
          const userObj = allUsers[(dayOffset + i) % allUsers.length] || allUsers[0];
          const exPreset = sampleExercises[(dayOffset * 2 + i) % sampleExercises.length];
          const secondEx = sampleExercises[(dayOffset * 2 + i + 1) % sampleExercises.length];

          newLogs.push({
            userId: userObj._id,
            routineName: `${exPreset.name} Routine`,
            performedAt: logDate,
            durationMinutes: 40 + (dayOffset % 25),
            caloriesBurned: exPreset.avgCal + (dayOffset % 50),
            exercisesPerformed: [
              {
                name: exPreset.name,
                sets: exPreset.sets,
                reps: exPreset.reps,
                weight: exPreset.weight,
              },
              {
                name: secondEx.name,
                sets: secondEx.sets,
                reps: secondEx.reps,
                weight: secondEx.weight,
              }
            ],
            weightUnit: "kg",
            createdAt: logDate,
            updatedAt: logDate,
          });
        }
      }

      await WorkoutLog.insertMany(newLogs);
      console.log(`[Seed] Seeded ${newLogs.length} realistic workout logs across last 28 days.`);
    }

    // 3. Seed realistic Nutrition Logs if low count
    const existingNutrition = await NutritionLog.countDocuments();
    if (existingNutrition < 25) {
      const allUsers = await User.find({ status: "active" }).select("_id name");
      const nutritionDocs = [];

      for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
        const d = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
        const dateString = d.toISOString().split("T")[0];

        for (let uIdx = 0; uIdx < Math.min(allUsers.length, 4); uIdx++) {
          const userObj = allUsers[uIdx];

          const meals = [
            {
              type: "breakfast",
              items: [
                {
                  foodName: "Oatmeal with Almond Butter & Blueberries",
                  servingSize: "1 bowl (350g)",
                  calories: 420,
                  macros: { protein: 18, carbs: 58, fat: 14 },
                },
                {
                  foodName: "Whey Protein Shake",
                  servingSize: "1 scoop in water",
                  calories: 140,
                  macros: { protein: 28, carbs: 3, fat: 2 },
                }
              ]
            },
            {
              type: "lunch",
              items: [
                {
                  foodName: "Grilled Chicken Breast with Brown Rice & Broccoli",
                  servingSize: "1 plate (400g)",
                  calories: 580,
                  macros: { protein: 48, carbs: 62, fat: 12 },
                }
              ]
            },
            {
              type: "dinner",
              items: [
                {
                  foodName: "Wild Salmon with Sweet Potato & Asparagus",
                  servingSize: "1 plate (420g)",
                  calories: 620,
                  macros: { protein: 44, carbs: 52, fat: 22 },
                }
              ]
            }
          ];

          const totalCalories = meals.reduce(
            (sum, m) => sum + m.items.reduce((mSum, it) => mSum + it.calories, 0),
            0
          );

          nutritionDocs.push({
            userId: userObj._id,
            date: dateString,
            meals,
            totalCalories,
            waterIntakeMl: 2800 + (dayOffset % 600),
            createdAt: d,
            updatedAt: d,
          });
        }
      }

      await NutritionLog.insertMany(nutritionDocs);
      console.log(`[Seed] Seeded ${nutritionDocs.length} realistic nutrition logs across last 28 days.`);
    }

    console.log(`[Seed] Platform initialized with rich, real MongoDB data.`);
  } catch (error) {
    console.error("[Seed] Admin seeding error:", error.message);
  }
}

export default seedAdminUser;
