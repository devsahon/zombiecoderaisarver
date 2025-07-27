@echo off
echo Installing Python dependencies...
pip install -r server\requirements.txt

echo Installing frontend dependencies...
cd frontend && npm install && cd..

echo Starting MCP Server...
start cmd /k "cd server\mcp && python dispatcher.py"

echo Starting Backend...
start cmd /k "cd server && python app.py"

pause 