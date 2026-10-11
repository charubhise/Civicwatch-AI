@echo off
echo ========================================================
echo   Launching CivicWatch-AI Platform (Backend + Frontend)
echo ========================================================
cd /d "%~dp0"
start "CivicWatch Backend (FastAPI)" cmd /c "start-backend.bat"
timeout /t 3 /nobreak >nul
start "CivicWatch Frontend (Vite)" cmd /c "start-frontend.bat"
echo.
echo Systems are booting up:
echo   - Backend API & Docs: http://localhost:8000/docs
echo   - Frontend Application: http://localhost:5173
echo.
pause
