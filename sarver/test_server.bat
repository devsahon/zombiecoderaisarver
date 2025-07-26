@echo off
REM Stop existing Python processes
taskkill /F /IM python.exe 2>NUL

REM Create and activate virtual environment
if not exist .venv (
    echo Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate
)

REM Start MCP system
echo Starting MCP system...
start "MCP Server" cmd /c "%~dp0.venv\Scripts\python.exe app.py"

REM Wait for server to start
echo Waiting for server to start...
timeout /t 10

REM Run endpoint tests
echo Running endpoint tests...
%~dp0.venv\Scripts\python.exe test_endpoints.py

echo.
echo Press any key to stop the server...
pause >nul

REM Stop the server
taskkill /F /IM python.exe 2>NUL
