# Fitness Companion - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Setup (Automated)](#quick-setup-automated)
3. [Manual Setup](#manual-setup)
4. [Getting Gemini API Key](#getting-gemini-api-key)
5. [Running the App](#running-the-app)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Python 3.10 or higher**
   - Download: https://www.python.org/downloads/
   - Verify: `python --version`

2. **Node.js 18 or higher**
   - Download: https://nodejs.org/
   - Verify: `node --version`

3. **PostgreSQL 15 or higher**
   - Download: https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run --name fitness-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`
   - Verify: `psql --version`

4. **Git** (already installed)

5. **Mobile Device**
   - Install "Expo Go" app from App Store (iOS) or Google Play (Android)
   - Or use Android emulator / iOS simulator

---

## Quick Setup (Automated)

Run the setup script in PowerShell:

```powershell
cd C:\Users\Liawa\OneDrive\Documents\ee4002d
.\setup.ps1
```

This will:
- Check prerequisites
- Set up Python virtual environment
- Install backend dependencies
- Install frontend dependencies
- Create .env files

Then follow the on-screen instructions.

---

## Manual Setup

### Step 1: Backend Setup

```powershell
# Navigate to project
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env and add your Gemini API key
notepad .env
```

**Important**: Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your-key-here
```

Get free key: https://makersuite.google.com/app/apikey

### Step 2: Database Setup

```powershell
# Create database (choose one method)

# Method 1: Using createdb command
createdb fitness_companion

# Method 2: Using psql
psql -U postgres
CREATE DATABASE fitness_companion;
\q

# Method 3: Using Docker
docker run --name fitness-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### Step 3: Initialize Database

```powershell
# Make sure you're in backend folder with venv activated
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\backend
.\venv\Scripts\Activate

# Initialize migrations
flask db init

# Create initial migration
flask db migrate -m "Initial migration"

# Apply migrations
flask db upgrade

# (Optional) Seed with demo data
flask seed-db
```

This creates:
- Demo account: `demo@fitness.com` / `demo123`
- Sample workout routine

### Step 4: Frontend Setup

```powershell
# Open NEW PowerShell window
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\frontend

# Install dependencies
npm install

# (Optional) Update API endpoint
# Edit src/services/api.js if needed
notepad src\services\api.js
```

**API Endpoint Configuration**:
- For Android emulator: `http://10.0.2.2:5000/api`
- For iOS simulator: `http://localhost:5000/api`
- For physical device: `http://YOUR_IP:5000/api`

To find your IP:
```powershell
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

---

## Getting Gemini API Key

### Why Gemini?
- **1500 requests/day FREE** forever
- No credit card required
- High quality AI responses
- Multimodal support

### Steps:

1. Go to: https://makersuite.google.com/app/apikey

2. Sign in with Google account

3. Click "Create API Key"

4. Copy the key

5. Paste in `backend/.env`:
   ```
   GEMINI_API_KEY=AIzaSyC...your-key-here
   ```

6. Save the file

7. Restart backend if running

**Alternative**: Use Ollama for 100% free local LLM (no internet required):
```powershell
# Install Ollama
winget install Ollama.Ollama

# Download model
ollama pull llama3.1:8b

# Update .env
USE_OLLAMA=true
```

---

## Running the App

### Start Backend (Terminal 1)

```powershell
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\backend
.\venv\Scripts\Activate
python run.py
```

**Backend runs at**: http://localhost:5000

**Test it**: Open http://localhost:5000/health in browser
- Should see: `{"status": "healthy", "message": "Fitness Companion API is running"}`

### Start Frontend (Terminal 2)

```powershell
# Open NEW PowerShell window
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\frontend
npm start
```

**Expo Dev Tools** will open in browser

**Run on device**:
- Scan QR code with Expo Go app
- Or press `a` for Android emulator
- Or press `i` for iOS simulator (Mac only)
- Or press `w` for web browser

---

## Testing

### Test Backend API

**Health check**:
```powershell
curl http://localhost:5000/health
```

**Register new user**:
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@test.com\",\"password\":\"test123\",\"username\":\"testuser\"}'
```

**Login**:
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@test.com\",\"password\":\"test123\"}'
```

**Chat with AI** (replace YOUR_TOKEN):
```powershell
curl -X POST http://localhost:5000/api/llm/chat `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{\"message\":\"Give me a workout tip\"}'
```

### Test Frontend

1. **Login**: Use demo account or create new
   - Email: `demo@fitness.com`
   - Password: `demo123`

2. **Home Screen**: Should see stats and motivation

3. **Chat**: Ask AI coach a question

4. **Manual Workout**: Log a workout

5. **Habits**: Create and complete a habit

---

## Troubleshooting

### Backend Issues

**"Module not found" error**:
```powershell
# Make sure venv is activated
.\venv\Scripts\Activate

# Reinstall dependencies
pip install -r requirements.txt
```

**"Connection refused" to database**:
```powershell
# Check PostgreSQL is running
# Windows: Check Services for "PostgreSQL"
# Docker: docker ps | findstr fitness-db

# Check connection string in .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fitness_companion
```

**"Gemini API error"**:
```powershell
# Verify API key in .env
notepad backend\.env

# Check quota: https://ai.google.dev/pricing

# Fallback to Ollama (100% free)
# In .env: USE_OLLAMA=true
```

**Database migration errors**:
```powershell
# Delete migrations folder and start fresh
rm -r migrations
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### Frontend Issues

**"Cannot connect to server"**:

1. Verify backend is running: http://localhost:5000/health

2. Update IP in `frontend/src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP:5000/api';
   ```

3. For Android emulator: use `10.0.2.2` instead of `localhost`

4. Disable Windows Firewall temporarily

**"Expo Go app can't connect"**:
- Make sure phone and computer are on same WiFi
- Check firewall isn't blocking port 19000
- Try tunnel mode: `npx expo start --tunnel`

**"Module resolution failed"**:
```powershell
# Clear cache
npx expo start -c

# Reinstall
rm -r node_modules
npm install
```

**Camera permission errors**:
- Grant camera permission in device settings
- Restart Expo Go app

### Common Errors

**"No module named 'flask'"**:
- Virtual environment not activated: `.\venv\Scripts\Activate`

**"psycopg2 not found"**:
- Install PostgreSQL development libraries
- Or use `psycopg2-binary` (already in requirements.txt)

**"npm ERR! code ENOENT"**:
- Wrong directory: `cd frontend`
- Missing package.json: pull from git

**"Port 5000 already in use"**:
```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in backend/run.py
```

---

## Next Steps

After successful setup:

1. **Read the docs**:
   - Main: `README.md`
   - Backend: `backend/README.md`
   - Frontend: `frontend/README.md`

2. **Try all features**:
   - Create account
   - Chat with AI
   - Log workouts
   - Track habits

3. **Customize**:
   - Change colors in screens
   - Add your own exercises
   - Modify AI prompts

4. **Deploy** (optional):
   - Backend: Render.com, Railway, Fly.io
   - Database: Supabase, Neon
   - Frontend: Build APK/IPA

---

## Additional Resources

- **Flask**: https://flask.palletsprojects.com/
- **React Native**: https://reactnative.dev/
- **Expo**: https://docs.expo.dev/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Gemini API**: https://ai.google.dev/docs

---

## Support

Having issues? Check:
1. This setup guide
2. Main README.md
3. Backend/Frontend READMEs
4. GitHub Issues

---

**Happy Coding! 💪🚀**
