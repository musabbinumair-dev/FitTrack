# 📘 Fitness Tracker — Complete Project Guide

> A full-stack MERN fitness tracking web application built as an Aptech eProject (Semester 4).
> This document covers **everything** — architecture, features, code explanations, technical decisions, and setup instructions.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Folder Structure](#4-folder-structure)
5. [How the Frontend Works](#5-how-the-frontend-works)
6. [How the Backend Works](#6-how-the-backend-works)
7. [Database Schema](#7-database-schema)
8. [API Endpoints — User Panel](#8-api-endpoints--user-panel)
9. [API Endpoints — Admin Panel](#9-api-endpoints--admin-panel)
10. [API Endpoints — AI Coach](#10-api-endpoints--ai-coach)
11. [Authentication Flow](#11-authentication-flow)
12. [Feature Breakdown — User Panel](#12-feature-breakdown--user-panel)
13. [Feature Breakdown — Admin Panel](#13-feature-breakdown--admin-panel)
14. [AI Coach — Full Technical Explanation](#14-ai-coach--full-technical-explanation)
15. [Landing Page](#15-landing-page)
16. [Security Implementation](#16-security-implementation)
17. [Email System](#17-email-system)
18. [Search System](#18-search-system)
19. [Notification System](#19-notification-system)
20. [Unit Conversion System](#20-unit-conversion-system)
21. [Mobile Responsiveness](#21-mobile-responsiveness)
22. [Judge Q&A — Technical Explanations](#22-judge-qa--technical-explanations)
23. [Project Installation](#23-project-installation)
24. [Troubleshooting](#24-troubleshooting)

---

# 1. Project Overview

**Fitness Tracker** is a full-stack web application designed to help users track and improve their fitness journey. It covers every aspect of health tracking: workouts, nutrition, water intake, body metrics, and progress analytics.

The project has **three separate panels**:

| Panel | Purpose | URL |
|-------|---------|-----|
| **Landing Page** | Marketing/intro page for visitors | `localhost:3001` (before login) |
| **User Panel** | Main app for registered users | `localhost:3001` (after login) |
| **Admin Panel** | Separate admin dashboard | `localhost:3001/admin` |

The system uses a **client-server architecture**:
- **Frontend** = React + TypeScript SPA (Single Page Application) on port `3001`
- **Backend** = Express.js RESTful API on port `5050`
- **Database** = MongoDB Atlas (cloud-hosted NoSQL database)

---

# 2. Tech Stack

## Frontend (User Panel)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.0.1 | UI component library — the entire interface is built with React components |
| **TypeScript** | 5.8.2 | Adds type safety to JavaScript — catches bugs before runtime |
| **Vite** | 6.2.3 | Build tool and dev server — extremely fast Hot Module Replacement (HMR) |
| **TailwindCSS** | 4.1.14 | Utility-first CSS framework — styling without writing custom CSS files |
| **Motion (Framer Motion)** | 12.23.24 | Animation library — powers all transitions, modals, drawers, hover effects |
| **Lucide React** | 0.546.0 | Icon library — all SVG icons used throughout the UI |
| **React Icons** | 5.7.0 | Additional icons (Google logo for OAuth button, etc.) |
| **@google/genai** | 2.4.0 | Google Gemini AI SDK — powers the AI Fitness Coach card feature |

## Admin Panel (Separate Vite App)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19 | Same as user panel |
| **TypeScript** | Latest | Type safety |
| **Vite** | Latest | Dev server for admin |
| **TailwindCSS** | 4 | Styling |
| **Framer Motion** | Latest | Animations |
| **Recharts** | Latest | Chart library for analytics graphs |

## Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | >=18 | JavaScript runtime environment for the server |
| **Express.js** | 5.2.1 | Web framework — handles all routing, middleware, and HTTP requests |
| **MongoDB** | Atlas (cloud) | NoSQL database — stores all users, workouts, nutrition, metrics |
| **Mongoose** | 9.9.4 | MongoDB ODM (Object Document Mapper) — defines schemas and runs queries |
| **bcryptjs** | 3.0.3 | Password hashing — never stores plain-text passwords |
| **jsonwebtoken (JWT)** | 9.0.3 | Token-based authentication — access tokens + refresh tokens |
| **Passport.js** | 0.7.0 | OAuth2 authentication middleware |
| **passport-google-oauth20** | 2.0.0 | Google Sign-In strategy for Passport |
| **Multer** | 2.2.0 | File upload handling — profile photo uploads |
| **Nodemailer** | 10.0.7 | Email sending via Gmail SMTP |
| **CORS** | 2.8.6 | Allows frontend (port 3001) to call backend (port 5050) |
| **dotenv** | 17.4.2 | Loads secret variables from `.env` file |
| **nodemon** | (dev) | Auto-restarts server on file changes during development |

---

# 3. System Architecture

```
BROWSER (PORT 3001)
  Landing Page (WelcomeScreen.tsx)
  User Panel  (React SPA)
  Admin Panel (React SPA)
        |
        | HTTP REST (JSON)
        | Authorization: Bearer <JWT Token>
        v
EXPRESS.JS SERVER (PORT 5050)
  CORS Middleware -> JSON Parser -> Route Matching
                                        |
                                   Auth Middleware
                                  (verifies JWT token)
                                        |
                                   CONTROLLERS
  auth | user | workout | nutrition | progress | dashboard
  admin | coach | notification | reminder | support | export
                                        |
                                  Mongoose Models
                                        |
                                        v
MONGODB ATLAS (CLOUD)
  Collections: users, workoutroutines, workoutlogs, nutritionlogs
               bodymetrics, notifications, reminders, supporttickets

EXTERNAL SERVICES:
  Google OAuth2  ->  User "Sign in with Google"
  Gmail SMTP     ->  Performance digest emails, support ticket emails
  Google Gemini  ->  AI Fitness Coach card (user panel dashboard)
```

### How It All Connects:

1. User opens `localhost:3001` in the browser — sees the **Landing Page**
2. Clicks "Login" or "Sign Up" — goes to auth forms
3. After successful login — **JWT access token** is stored in `localStorage`
4. Every API request from the frontend sends this token in the `Authorization` header
5. Backend's `auth.js` middleware verifies the token — extracts `userId`
6. Controllers use `userId` to query only that user's data from MongoDB
7. Response flows back as JSON — React re-renders the UI

---

# 4. Folder Structure

```
Fitness_Tracker/
|
+-- backend/                          <- Express.js API Server
|   +-- .env                          # All secret config (never commit this)
|   +-- package.json
|   +-- uploads/                      # User profile photo files
|   +-- src/
|       +-- server.js                 # Entry point
|       +-- app.js                    # Express config - CORS, routes, middleware
|       |
|       +-- config/
|       |   +-- db.js                 # MongoDB connection
|       |   +-- env.js                # Centralizes env variables
|       |   +-- passport.js           # Google OAuth2 strategy setup
|       |
|       +-- middleware/
|       |   +-- auth.js               # JWT verification - protects private routes
|       |
|       +-- models/
|       |   +-- User.js               # Users (profile, goals, preferences, tokens)
|       |   +-- WorkoutRoutine.js     # Workout template definitions
|       |   +-- WorkoutLog.js         # Logged/completed workout sessions
|       |   +-- NutritionLog.js       # Daily food and water logs
|       |   +-- FoodItem.js           # Food item reference database
|       |   +-- BodyMetric.js         # Weight/body measurement history
|       |   +-- Notification.js       # In-app notifications
|       |   +-- Reminder.js           # User-set reminders
|       |   +-- SupportTicket.js      # Help desk tickets
|       |
|       +-- controllers/
|       |   +-- auth.controller.js    # register, login, logout, refresh, change password
|       |   +-- auth.google.controller.js  # Google OAuth callback
|       |   +-- user.controller.js    # Get/update profile, photo upload, preferences
|       |   +-- workout.controller.js # Routine and log CRUD
|       |   +-- nutrition.controller.js    # Meal logs, food search, water, goals
|       |   +-- progress.controller.js     # Body metrics, analytics data
|       |   +-- dashboard.controller.js    # Aggregated dashboard summary
|       |   +-- notification.controller.js # List, mark-read, send email
|       |   +-- reminder.controller.js     # CRUD for reminders
|       |   +-- support.controller.js      # Submit and list support tickets
|       |   +-- export.controller.js       # Generate CSV export
|       |   +-- admin.controller.js        # All admin panel operations
|       |   +-- coach.controller.js        # AI Coach keyword engine + responses
|       |
|       +-- services/
|       |   +-- email.service.js      # Nodemailer setup, HTML email templates
|       |
|       +-- routes/
|           +-- auth.routes.js        # /api/auth/*
|           +-- auth.google.routes.js # /api/auth/google/*
|           +-- user.routes.js        # /api/users/*
|           +-- workout.routes.js     # /api/workouts/*
|           +-- nutrition.routes.js   # /api/nutrition/*
|           +-- progress.routes.js    # /api/progress/*
|           +-- dashboard.routes.js   # /api/dashboard/*
|           +-- notification.routes.js # /api/notifications/*
|           +-- reminder.routes.js    # /api/reminders/*
|           +-- support.routes.js     # /api/support/*
|           +-- export.routes.js      # /api/export/*
|           +-- admin.routes.js       # /api/admin/*
|           +-- coach.routes.js       # /api/coach/*
|
+-- frontend/                         <- User Panel (React + Vite)
|   +-- .env                          # VITE_API_BASE, VITE_GEMINI_API_KEY
|   +-- package.json
|   +-- index.html
|   +-- vite.config.ts
|   +-- src/
|       +-- main.tsx                  # React root
|       +-- App.tsx                   # Root component - page routing, global state
|       +-- index.css                 # Global styles, TailwindCSS, mobile nav fixes
|       |
|       +-- context/
|       |   +-- AuthContext.jsx       # Global auth state
|       |   +-- UnitContext.tsx       # Global unit system (kcal/kJ, kg/lbs, cm/in)
|       |
|       +-- lib/
|       |   +-- api.js               # HTTP client - all API call functions
|       |
|       +-- services/
|       |   +-- adminApi.ts          # Admin panel API service
|       |   +-- coachApi.ts          # AI Coach API + local fallback engine
|       |
|       +-- types/
|       |   +-- fitness.ts           # TypeScript interfaces
|       |
|       +-- data/
|       |   +-- mockFitnessData.ts   # Fallback/initial data
|       |
|       +-- components/
|           +-- WelcomeScreen.tsx         # Landing page wrapper
|           +-- HeroLandingSection.tsx    # Hero section
|           +-- ScrollTransitionSection.tsx # Scroll-animated features
|           +-- RealStoriesSection.tsx    # Testimonials
|           +-- FindSessionSection.tsx    # Trainer/session finder
|           +-- FaqSection.tsx            # FAQ accordion
|           +-- FooterCtaSection.tsx      # Footer with CTA
|           |
|           +-- LoginPage.tsx            # Login form (email + Google)
|           +-- SignUpPage.tsx           # Registration form
|           +-- ForgotPasswordPage.tsx   # Password reset page
|           +-- AuthCallback.tsx         # Google OAuth callback handler
|           +-- OnboardingModal.tsx      # New user setup wizard
|           |
|           +-- SidebarDock.tsx          # Left sidebar navigation (desktop)
|           +-- TopNavigationBar.tsx     # Top bar (search, notifications, theme)
|           +-- BottomFloatingBar.tsx    # Bottom navigation (mobile only)
|           |
|           +-- DashboardHeader.tsx      # Greeting, streak, quick actions
|           +-- BodyOverviewCard.tsx     # Calorie ring + macro breakdown
|           +-- KpiMetricsGrid.tsx       # Daily KPI cards
|           +-- TodaysWorkoutCard.tsx    # Today's workout preview
|           +-- RecentActivityFeedCard.tsx # Recent activity
|           +-- ActivityFeedSection.tsx  # Full activity timeline
|           +-- ActivityChartsSection.tsx # Dashboard charts
|           +-- AiFitnessCoachCard.tsx   # Gemini AI chat card (dashboard)
|           |
|           +-- WorkoutsRoutinesPage.tsx    # Full workouts page
|           +-- ActiveWorkoutSessionScreen.tsx # Live workout tracker
|           +-- NutritionTrackerPage.tsx    # Nutrition tracker
|           +-- LogMealDrawer.tsx           # Add meal drawer
|           +-- AddFoodToMealDrawer.tsx     # Food search and add
|           +-- EditFoodModal.tsx           # Edit food item
|           +-- HydrationTrackerDrawer.tsx  # Water intake drawer
|           +-- CalorieMacroGoalsModal.tsx  # Set calorie/macro goals
|           |
|           +-- ProgressAnalyticsPage.tsx  # Analytics page with charts
|           +-- CalendarModal.tsx          # Date picker
|           |
|           +-- ProfileSettingsPage.tsx    # Full profile + settings
|           +-- QuickLogModal.tsx          # Quick logging modal
|           +-- ReportModal.tsx            # PDF report generator
|           +-- SupportModal.tsx           # Help desk
|           |
|           +-- AiCoachWidget.tsx          # Floating AI Coach chatbot widget
|           |
|           +-- admin/
|               +-- AdminLayout.tsx
|               +-- AdminSidebar.tsx
|               +-- AdminHeader.tsx
|               +-- AdminRouteGuard.tsx
|               +-- AdminPreferencesModal.tsx
|               +-- AnalyticsOverviewPage.tsx
|               +-- UsersManagementPage.tsx
|               +-- UserDetailDrawer.tsx
|               +-- CreateUserModal.tsx
|               +-- DeleteUserModal.tsx
|               +-- ExerciseLeaderboardCard.tsx
|
+-- admin/                            <- Admin Panel (Separate Vite App)
+-- landing/                          <- Original landing page design files
+-- MERN-Fitness_Tracker-SRS.txt
+-- MERN-Fitness_Tracker-SRS.docx
+-- Fitness tracker Blueprint.pdf
+-- project_guide.md                 # This file
```

---

# 5. How the Frontend Works

## Single Page Application (SPA)

The entire frontend is one HTML file (`index.html`). React takes over the page and dynamically renders different "pages" by switching components. No real browser navigation happens — the URL does not change when you click tabs.

## State-Based Routing (No React Router)

`App.tsx` uses a `currentPage` state string to decide what to show:

```
'welcome'  ->  Landing Page (before login)
'login'    ->  Login form
'signup'   ->  Sign Up form
'app'      ->  Main user panel (requires authentication)
'admin'    ->  Admin panel (requires admin role)
```

Within the main app, a `currentTab` state controls which section is shown:

```
'activity'   ->  Dashboard
'workouts'   ->  Workouts & Routines
'nutrition'  ->  Nutrition Tracker
'analytics'  ->  Progress Analytics
'profile'    ->  Profile & Settings
```

## Authentication Guard

When `App.tsx` loads, it reads `localStorage` for a saved token. If a token exists and is valid, it restores the user session. If there is no token, it shows the landing page. This also protects against directly pasting a URL into a new tab — without a valid token, the app always shows the landing page.

## AuthContext — Global Auth State

`AuthContext.jsx` uses React's Context API to share auth state everywhere:

```js
const { user, accessToken, login, logout } = useAuth();
```

- `user` — the logged-in user's data
- `accessToken` — JWT token for API calls
- `login(userData, tokens)` — saves everything and navigates to app
- `logout()` — clears tokens, clears localStorage, goes back to welcome screen

## UnitContext — Global Unit System

`UnitContext.tsx` provides live unit conversion throughout the app. Users set their preferences in settings, and every number displayed in the UI is automatically converted:

```tsx
const { convertEnergy, convertWeight, energyLabel, weightLabel } = useUnits();

<span>{convertEnergy(dailyCalories)} {energyLabel}</span>
// Shows "2000 kcal" or "8368 kJ" depending on user preference
```

## API Client (api.js)

All backend communication goes through `lib/api.js`. Every function:
1. Gets the JWT token from `localStorage`
2. Adds `Authorization: Bearer <token>` header
3. Makes the `fetch()` call to `localhost:5050/api/...`
4. Parses and returns JSON
5. Throws descriptive errors on failure

## Styling System

- **TailwindCSS v4**: Utility classes for all styling
- **index.css**: Global styles, CSS variables, dark mode overrides, mobile nav fixes
- **Framer Motion**: Wraps components with `<motion.div>` for animations. Uses `AnimatePresence` for clean unmount animations.

---

# 6. How the Backend Works

## Request Lifecycle

```
Browser Request
     |
     v
Express App (app.js)
     |
     +-- CORS Middleware         -> Checks if request origin is allowed
     +-- express.json()          -> Parses JSON request body
     +-- express.static()        -> Serves /uploads/ files directly
     +-- Route Matching          -> /api/workouts/routines -> workout.routes.js
     +-- auth.js Middleware      -> Verifies JWT, attaches req.userId
     +-- Controller Function     -> Business logic
     |   +-- Validates input
     |   +-- Calls Mongoose model
     |   +-- Formats response
     +-- Mongoose Model          -> Translates to MongoDB query
     v
MongoDB Atlas -> Stores/retrieves data
     |
     v
JSON Response sent back to browser
```

## app.js — Express Configuration

`app.js`:
1. Creates the Express app
2. Applies all middleware (CORS, JSON parsing)
3. Mounts all route files at their respective base paths
4. Serves the `/uploads/` directory for static photo files

## server.js — Entry Point

`server.js` does three things:
1. Calls `connectDB()` to connect to MongoDB
2. Starts the Express app listening on port `5050`
3. Handles graceful shutdown

## Middleware — auth.js

The auth middleware runs before any protected controller:
1. Reads the `Authorization: Bearer <token>` header
2. Calls `jwt.verify(token, JWT_ACCESS_SECRET)` to validate
3. If valid — attaches `req.userId` and calls `next()`
4. If invalid — returns `401 Unauthorized`

Some routes use **soft auth** — they try to verify the token but do not block the request if it is missing (used for the AI Coach).

---

# 7. Database Schema

## Users Collection

```
User {
  name: String (required)
  username: String (unique)
  email: String (required, unique)
  passwordHash: String (bcrypt hashed, never returned to client)
  googleId: String (for Google OAuth users)

  // Goals
  dailyCalorieGoal: Number (default: 2000)
  proteinGoal: Number (grams)
  carbsGoal: Number (grams)
  fatsGoal: Number (grams)
  waterGoalMl: Number (default: 2500ml)

  // Physical stats
  weight: Number
  height: Number
  age: Number
  gender: String
  fitnessGoal: String ('lose_weight' | 'gain_muscle' | 'maintain' | ...)
  activityLevel: String

  // Account
  profilePhotoUrl: String
  isOnboardingCompleted: Boolean
  role: String ('user' | 'admin')
  refreshToken: String

  // Preferences
  preferences: {
    energyUnit: 'kcal' | 'kJ'
    weightUnit: 'kg' | 'lbs'
    heightUnit: 'cm' | 'in'
    theme: 'dark' | 'light'
    notifications: Boolean
  }

  createdAt: Date
  updatedAt: Date
}
```

## WorkoutRoutine Collection

```
WorkoutRoutine {
  userId: ObjectId (ref: User)
  name: String
  category: String ('strength' | 'cardio' | 'flexibility' | ...)
  tags: [String]
  exercises: [{
    name: String
    sets: Number
    reps: Number
    weight: Number
    unit: String
    durationSeconds: Number
    notes: String
  }]
  createdAt: Date
}
```

## WorkoutLog Collection

```
WorkoutLog {
  userId: ObjectId (ref: User)
  routineName: String
  category: String
  durationMinutes: Number
  caloriesBurned: Number
  exercisesPerformed: [{
    name: String
    sets: [{ reps, weight, unit, completed }]
  }]
  notes: String
  performedAt: Date
}
```

## NutritionLog Collection

```
NutritionLog {
  userId: ObjectId (ref: User)
  date: String (YYYY-MM-DD)
  meals: [{
    _id: ObjectId
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
    name: String
    calories: Number
    protein: Number
    carbs: Number
    fats: Number
    quantity: Number
    unit: String
    loggedAt: Date
  }]
  waterIntakeMl: Number
  calorieGoal: Number
  proteinGoal: Number
  carbsGoal: Number
  fatsGoal: Number
}
```

## BodyMetric Collection

```
BodyMetric {
  userId: ObjectId (ref: User)
  date: Date
  weight: Number
  weightUnit: String
  bodyFatPercentage: Number
  notes: String
}
```

## Notification Collection

```
Notification {
  userId: ObjectId (ref: User)
  type: String
  title: String
  message: String
  isRead: Boolean
  createdAt: Date
}
```

## Reminder Collection

```
Reminder {
  userId: ObjectId (ref: User)
  type: String ('workout' | 'meal' | 'water' | 'sleep' | ...)
  label: String
  scheduleType: 'once' | 'daily' | 'weekly'
  triggerTime: Date
  isActive: Boolean
  createdAt: Date
}
```

## SupportTicket Collection

```
SupportTicket {
  userId: ObjectId (ref: User)
  category: 'bug' | 'feature' | 'billing' | 'account' | 'other'
  subject: String
  message: String
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
}
```

---

# 8. API Endpoints — User Panel

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create new user account |
| POST | `/api/auth/login` | No | Login with email/password, returns JWT tokens |
| POST | `/api/auth/refresh` | No | Get new access token using refresh token |
| POST | `/api/auth/change-password` | Yes | Change account password |
| GET | `/api/auth/google` | No | Start Google OAuth2 login flow |
| GET | `/api/auth/google/callback` | No | Google OAuth2 callback |
| GET | `/api/users/me` | Yes | Get logged-in user profile |
| PATCH | `/api/users/me` | Yes | Update profile (name, goals, physical stats) |
| PATCH | `/api/users/me/preferences` | Yes | Update unit/theme/notification preferences |
| POST | `/api/users/me/photo` | Yes | Upload profile photo (multipart) |
| DELETE | `/api/users/me/photo` | Yes | Remove profile photo |
| GET | `/api/workouts/routines` | Yes | List all workout routines |
| POST | `/api/workouts/routines` | Yes | Create a new workout routine |
| GET | `/api/workouts/routines/:id` | Yes | Get a specific routine |
| PUT | `/api/workouts/routines/:id` | Yes | Update a routine |
| DELETE | `/api/workouts/routines/:id` | Yes | Delete a routine |
| GET | `/api/workouts/logs` | Yes | Get workout session logs |
| POST | `/api/workouts/logs` | Yes | Log a completed workout session |
| DELETE | `/api/workouts/logs/:id` | Yes | Delete a workout log entry |
| GET | `/api/nutrition/logs/:date` | Yes | Get nutrition log for a specific date |
| GET | `/api/nutrition/logs-range` | Yes | Get nutrition logs for a date range |
| POST | `/api/nutrition/logs/:date/meals` | Yes | Add a meal item |
| PATCH | `/api/nutrition/logs/:date/meals/:id` | Yes | Update a specific meal item |
| DELETE | `/api/nutrition/logs/:date/meals/:id` | Yes | Delete a meal item |
| PATCH | `/api/nutrition/logs/:date/water` | Yes | Update water intake |
| PATCH | `/api/nutrition/logs/:date/goals` | Yes | Override daily calorie/macro goals |
| GET | `/api/nutrition/foods/search` | Yes | Search food database |
| POST | `/api/progress/metrics` | Yes | Log a body metric |
| GET | `/api/progress/metrics` | Yes | Get all body metric logs |
| DELETE | `/api/progress/metrics/:id` | Yes | Delete a body metric entry |
| GET | `/api/progress/analytics/weight` | Yes | Weight trend chart data |
| GET | `/api/progress/analytics/workouts` | Yes | Workout frequency/volume chart data |
| GET | `/api/progress/analytics/nutrition` | Yes | Nutrition trends chart data |
| GET | `/api/dashboard/summary` | Yes | All aggregated data for the dashboard |
| GET | `/api/notifications` | Yes | List all notifications |
| PATCH | `/api/notifications/:id/read` | Yes | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Yes | Mark all notifications as read |
| DELETE | `/api/notifications/:id` | Yes | Delete a notification |
| POST | `/api/notifications/test-email` | Yes | Send test performance digest email |
| GET | `/api/reminders` | Yes | List all reminders |
| POST | `/api/reminders` | Yes | Create a new reminder |
| PUT | `/api/reminders/:id` | Yes | Update a reminder |
| DELETE | `/api/reminders/:id` | Yes | Delete a reminder |
| POST | `/api/support` | Yes | Submit a support ticket |
| GET | `/api/support/my-tickets` | Yes | List this user's submitted tickets |
| GET | `/api/export/progress` | Yes | Download fitness data as CSV |
| GET | `/api/health` | No | Server health check |

---

# 9. API Endpoints — Admin Panel

All admin routes require a valid JWT **and** `role === 'admin'`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Platform stats |
| GET | `/api/admin/users` | List all users (paginated, searchable) |
| GET | `/api/admin/users/:id` | Get full user detail |
| POST | `/api/admin/users` | Create a new user manually |
| PATCH | `/api/admin/users/:id` | Update user data |
| DELETE | `/api/admin/users/:id` | Permanently delete a user |
| GET | `/api/admin/analytics/overview` | Full platform analytics |
| GET | `/api/admin/analytics/workouts` | Platform-wide workout statistics |
| GET | `/api/admin/analytics/nutrition` | Platform-wide nutrition statistics |
| GET | `/api/admin/analytics/exercise-leaderboard` | Most popular exercises |
| GET | `/api/admin/support-tickets` | All support tickets |
| PATCH | `/api/admin/support-tickets/:id` | Update ticket status/priority |
| GET | `/api/admin/notifications` | Admin notification center |
| GET | `/api/admin/settings` | Get admin preferences |
| PATCH | `/api/admin/settings` | Update admin preferences |

---

# 10. API Endpoints — AI Coach

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/coach/chat` | Soft | Send message, receive response + action buttons |

**Request body:**
```json
{ "message": "How do I lose weight?" }
```

**Response body:**
```json
{
  "reply": "For weight loss, focus on a calorie deficit...",
  "actions": [
    { "type": "navigate", "target": "nutrition", "label": "Open Nutrition Tracker" },
    { "type": "quick-log", "target": "meal", "label": "Log a Meal" }
  ]
}
```

---

# 11. Authentication Flow

## Email/Password Login

```
1. User fills email + password form
2. Frontend sends POST /api/auth/login
3. Backend finds user by email in MongoDB
4. bcryptjs.compare(password, user.passwordHash) -> verifies password
5. If match:
   - jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: '15m' }) -> accessToken
   - jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' }) -> refreshToken
   - refreshToken saved to user document in MongoDB
6. Backend responds: { accessToken, refreshToken, user }
7. Frontend stores both tokens in localStorage
8. AuthContext.login() sets global auth state
9. App.tsx switches to currentPage = 'app'
```

## Google OAuth2 Login

```
1. User clicks "Sign in with Google"
2. Frontend navigates to GET /api/auth/google
3. Passport.js redirects to Google's consent screen
4. User grants permission
5. Google redirects to GET /api/auth/google/callback
6. Passport.js extracts profile (name, email, googleId)
7. Backend: find or create user with this googleId
8. Generate JWT tokens (same as email login)
9. Backend redirects to frontend: /?token=ACCESS&refresh=REFRESH
10. AuthCallback.tsx reads tokens from URL, stores them, navigates to app
```

## Token Refresh

- Access tokens expire in 15 minutes
- When a request fails with 401, the API client tries POST /api/auth/refresh
- Backend verifies the refresh token, issues a new access token
- If refresh also fails -> user is logged out

## Logout and Route Protection

- `logout()` in AuthContext clears both tokens from `localStorage`
- `App.tsx` checks for tokens on every render cycle
- Pasting a copied URL in a logged-out browser always shows the landing page

---

# 12. Feature Breakdown — User Panel

## Landing Page

The landing page (`WelcomeScreen.tsx`) is a full marketing page with these sections:

| Section | Component | Content |
|---------|-----------|---------|
| Hero | `HeroLandingSection.tsx` | Animated headline, app preview, CTA buttons |
| Features | `ScrollTransitionSection.tsx` | Scroll-triggered animated feature showcase |
| Testimonials | `RealStoriesSection.tsx` | User stories and reviews |
| Find Session | `FindSessionSection.tsx` | Trainer/session finder UI |
| FAQ | `FaqSection.tsx` | Expandable questions and answers |
| Footer CTA | `FooterCtaSection.tsx` | Final call-to-action, links, copyright |

Clicking "Login" or "Get Started" navigates to the auth forms.

## Onboarding Wizard

When a new user registers, `OnboardingModal.tsx` launches automatically. It is a 7-step wizard:
1. Welcome — greeting, purpose explanation
2. Personal Info — age, gender
3. Physical Stats — height, weight
4. Fitness Goal — lose weight / build muscle / stay active / improve endurance
5. Activity Level — sedentary / lightly active / moderately active / very active
6. Daily Targets — auto-calculated calorie/protein/carb/fat goals (editable)
7. Preferences — unit system (kcal/kJ, kg/lbs, cm/in), theme (dark/light)

After completion, `isOnboardingCompleted` is set to `true` in the database and the wizard never shows again.

## Dashboard

The dashboard aggregates data from multiple collections in one call (`/api/dashboard/summary`) and shows:
- Greeting header with current date, streak count, quick action buttons
- KPI Cards — Today's calories consumed vs goal, water intake, sleep hours, weight
- Calorie Ring — Visual donut chart showing calorie budget remaining
- Macros Breakdown — Protein / Carbs / Fat progress bars
- Today's Workout Card — Next scheduled or most recent routine preview
- Recent Activity Feed — Timeline of all recent logs
- AI Fitness Coach Card — Inline Gemini AI chat panel

## Workouts and Routines

`WorkoutsRoutinesPage.tsx`:

**Routines Tab:**
- List of all saved workout routines with exercise count and category badges
- Filter bar with category filter, tag filter, sort (name/newest/oldest), search
- Click routine -> opens detail drawer with full exercise list
- Create routine -> full exercise builder (add/remove/reorder exercises)
- Edit/Delete routines

**Workout Logs Tab:**
- Calendar showing workout session history
- Log entries with duration, calories burned, exercises performed
- Delete log entries

**Active Session:**
`ActiveWorkoutSessionScreen.tsx`:
- Exercise-by-exercise walkthrough with set tracking
- Stopwatch timer running in real time
- Mark sets as complete with checkboxes
- Save session -> creates WorkoutLog entry in database

## Nutrition Tracker

`NutritionTrackerPage.tsx`:
- Date selector — browse any day's nutrition log
- Meal sections — Breakfast, Lunch, Dinner, Snacks — each expandable
- Add food — search food database or enter custom food
- Macro summary — total calories, protein, carbs, fat vs goals
- Date range filter — Today, 7 days, 30 days, Custom range for trends
- Water tracker — click to add cups or enter custom ml
- Edit/Delete individual food items

## Progress Analytics

`ProgressAnalyticsPage.tsx`:
- Weight chart — line chart showing weight history over time
- Calorie chart — bar chart of daily calorie intake trends
- Workout frequency chart — workouts per week bar chart
- Macro distribution — pie chart of protein/carbs/fat split
- Date range filter for all charts
- Body metric logging — log today's weight directly

## Profile and Settings

`ProfileSettingsPage.tsx`:

| Tab | Content |
|-----|---------|
| Profile | Name, username, bio, profile photo upload/remove |
| Body Stats | Height, weight, age, gender |
| Goals | Daily calorie, protein, carbs, fat, water goals |
| Fitness | Fitness goal, activity level |
| Preferences | Energy unit, weight unit, height unit, theme toggle |
| Account | Change password |
| Notifications | Enable/disable notification types |
| Reminders | Create, edit, toggle, delete custom reminders |
| Privacy | Privacy settings |
| Support | Link to support modal |

## Quick Log Modal

`QuickLogModal.tsx` — rapid logging without navigating to a specific page:
- Log Workout — select routine, enter duration and calories
- Log Meal — enter meal name and macros
- Log Water — enter ml amount
- Log Weight — enter today's weight

## Report Generator

`ReportModal.tsx` — generates a printable PDF performance summary:
- Weekly workout count and total duration
- Average daily calories vs goal
- Current weight vs target weight
- Coaching notes
- Uses browser's built-in print dialog

## Support System

`SupportModal.tsx`:
- Submit new tickets (Bug Report, Feature Request, Billing, Account, Other)
- Set priority (Low, Medium, High)
- View all past submitted tickets with status badges
- Automated email notification to support inbox on submission

## Search (Global)

The search bar in `TopNavigationBar.tsx`:
- Type any keyword and see results in real-time
- Results are categorized: Pages, Features, Settings
- Clicking a result navigates directly to that tab or section
- Examples: searching "water" navigates to nutrition tab and opens hydration drawer

## Notifications

The bell icon in the top navigation bar:
- Badge shows unread count
- Clicking opens a dropdown of recent notifications
- Click "Mark as read" or "Mark all as read"
- Notifications are created by the backend at various events

---

# 13. Feature Breakdown — Admin Panel

The admin panel is accessible at `/admin`. Only users with `role: 'admin'` can access it.

## Admin Route Guard

`AdminRouteGuard.tsx` checks:
1. User is logged in
2. User has `role === 'admin'`

If either fails -> redirects to the main login page.

## Admin Layout

`AdminLayout.tsx`:
- `AdminSidebar.tsx` — navigation menu (Dashboard, Users, Analytics, Support)
- `AdminHeader.tsx` — top bar with global search, notification bell, admin avatar, logout

## Analytics Overview Page

`AnalyticsOverviewPage.tsx`:

| Section | What It Shows |
|---------|--------------|
| KPI Cards | Total users, active users today, workouts this week, avg calories tracked |
| Live Platform Telemetry | Real-time activity graph (users, workouts, nutrition over time) |
| Macronutrients Distribution | Platform average protein/carb/fat split |
| User Status | Active vs inactive users pie chart |
| New vs Returning Users | Comparison of new signups vs returning users |
| Exercise Leaderboard | Most popular exercises across all users |

## Users Management Page

`UsersManagementPage.tsx`:
- Table of all registered users with: avatar, name, email, role badge, join date, status
- Search by name or email
- Filter by role (admin/user), status (active/inactive)
- Sort by name, email, join date, last active
- User Detail Drawer — click any user to see:
  - Full profile info
  - Workout stats (total sessions, favorite exercise)
  - Nutrition stats (avg daily calories)
  - Weight history
  - Account actions (promote to admin, deactivate, delete)
- Create User Modal — admin can manually create accounts
- Delete User Modal — confirmation dialog before permanent deletion

## Admin Preferences Modal

`AdminPreferencesModal.tsx`:
- **Admin Support Email Forwarding** — set the email where support tickets get forwarded
- Other platform-wide preferences

---

# 14. AI Coach — Full Technical Explanation

The AI Coach is a floating chat widget in the bottom-right corner, visible only when logged in. It uses a **custom keyword-based response engine** — not an external AI API.

## How It Works (Simple)

1. User types a message
2. System checks if the message contains any fitness-related keywords
3. If yes -> matches the best intent category -> generates a coaching response
4. Response includes text + action buttons that directly open pages in the app
5. If no fitness keywords found -> returns a default "out of scope" message

## Backend: coach.controller.js

### Step 1: Domain Guard

```js
const PROJECT_KEYWORDS = [
  'workout', 'exercise', 'calorie', 'protein', 'water', 'weight',
  'nutrition', 'progress', 'goal', 'muscle', 'fat', 'cardio',
  'strength', 'diet', 'meal', 'food', 'log', 'track', 'fitness', ...
];

function isWithinProjectScope(query) {
  return PROJECT_KEYWORDS.some(kw => query.toLowerCase().includes(kw));
}
```

If the message is not fitness-related -> immediate default response.

### Step 2: Intent Detection

```js
function generateCoachResponse(query, user) {
  const q = query.toLowerCase();

  if (q.includes('workout') || q.includes('exercise')) {
    return { reply: '...workout advice...', actions: [...] };
  }
  if (q.includes('protein')) {
    return {
      reply: `Aim for ${Math.round(user.weight * 1.6)}g of protein...`,
      actions: [...]
    };
  }
  if (q.includes('water') || q.includes('hydration')) {
    return {
      reply: `Your daily water goal is ${user.waterGoalMl}ml...`,
      actions: [...]
    };
  }
}
```

A **rule-based classifier** — series of if-else conditions. Simple, deterministic, zero cost.

### Step 3: Personalization

```js
const user = await User.findById(req.userId).select(
  'name calorieGoal waterGoalMl weight weightUnit targetWeight'
);
// In response: `Your calorie goal is ${user.calorieGoal} per day`
```

### Step 4: Action Buttons in Response

```js
{
  reply: "Focus on progressive overload...",
  actions: [
    { type: "navigate", target: "workouts", label: "Open Workouts" },
    { type: "quick-log", target: "workout", label: "Log a Workout" }
  ]
}
```

## Frontend: coachApi.ts

```ts
export async function sendCoachMessage(message: string): Promise<CoachResponse> {
  try {
    const res = await fetch(`${API_BASE}/coach/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ message })
    });
    return await res.json();
  } catch {
    return localCoachFallback(message); // same logic, runs in browser
  }
}
```

The `localCoachFallback` is an identical copy of the keyword logic that runs entirely in the browser — the chatbot **always works** even if the server is off.

## Frontend: AiCoachWidget.tsx

- Floating launcher — animated bot icon in bottom-right corner
- Chat window — slides up/down with Framer Motion animation
- Message bubbles — user messages (right) and coach replies (left)
- Typing indicator — animated dots while waiting for response
- Quick action chips — pre-set common questions
- Action buttons — click to navigate or open modals

```tsx
function handleActionClick(action: CoachAction) {
  if (action.type === 'navigate') {
    onNavigateTab(action.target);  // changes App.tsx currentTab
    setIsOpen(false);
  }
  if (action.type === 'quick-log') {
    onOpenQuickLog(action.target); // opens QuickLogModal
    setIsOpen(false);
  }
}
```

## Why Not ChatGPT/External AI?

| Reason | Explanation |
|--------|-------------|
| No API cost | External AI APIs charge per request. Our solution is free. |
| No hallucination | Our coach can only say things we explicitly programmed. Zero wrong advice. |
| Offline capable | Works with no internet or server running. |
| Domain-locked | Physically cannot answer off-topic questions. |
| Fully explainable | Every response comes from a transparent if-else tree. |
| Deeply integrated | Response buttons actually do things in the app — not just text. |

---

# 15. Landing Page

The landing page (`WelcomeScreen.tsx`) is shown to all visitors who are not logged in.

## Sections

- **Hero** (`HeroLandingSection.tsx`) — Animated headline, app preview, CTA buttons
- **Scroll Transition** (`ScrollTransitionSection.tsx`) — Scroll-triggered animated feature showcase
- **Testimonials** (`RealStoriesSection.tsx`) — User testimonials with photos and quotes
- **Find Session** (`FindSessionSection.tsx`) — Training session categories
- **FAQ** (`FaqSection.tsx`) — Accordion-style expandable Q&A
- **Footer CTA** (`FooterCtaSection.tsx`) — Final CTA, social links, copyright

## Navigation from Landing Page

```
Landing Page
  +-- "Get Started Free" button -> navigates to SignUpPage
  +-- "Login" button -> navigates to LoginPage
  +-- All auth forms have "Back to Home" link -> returns to landing
```

---

# 16. Security Implementation

## Password Security

- Passwords are never stored in plain text
- `bcryptjs.hash(password, 10)` hashes the password with salt rounds
- `bcryptjs.compare(input, hash)` verifies without ever decoding the hash
- Password hash is never returned in any API response

## JWT Token Security

- **Access Token** — valid for 15 minutes. Short-lived to limit damage if leaked.
- **Refresh Token** — valid for 7 days. Stored in MongoDB.
- **Token Rotation** — every refresh generates a brand new refresh token, old one is invalidated
- **Secret keys** — stored in `.env` file, never hardcoded

## Route Protection

- Every private API endpoint runs `auth.js` middleware first
- If token is expired or tampered -> `401 Unauthorized`
- Admin routes additionally check `req.user.role === 'admin'`

## CORS Protection

- CORS configured to only allow requests from `localhost:3001`
- Any request from a different origin is blocked

## Frontend Route Guard

- `AdminRouteGuard.tsx` prevents non-admin users from seeing the admin panel
- `App.tsx` shows the landing page if there is no valid token
- Pasting a copied URL in a logged-out browser always shows the landing page

## File Upload Security

- Multer only accepts image file types
- Max file size limit enforced
- Files stored server-side, served via `/uploads/` static path

---

# 17. Email System

Nodemailer connects to Gmail SMTP using an **App Password** for secure authentication.

## Emails Sent By the System

| Trigger | Email Type | Recipient |
|---------|-----------|-----------|
| User sends support ticket | Support notification | Admin support email (set in Admin Preferences) |
| User clicks "Send Test Email" | Performance digest | User's registered email |
| Admin sends notification | System alert | Target user's email |

## Email Template

The performance digest email is HTML-formatted with:
- App branding/logo header
- Workout summary (sessions this week, total duration)
- Nutrition summary (avg daily calories vs goal)
- Current weight vs target
- Personalized coaching note

## Admin Email Forwarding

In Admin Preferences, the admin sets a "Support Email Forwarding" address. When any user submits a support ticket, a copy is also sent to this admin email.

---

# 18. Search System

The global search bar in `TopNavigationBar.tsx` is a **client-side fuzzy search** across the app's page and feature list.

## How It Works

```ts
const SEARCHABLE_ITEMS = [
  { label: 'Dashboard', tab: 'activity', keywords: ['home', 'overview', 'summary'] },
  { label: 'Log Workout', tab: 'workouts', keywords: ['exercise', 'gym', 'training'] },
  { label: 'Nutrition Tracker', tab: 'nutrition', keywords: ['food', 'meal', 'diet'] },
  { label: 'Water / Hydration', tab: 'nutrition', action: 'open-hydration',
    keywords: ['water', 'drink'] },
  { label: 'Progress Charts', tab: 'analytics', keywords: ['graph', 'weight', 'trend'] },
  { label: 'Profile Settings', tab: 'profile', keywords: ['account', 'photo', 'password'] },
  // ... more items
];
```

- As the user types, results filter in real time
- Results are grouped by category (Pages, Features, Settings)
- Clicking a result calls `onNavigateTab(item.tab)` to switch the view
- Some results also trigger specific actions (open a drawer, scroll to a section)

---

# 19. Notification System

## In-App Notifications

Notifications are stored in the `Notification` collection in MongoDB. The bell icon shows unread count as a badge. Clicking opens a dropdown where notifications can be marked as read.

## Creating Notifications

Notifications are created by the backend at specific events:
- New user registration -> welcome notification
- Workout log saved -> activity notification
- Support ticket status change -> response notification
- Admin sends a system broadcast -> system notification

## Email Notifications

From profile settings, users can enable email notifications. When enabled, the system also sends an email alongside the in-app notification using Nodemailer.

---

# 20. Unit Conversion System

`UnitContext.tsx` provides global unit conversion. Users set preferences during onboarding or in settings, and every value displayed is automatically converted.

## Supported Conversions

| Preference | Options | Conversion |
|-----------|---------|-----------|
| Energy | kcal / kJ | 1 kcal = 4.184 kJ |
| Weight | kg / lbs | 1 kg = 2.20462 lbs |
| Height | cm / in | 1 cm = 0.393701 in |

## Usage in Components

```tsx
const { convertEnergy, convertWeight, energyLabel, weightLabel } = useUnits();

<span>{convertEnergy(2000)} {energyLabel}</span>
// -> "2000 kcal" or "8368 kJ"

<span>{convertWeight(75)} {weightLabel}</span>
// -> "75 kg" or "165.3 lbs"
```

The preference is saved to the user's profile in MongoDB so it persists across sessions and devices.

---

# 21. Mobile Responsiveness

The app is fully responsive across three breakpoints:

| Screen | Breakpoint | Navigation Style |
|--------|-----------|-----------------|
| Mobile | < 768px | Bottom floating navigation bar |
| Tablet | 768px-1024px | Sidebar collapses, icons only |
| Desktop | > 1024px | Full sidebar with labels |

## Bottom Navigation Bar

`BottomFloatingBar.tsx`:
- Only visible on screens less than 768px (CSS media query in `index.css`)
- Rendered via a **React Portal** to `document.body` to escape any `overflow: hidden` parents
- Uses `position: fixed; bottom: 0` to always stick to the bottom
- Shows 5 main tabs: Dashboard, Workouts, Nutrition, Analytics, Profile

## CSS Implementation

```css
/* index.css */
@media (min-width: 769px) {
  .bottom-floating-bar {
    display: none !important;
  }
}

.bottom-floating-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}
```

---

# 22. Judge Q&A — Technical Explanations

## General Project Questions

**Q: What is this project?**
> It is a full-stack fitness tracking web app. Users can log workouts, track nutrition, monitor body weight, see analytics charts, and get guidance from an AI coach. There is also a separate admin panel for managing all users and viewing platform statistics.

**Q: What technology did you use?**
> We used the MERN stack: MongoDB for the database, Express.js for the backend API, React with TypeScript for the frontend, and Node.js as the runtime. For extras: JWT for authentication, bcrypt for password security, Google OAuth for social login, Nodemailer for emails, and Framer Motion for animations.

**Q: Why MERN specifically?**
> MongoDB is flexible — our data structures (workouts, nutrition logs) have nested shapes so a NoSQL database fits perfectly. Express is lightweight and easy to add middleware to. React makes building interactive UIs straightforward. And Node.js lets us use JavaScript on both frontend and backend — one language for the whole project.

---

## Authentication Questions

**Q: How do you handle login security?**
> We use JWT (JSON Web Tokens) with a dual-token system. Access tokens expire in 15 minutes. Refresh tokens last 7 days. Passwords are hashed with bcrypt — we never store or see the actual password. The refresh token is saved in the database so we can revoke it if needed.

**Q: What is the difference between the access token and refresh token?**
> Access token is like a daily pass — valid for 15 minutes, used for every API request. When it expires, the refresh token is used to get a new access token silently. This way the user stays logged in without re-entering their password, but security is maintained.

**Q: What happens if someone steals the access token?**
> They can use it for at most 15 minutes before it expires. The refresh token is needed to get a new one, and that is stored separately. For production, we would also add HTTPS and secure HttpOnly cookies.

---

## AI Coach Questions

**Q: What AI technology powers the chatbot?**
> It is a custom rule-based engine, not an external AI. We built our own intent detection using keyword matching. The bot checks if the user message contains fitness-related words, identifies the intent (workout, nutrition, hydration, etc.), and returns a coaching response with personalized data from the user's profile.

**Q: Why not use ChatGPT?**
> Three reasons: ChatGPT costs money per request. It can give wrong health advice (hallucination). And it would be a black box — we could not guarantee it stays on-topic. Our solution is free, always accurate, fully offline-capable, and domain-locked — it literally cannot answer off-topic questions.

**Q: What if the backend goes down during the demo?**
> We built a fallback engine inside the frontend itself. The same keyword logic runs in the browser with JavaScript. So even if the server is completely off, the chatbot still works perfectly.

**Q: How does the chatbot open pages inside the app?**
> Each response from the coach includes an `actions` array alongside the text. These actions have a `type` (navigate or quick-log), a `target` (which tab/feature), and a `label` for the button. When the user clicks the button, the widget calls a callback function from App.tsx that directly changes the current tab state.

---

## Database Questions

**Q: Why MongoDB instead of SQL?**
> Our data has nested structures (a workout log contains an array of exercises, each with an array of sets). Representing this in SQL requires multiple join tables. In MongoDB, it is stored naturally as a nested document, which is simpler and faster to query.

**Q: How is user data kept separate?**
> Every document in every collection has a `userId` field referencing the User collection. Every authenticated API endpoint extracts the userId from the JWT token and filters all queries by that userId. One user can never see another user's data.

---

## Admin Panel Questions

**Q: How is the admin panel separate from the user panel?**
> The admin panel uses the same React codebase but is gated by an `AdminRouteGuard` component that checks `user.role === 'admin'`. Only users with the admin role in the database can access it. The backend also checks the role on every admin API endpoint.

**Q: What can the admin do?**
> View platform-wide analytics (total users, active users, workout trends), manage all users (create, edit, promote to admin, delete), view and respond to support tickets, and configure admin preferences like the support email forwarding address.

---

# 23. Project Installation

> These steps assume you received the project as a zip file (without node_modules).

## Prerequisites

| Software | Version | Download |
|----------|---------|---------|
| **Node.js** | 18 or higher | [nodejs.org](https://nodejs.org) |
| **npm** | 9 or higher | Included with Node.js |
| **MongoDB Atlas account** | Free tier | [cloud.mongodb.com](https://cloud.mongodb.com) |

Verify installation:
```bash
node -v    # v18.x.x or higher
npm -v     # 9.x.x or higher
```

## Step 1: Extract the Project

Unzip to your desired location. You will see:
```
Fitness_Tracker/
+-- backend/
+-- frontend/
+-- admin/
```

## Step 2: Set Up MongoDB Atlas

1. Go to cloud.mongodb.com and create a free account
2. Create a new Cluster (free M0 tier is fine)
3. Create a Database User (username + password)
4. Under Network Access -> Add `0.0.0.0/0` (allow all IPs for development)
5. Click Connect -> Drivers -> Copy the connection string

## Step 3: Configure Backend .env

Create `backend/.env`:

```env
PORT=5050

MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/fitness_tracker?retryWrites=true&w=majority

JWT_ACCESS_SECRET=replace_with_any_long_random_string_here
JWT_REFRESH_SECRET=replace_with_a_different_long_random_string

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5050/api/auth/google/callback
CLIENT_ORIGIN=http://localhost:3001

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM="Fitness Tracker" <your_gmail@gmail.com>
```

> Gmail App Password: Google Account -> Security -> 2-Step Verification -> App Passwords -> Generate for "Mail". Do NOT use your regular Gmail password.

## Step 4: Configure Frontend .env

Create `frontend/.env`:

```env
VITE_API_BASE=http://localhost:5050/api

VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> Gemini Key: Free at aistudio.google.com/apikey
> Note: The AI Coach chatbot widget uses its own built-in engine and does NOT need a Gemini key. The Gemini key is only for the inline AiFitnessCoachCard on the dashboard.

## Step 5: Install Dependencies

**Terminal 1 — Backend:**
```bash
cd Fitness_Tracker/backend
npm install
```

**Terminal 2 — Frontend:**
```bash
cd Fitness_Tracker/frontend
npm install
```

## Step 6: Run the Application

**Terminal 1 — Start Backend:**
```bash
cd backend
npm start
```
Expected output:
```
MongoDB connected
Server running on http://localhost:5050
```

**Terminal 2 — Start Frontend:**
```bash
cd frontend
npm run dev
```
Expected output:
```
VITE v6.x.x  ready in 300 ms
Local: http://localhost:3001/
```

## Step 7: Create an Admin Account

After registering normally, promote your account to admin in MongoDB Atlas:
1. Open MongoDB Atlas -> Collections -> users
2. Find your user document
3. Edit -> Change `"role": "user"` to `"role": "admin"`
4. Save
5. Log out and log back in

## Step 8: Open the Application

- User Panel: http://localhost:3001
- Admin Panel: http://localhost:3001/admin (after promoting to admin)

---

# 24. Troubleshooting

| Issue | Solution |
|-------|---------|
| `MongoDB connection failed` | Check `MONGODB_URI` in backend `.env`. Make sure IP `0.0.0.0/0` is whitelisted in Atlas Network Access. |
| `CORS error in browser` | Backend must be on port `5050`, frontend on `3001`. Check `CLIENT_ORIGIN` in backend `.env`. |
| `Module not found` | Run `npm install` again in the failing folder. |
| `nodemon: command not found` | Run `npm install -g nodemon` or use `node src/server.js` directly. |
| `Gemini AI coach card not responding` | Check `VITE_GEMINI_API_KEY` in `frontend/.env`. The floating widget still works via local fallback. |
| `Email not sending` | Make sure `EMAIL_PASS` is a Gmail App Password, not your regular password. Enable 2-Step Verification first. |
| `Profile photo not showing` | Backend must be running — photos are served from `localhost:5050/uploads/`. |
| `Admin panel shows Access Denied` | Make sure your user's `role` field is `"admin"` in MongoDB Atlas. |
| `Google Sign-In not working` | Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Make sure the callback URL is added in Google Cloud Console -> Authorized Redirect URIs. |
| `Page appears blank after login` | Open browser DevTools console — likely an API error. Make sure both backend and frontend servers are running. |
| `Bottom navigation missing on mobile` | Hard refresh (Ctrl+Shift+R). It only shows on screens under 768px width. |

---

> **Remember**: Backend (port 5050) and Frontend (port 3001) must both be running simultaneously.
> They communicate via HTTP REST — the frontend is just a browser UI that calls the backend API.

---

*Last updated: September 2026 — Aptech Semester 4 E-Project*