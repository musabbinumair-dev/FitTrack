import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// In-memory store for mock API server
let mockUserData: any = {
  _id: 'user_default_1',
  name: 'Athlete',
  email: 'athlete@fittrack.com',
  username: 'athlete',
  role: 'user',
  calorieGoal: 2400,
  proteinGoal: 160,
  carbsGoal: 220,
  fatsGoal: 65,
  waterGoalMl: 3200,
  weight: 72,
  startingWeight: 72,
  weightUnit: 'kg',
  height: 175,
  heightUnit: 'cm',
  targetWeight: 75,
  fitnessGoal: 'build_muscle',
  workoutDaysPerWeek: 4,
  isOnboardingCompleted: false,
};

let mockNutritionLog: any = {
  date: new Date().toISOString().split('T')[0],
  waterIntakeMl: 1750,
  totalCalories: 1840,
  totalProtein: 135,
  totalCarbs: 190,
  totalFats: 52,
  calorieGoal: 2400,
  proteinGoal: 160,
  carbsGoal: 220,
  fatsGoal: 65,
  waterGoal: 3200,
  meals: [
    {
      _id: 'm1',
      type: 'breakfast',
      items: [
        { _id: 'item_1', foodName: 'Oatmeal with Blueberries & Whey', calories: 420, macros: { protein: 32, carbs: 58, fat: 8 }, servingSize: '1 bowl' }
      ]
    },
    {
      _id: 'm2',
      type: 'lunch',
      items: [
        { _id: 'item_2', foodName: 'Grilled Chicken Breast & Quinoa', calories: 580, macros: { protein: 48, carbs: 55, fat: 12 }, servingSize: '250g' }
      ]
    },
    {
      _id: 'm3',
      type: 'dinner',
      items: [
        { _id: 'item_3', foodName: 'Salmon Fillet with Sweet Potato', calories: 640, macros: { protein: 42, carbs: 48, fat: 22 }, servingSize: '1 plate' }
      ]
    }
  ]
};

const mockApiPlugin = (): Plugin => ({
  name: 'mock-api-middleware',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url || '';
      if (!url.startsWith('/api')) {
        return next();
      }

      const sendJson = (statusCode: number, data: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = statusCode;
        res.end(JSON.stringify(data));
      };

      // Read JSON body helper
      const readBody = (callback: (body: any) => void) => {
        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });
        req.on('end', () => {
          try {
            callback(bodyStr ? JSON.parse(bodyStr) : {});
          } catch {
            callback({});
          }
        });
      };

      const pathUrl = url.split('?')[0];

      // Auth Endpoints
      if (pathUrl === '/api/auth/login' && req.method === 'POST') {
        return readBody((body) => {
          const isUserAdmin = (body.username || body.email || '').toLowerCase().includes('admin');
          mockUserData = {
            ...mockUserData,
            email: body.username || body.email || mockUserData.email,
            name: (body.username || '').split('@')[0] || mockUserData.name,
            role: isUserAdmin ? 'admin' : 'user',
          };
          sendJson(200, {
            success: true,
            accessToken: 'token_' + Date.now(),
            refreshToken: 'refresh_' + Date.now(),
            user: mockUserData,
          });
        });
      }

      if (pathUrl === '/api/auth/register' && req.method === 'POST') {
        return readBody((body) => {
          mockUserData = {
            ...mockUserData,
            name: body.name || 'Athlete',
            email: body.email || 'user@fittrack.com',
            username: body.username || 'athlete',
            role: 'user',
            isOnboardingCompleted: false,
          };
          sendJson(201, {
            success: true,
            accessToken: 'token_' + Date.now(),
            refreshToken: 'refresh_' + Date.now(),
            user: mockUserData,
          });
        });
      }

      if (pathUrl === '/api/auth/forgot-password' && req.method === 'POST') {
        return sendJson(200, { success: true, message: 'Reset email sent' });
      }

      // User Profile Endpoints
      if (pathUrl === '/api/users/me') {
        if (req.method === 'GET') {
          return sendJson(200, { success: true, user: mockUserData });
        }
        if (req.method === 'PATCH' || req.method === 'PUT') {
          return readBody((body) => {
            mockUserData = { ...mockUserData, ...body };
            sendJson(200, { success: true, user: mockUserData });
          });
        }
      }

      // Workouts Endpoints
      if (pathUrl.startsWith('/api/workouts/routines')) {
        return sendJson(200, {
          success: true,
          routines: [
            { _id: 'r1', name: 'Push Hypertrophy', category: 'Strength', exercisesCount: 6, durationMinutes: 55 },
            { _id: 'r2', name: 'Pull Power & Back', category: 'Hypertrophy', exercisesCount: 5, durationMinutes: 50 },
            { _id: 'r3', name: 'Leg Day & Core', category: 'Lower Body', exercisesCount: 7, durationMinutes: 60 },
          ],
        });
      }

      if (pathUrl.startsWith('/api/workouts/logs')) {
        if (req.method === 'GET') {
          return sendJson(200, {
            success: true,
            logs: [
              { _id: 'log1', routineName: 'Push Hypertrophy', date: new Date().toISOString(), durationMinutes: 52, totalVolumeKg: 4200, caloriesBurned: 380 },
              { _id: 'log2', routineName: 'Pull Power', date: new Date(Date.now() - 86400000).toISOString(), durationMinutes: 48, totalVolumeKg: 3900, caloriesBurned: 340 }
            ],
          });
        }
        if (req.method === 'POST') {
          return readBody((body) => {
            sendJson(201, { success: true, log: { _id: 'log_' + Date.now(), ...body } });
          });
        }
      }

      // Nutrition Endpoints
      if (pathUrl.startsWith('/api/nutrition/logs/')) {
        if (req.method === 'GET') {
          return sendJson(200, { success: true, log: mockNutritionLog });
        }
      }

      if (pathUrl.includes('/water') && req.method === 'PATCH') {
        return readBody((body) => {
          if (typeof body.waterIntakeMl === 'number') {
            mockNutritionLog.waterIntakeMl = body.waterIntakeMl;
          }
          sendJson(200, { success: true, log: mockNutritionLog });
        });
      }

      if (pathUrl.includes('/meals') && req.method === 'POST') {
        return readBody((body) => {
          const item = { _id: 'item_' + Date.now(), ...body };
          mockNutritionLog.meals[0].items.push(item);
          mockNutritionLog.totalCalories += body.calories || 0;
          sendJson(201, { success: true, log: mockNutritionLog });
        });
      }

      // Progress & Analytics Endpoints
      if (pathUrl.startsWith('/api/progress/analytics/')) {
        return sendJson(200, {
          success: true,
          data: {
            currentWeight: mockUserData.weight || 72,
            targetWeight: mockUserData.targetWeight || 75,
            weeklyChange: -0.4,
            chartData: [
              { date: 'Mon', weight: 72.8, calories: 2350, workoutMinutes: 45 },
              { date: 'Tue', weight: 72.5, calories: 2420, workoutMinutes: 60 },
              { date: 'Wed', weight: 72.3, calories: 2380, workoutMinutes: 50 },
              { date: 'Thu', weight: 72.2, calories: 2450, workoutMinutes: 55 },
              { date: 'Fri', weight: 72.0, calories: 2400, workoutMinutes: 65 },
              { date: 'Sat', weight: 71.9, calories: 2500, workoutMinutes: 40 },
              { date: 'Sun', weight: 72.0, calories: 2390, workoutMinutes: 50 },
            ]
          }
        });
      }

      if (pathUrl.startsWith('/api/progress/metrics')) {
        return sendJson(200, {
          success: true,
          metrics: [
            { _id: 'm1', date: new Date().toISOString(), weight: mockUserData.weight || 72, bodyFatPercentage: 14.5 }
          ]
        });
      }

      // AI Coach Chat Endpoint
      if (pathUrl === '/api/coach/chat' && req.method === 'POST') {
        return readBody((body) => {
          const msg = (body.message || '').toLowerCase();
          let reply = "I'm your dedicated FitTrack AI Coach! I'm here to analyze your nutrition, optimize your training splits, and keep you on track to crush your fitness targets.";
          if (msg.includes('workout') || msg.includes('exercise')) {
            reply = "For optimal muscle hypertrophy, maintain high training intensity with 2-3 minutes of rest between compound sets. Your weekly routine is structured for maximum progressive overload.";
          } else if (msg.includes('calorie') || msg.includes('food') || msg.includes('protein')) {
            reply = `Your current daily target is ${mockUserData.calorieGoal || 2400} kcal with ${mockUserData.proteinGoal || 160}g of protein. Hitting your protein threshold is key for muscle recovery.`;
          }
          sendJson(200, { success: true, reply });
        });
      }

      // Admin Endpoints
      if (pathUrl.startsWith('/api/admin/users')) {
        return sendJson(200, {
          success: true,
          users: [
            { _id: 'u1', name: 'Alex Johnson', email: 'alex@example.com', role: 'user', status: 'active', createdAt: '2026-01-10' },
            { _id: 'u2', name: 'Sarah Miller', email: 'sarah@example.com', role: 'user', status: 'active', createdAt: '2026-02-14' },
            { _id: 'u3', name: 'Admin Master', email: 'admin@fittrack.com', role: 'admin', status: 'active', createdAt: '2026-01-01' },
          ],
          totalUsers: 3,
        });
      }

      if (pathUrl.startsWith('/api/admin/analytics')) {
        return sendJson(200, {
          success: true,
          totalUsers: 1420,
          activeUsers: 890,
          totalWorkoutsLogged: 15420,
          avgCaloriesTracked: 2350,
        });
      }

      if (pathUrl.startsWith('/api/notifications')) {
        return sendJson(200, {
          success: true,
          notifications: [
            { _id: 'n1', title: 'Great workout yesterday!', message: 'You reached 100% of your daily protein target.', read: false, createdAt: new Date().toISOString() },
            { _id: 'n2', title: 'Hydration reminder', message: 'Drink 500ml of water to stay energized.', read: true, createdAt: new Date().toISOString() },
          ],
          unreadCount: 1,
        });
      }

      // Default fallback JSON for unhandled API routes
      return sendJson(200, { success: true, message: 'FitTrack API Ready' });
    });
  },
});

export default defineConfig(() => {
  return {
    root: path.resolve(__dirname),
    base: './',
    plugins: [react(), tailwindcss(), mockApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'motion/react': 'framer-motion',
      },
    },
    build: {
      outDir: path.resolve(__dirname, '../dist'),
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
