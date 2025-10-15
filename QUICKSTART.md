# 🚀 Quick Start Cheat Sheet

## One-Time Setup

```powershell
# 1. Run setup script
.\setup.ps1

# 2. Get FREE Gemini API key
# https://makersuite.google.com/app/apikey

# 3. Add key to backend\.env
notepad backend\.env
# GEMINI_API_KEY=your-key-here

# 4. Create database
createdb fitness_companion
```

---

## Every Time You Start Working

### Terminal 1: Backend
```powershell
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\backend
.\venv\Scripts\Activate  # ← ALWAYS DO THIS FIRST
python run.py
```

### Terminal 2: Frontend
```powershell
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\frontend
npm start
```

---

## First Time Database Setup

```powershell
cd backend
.\venv\Scripts\Activate  # ← Don't forget!
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
flask seed-db  # Optional: creates demo account
```

---

## Demo Account
- Email: `demo@fitness.com`
- Password: `demo123`

---

## Test Backend
```powershell
# In browser:
http://localhost:5000/health
```

---

## Common Commands

### Backend (venv must be activated!)
```powershell
cd backend
.\venv\Scripts\Activate  # See (venv) in prompt

# Run server
python run.py

# Database migrations
flask db migrate -m "Description"
flask db upgrade

# Create demo data
flask seed-db

# Deactivate venv
deactivate
```

### Frontend
```powershell
cd frontend

# Start Expo
npm start

# Clear cache
npx expo start -c

# Build Android
npx expo build:android
```

---

## Verify Isolation

### Backend
```powershell
cd backend
.\venv\Scripts\Activate
python -c "import sys; print(sys.executable)"
# Should show: ...\backend\venv\Scripts\python.exe
```

### Frontend
```powershell
cd frontend
npm list --depth=0
# Shows local packages only
```

---

## Troubleshooting

### Backend won't start
```powershell
cd backend
.\venv\Scripts\Activate  # ALWAYS FIRST
pip install -r requirements.txt
python run.py
```

### Frontend won't connect
```powershell
# Edit frontend/src/services/api.js
# Android emulator: http://10.0.2.2:5000/api
# Physical device: http://YOUR_IP:5000/api
```

### Get your IP
```powershell
ipconfig
# Look for IPv4 Address
```

---

## File Structure
```
ee4002d/
├── backend/
│   ├── venv/          ← Isolated Python
│   ├── .env           ← Your API keys
│   ├── run.py         ← Start here
│   └── requirements.txt
└── frontend/
    ├── node_modules/  ← Isolated Node
    ├── App.js
    └── package.json
```

---

## Quick Checks

✅ Backend running? → http://localhost:5000/health  
✅ venv activated? → See `(venv)` in prompt  
✅ Gemini key added? → Check `backend\.env`  
✅ Database created? → `psql -l | findstr fitness`  

---

## URLs
- Backend API: http://localhost:5000
- Expo Dev Tools: http://localhost:19002
- Gemini API Key: https://makersuite.google.com/app/apikey

---

## Important Reminder

**ALWAYS activate venv before backend commands:**
```powershell
cd backend
.\venv\Scripts\Activate  # ← CRITICAL!
# Now run your commands
```

---

## Cost
**$0/month** 🎉
- Google Gemini: 1500 req/day FREE
- PostgreSQL: Open source FREE
- Everything else: FREE

---

## Documentation
- Main: `README.md`
- Setup: `SETUP_GUIDE.md`
- Isolation: `ENVIRONMENT_ISOLATION.md`
- Backend: `backend/README.md`
- Frontend: `frontend/README.md`

---

**Happy coding! 💪**
