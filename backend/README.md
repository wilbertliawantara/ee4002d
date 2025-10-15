# Fitness Companion Backend

Flask-based REST API for the Fitness Companion app with AI-powered coaching and pose detection.

## 💰 Cost: **100% FREE for Development**

- **Database**: PostgreSQL (local or free tier hosting)
- **LLM**: Google Gemini API (1500 requests/day FREE)
- **Alternative LLM**: Ollama (completely free, runs locally)

---

## 🚀 Quick Start (Windows)

### Prerequisites

1. **Python 3.10+**
   ```powershell
   python --version
   ```

2. **PostgreSQL** (choose one):
   - Install locally: https://www.postgresql.org/download/windows/
   - Or use Docker:
     ```powershell
     docker run --name fitness-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
     ```

3. **Git** (already installed)

### Installation

1. **Navigate to backend folder**
   ```powershell
   cd C:\Users\Liawa\OneDrive\Documents\ee4002d\backend
   ```

2. **Create virtual environment**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate
   ```

3. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```powershell
   cp .env.example .env
   ```

5. **Edit `.env` file**
   - Get FREE Gemini API key: https://makersuite.google.com/app/apikey
   - Update `GEMINI_API_KEY` in `.env`

6. **Create database**
   ```powershell
   # If using local PostgreSQL
   createdb fitness_companion
   
   # Or connect to PostgreSQL and run:
   # CREATE DATABASE fitness_companion;
   ```

7. **Initialize database**
   ```powershell
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

8. **Seed with sample data (optional)**
   ```powershell
   flask seed-db
   ```

9. **Run the server**
   ```powershell
   python run.py
   ```

   Server will start at: `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile

### Workouts
- `GET /api/workouts/routines` - Get workout routines
- `POST /api/workouts/routines` - Create routine
- `GET /api/workouts/sessions` - Get workout sessions
- `POST /api/workouts/sessions` - Log workout session
- `GET /api/workouts/stats` - Get workout statistics

### LLM Chat (AI Coach)
- `POST /api/llm/chat` - Send message to AI coach
- `GET /api/llm/motivation` - Get motivational message
- `GET /api/llm/history` - Get conversation history

### Pose Detection
- `POST /api/pose/analyze` - Analyze pose data
- `GET /api/pose/session/<id>/analyses` - Get session analyses
- `POST /api/pose/feedback` - Get real-time feedback

### Habit Tracker
- `GET /api/habits/` - Get all habits
- `POST /api/habits/` - Create habit
- `POST /api/habits/<id>/complete` - Mark habit complete
- `GET /api/habits/reminders/upcoming` - Get upcoming reminders

---

## 🧪 Testing

### Test API with curl

```powershell
# Register
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{\"email\":\"test@test.com\",\"password\":\"test123\",\"username\":\"testuser\"}'

# Login
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"test@test.com\",\"password\":\"test123\"}'

# Chat with AI (replace TOKEN with access_token from login)
curl -X POST http://localhost:5000/api/llm/chat -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -d '{\"message\":\"Give me a workout tip\"}'
```

---

## 🆓 Using Free LLM Options

### Option 1: Google Gemini (Recommended)
- **Cost**: 1500 requests/day FREE
- **Setup**: Get API key from https://makersuite.google.com/app/apikey
- **Quality**: Excellent

### Option 2: Ollama (Completely Free)
- **Cost**: $0 (runs locally)
- **Setup**:
  ```powershell
  # Install Ollama from https://ollama.ai
  winget install Ollama.Ollama
  
  # Pull Llama model
  ollama pull llama3.1:8b
  
  # Update .env
  USE_OLLAMA=true
  ```
- **Quality**: Good (uses Meta's Llama 3.1)

---

## 🗃️ Database Schema

### Tables
- `users` - User accounts and profiles
- `workout_routines` - Workout templates
- `workout_sessions` - Completed workouts
- `pose_analyses` - Pose detection results
- `habits` - Habit tracking
- `llm_conversations` - AI chat history

---

## 🔧 Development Commands

```powershell
# Activate virtual environment
.\venv\Scripts\Activate

# Run dev server
python run.py

# Database migrations
flask db migrate -m "Description"
flask db upgrade

# Initialize database
flask init-db

# Seed sample data
flask seed-db

# Run tests
pytest
```

---

## 📦 Deployment (Free Options)

### Option 1: Render.com (Free Tier)
- 750 hours/month FREE
- Auto-deploy from GitHub
- Guide: https://render.com/docs/deploy-flask

### Option 2: Railway.app (Free Tier)
- $5 credit/month FREE
- PostgreSQL included
- Guide: https://docs.railway.app/deploy/deployments

### Option 3: Fly.io (Free Tier)
- 3 VMs FREE
- PostgreSQL included
- Guide: https://fly.io/docs/languages-and-frameworks/python/

---

## 🐛 Troubleshooting

### Database connection error
```powershell
# Make sure PostgreSQL is running
# Check connection string in .env
# Default: postgresql://postgres:postgres@localhost:5432/fitness_companion
```

### Import errors
```powershell
# Make sure virtual environment is activated
.\venv\Scripts\Activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Gemini API errors
- Verify API key is correct in `.env`
- Check free tier quota: https://ai.google.dev/pricing
- Fallback: Set `USE_OLLAMA=true` for offline LLM

---

## 📄 License

MIT

---

## 🆘 Support

For issues, check:
- Flask docs: https://flask.palletsprojects.com/
- SQLAlchemy docs: https://docs.sqlalchemy.org/
- Gemini API docs: https://ai.google.dev/docs
