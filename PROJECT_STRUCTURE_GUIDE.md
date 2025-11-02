# 📱 Fitness Companion App - Project Structure Guide
**Simple Explanation for Presentation**

---

## 🎯 What Does This App Do?

A mobile fitness app that helps users:
1. **Track workouts** - Log exercises, sets, reps
2. **Build habits** - Create and track fitness habits with streaks
3. **Chat with AI** - Get fitness advice from an AI coach (Google Gemini)
4. **Monitor progress** - View statistics and workout history

---

## 🏗️ Architecture Overview (3-Tier System)

```
┌─────────────────────────┐
│   MOBILE APP (FRONTEND) │  ← What users see and interact with
│   React Native + Expo   │
└────────────┬────────────┘
             │
             │ HTTP Requests (JSON)
             │ 
┌────────────▼────────────┐
│   BACKEND (API SERVER)  │  ← Handles business logic
│   Flask (Python)        │
└────────────┬────────────┘
             │
             │ SQL Queries
             │
┌────────────▼────────────┐
│   DATABASE              │  ← Stores all data
│   PostgreSQL            │
└─────────────────────────┘
```

**Think of it like a restaurant:**
- **Frontend** = Waiter (takes your order, shows you the menu)
- **Backend** = Kitchen (processes your order)
- **Database** = Storage room (keeps ingredients/data)

---

## 📁 Project Structure

```
ee4002d/
├── backend/          ← Python Flask server (API)
├── frontend/         ← React Native mobile app
└── (documentation files)
```

---

## 🔧 BACKEND Structure (Python Flask)

### **File Organization**

```
backend/
├── run.py                    ← START HERE: Entry point (runs the server)
├── config.py                 ← Settings (database URL, API keys)
├── requirements.txt          ← List of Python libraries needed
│
├── app/                      ← Main application folder
│   ├── __init__.py          ← Creates the Flask app
│   ├── models.py            ← Database tables (User, Workout, etc.)
│   │
│   ├── routes/              ← API endpoints (like restaurant menu items)
│   │   ├── auth.py         ← Login, register, profile
│   │   ├── workouts.py     ← Workout tracking
│   │   ├── habits.py       ← Habit tracking
│   │   ├── llm.py          ← AI chat
│   │   └── pose.py         ← Camera pose detection (future)
│   │
│   └── services/            ← Business logic (the "brain")
│       └── llm_service.py  ← Talks to Google Gemini AI
│
└── migrations/               ← Database version control
```

---

### **Key Backend Files Explained**

#### **1. run.py** (The Starting Point)
```python
# This file starts your server
# Run: python run.py
# Server starts at: http://localhost:5000

app = create_app()  # Creates the Flask application
app.run(port=5000)  # Starts listening for requests
```

**What it does:**
- Starts the web server
- Loads all the routes (API endpoints)
- Connects to the database

---

#### **2. config.py** (Settings File)
```python
# All configuration in one place
SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:180803@localhost:5432/fitness_companion'
GEMINI_API_KEY = 'your-api-key-here'
JWT_SECRET_KEY = 'secret-for-tokens'
```

**What it configures:**
- **Database connection** - Where to find PostgreSQL
- **API keys** - Google Gemini for AI chat
- **Security settings** - JWT token expiration times
- **Upload folders** - Where to save files

---

#### **3. models.py** (Database Blueprint)

This defines what data looks like in the database.

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.String(255))
    fitness_level = db.Column(db.String(20))
```

**Think of models as Excel spreadsheet templates:**

| Table Name | What It Stores | Key Fields |
|------------|----------------|------------|
| **users** | User accounts | email, password, fitness_level |
| **workout_sessions** | Completed workouts | exercises, duration, calories |
| **habits** | Fitness habits | name, current_streak, total_completions |
| **llm_conversations** | Chat history | user_message, ai_response |
| **workout_routines** | Saved workout plans | name, exercises, difficulty |

**Important Methods:**
- `set_password()` - Encrypts password (security!)
- `check_password()` - Verifies login
- `to_dict()` - Converts database row to JSON for API

---

#### **4. routes/auth.py** (Login & Registration)

Handles user authentication (who you are).

```python
@bp.route('/register', methods=['POST'])
def register():
    # 1. Get email, password from request
    # 2. Check if email already exists
    # 3. Create new user in database
    # 4. Return JWT token (like a VIP pass)
```

**API Endpoints:**
| Method | URL | What It Does | Returns |
|--------|-----|--------------|---------|
| POST | `/api/auth/register` | Create new account | User + JWT token |
| POST | `/api/auth/login` | Login existing user | User + JWT token |
| GET | `/api/auth/me` | Get current user profile | User info |
| PUT | `/api/auth/me` | Update profile | Updated user |

**JWT Token = Digital ID Card**
- Created when you login
- Sent with every request (like showing your ID)
- Expires after 24 hours (for security)

---

#### **5. routes/workouts.py** (Workout Tracking)

Manages workout routines and sessions.

```python
@bp.route('/sessions', methods=['POST'])
@jwt_required()  # Must be logged in!
def create_session():
    # 1. Get workout data (exercises, duration)
    # 2. Save to database
    # 3. Return saved session
```

**API Endpoints:**
| Method | URL | What It Does |
|--------|-----|--------------|
| GET | `/api/workouts/sessions` | Get workout history |
| POST | `/api/workouts/sessions` | Log new workout |
| GET | `/api/workouts/stats` | Get statistics (total workouts, streaks) |
| POST | `/api/workouts/routines` | Create workout template |

**Example Request:**
```json
POST /api/workouts/sessions
{
  "session_type": "manual",
  "duration_minutes": 45,
  "exercises_completed": [
    {"name": "Push-ups", "sets": 3, "reps": 15},
    {"name": "Squats", "sets": 4, "reps": 20}
  ],
  "notes": "Felt strong today!"
}
```

---

#### **6. routes/habits.py** (Habit Tracking)

Manages fitness habits and streaks.

```python
@bp.route('/habits/<int:id>/complete', methods=['POST'])
@jwt_required()
def complete_habit(id):
    # 1. Find the habit
    # 2. Update streak (if consecutive days)
    # 3. Mark as completed today
```

**API Endpoints:**
| Method | URL | What It Does |
|--------|-----|--------------|
| GET | `/api/habits/` | Get all habits |
| POST | `/api/habits/` | Create new habit |
| POST | `/api/habits/:id/complete` | Mark habit done today |
| DELETE | `/api/habits/:id` | Delete habit |

**Streak Logic:**
```
Day 1: Complete habit → Streak = 1
Day 2: Complete habit → Streak = 2
Day 3: Miss habit → Streak = 0
Day 4: Complete habit → Streak = 1
```

---

#### **7. services/llm_service.py** (AI Brain)

Integrates Google Gemini AI for fitness coaching.

```python
class LLMService:
    def generate_response(self, user_id, message):
        # 1. Get user's context (past workouts, goals)
        # 2. Build prompt for AI
        # 3. Send to Google Gemini API
        # 4. Return AI response
        # 5. Save conversation to database
```

**How It Works:**

1. **User asks:** "What's the best exercise for abs?"

2. **Service builds context:**
```
User: John Doe
Fitness Level: intermediate
Recent Workouts:
- 2025-11-01: 45 min, 300 cal
- 2025-10-30: 30 min, 200 cal

User Question: What's the best exercise for abs?
```

3. **Sends to Gemini API** (Google's AI)

4. **AI responds:**
```
For abs, I recommend:
1. Planks (hold 30-60s) - Engages entire core
2. Bicycle crunches (3 sets × 15 reps)
3. Leg raises (3 sets × 10 reps)

Start with planks—they're joint-friendly!
```

5. **Saves to database** (for conversation history)

**Why Google Gemini?**
- **FREE**: 1500 requests per day
- **Fast**: Responds in 1-2 seconds
- **Smart**: Understands fitness context

---

## 📱 FRONTEND Structure (React Native)

### **File Organization**

```
frontend/
├── App.js                    ← Main entry point
├── index.js                  ← Registers the app
├── package.json              ← Lists JavaScript libraries
│
└── src/
    ├── screens/              ← Each screen in the app
    │   ├── LoginScreen.js   ← Login page
    │   ├── HomeScreen.js    ← Dashboard (stats, quick actions)
    │   ├── ChatScreen.js    ← AI chat interface
    │   ├── ManualWorkoutScreen.js  ← Log workouts manually
    │   └── HabitsScreen.js  ← Manage habits
    │
    ├── components/           ← Reusable UI pieces (buttons, cards)
    ├── navigation/           ← Screen navigation setup
    └── services/
        └── api.js           ← Talks to backend (axios HTTP client)
```

---

### **Key Frontend Files Explained**

#### **1. App.js** (App Entry Point)
```javascript
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**What it does:**
- Sets up navigation between screens
- Loads the first screen (LoginScreen)
- Wraps everything in a container

---

#### **2. services/api.js** (Backend Communication)

This file handles ALL communication with the backend.

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {'Content-Type': 'application/json'}
});
```

**How It Works:**

**Step 1: Add JWT token automatically**
```javascript
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Step 2: Handle expired tokens**
```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired! Get a new one
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      // ... refresh logic
    }
  }
);
```

**API Functions (organized by feature):**

```javascript
// AUTH
authAPI.login(email, password)      → Login & get token
authAPI.register(data)              → Create account
authAPI.getCurrentUser()            → Get profile

// WORKOUTS
workoutsAPI.createSession(data)     → Log workout
workoutsAPI.getSessions()           → Get workout history
workoutsAPI.getStats()              → Get statistics

// AI CHAT
llmAPI.chat(message)                → Send message to AI
llmAPI.getMotivation()              → Get daily motivation

// HABITS
habitsAPI.getHabits()               → Get all habits
habitsAPI.completeHabit(id)         → Mark habit done today
```

---

#### **3. screens/LoginScreen.js**

```javascript
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // 1. Send email + password to backend
    const response = await authAPI.login(email, password);
    
    // 2. Save token to phone storage
    await AsyncStorage.setItem('access_token', response.access_token);
    
    // 3. Navigate to Home screen
    navigation.navigate('Home');
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
```

**Flow:**
1. User types email & password
2. Taps "Login" button
3. Calls backend `/api/auth/login`
4. Receives JWT token
5. Saves token to phone
6. Navigates to HomeScreen

---

#### **4. screens/HomeScreen.js** (Dashboard)

```javascript
function HomeScreen() {
  const [stats, setStats] = useState(null);
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    // Load data when screen opens
    loadData();
  }, []);

  const loadData = async () => {
    // Get workout statistics
    const statsData = await workoutsAPI.getStats();
    setStats(statsData);

    // Get AI motivation message
    const motivationMsg = await llmAPI.getMotivation();
    setMotivation(motivationMsg);
  };

  return (
    <View>
      <Text>Total Workouts: {stats?.total_sessions}</Text>
      <Text>Total Minutes: {stats?.total_minutes}</Text>
      <Text>{motivation}</Text>
      
      <Button title="Log Workout" onPress={...} />
      <Button title="Chat with AI" onPress={...} />
      <Button title="Track Habits" onPress={...} />
    </View>
  );
}
```

**What users see:**
- Workout statistics (total workouts, time, calories)
- AI motivational message
- Quick action buttons

---

#### **5. screens/ChatScreen.js** (AI Chat)

```javascript
function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const sendMessage = async () => {
    // 1. Add user message to chat
    setMessages([...messages, {role: 'user', content: inputText}]);

    // 2. Send to AI
    const response = await llmAPI.chat(inputText);

    // 3. Add AI response to chat
    setMessages([...messages, 
      {role: 'user', content: inputText},
      {role: 'assistant', content: response.message}
    ]);

    setInputText('');
  };

  return (
    <View>
      <ScrollView>
        {messages.map(msg => (
          <Text>{msg.role}: {msg.content}</Text>
        ))}
      </ScrollView>
      <TextInput value={inputText} onChangeText={setInputText} />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}
```

**Chat Flow:**
1. User types message
2. Frontend sends to `/api/llm/chat`
3. Backend sends to Google Gemini AI
4. AI responds with fitness advice
5. Frontend displays response

---

#### **6. screens/ManualWorkoutScreen.js** (Log Workouts)

```javascript
function ManualWorkoutScreen() {
  const [duration, setDuration] = useState('');
  const [exercises, setExercises] = useState([
    {name: '', sets: '', reps: ''}
  ]);

  const addExercise = () => {
    setExercises([...exercises, {name: '', sets: '', reps: ''}]);
  };

  const saveWorkout = async () => {
    const session = {
      session_type: 'manual',
      duration_minutes: parseInt(duration),
      exercises_completed: exercises,
      completed_at: new Date().toISOString()
    };

    await workoutsAPI.createSession(session);
    navigation.navigate('Home');
  };

  return (
    <View>
      <TextInput 
        placeholder="Duration (minutes)" 
        value={duration} 
        onChangeText={setDuration} 
      />
      
      {exercises.map((ex, index) => (
        <View key={index}>
          <TextInput placeholder="Exercise" value={ex.name} />
          <TextInput placeholder="Sets" value={ex.sets} />
          <TextInput placeholder="Reps" value={ex.reps} />
        </View>
      ))}
      
      <Button title="Add Exercise" onPress={addExercise} />
      <Button title="Save Workout" onPress={saveWorkout} />
    </View>
  );
}
```

**User Journey:**
1. Enter duration (e.g., 45 minutes)
2. Add exercises (Push-ups, 3 sets, 15 reps)
3. Tap "Save Workout"
4. Data sent to backend
5. Saved to PostgreSQL database
6. Return to Home screen (stats updated!)

---

## 🔄 Complete Request Flow Example

Let's trace what happens when a user logs a workout:

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION (Frontend - ManualWorkoutScreen.js)              │
│    User fills form:                                              │
│    - Duration: 45 minutes                                        │
│    - Exercises: Push-ups (3×15), Squats (4×20)                  │
│    - Taps "Save Workout" button                                 │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. API CALL (Frontend - api.js)                                 │
│    workoutsAPI.createSession({                                   │
│      session_type: 'manual',                                     │
│      duration_minutes: 45,                                       │
│      exercises_completed: [...]                                  │
│    })                                                            │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              │ HTTP POST Request
                              │ URL: http://localhost:5000/api/workouts/sessions
                              │ Headers: Authorization: Bearer <JWT_TOKEN>
                              │ Body: { session_type, duration_minutes, exercises }
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. BACKEND RECEIVES (Backend - routes/workouts.py)              │
│    @bp.route('/sessions', methods=['POST'])                      │
│    @jwt_required()  ← Checks JWT token is valid                 │
│    def create_session():                                         │
│        current_user_id = get_jwt_identity()  ← Get user ID      │
│        data = request.get_json()             ← Get workout data │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. VALIDATE & PROCESS (Backend - workouts.py)                   │
│    - Check required fields exist                                 │
│    - Verify user is logged in                                    │
│    - Parse ISO date format                                       │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. CREATE DATABASE RECORD (Backend - models.py)                 │
│    session = WorkoutSession(                                     │
│        user_id=1,                                                │
│        session_type='manual',                                    │
│        duration_minutes=45,                                      │
│        exercises_completed=[{...}]                               │
│    )                                                             │
│    db.session.add(session)                                       │
│    db.session.commit()  ← SAVE TO DATABASE                      │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 6. DATABASE STORES (PostgreSQL - workout_sessions table)        │
│                                                                  │
│    INSERT INTO workout_sessions (                                │
│        user_id, session_type, duration_minutes,                  │
│        exercises_completed, created_at                           │
│    ) VALUES (                                                    │
│        1, 'manual', 45,                                          │
│        '[{"name":"Push-ups","sets":3,"reps":15}]',              │
│        '2025-11-01 14:30:00'                                     │
│    ) RETURNING id;                                               │
│                                                                  │
│    Returns: id = 42                                              │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 7. BACKEND RESPONDS (Backend - workouts.py)                     │
│    return jsonify({                                              │
│        'message': 'Session created successfully',                │
│        'session': session.to_dict()  ← Convert to JSON          │
│    }), 201                                                       │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              │ HTTP Response
                              │ Status: 201 Created
                              │ Body: {"message": "...", "session": {...}}
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 8. FRONTEND RECEIVES (Frontend - ManualWorkoutScreen.js)        │
│    const response = await workoutsAPI.createSession(data);       │
│    // Success!                                                   │
│    navigation.navigate('Home');  ← Go back to home screen       │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 9. HOME SCREEN UPDATES (Frontend - HomeScreen.js)               │
│    useEffect(() => {                                             │
│        loadStats();  ← Fetch updated statistics                 │
│    });                                                           │
│                                                                  │
│    User sees:                                                    │
│    - Total Workouts: 43 (was 42, now 43!)                       │
│    - Total Minutes: 1,890 (was 1,845, now 1,890!)              │
└──────────────────────────────────────────────────────────────────┘
```

**Total Time:** < 1 second from tap to update!

---

## 🗄️ Database Tables (PostgreSQL)

### **Visual Database Schema**

```
┌─────────────────────┐
│       USERS         │  ← Master table (user accounts)
├─────────────────────┤
│ id (PK)             │
│ email               │
│ username            │
│ password_hash       │  ← Encrypted (bcrypt)
│ fitness_level       │
└──────────┬──────────┘
           │
           │ (One user has many...)
           │
    ┌──────┴──────┬────────────┬─────────────┐
    │             │            │             │
    ▼             ▼            ▼             ▼
┌────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐
│WORKOUTS│  │ HABITS  │  │   CHAT   │  │  POSES   │
│        │  │         │  │ MESSAGES │  │ (future) │
└────────┘  └─────────┘  └──────────┘  └──────────┘
```

### **Table Details**

**1. users**
```sql
id              → 1
email           → john@example.com
username        → john_doe
password_hash   → $2b$12$KpVN... (encrypted)
fitness_level   → intermediate
created_at      → 2025-10-15 08:30:00
```

**2. workout_sessions**
```sql
id                    → 42
user_id               → 1 (links to users table)
session_type          → manual
duration_minutes      → 45
exercises_completed   → [{"name":"Push-ups","sets":3,"reps":15}]
completed_at          → 2025-11-01 14:30:00
```

**3. habits**
```sql
id                → 7
user_id           → 1
name              → Morning stretch
frequency         → daily
current_streak    → 12 (days in a row!)
longest_streak    → 28
total_completions → 87
```

**4. llm_conversations**
```sql
id         → 123
user_id    → 1
role       → user
content    → What's the best exercise for abs?
timestamp  → 2025-11-01 14:30:00
```
```sql
id         → 124
user_id    → 1
role       → assistant
content    → For abs, I recommend planks...
timestamp  → 2025-11-01 14:30:02
```

---

## 🔐 Security (How We Keep Data Safe)

### **1. Password Encryption (bcrypt)**

```python
# Registration
user.set_password("mypassword123")
# Stores: $2b$12$KpVN7J3... (NOT the actual password!)

# Login
user.check_password("mypassword123")
# Returns: True (passwords match!)
```

**Why bcrypt?**
- If database is hacked, attackers see gibberish
- Each password gets a unique "salt" (random data)
- Takes 0.1 seconds to check (slow enough to prevent brute force)

### **2. JWT Tokens (Authentication)**

**When you login:**
```
1. Send email + password
2. Backend verifies password
3. Backend creates JWT token
4. Token = {user_id: 1, expires: 2025-11-02}
5. Backend signs token with secret key
6. Frontend stores token on phone
```

**Every request:**
```
1. Frontend adds token to request header
2. Backend verifies signature (is it real?)
3. Backend extracts user_id from token
4. Backend processes request for that user
```

**Token Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNjk4NzY5MDMyfQ.signature
│                                        │                                    │
Header (algorithm info)                  Payload (user_id, expiration)       Signature
```

### **3. CORS (Cross-Origin Security)**

```python
CORS(app, resources={r"/api/*": {"origins": "*"}})
```

**What it does:**
- Only allows requests from mobile app
- Prevents random websites from stealing data
- Checks Authorization header exists

### **4. Data Isolation**

```python
@jwt_required()  # Must be logged in
def get_workouts():
    user_id = get_jwt_identity()  # Get current user ID
    workouts = Workout.query.filter_by(user_id=user_id).all()
    # You can ONLY see YOUR workouts!
```

**Rule:** You can never access another user's data!

---

## 🚀 How to Run the Project

### **Step 1: Start Database**
```powershell
# PostgreSQL must be running
# Database: fitness_companion
# Password: 180803
```

### **Step 2: Start Backend (Terminal 1)**
```powershell
cd backend
.\venv\Scripts\Activate.ps1    # Activate virtual environment
python run.py                   # Start Flask server
# Server running at: http://localhost:5000
```

### **Step 3: Start Frontend (Terminal 2)**
```powershell
cd frontend
npm start                       # Start Expo
# Press 'w' for web browser
# Or scan QR code with Expo Go app
```

### **Step 4: Test It!**
1. Open app in browser or phone
2. Register new account
3. Login
4. Log a workout
5. Chat with AI
6. Track a habit

---

## 🎨 Design Patterns Used

### **1. MVC Pattern (Backend)**
```
Model      → models.py (database structure)
View       → JSON responses (what user sees)
Controller → routes/*.py (business logic)
```

### **2. API Client Pattern (Frontend)**
```
All backend calls in ONE file: api.js
Screens just call: workoutsAPI.createSession()
If backend URL changes → update ONE place!
```

### **3. Authentication Middleware**
```python
@jwt_required()  # Decorator pattern
def protected_route():
    # This runs ONLY if user is logged in
```

### **4. Service Layer Pattern**
```
Routes → Call Services → Services do complex logic
Example: llm_service handles ALL AI interactions
```

---

## 📊 Data Flow Examples

### **Example 1: User Logs In**
```
1. User: john@example.com, password123
   └→ Frontend: LoginScreen.js

2. POST /api/auth/login
   └→ Backend: routes/auth.py

3. Query database for email
   └→ PostgreSQL: users table

4. Check password hash matches
   └→ bcrypt.verify()

5. Create JWT token
   └→ JWT library (user_id=1, expires=24h)

6. Return token to frontend
   └→ {access_token: "eyJ...", user: {...}}

7. Store token on phone
   └→ AsyncStorage.setItem('access_token', ...)

8. Navigate to Home screen
   └→ HomeScreen.js
```

### **Example 2: AI Chat**
```
1. User types: "What exercise for abs?"
   └→ Frontend: ChatScreen.js

2. POST /api/llm/chat
   └→ Backend: routes/llm.py

3. Get user context (workouts, goals)
   └→ Database queries

4. Build AI prompt with context
   └→ llm_service.py

5. Send to Google Gemini API
   └→ External API call

6. Gemini responds
   └→ "For abs, I recommend planks..."

7. Save conversation to database
   └→ llm_conversations table

8. Return response to frontend
   └→ {message: "For abs...", tokens: 127}

9. Display in chat UI
   └→ Chat bubble appears!
```

---

## 🛠️ Key Technologies Explained

| Technology | What It Is | Why We Use It |
|------------|-----------|---------------|
| **Python** | Programming language | Easy to learn, great for AI |
| **Flask** | Web framework | Lightweight, simple REST API |
| **PostgreSQL** | Database | Free, handles JSON, reliable |
| **React Native** | Mobile framework | One codebase → iOS + Android |
| **Expo** | Development tool | No need for Xcode/Android Studio |
| **JWT** | Authentication | Stateless, mobile-friendly |
| **Google Gemini** | AI model | FREE 1500 requests/day |
| **Axios** | HTTP client | Easy API calls from frontend |
| **SQLAlchemy** | ORM library | Python code instead of SQL |
| **bcrypt** | Encryption | Secure password hashing |

---

## 💡 Common Questions for Presentation

### **Q: How does the app know who is logged in?**
**A:** JWT tokens! When you login, you get a token (like a VIP pass). Every request sends this token. Backend reads the token to know your user_id.

### **Q: Where is data stored?**
**A:** PostgreSQL database on your computer. Tables: users, workouts, habits, conversations.

### **Q: How does AI chat work?**
**A:** 
1. Your message goes to Flask backend
2. Backend adds context (your workouts, goals)
3. Backend sends to Google Gemini API
4. Gemini AI responds with fitness advice
5. Backend saves conversation and returns response

### **Q: Is it free?**
**A:** Yes! Google Gemini free tier = 1500 requests/day. PostgreSQL = free. Everything runs locally.

### **Q: What if backend crashes?**
**A:** Frontend shows error message. Data is safe in database. Restart backend and everything works again.

### **Q: Can I use this on iPhone and Android?**
**A:** Yes! React Native compiles to both. One codebase = two platforms.

### **Q: How are passwords stored?**
**A:** Never in plain text! We use bcrypt encryption. Even if database is stolen, passwords are gibberish.

### **Q: What's the difference between access_token and refresh_token?**
**A:**
- Access token: 24-hour pass (used for requests)
- Refresh token: 30-day pass (used to get new access token)
- If access token expires, use refresh token to get a new one

### **Q: Why separate frontend and backend?**
**A:**
- Frontend can be web, mobile, desktop
- Backend can serve multiple frontends
- Teams can work independently
- Easier to scale and maintain

---

## 🎓 Presentation Tips

### **Start with the Big Picture**
"This is a mobile fitness app with 3 main parts: a React Native frontend (what users see), a Flask backend (the brain), and a PostgreSQL database (memory)."

### **Use Analogies**
- Frontend = Restaurant waiter (takes orders, shows menu)
- Backend = Kitchen (processes orders)
- Database = Storage room (keeps ingredients)
- JWT token = VIP pass (proves who you are)
- API = Menu (list of things you can order)

### **Show the Flow**
Walk through one complete example:
"When you log a workout, the frontend sends data to the backend, the backend saves it to PostgreSQL, and then returns success. The home screen refreshes and shows your new stats!"

### **Highlight Key Code**
- Show `models.py` → "This is how we structure data"
- Show `auth.py` → "This is how login works"
- Show `api.js` → "This is how frontend talks to backend"

### **Demo Live**
1. Start backend: `python run.py`
2. Start frontend: `npm start`
3. Login → Log workout → See stats update → Chat with AI

### **Explain Why Not What**
Don't just say "We use PostgreSQL."
Say "We use PostgreSQL because it's free, handles JSON data well, and has ACID compliance for data safety."

---

## 📚 Quick Reference: Important Terms

| Term | Simple Explanation |
|------|-------------------|
| **API** | A menu of functions the backend provides |
| **REST** | A style of API (GET, POST, PUT, DELETE) |
| **JWT** | A secure token that proves who you are |
| **ORM** | Write Python instead of SQL for database |
| **JSON** | Text format for sending data (like `{name: "value"}`) |
| **Endpoint** | A URL that does something (like `/api/auth/login`) |
| **Route** | Backend function that handles an endpoint |
| **Model** | Blueprint for database table |
| **Migration** | Version control for database changes |
| **Middleware** | Code that runs before route (like `@jwt_required`) |
| **Async Storage** | Phone's local storage (like cookies) |
| **Interceptor** | Automatic code that runs on every request |
| **bcrypt** | Algorithm to encrypt passwords |
| **CORS** | Security that checks where requests come from |

---

## 🎯 Key Takeaways

1. **Three-Tier Architecture**: Frontend ↔ Backend ↔ Database
2. **RESTful API**: Clean, standard way to communicate
3. **JWT Authentication**: Secure, stateless login system
4. **AI Integration**: Google Gemini for free AI coaching
5. **Cross-Platform**: React Native = iOS + Android from one codebase
6. **Security First**: Encrypted passwords, token-based auth, data isolation
7. **Free Stack**: $0 cost (PostgreSQL + Gemini free tier)

---

## 📖 Files to Show in Presentation

1. **backend/run.py** - "This starts the server"
2. **backend/models.py** - "This defines our database tables"
3. **backend/routes/auth.py** - "This handles login/register"
4. **backend/services/llm_service.py** - "This talks to AI"
5. **frontend/src/services/api.js** - "This connects to backend"
6. **frontend/src/screens/HomeScreen.js** - "This is the main dashboard"

---

Good luck with your presentation! 🚀

Remember: Keep it simple, use analogies, and show how everything connects. Your audience doesn't need to understand every line of code—they need to understand the **flow** and **why** you made certain choices.
