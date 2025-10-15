# Fitness Companion - Complete Isolated Setup Script for Windows
# This script creates ISOLATED environments to avoid dependency conflicts
# Run this script in PowerShell Administrator mode (recommended)

Write-Host "========================================" -ForegroundColor Green
Write-Host "Fitness Companion - Isolated Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "This script will create ISOLATED environments:" -ForegroundColor Cyan
Write-Host "  - Python virtual environment (backend/venv/)" -ForegroundColor Cyan
Write-Host "  - Node.js local modules (frontend/node_modules/)" -ForegroundColor Cyan
Write-Host "  - No global package installations" -ForegroundColor Cyan
Write-Host "  - No dependency conflicts with other projects" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = py --version 2>&1
    Write-Host "OK Python installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR Python not found. Please install Python 3.10+ from https://www.python.org/" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "OK Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
try {
    $pgVersion = psql --version 2>&1
    Write-Host "OK PostgreSQL installed: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "WARNING PostgreSQL not found. Install from https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "  Or use Docker: docker run --name fitness-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Step 2: Setting up ISOLATED Backend..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Backend setup
Set-Location backend

# Remove old venv if exists
if (Test-Path venv) {
    Write-Host "WARNING Removing old virtual environment..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force venv
}

# Create fresh virtual environment
Write-Host "Creating NEW Python virtual environment (isolated)..." -ForegroundColor Yellow
py -m venv venv

Write-Host "OK Virtual environment created at backend/venv/" -ForegroundColor Green
Write-Host "  This is ISOLATED from your global Python packages" -ForegroundColor Cyan

# Install dependencies using venv's pip directly
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
.\venv\Scripts\pip.exe install -r requirements.txt

# Copy .env file
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "IMPORTANT: Edit backend/.env and add your Gemini API key" -ForegroundColor Yellow
    Write-Host "  Get free key from: https://makersuite.google.com/app/apikey" -ForegroundColor Yellow
} else {
    Write-Host "OK .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "OK Backend setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Step 3: Setting up ISOLATED Frontend..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Go to frontend
Set-Location ../frontend

# Install Node dependencies (locally in node_modules/)
Write-Host "Installing Node.js dependencies locally (this may take 3-5 minutes)..." -ForegroundColor Yellow
Write-Host "  All packages will be in frontend/node_modules/ (isolated)" -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "OK Frontend setup complete!" -ForegroundColor Green
Write-Host "  All packages installed in frontend/node_modules/ (isolated)" -ForegroundColor Cyan
Write-Host ""

# Return to project root
Set-Location ..

Write-Host "========================================" -ForegroundColor Green
Write-Host "Step 4: Environment Verification" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Checking isolated environments..." -ForegroundColor Yellow
Write-Host ""

# Check backend venv
if (Test-Path backend/venv/Scripts/python.exe) {
    Write-Host "OK Backend virtual environment: READY" -ForegroundColor Green
    Write-Host "  Location: backend/venv/" -ForegroundColor Cyan
} else {
    Write-Host "ERROR Backend virtual environment: NOT FOUND" -ForegroundColor Red
}

# Check frontend node_modules
if (Test-Path frontend/node_modules) {
    Write-Host "OK Frontend node_modules: READY" -ForegroundColor Green
    Write-Host "  Location: frontend/node_modules/" -ForegroundColor Cyan
} else {
    Write-Host "ERROR Frontend node_modules: NOT FOUND" -ForegroundColor Red
}

# Check .env files
if (Test-Path backend/.env) {
    Write-Host "OK Backend .env file: EXISTS" -ForegroundColor Green
} else {
    Write-Host "WARNING Backend .env file: NEEDS CONFIGURATION" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "OK ISOLATED Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your environments are ISOLATED:" -ForegroundColor Cyan
Write-Host "  OK Backend uses backend/venv/ (no global Python pollution)" -ForegroundColor Green
Write-Host "  OK Frontend uses frontend/node_modules/ (local packages only)" -ForegroundColor Green
Write-Host "  OK No conflicts with other projects" -ForegroundColor Green
Write-Host ""
Write-Host "Total Cost: ZERO (100 percent FREE)" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "NEXT STEPS (IMPORTANT):" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Get FREE Gemini API Key:" -ForegroundColor Cyan
Write-Host "   https://makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host ""
Write-Host "2. Edit backend/.env and add your key:" -ForegroundColor Cyan
Write-Host "   notepad backend\.env" -ForegroundColor White
Write-Host "   GEMINI_API_KEY=your-key-here" -ForegroundColor White
Write-Host ""
Write-Host "3. Create database:" -ForegroundColor Cyan
Write-Host "   createdb fitness_companion" -ForegroundColor White
Write-Host "   OR use Docker: docker run --name fitness-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres" -ForegroundColor White
Write-Host ""
Write-Host "4. Start Backend (Terminal 1):" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   .\venv\Scripts\Activate" -ForegroundColor Green
Write-Host "   flask db init" -ForegroundColor White
Write-Host "   flask db migrate -m 'Initial'" -ForegroundColor White
Write-Host "   flask db upgrade" -ForegroundColor White
Write-Host "   flask seed-db" -ForegroundColor White
Write-Host "   python run.py" -ForegroundColor White
Write-Host ""
Write-Host "5. Start Frontend (Terminal 2):" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "IMPORTANT: Always activate venv first!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Before running backend commands, ALWAYS run:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  .\venv\Scripts\Activate" -ForegroundColor Green
Write-Host "  # You'll see (venv) in your prompt" -ForegroundColor Gray
Write-Host ""
Write-Host "Read SETUP_GUIDE.md for detailed instructions!" -ForegroundColor Yellow
Write-Host ""
