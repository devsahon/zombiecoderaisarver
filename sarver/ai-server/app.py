from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
import time
import sys
import json
import psutil
from datetime import datetime
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/ai_server.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Global variables for monitoring
latency_log = []
agents_status = {}
system_stats = {}
active_connections = 0

def update_system_stats():
    """Update system statistics"""
    global system_stats
    ram = psutil.virtual_memory()
    cpu = psutil.cpu_percent(interval=0.5)
    disk = psutil.disk_usage('/')
    
    system_stats = {
        "ram_percent": ram.percent,
        "ram_total_gb": round(ram.total / (1024**3), 2),
        "ram_available_gb": round(ram.available / (1024**3), 2),
        "cpu_percent": cpu,
        "disk_percent": disk.percent,
        "disk_total_gb": round(disk.total / (1024**3), 2),
        "disk_free_gb": round(disk.free / (1024**3), 2),
        "timestamp": datetime.now().isoformat(),
        "active_connections": active_connections
    }

def update_agent_status():
    """Update agent status"""
    global agents_status
    try:
        # Import agent registry
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from ai.agents.registry import AgentRegistry
        
        for agent_name in AgentRegistry._agents.keys():
            try:
                agent = AgentRegistry.get_agent(agent_name)
                agents_status[agent_name] = {
                    "status": "active",
                    "last_used": datetime.now().isoformat(),
                    "memory_usage": "0KB",
                    "config": agent.config if hasattr(agent, 'config') else {}
                }
            except Exception as e:
                agents_status[agent_name] = {
                    "status": f"disabled: {str(e)}",
                    "last_used": None,
                    "memory_usage": "0KB"
                }
    except Exception as e:
        logger.error(f"Error updating agent status: {e}")

@app.route("/api/status")
def status():
    """Enhanced status endpoint for admin panel"""
    update_system_stats()
    update_agent_status()
    
    # Fallback provider info
    fallback_info = {
        "provider": "openai",
        "fallback": False,
        "last_error": None,
        "fallback_chain": ["openai", "ollama", "togetherai"]
    }
    
    return jsonify({
        "service": "ai-server",
        "dispatcher_active": True,
        "latency_log": latency_log[-10:],  # Last 10 entries
        "agents_status": agents_status,
        "fallback_info": fallback_info,
        "system": system_stats,
        "server_info": {
            "port": 8000,
            "uptime": time.time(),
            "version": "1.0.0"
        }
    })

@app.route("/api/agents")
def get_agents():
    """Get all available agents"""
    try:
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from ai.agents.registry import AgentRegistry
        
        agents = AgentRegistry.list_agents()
        return jsonify({
            "success": True,
            "agents": agents,
            "total": len(agents)
        })
    except Exception as e:
        logger.error(f"Error getting agents: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/agents/<agent_name>/status")
def get_agent_status(agent_name):
    """Get specific agent status"""
    try:
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from ai.agents.registry import AgentRegistry
        
        agent = AgentRegistry.get_agent(agent_name)
        return jsonify({
            "success": True,
            "agent": agent_name,
            "status": "active",
            "config": agent.config if hasattr(agent, 'config') else {},
            "memory_usage": "0KB"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 404

@app.route("/api/dispatch", methods=["POST"])
def dispatch():
    """Enhanced dispatch endpoint"""
    data = request.get_json()
    agent_name = data.get("agent")
    text = data.get("text")
    
    if not agent_name or not text:
        return jsonify({"error": "Missing agent or text"}), 400

    start_time = time.time()
    
    try:
        # Import dispatcher
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        from dispatcher.core import dispatch as dispatch_request
        
        result = dispatch_request({"agent": agent_name, "text": text})
        
        # Calculate latency
        latency = (time.time() - start_time) * 1000
        latency_log.append({
            "timestamp": datetime.now().isoformat(),
            "latency_ms": round(latency, 2),
            "agent": agent_name
        })
        
        # Keep only last 100 entries
        if len(latency_log) > 100:
            latency_log.pop(0)
        
        # Emit real-time update
        socketio.emit('agent_response', {
            'agent': agent_name,
            'latency': round(latency, 2),
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify({
            "success": True,
            "result": result,
            "latency_ms": round(latency, 2),
            "agent": agent_name
        })
        
    except Exception as e:
        latency = (time.time() - start_time) * 1000
        latency_log.append({
            "timestamp": datetime.now().isoformat(),
            "latency_ms": round(latency, 2),
            "agent": agent_name,
            "error": str(e)
        })
        
        logger.error(f"Dispatch error: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "latency_ms": round(latency, 2)
        }), 500

@app.route("/api/providers")
def get_providers():
    """Get available providers"""
    providers = {
        "openai": {"status": "active", "type": "cloud", "models": ["gpt-3.5-turbo", "gpt-4"]},
        "ollama": {"status": "active", "type": "local", "models": ["llama2", "mistral"]},
        "togetherai": {"status": "active", "type": "cloud", "models": ["llama-2-70b", "mistral-7b"]},
        "huggingface": {"status": "inactive", "type": "cloud", "models": []}
    }
    return jsonify({
        "success": True,
        "providers": providers
    })

@app.route("/api/logs")
def get_logs():
    """Get recent logs"""
    try:
        log_file = os.path.join(os.path.dirname(__file__), 'logs/ai_server.log')
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                lines = f.readlines()
                return jsonify({
                    "success": True,
                    "logs": lines[-50:]  # Last 50 lines
                })
        else:
            return jsonify({
                "success": True,
                "logs": ["No log file found"]
            })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/health")
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "ai-server",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

# WebSocket events
@socketio.on('connect')
def handle_connect():
    global active_connections
    active_connections += 1
    logger.info(f"Client connected. Total connections: {active_connections}")
    emit('status', {'message': 'Connected to AI Server'})

@socketio.on('disconnect')
def handle_disconnect():
    global active_connections
    active_connections -= 1
    logger.info(f"Client disconnected. Total connections: {active_connections}")

@socketio.on('agent_request')
def handle_agent_request(data):
    """Handle real-time agent requests"""
    try:
        agent_name = data.get('agent')
        text = data.get('text')
        
        if agent_name and text:
            # Process request
            start_time = time.time()
            
            sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
            from dispatcher.core import dispatch as dispatch_request
            
            result = dispatch_request({"agent": agent_name, "text": text})
            latency = (time.time() - start_time) * 1000
            
            emit('agent_response', {
                'agent': agent_name,
                'result': result,
                'latency': round(latency, 2),
                'timestamp': datetime.now().isoformat()
            })
    except Exception as e:
        emit('error', {'message': str(e)})

# Legacy endpoints for backward compatibility
@app.route("/status")
def legacy_status():
    return status()

@app.route("/dispatch")
def legacy_dispatch():
    agent = request.args.get("agent")
    text = request.args.get("text")
    if not agent or not text:
        return jsonify({"error": "Missing agent or text"}), 400
    
    return dispatch()

if __name__ == "__main__":
    # Create logs directory if it doesn't exist
    os.makedirs('logs', exist_ok=True)
    
    logger.info("Starting AI Server on port 8000...")
    socketio.run(app, host="0.0.0.0", port=8000, debug=False) 