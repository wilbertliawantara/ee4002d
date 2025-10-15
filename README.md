"# 💪 Fitness Companion

AI-powered fitness coaching app with pose detection, habit tracking, and personalized motivation.

## 🎯 Features

- **📸 Camera Workouts** - Real-time pose detection and form feedback
- **🤖 AI Coach** - Context-aware fitness coaching powered by Google Gemini
- **✏️ Manual Logging** - Track workouts without camera
- **📅 Habit Tracker** - Build consistency with streak tracking
- **📊 Progress Analytics** - Track workouts, calories, and time
- **💬 Chat Support** - Ask your AI coach anything about fitness

---

## 💰 Cost: **100% FREE**

| Component | Technology | Cost |
|-----------|------------|------|
| **Backend** | Flask + PostgreSQL | $0 (local) |
| **Database** | PostgreSQL | $0 (open-source) |
| **LLM** | Google Gemini API | $0 (1500 req/day free) |
| **Frontend** | React Native (Expo) | $0 |
| **Pose Detection** | MediaPipe | $0 (on-device) |
| **Total** | | **$0/month** 🎉 |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   React Native (Expo) Frontend      │
│   iOS, Android, Web                 │
└─────────────────────────────────────┘
                │
                │ REST API
                ▼
┌─────────────────────────────────────┐
│   Flask Backend                     │
│   - JWT Auth                        │
│   - Workout API                     │
│   - LLM Integration                 │
│   - Habit Tracker                   │
└─────────────────────────────────────┘
        │               │
        ▼               ▼
┌──────────────┐  ┌────────────────┐
│ PostgreSQL   │  │ Google Gemini  │
│ (Local/Free) │  │ API (FREE)     │
└──────────────┘  └────────────────┘
```

---

## 🚀 Quick Start (Windows)

### Prerequisites

1. **Python 3.10+**
   ```powershell
   python --version
   ```

2. **Node.js 18+**
   ```powershell
   node --version
   ```

3. **PostgreSQL 15+**
   - Download: https://www.postgresql.org/download/windows/
   - Or use Docker:
     ```powershell
     docker run --name fitness-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
     ```

4. **Git** (already installed)

---

### Step 1: Clone Repository

```powershell
cd C:\Users\Liawa\OneDrive\Documents\ee4002d
git pull  # Get latest changes
```

---

### Step 2: Backend Setup (5 minutes)

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env

# Edit .env and add your Gemini API key
# Get free key: https://makersuite.google.com/app/apikey
notepad .env

# Create database
createdb fitness_companion
# Or in PostgreSQL shell: CREATE DATABASE fitness_companion;

# Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Seed sample data (optional)
flask seed-db

# Run backend
python run.py
```

Backend will run at: **http://localhost:5000**

Test it: http://localhost:5000/health

---

### Step 3: Frontend Setup (5 minutes)

Open a **new PowerShell window**:

```powershell
# Navigate to frontend
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\frontend

# Install dependencies
npm install

# Update API endpoint for your device
# Edit src/services/api.js:
# - For Android emulator: http://10.0.2.2:5000/api
# - For physical device: http://YOUR_IP:5000/api (get IP with: ipconfig)
notepad src\services\api.js

# Start Expo
npm start
```

Scan QR code with **Expo Go app** on your phone, or press:
- `a` for Android emulator
- `i` for iOS simulator (Mac only)
- `w` for web browser

---

### Step 4: Get Gemini API Key (FREE)

1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Paste in `backend/.env`:
   ```
   GEMINI_API_KEY=your-key-here
   ```
5. Restart backend: `python run.py`

**Quota**: 1500 requests/day FREE forever 🎉

---

## 📱 Using the App

### 1. Sign Up / Login
- Create account with email & password
- Demo account: `demo@fitness.com` / `demo123` (if you ran `flask seed-db`)

### 2. Home Dashboard
- View daily motivation
- See workout stats
- Quick access to features

### 3. Camera Workout (Demo)
- Start camera workout
- See real-time feedback
- Track reps and form score
- *Note: Full pose detection coming soon*

### 4. Manual Workout
- Log exercises manually
- Add sets, reps, duration
- Saved to habit tracker

### 5. Chat with AI Coach
- Ask fitness questions
- Get personalized advice
- Context-aware responses

### 6. Habit Tracker
- Create workout habits
- Track streaks
- Get reminders

---

## 🛠️ Development

### Backend (Flask)

```powershell
cd backend
.\venv\Scripts\Activate

# Run dev server
python run.py

# Database migrations
flask db migrate -m "Description"
flask db upgrade

# Tests (coming soon)
pytest
```

**API Documentation**: See `backend/README.md`

### Frontend (React Native)

```powershell
cd frontend

# Run with cache clear
npx expo start -c

# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios
```

**UI Documentation**: See `frontend/README.md`

---

## 🎯 Next Steps

### ✅ Completed
- [x] Backend API (Flask + PostgreSQL)
- [x] Authentication (JWT)
- [x] LLM Integration (Google Gemini)
- [x] Database models
- [x] Frontend UI (React Native)
- [x] All screens (Login, Home, Chat, Workouts, Habits)
- [x] API service layer

### 🚧 To Implement
- [ ] MediaPipe pose detection integration
- [ ] Push notifications for habit reminders
- [ ] Offline mode with local caching
- [ ] Charts and progress visualization
- [ ] Social features (share workouts)
- [ ] Fine-tune LLM with workout data

---

## 📂 Project Structure

```
ee4002d/
├── backend/               # Flask REST API
│   ├── app/
│   │   ├── models.py     # Database models
│   │   ├── routes/       # API endpoints
│   │   └── services/     # Business logic
│   ├── config.py         # Configuration
│   ├── run.py           # Entry point
│   └── requirements.txt  # Python deps
├── frontend/             # React Native app
│   ├── src/
│   │   ├── screens/     # UI screens
│   │   └── services/    # API client
│   ├── App.js           # Entry point
│   └── package.json     # Node deps
└── README.md            # This file
```

---

## 🆓 Free Alternatives

### LLM Options (all FREE)
1. **Google Gemini** - 1500 req/day (recommended)
2. **Ollama** - 100% free local LLM (unlimited)
3. **Groq** - Free tier available
4. **HuggingFace** - Free inference API

### Database Hosting (FREE tiers)
1. **Supabase** - 500MB free
2. **Neon** - 3GB free
3. **Railway** - $5 credit/month
4. **Local PostgreSQL** - Unlimited free

### Backend Hosting (FREE tiers)
1. **Render.com** - 750 hours/month
2. **Railway.app** - $5 credit/month
3. **Fly.io** - 3 VMs free

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check Python version
python --version  # Should be 3.10+

# Check PostgreSQL is running
psql -U postgres  # Should connect

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend can't connect to backend
- Update IP in `frontend/src/services/api.js`
- For Android emulator: `http://10.0.2.2:5000/api`
- For physical device: `http://YOUR_IP:5000/api`
- Get IP: `ipconfig` (look for IPv4)

### Gemini API errors
- Verify API key in `backend/.env`
- Check quota: https://ai.google.dev/pricing
- Fallback: Set `USE_OLLAMA=true` for local LLM

---

## 📄 License

MIT

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 🙏 Credits

- **Flask** - Backend framework
- **React Native** - Mobile framework
- **Google Gemini** - AI language model
- **PostgreSQL** - Database
- **MediaPipe** - Pose detection (future)
- **Expo** - React Native tooling

---

## 📧 Support

For issues or questions:
- Create an issue on GitHub
- Check documentation in `backend/README.md` and `frontend/README.md`

---

**Built with ❤️ and 100% FREE tools** 🎉" 
