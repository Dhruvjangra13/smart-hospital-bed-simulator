@echo off
echo =====================================================================
echo  PULSE-TWIN: Smart Hospital Bed & Patient Deterioration Simulator
echo =====================================================================
echo Starting FastAPI Backend (Port 8000)...
start "PulseTwin Backend" cmd /k "cd backend && python run.py"

echo Starting Vite React Frontend (Port 5173)...
start "PulseTwin Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =====================================================================
echo  Services launched!
echo  Backend API & Swagger: http://localhost:8000/docs
echo  Frontend Dashboard:    http://localhost:5173
echo =====================================================================
