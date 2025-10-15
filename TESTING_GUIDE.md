# 🧪 Complete Testing Guide

This guide will walk you through **every step** to set up, verify, and test your fitness app.

---

## 📋 Prerequisites Check

Before starting, verify you have:

```powershell
# Check Python (need 3.10+)
python --version

# Check Node.js (need 18+)
node --version

# Check npm
npm --version

# Check Git
git --version

# Check PostgreSQL (need 15+)
psql --version
```

**If PostgreSQL is missing**, install it:
- Download: https://www.postgresql.org/download/windows/
- Or use Chocolatey: `choco install postgresql`

---

## Step 1: Run Setup Script

### 1.1 Execute Setup

```powershell
# Make sure you're in the project root
cd C:\Users\Liawa\OneDrive\Documents\ee4002d

# Run setup
.\setup.ps1
```

**Expected Output**:
```
========================================
FITNESS COMPANION - Isolated Setup
========================================

This script creates ISOLATED environments:
  ✓ Python virtual environment (backend/venv/)
  ✓ Local Node.js modules (frontend/node_modules/)
  ✓ No global package installations
  ✓ No conflicts with other projects

[1/3] Setting up Backend Environment...
...
Backend setup complete! ✓

[2/3] Setting up Frontend Environment...
...
Frontend setup complete! ✓

[3/3] Environment Verification...
✓ Backend venv exists
✓ Frontend node_modules exists
⚠ Backend .env file not found (you'll create this next)
```

### 1.2 Verify Virtual Environment

```powershell
# Check venv was created
Test-Path backend\venv\Scripts\python.exe
# Should output: True

# Activate venv
cd backend
.\venv\Scripts\Activate

# Your prompt should now show (venv)
# Example: (venv) PS C:\Users\Liawa\OneDrive\Documents\ee4002d\backend>
```

### 1.3 Verify Isolated Packages

```powershell
# Still in activated venv
pip list

# You should see:
# Flask, SQLAlchemy, google-generativeai, etc.
# These are ONLY in this venv, not global!

# Verify Python location
python -c "import sys; print(sys.executable)"
# Should output: C:\Users\Liawa\OneDrive\Documents\ee4002d\backend\venv\Scripts\python.exe
```

### 1.4 Verify Frontend Packages

```powershell
# Open NEW terminal (don't close backend one)
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\frontend

# Check node_modules
Test-Path node_modules
# Should output: True

# List packages
npm list --depth=0
# Should show: expo, react-native, axios, etc.
```

✅ **Checkpoint 1**: Both environments are isolated and packages installed!

---

## Step 2: Get Gemini API Key (FREE)

### 2.1 Visit Google AI Studio

1. Open browser: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX`)

**Cost**: FREE - 1500 requests/day forever! 🎉

### 2.2 Add to .env File

```powershell
# In backend terminal (venv should still be activated)
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\backend

# Create .env file
notepad .env
```

**Paste this content** (replace with YOUR key):
```env
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fitness_companion
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
USE_OLLAMA=False
JWT_SECRET_KEY=your-jwt-secret-change-in-production
```

**Save and close Notepad**.

### 2.3 Verify .env File

```powershell
# Check file exists
Test-Path .env
# Should output: True

# Check content (first 3 lines)
Get-Content .env | Select-Object -First 3
# Should show: FLASK_APP=run.py, etc.
```

✅ **Checkpoint 2**: API key configured!

---

## Step 3: Set Up PostgreSQL Database

### 3.1 Verify PostgreSQL is Running

```powershell
# Check PostgreSQL service
Get-Service -Name postgresql*
# Status should be "Running"

# If not running, start it:
Start-Service -Name postgresql-x64-15  # Adjust version number
```

### 3.2 Connect to PostgreSQL

```powershell
# Connect as postgres user (default password is usually 'postgres')
psql -U postgres

# You should see:
# postgres=#
```

**If password prompt appears**, enter the password you set during PostgreSQL installation.

### 3.3 Create Database

```sql
-- In psql prompt
CREATE DATABASE fitness_companion;

-- Verify it was created
\l

-- You should see 'fitness_companion' in the list

-- Connect to the database
\c fitness_companion

-- Exit psql
\q
```

### 3.4 Alternative: Create via PowerShell

```powershell
# Create database directly
createdb -U postgres fitness_companion

# List databases
psql -U postgres -l | findstr fitness
# Should show: fitness_companion
```

✅ **Checkpoint 3**: Database created!

---

## Step 4: Initialize Database Schema

### 4.1 Activate venv (if not already)

```powershell
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\backend
.\venv\Scripts\Activate

# Verify (venv) appears in prompt
```

### 4.2 Initialize Flask-Migrate

```powershell
# Initialize migrations folder
flask db init

# You should see:
# Creating directory backend/migrations ... done
```

### 4.3 Create Migration

```powershell
# Generate migration from models
flask db migrate -m "Initial schema"

# You should see:
# INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
# INFO  [alembic.autogenerate.compare] Detected added table 'users'
# INFO  [alembic.autogenerate.compare] Detected added table 'workout_routines'
# ... (6 tables total)
# Generating migrations\versions\xxxx_initial_schema.py ... done
```

### 4.4 Apply Migration

```powershell
# Apply migration to database
flask db upgrade

# You should see:
# INFO  [alembic.runtime.migration] Running upgrade -> xxxx, Initial schema
```

### 4.5 Verify Tables in PostgreSQL

```powershell
# Connect to database
psql -U postgres -d fitness_companion

# List tables
\dt

# You should see:
#  public | users              | table | postgres
#  public | workout_routines   | table | postgres
#  public | workout_sessions   | table | postgres
#  public | pose_analyses      | table | postgres
#  public | habits             | table | postgres
#  public | llm_conversations  | table | postgres
#  public | alembic_version    | table | postgres

# View users table structure
\d users

# You should see columns: id, email, password_hash, name, fitness_level, etc.

# Exit
\q
```

### 4.6 (Optional) Seed Demo Data

```powershell
# Create demo account
flask seed-db

# You should see:
# Demo user created: demo@fitness.com / demo123
```

✅ **Checkpoint 4**: Database schema created with 6 tables!

---

## Step 5: Start Backend Server

### 5.1 Start Flask

```powershell
# In backend terminal (venv activated)
python run.py

# You should see:
# * Serving Flask app 'run'
# * Debug mode: on
# WARNING: This is a development server.
# * Running on http://127.0.0.1:5000
```

**Keep this terminal open!** Backend is now running.

### 5.2 Test Health Endpoint

```powershell
# Open NEW terminal
curl http://localhost:5000/health

# You should see:
# {"status":"healthy"}
```

Or open browser: http://localhost:5000/health

### 5.3 Test Database Connection

```powershell
# In new terminal
curl http://localhost:5000/api/auth/register -Method POST -ContentType "application/json" -Body '{"email":"test@test.com","password":"test123","name":"Test User"}'

# You should see JSON response with user data
```

✅ **Checkpoint 5**: Backend running and responding!

---

## Step 6: Start Frontend

### 6.1 Start Expo

```powershell
# Open NEW terminal (keep backend running)
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\frontend

# Start Expo
npm start

# You should see:
# › Metro waiting on exp://192.168.x.x:8081
# › Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### 6.2 Install Expo Go App

On your phone:
- **Android**: Install "Expo Go" from Play Store
- **iOS**: Install "Expo Go" from App Store

### 6.3 Connect Phone

**Option A: Scan QR Code**
- Open Expo Go app
- Tap "Scan QR code"
- Scan the QR code in terminal

**Option B: Manual Connection**
- Make sure phone is on same WiFi as computer
- In Expo Go, tap "Enter URL manually"
- Enter: `exp://YOUR_IP:8081` (find IP in terminal output)

✅ **Checkpoint 6**: Frontend loaded on phone!

---

## Step 7: Test Complete Flow

### 7.1 Test Registration

1. **On Phone**: App should show Login screen
2. **Tap**: "Don't have an account? Register"
3. **Enter**:
   - Email: `john@test.com`
   - Password: `test123`
   - Name: `John Doe`
   - Fitness Level: `Intermediate`
4. **Tap**: "Register"

### 7.2 Verify in Database

```powershell
# In new terminal
psql -U postgres -d fitness_companion

# Check user was created
SELECT id, email, name, fitness_level, created_at FROM users WHERE email = 'john@test.com';

# You should see:
#  id |     email      |   name   | fitness_level |         created_at
# ----+----------------+----------+---------------+----------------------------
#   1 | john@test.com  | John Doe | intermediate  | 2025-10-15 10:30:45.123456
```

**Visual Confirmation**: User in database! 🎉

### 7.3 Test Login

1. **On Phone**: Should auto-login after registration
2. **If not**: Tap "Login" and enter credentials
3. **Should see**: Home screen with "Welcome, John Doe!"

### 7.4 Test Chat with AI

1. **On Phone**: Tap "Chat with AI Coach"
2. **Type**: "What workout should I do today?"
3. **Send**

**Verify in Database**:
```sql
-- Check LLM conversation
SELECT id, user_id, role, LEFT(content, 50) as content_preview, created_at
FROM llm_conversations
ORDER BY created_at DESC
LIMIT 5;

-- You should see:
# User message: "What workout should I do today?"
# Assistant message: "Based on your fitness level..."
```

### 7.5 Test Habit Tracker

1. **On Phone**: Tap "Habits" from home screen
2. **Tap**: "+ Create Habit"
3. **Enter**:
   - Name: "Morning Workout"
   - Schedule: "Daily"
   - Reminder: 07:00
4. **Tap**: "Create"

**Verify in Database**:
```sql
SELECT id, name, schedule, reminder_time, streak_count, created_at
FROM habits
WHERE user_id = 1;

-- You should see:
#  id |      name       | schedule | reminder_time | streak_count | created_at
# ----+-----------------+----------+---------------+--------------+------------
#   1 | Morning Workout | daily    | 07:00:00      | 0            | 2025-10-15...
```

### 7.6 Complete a Habit

1. **On Phone**: Tap checkmark on "Morning Workout"
2. **Should see**: "🔥 1 day streak!"

**Verify in Database**:
```sql
SELECT id, name, streak_count, last_completed_at
FROM habits
WHERE id = 1;

-- streak_count should now be 1!
-- last_completed_at should be current timestamp
```

### 7.7 Test Manual Workout

1. **On Phone**: Tap "Log Workout"
2. **Enter**:
   - Exercise: Push-ups
   - Sets: 3
   - Reps: 15
3. **Add another**: Squats, 3 sets, 20 reps
4. **Tap**: "Save Workout"

**Verify in Database**:
```sql
-- Check workout session
SELECT id, user_id, total_exercises, total_duration, completed_at
FROM workout_sessions
ORDER BY created_at DESC
LIMIT 1;

-- Check workout details (exercises stored as JSON)
SELECT exercises FROM workout_sessions WHERE id = 1;

-- You should see JSON like:
# [{"name":"Push-ups","sets":3,"reps":15},{"name":"Squats","sets":3,"reps":20}]
```

### 7.8 Test Stats

1. **On Phone**: Go to Home screen
2. **Should see**:
   - Total workouts: 1
   - Active habits: 1
   - Current streak: 1

**Verify Calculation**:
```sql
-- Count workouts
SELECT COUNT(*) as total_workouts FROM workout_sessions WHERE user_id = 1;

-- Count habits
SELECT COUNT(*) as active_habits FROM habits WHERE user_id = 1 AND is_active = true;

-- Max streak
SELECT MAX(streak_count) as max_streak FROM habits WHERE user_id = 1;
```

✅ **Checkpoint 7**: Everything works end-to-end! 🎉

---

## 🔍 Live Database Monitoring

### Watch Database in Real-Time

**Terminal 1: Backend running**
**Terminal 2: Frontend running**
**Terminal 3: PostgreSQL monitor**

```powershell
# Open 3rd terminal
psql -U postgres -d fitness_companion

-- Watch user table
SELECT id, email, name, created_at FROM users;

-- Watch habits
SELECT id, user_id, name, streak_count, is_active FROM habits;

-- Watch workouts
SELECT id, user_id, total_exercises, completed_at FROM workout_sessions ORDER BY created_at DESC LIMIT 5;

-- Watch LLM conversations (last 10 messages)
SELECT user_id, role, LEFT(content, 60) as message, created_at
FROM llm_conversations
ORDER BY created_at DESC
LIMIT 10;
```

### Automatic Refresh Query

```sql
-- Run this to see live updates (PostgreSQL)
\watch 2

-- This will refresh query every 2 seconds
-- Press Ctrl+C to stop
```

### Example Monitoring Queries

```sql
-- 1. User activity summary
SELECT
    u.email,
    COUNT(DISTINCT ws.id) as total_workouts,
    COUNT(DISTINCT h.id) as total_habits,
    MAX(h.streak_count) as best_streak
FROM users u
LEFT JOIN workout_sessions ws ON u.id = ws.user_id
LEFT JOIN habits h ON u.id = h.user_id
GROUP BY u.id, u.email;

-- 2. Recent activity (last 24 hours)
SELECT
    'workout' as type,
    u.email,
    ws.total_exercises as detail,
    ws.completed_at as timestamp
FROM workout_sessions ws
JOIN users u ON ws.user_id = u.id
WHERE ws.completed_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT
    'habit' as type,
    u.email,
    h.name as detail,
    h.last_completed_at as timestamp
FROM habits h
JOIN users u ON h.user_id = u.id
WHERE h.last_completed_at > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- 3. LLM usage statistics
SELECT
    u.email,
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE role = 'user') as user_messages,
    COUNT(*) FILTER (WHERE role = 'assistant') as ai_responses
FROM llm_conversations lc
JOIN users u ON lc.user_id = u.id
GROUP BY u.id, u.email;
```

---

## 📊 PostgreSQL GUI Tool (Optional)

For visual database exploration, install **pgAdmin**:

```powershell
# Install via Chocolatey
choco install pgadmin4

# Or download: https://www.pgadmin.org/download/
```

**After installation**:
1. Open pgAdmin
2. Right-click "Servers" → "Create" → "Server"
3. **General tab**: Name = "Local Fitness DB"
4. **Connection tab**:
   - Host: localhost
   - Port: 5432
   - Database: fitness_companion
   - Username: postgres
   - Password: (your postgres password)
5. Click "Save"

Now you can visually browse tables, run queries, and see data updates in real-time!

---

## ✅ Verification Checklist

Use this to confirm everything is working:

```
Environment Setup:
☐ venv created at backend/venv/
☐ node_modules created at frontend/node_modules/
☐ Activated venv shows (venv) in prompt
☐ pip list shows Flask, SQLAlchemy, etc.
☐ npm list shows expo, react-native, etc.

Configuration:
☐ .env file exists in backend/
☐ GEMINI_API_KEY is set
☐ PostgreSQL service is running
☐ Database 'fitness_companion' exists

Database:
☐ 6 tables created (users, workout_routines, etc.)
☐ Can connect via psql
☐ Can query tables

Backend:
☐ python run.py starts without errors
☐ http://localhost:5000/health returns {"status":"healthy"}
☐ Can register user via API

Frontend:
☐ npm start launches Expo
☐ App loads on phone via Expo Go
☐ Login screen appears

End-to-End:
☐ Register new user → appears in database
☐ Login → JWT token received
☐ Chat with AI → messages saved in llm_conversations table
☐ Create habit → appears in habits table
☐ Complete habit → streak_count increases
☐ Log workout → appears in workout_sessions table
☐ Home screen shows correct stats
```

---

## 🐛 Troubleshooting

### Backend won't start

```powershell
# Activate venv
cd backend
.\venv\Scripts\Activate

# Reinstall dependencies
pip install -r requirements.txt

# Check database connection
python -c "from app import create_app; app = create_app(); print('OK')"
```

### Frontend can't connect to backend

```powershell
# Find your computer's IP
ipconfig
# Look for "IPv4 Address" under your active network

# Edit frontend/src/services/api.js
# Change API_BASE_URL to:
# http://YOUR_IP:5000/api
```

### Database connection error

```powershell
# Check PostgreSQL is running
Get-Service -Name postgresql*

# Check DATABASE_URL in .env
Get-Content backend\.env | findstr DATABASE_URL

# Should be: postgresql://postgres:postgres@localhost:5432/fitness_companion
```

### Gemini API error

```powershell
# Check API key in .env
Get-Content backend\.env | findstr GEMINI_API_KEY

# Test API key
curl https://generativelanguage.googleapis.com/v1/models?key=YOUR_KEY_HERE
```

---

## 📝 Daily Workflow

Every time you work on the project:

```powershell
# Terminal 1: Backend
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\backend
.\venv\Scripts\Activate  # ← ALWAYS FIRST!
python run.py

# Terminal 2: Frontend
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\frontend
npm start

# Terminal 3: Database monitoring (optional)
psql -U postgres -d fitness_companion
```

---

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ You can register → user appears in database
2. ✅ You can login → JWT token received
3. ✅ You can chat with AI → conversation saved
4. ✅ You can create habits → habit in database with streak tracking
5. ✅ You can log workouts → workout in database
6. ✅ Database updates in real-time as you use the app

**Congratulations! Your fitness companion app is fully operational!** 💪🎉

---

**Next**: Check `ENVIRONMENT_ISOLATION.md` to understand how environments work, and `QUICKSTART.md` for daily reference commands.
