@echo off
REM === Start all ZombieCoder servers in a single window ===

REM Set base directory to project root
cd /d %~dp0..

REM Start Python Backend
cd ai
start /b cmd /c "python server\app.py > ..\logs\python_backend.log 2>&1"

REM Start MCP Dispatcher (set PYTHONPATH to current dir for import fix)
set PYTHONPATH=%cd%
start /b cmd /c "python server\mcp\dispatcher.py > ..\logs\mcp_dispatcher.log 2>&1"

REM Start Laravel API
cd ..\laravel-api
start /b cmd /c "php artisan serve --port=8001 > ..\logs\laravel_api.log 2>&1"

REM Start Ollama Server (if not already running)
cd ..
start /b cmd /c "ollama serve > logs\ollama.log 2>&1"

REM Return to powershell folder
cd powershell

REM Print status
@echo ===============================
@echo All servers are starting in background within this window.
@echo Check logs in the logs/ folder for output/errors.
@echo Open powershell\server_status.html in your browser to see live status.
@echo ===============================
@echo Press Ctrl+C to stop all servers in this window. 