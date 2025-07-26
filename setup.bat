@echo off
REM ZombieCoder AI Management System - Setup Script
REM For Windows users

echo 🚀 ZombieCoder AI Management System Setup
echo ==========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup Admin Panel
echo.
echo 📦 Setting up Admin Panel...
cd admin

REM Install Node.js dependencies
echo Installing Node.js dependencies...
call npm install

REM Create data directory
if not exist "data" mkdir data

REM Initialize database
echo Initializing database...
if exist "lib\database-schema.sql" (
    echo Database schema found. Database will be created on first run.
) else (
    echo ⚠️  Database schema not found. Please check lib\database-schema.sql
)

cd ..

REM Setup Server Services
echo.
echo 🐍 Setting up Server Services...
cd sarver

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies
echo Installing Python dependencies...

REM Install core dependencies
pip install flask flask-cors python-dotenv requests psutil websockets

REM Install voice server dependencies
cd voice-server
if exist "requirements.txt" (
    pip install -r requirements.txt
) else (
    echo Installing voice server dependencies...
    pip install flask flask-cors python-dotenv requests
)
cd ..

REM Install AI server dependencies
cd ai-server
if exist "requirements.txt" (
    pip install -r requirements.txt
) else (
    echo Installing AI server dependencies...
    pip install flask flask-cors python-dotenv requests
)
cd ..

REM Create logs directory
if not exist "logs" mkdir logs

echo.
echo ✅ Setup completed successfully!
echo.
echo 🎯 Next Steps:
echo 1. Start the admin panel:
echo    cd admin ^&^& npm run dev
echo.
echo 2. Start the main server:
echo    cd sarver ^&^& venv\Scripts\activate.bat ^&^& python simple_server.py
echo.
echo 3. Start the voice server ^(in new terminal^):
echo    cd sarver\voice-server ^&^& ..\venv\Scripts\activate.bat ^&^& python app.py
echo.
echo 4. Start the AI server ^(in new terminal^):
echo    cd sarver\ai-server ^&^& ..\venv\Scripts\activate.bat ^&^& python app.py
echo.
echo 🌐 Admin Panel: http://localhost:3000/admin
echo 👤 Username: admin
echo 🔑 Password: admin123
echo.
echo 📚 For more information, see README.md
pause 