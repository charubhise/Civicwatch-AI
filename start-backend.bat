@echo off
echo ========================================================
echo   Starting CivicWatch-AI Backend (FastAPI on Port 8000)
echo ========================================================
cd /d "%~dp0"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
