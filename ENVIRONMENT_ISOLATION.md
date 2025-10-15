# Environment Isolation Guide

## 🔒 Why Isolated Environments?

**Problem**: Installing Python packages globally can:
- Conflict with other projects
- Break system Python packages
- Cause version mismatches
- Make projects non-portable

**Solution**: Use virtual environments (isolated sandboxes)

---

## 🎯 What This Project Uses

### Backend (Python)
- **Virtual Environment**: `backend/venv/`
- **Isolation Method**: Python's built-in `venv` module
- **Packages Installed In**: `backend/venv/Lib/site-packages/`
- **Python Executable**: `backend/venv/Scripts/python.exe`
- **Global Python**: Completely untouched ✓

### Frontend (Node.js)
- **Local Modules**: `frontend/node_modules/`
- **Isolation Method**: npm's default behavior (local install)
- **Packages Installed In**: `frontend/node_modules/`
- **Global npm**: Completely untouched ✓

---

## ✅ How Isolation Works

### Before Setup (Your System)
```
C:\
├── Python\                      (Your global Python)
│   └── Lib\site-packages\      (Your global packages - UNTOUCHED)
├── Users\YourName\AppData\
│   └── npm\                     (Your global npm - UNTOUCHED)
└── Your\Other\Projects\         (Other projects - UNAFFECTED)
```

### After Setup (Isolated)
```
ee4002d\
├── backend\
│   ├── venv\                    (ISOLATED Python environment)
│   │   ├── Scripts\
│   │   │   └── python.exe       (This project's Python)
│   │   └── Lib\
│   │       └── site-packages\   (This project's packages ONLY)
│   ├── app\
│   └── requirements.txt
│
└── frontend\
    ├── node_modules\            (ISOLATED Node packages)
    │   └── (all dependencies)   (This project's packages ONLY)
    ├── src\
    └── package.json
```

---

## 🚀 How to Use Isolated Environments

### Backend (Always Activate venv First!)

**WRONG** ❌:
```powershell
cd backend
python run.py  # Uses GLOBAL Python (wrong packages!)
```

**CORRECT** ✅:
```powershell
cd backend
.\venv\Scripts\Activate  # Activate isolated environment
# You'll see (venv) in your prompt
python run.py            # Uses ISOLATED Python (correct packages!)
```

**Visual Indicator**:
```powershell
# Before activation
PS C:\Users\Liawa\OneDrive\Documents\ee4002d\backend>

# After activation (notice (venv) prefix)
(venv) PS C:\Users\Liawa\OneDrive\Documents\ee4002d\backend>
```

### Frontend (Automatic Isolation)

**No activation needed** - npm always uses local `node_modules/` first:
```powershell
cd frontend
npm start  # Automatically uses frontend/node_modules/
```

---

## 🛠️ Common Commands

### Backend Virtual Environment

```powershell
# Activate (do this EVERY TIME you open a new terminal)
cd backend
.\venv\Scripts\Activate

# Install packages (inside venv)
pip install package-name

# List installed packages (isolated)
pip list

# Deactivate (exit isolated environment)
deactivate

# Delete and recreate (if corrupted)
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
```

### Frontend Node Modules

```powershell
# Install packages (local by default)
cd frontend
npm install package-name

# List installed packages
npm list --depth=0

# Reinstall all (if corrupted)
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

---

## 🔍 Verify Isolation

### Check Backend is Isolated

```powershell
cd backend
.\venv\Scripts\Activate

# This should show the venv path
python -c "import sys; print(sys.executable)"
# Output: C:\Users\Liawa\OneDrive\Documents\ee4002d\backend\venv\Scripts\python.exe

# This should show ONLY packages in requirements.txt
pip list
```

### Check Frontend is Isolated

```powershell
cd frontend

# This lists local packages only
npm list --depth=0
```

---

## ⚠️ Common Mistakes

### Mistake 1: Forgetting to Activate venv
```powershell
# WRONG
cd backend
python run.py  # Uses global Python!

# CORRECT
cd backend
.\venv\Scripts\Activate  # See (venv) in prompt
python run.py
```

### Mistake 2: Installing Packages Globally
```powershell
# WRONG (installs globally)
pip install flask

# CORRECT (installs in venv)
cd backend
.\venv\Scripts\Activate
pip install flask
```

### Mistake 3: Using Wrong Python
```powershell
# Check which Python you're using
(venv) PS> python -c "import sys; print(sys.executable)"

# Should output: C:\...\ee4002d\backend\venv\Scripts\python.exe
# NOT: C:\Python311\python.exe (global)
```

---

## 🎓 Quick Reference

### Every Time You Work on Backend:
1. Open PowerShell
2. `cd C:\Users\Liawa\OneDrive\Documents\ee4002d\backend`
3. `.\venv\Scripts\Activate` ← **CRITICAL STEP**
4. See `(venv)` in prompt? Good!
5. Run your commands: `python run.py`, `flask db migrate`, etc.

### Every Time You Work on Frontend:
1. Open PowerShell
2. `cd C:\Users\Liawa\OneDrive\Documents\ee4002d\frontend`
3. `npm start` (no activation needed)

---

## 🧪 Test Isolation

Run these commands to verify your environments are isolated:

```powershell
# Test 1: Backend isolation
cd backend
.\venv\Scripts\Activate
python -c "import flask; print('Flask version:', flask.__version__)"
# Should work (Flask installed in venv)

deactivate
python -c "import flask; print('Flask version:', flask.__version__)"
# Should fail if Flask not in global Python (good!)

# Test 2: Frontend isolation
cd frontend
npm list flask --depth=0
# Should show local packages only

# Test 3: No global pollution
pip list --user
# Should NOT show Flask, SQLAlchemy, etc. (if you didn't have them before)
```

---

## 📦 What's Installed Where?

### Backend Packages (in venv only)
```
backend/venv/Lib/site-packages/
├── flask/
├── sqlalchemy/
├── flask_jwt_extended/
├── google.generativeai/
└── ... (all from requirements.txt)
```

### Frontend Packages (local only)
```
frontend/node_modules/
├── react/
├── react-native/
├── expo/
├── axios/
└── ... (all from package.json)
```

### Your Global Python (UNTOUCHED)
```
C:\Python311\Lib\site-packages\
└── (whatever you had before - unchanged)
```

---

## 🔄 Recreate Environments (if needed)

### Backend

```powershell
cd backend

# Remove old
Remove-Item -Recurse -Force venv

# Create new
python -m venv venv
.\venv\Scripts\Activate

# Reinstall
pip install -r requirements.txt
```

### Frontend

```powershell
cd frontend

# Remove old
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Reinstall
npm install
```

---

## ✅ Benefits of Isolation

1. **No Conflicts**: Each project has its own packages
2. **Reproducible**: `requirements.txt` + `package.json` = exact environment
3. **Safe**: Can delete entire project without breaking other projects
4. **Portable**: Works on any machine with Python + Node.js
5. **Clean**: No global package pollution

---

## 🆘 Troubleshooting

### "Module not found" error (Backend)
**Cause**: venv not activated or package not installed

**Fix**:
```powershell
cd backend
.\venv\Scripts\Activate  # See (venv) in prompt?
pip install -r requirements.txt
```

### "Cannot find module" error (Frontend)
**Cause**: node_modules missing or corrupted

**Fix**:
```powershell
cd frontend
npm install
```

### "Wrong Python version" error
**Cause**: Using global Python instead of venv

**Fix**:
```powershell
cd backend
.\venv\Scripts\Activate
python --version  # Should match version used to create venv
```

---

## 📚 Learn More

- Python venv: https://docs.python.org/3/library/venv.html
- npm local packages: https://docs.npmjs.com/downloading-and-installing-packages-locally
- Virtual environments guide: https://realpython.com/python-virtual-environments-a-primer/

---

**Remember**: Always activate `venv` before working on backend! 🔒
