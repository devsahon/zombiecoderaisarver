# PowerShell script to auto-start all required servers in separate windows

# 1. MCP Dispatcher
Start-Process powershell -ArgumentList 'cd ai; python server/mcp/dispatcher.py' -WindowStyle Minimized

# 2. Python Backend (Flask)
Start-Process powershell -ArgumentList 'cd ai; python server/app.py' -WindowStyle Minimized

# 3. Laravel API
Start-Process powershell -ArgumentList 'cd laravel-api; php artisan serve' -WindowStyle Minimized

# 4. Ollama Server (if installed)
# Uncomment and set correct path if needed
# Start-Process powershell -ArgumentList 'ollama serve' -WindowStyle Minimized 