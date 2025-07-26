#!/bin/bash

echo "Starting all servers..."

# Function to start a server
start_server() {
    local server_name=$1
    local server_path=$2
    local port=$3
    
    echo "Starting $server_name on port $port..."
    cd "$server_path" || { echo "Failed to change to directory: $server_path"; return 1; }
    
    # Check if Python virtual environment exists
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    # Start server in background
    nohup python app.py > "../../logs/${server_name}.log" 2>&1 &
    echo "$server_name started with PID: $!"
    
    # Go back to original directory
    cd ../..
    
    # Wait a bit for server to start
    sleep 2
}

# Create logs directory if it doesn't exist
mkdir -p logs

# Start servers
echo "=== Starting Main Server ==="
start_server "main-server" "sarver" 8000

echo "=== Starting API Server ==="
start_server "api-server" "sarver" 8000

echo "=== Starting Voice Server ==="
start_server "voice-server" "sarver/voice-server" 8001

echo "=== Starting AI Server ==="
start_server "ai-server" "sarver/ai-server" 8002

echo "=== All servers started ==="
echo "Check logs directory for server logs"
echo "Main server: http://localhost:8000"
echo "Voice server: http://localhost:8001"
echo "AI server: http://localhost:8002"

# Show running processes
echo "=== Running server processes ==="
ps aux | grep "python app.py" | grep -v grep 