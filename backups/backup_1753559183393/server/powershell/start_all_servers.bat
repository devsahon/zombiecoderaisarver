@echo off
REM === Start Python Backend ===
start "Python Backend" cmd /k "cd /d %~dp0..\ai && python server\app.py"

REM === Start MCP Dispatcher ===
start "MCP Dispatcher" cmd /k "cd /d %~dp0..\ai && python server\mcp\dispatcher.py"

REM === Start Laravel API ===
start "Laravel API" cmd /k "cd /d %~dp0..\laravel-api && php artisan serve --port=8001"

REM === Start Ollama Server (if not already running) ===
start "Ollama Server" cmd /k "ollama serve"

REM === End of script === 