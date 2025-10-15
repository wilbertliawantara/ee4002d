# Fitness Companion Frontend

React Native mobile app for AI-powered fitness coaching with pose detection.

## 💰 Cost: **100% FREE**

- Expo (FREE)
- React Native (FREE)
- All dependencies (FREE)

---

## 🚀 Quick Start (Windows)

### Prerequisites

1. **Node.js 18+**
   ```powershell
   node --version
   ```
   Install from: https://nodejs.org/

2. **Expo CLI**
   ```powershell
   npm install -g expo-cli
   ```

3. **Expo Go App** on your phone (iOS/Android)
   - Download from App Store or Google Play

### Installation

1. **Navigate to frontend folder**
   ```powershell
   cd C:\Users\Liawa\OneDrive\Documents\ee4002d\frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Update API endpoint**
   
   Open `src/services/api.js` and update `API_BASE_URL`:
   
   - For Android emulator: `http://10.0.2.2:5000/api`
   - For iOS simulator: `http://localhost:5000/api`
   - For physical device: `http://YOUR_COMPUTER_IP:5000/api`
     (Find your IP: `ipconfig` in PowerShell, look for IPv4)

4. **Start the app**
   ```powershell
   npm start
   ```

5. **Run on device**
   - Scan the QR code with Expo Go app
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator (Mac only)
   - Or press `w` for web browser

---

## 📱 Features

### 🏠 Home Screen
- Daily motivation from AI
- Workout statistics
- Quick action buttons
- Active habit tracker

### 💬 AI Chat
- Context-aware fitness coaching
- Powered by Google Gemini (FREE)
- Conversation history
- Personalized advice

### 📸 Camera Workout (Demo)
- Pose detection placeholder
- Real-time form feedback
- Rep counting
- Form scoring

**Next steps for pose detection:**
1. Install MediaPipe or TensorFlow Lite
2. Integrate with `react-native-vision-camera`
3. Process keypoints for form analysis

### ✏️ Manual Workout
- Log exercises without camera
- Track sets, reps, duration
- Add custom notes
- Syncs to habit tracker

### 📅 Habit Tracker
- Create workout habits
- Track streaks
- Set schedules
- Push reminders (future)

---

## 🛠️ Project Structure

```
frontend/
├── App.js                    # Main entry point
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js    # Auth screen
│   │   ├── HomeScreen.js     # Dashboard
│   │   ├── ChatScreen.js     # AI chat
│   │   ├── CameraWorkoutScreen.js
│   │   ├── ManualWorkoutScreen.js
│   │   └── HabitsScreen.js
│   ├── services/
│   │   └── api.js            # API client (Axios)
│   └── components/           # Reusable components
├── app.json                  # Expo config
├── package.json              # Dependencies
└── README.md
```

---

## 🔌 Backend Integration

The app connects to the Flask backend at `http://localhost:5000/api`.

**Make sure backend is running:**
```powershell
cd C:\Users\Liawa\OneDrive\Documents\ee4002d\backend
.\venv\Scripts\Activate
python run.py
```

**API Endpoints used:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Sign up
- `GET /api/workouts/stats` - Get stats
- `POST /api/llm/chat` - Chat with AI
- `GET /api/llm/motivation` - Daily motivation
- `POST /api/workouts/sessions` - Log workout
- `GET /api/habits/` - Get habits
- `POST /api/habits/:id/complete` - Complete habit

---

## 📦 Dependencies

```json
{
  "expo": "~50.0.0",
  "react-native": "0.73.0",
  "axios": "^1.6.2",
  "@react-navigation/native": "^6.1.9",
  "expo-camera": "~14.0.0"
}
```

All dependencies are **FREE and open-source**.

---

## 🎨 Customization

### Change Colors
Edit styles in each screen file. Main colors:
- Green (`#4CAF50`) - Primary/Workouts
- Orange (`#FF9800`) - AI Chat
- Blue (`#2196F3`) - Manual workouts
- Purple (`#9C27B0`) - Habits

### Add Screens
1. Create in `src/screens/`
2. Import in `App.js`
3. Add to Stack.Navigator

---

## 🐛 Troubleshooting

### Cannot connect to backend
- Check backend is running: `http://localhost:5000/health`
- Update IP address in `src/services/api.js`
- Disable firewall temporarily
- For Android emulator, use `10.0.2.2` instead of `localhost`

### Expo errors
```powershell
# Clear cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Camera permission errors
- Grant camera permissions in device settings
- Restart Expo Go app

---

## 📲 Building for Production

### Android APK (FREE)
```powershell
expo build:android
```

### iOS IPA (requires Apple Developer account, $99/year)
```powershell
expo build:ios
```

### Using EAS Build (FREE tier available)
```powershell
npm install -g eas-cli
eas build --platform android
```

---

## 🚀 Next Steps

### Add Pose Detection
1. Install vision camera:
   ```powershell
   npx expo install react-native-vision-camera
   ```

2. Install MediaPipe (or TensorFlow Lite)

3. Update `CameraWorkoutScreen.js` with real pose detection

### Add Push Notifications
1. Install expo-notifications:
   ```powershell
   npx expo install expo-notifications
   ```

2. Integrate with habit reminders

### Add Offline Support
- Use Redux/Context for state management
- Cache workouts locally
- Sync when online

---

## 🆓 Completely Free Stack

- Development: FREE
- Testing: FREE (Expo Go)
- Building: FREE (EAS Build free tier)
- Hosting backend: FREE (Render/Railway)
- LLM: FREE (Google Gemini 1500 req/day)
- Database: FREE (local PostgreSQL or Supabase)

**Total cost: $0** 🎉

---

## 📄 License

MIT

---

## 🆘 Support

- Expo docs: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/
- React Native: https://reactnative.dev/
