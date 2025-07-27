from flask import Flask, jsonify, request, send_file, render_template
from flask_cors import CORS
import os
import time
import sys
import pyttsx3
import tempfile
import psutil
import json
from datetime import datetime
from ai.agents.registry import AgentRegistry
from ai.agents.store.provider_store import ProviderStore

app = Flask(__name__, template_folder='../../templates')
CORS(app)  # Enable CORS for admin panel integration

# Global variables for monitoring
latency_log = []
agents_status = {}
system_stats = {}

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
        "timestamp": datetime.now().isoformat()
    }

def update_agent_status():
    """Update agent status"""
    global agents_status
    try:
        for agent_name in AgentRegistry._agents.keys():
            try:
                agent = AgentRegistry.get_agent(agent_name)
                agents_status[agent_name] = {
                    "status": "active",
                    "last_used": datetime.now().isoformat(),
                    "memory_usage": "0KB"  # Placeholder
                }
            except Exception as e:
                agents_status[agent_name] = {
                    "status": f"disabled: {str(e)}",
                    "last_used": None,
                    "memory_usage": "0KB"
                }
    except Exception as e:
        print(f"Error updating agent status: {e}")

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
        agents = AgentRegistry.list_agents()
        return jsonify({
            "success": True,
            "agents": agents,
            "total": len(agents)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/agents/<agent_name>/status")
def get_agent_status(agent_name):
    """Get specific agent status"""
    try:
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
        sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../server/mcp')))
        from dispatcher import run_agent
        
        result = run_agent(agent_name, prompt=text)
        
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
        
        return jsonify({
            "success": False,
            "error": str(e),
            "latency_ms": round(latency, 2)
        }), 500

@app.route("/api/voice_chat", methods=["POST"])
def voice_chat():
    """Voice chat endpoint"""
    data = request.get_json()
    text = data.get("text")
    agent = data.get("agent", "instruct")
    
    if not text:
        return jsonify({"error": "Missing text"}), 400
    
    try:
        # Get agent response
        sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../server/mcp')))
        from dispatcher import run_agent
        result = run_agent(agent, prompt=text)
        
        # Text-to-speech
        engine = pyttsx3.init()
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tf:
            engine.save_to_file(result["result"], tf.name)
            engine.runAndWait()
            audio_path = tf.name
        
        return send_file(audio_path, mimetype="audio/mpeg", as_attachment=True, download_name="response.mp3")
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/providers")
def get_providers():
    """Get available providers"""
    providers = {
        "openai": {"status": "active", "type": "cloud"},
        "ollama": {"status": "active", "type": "local"},
        "togetherai": {"status": "active", "type": "cloud"},
        "huggingface": {"status": "inactive", "type": "cloud"}
    }
    return jsonify({
        "success": True,
        "providers": providers
    })

@app.route("/api/provider/<provider_id>/clear_memory", methods=["POST"])
def clear_provider_memory(provider_id):
    """Clear provider memory"""
    try:
        store = ProviderStore()
        store.clear_memory(provider_id)
        return jsonify({
            "success": True,
            "message": f"Memory cleared for provider {provider_id}"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/provider/memory_status")
def provider_memory_status():
    """Get provider memory status"""
    try:
        store = ProviderStore()
        all_mem = store.get_all_providers()
        status = {pid: {"keys": list(mem.keys()), "size": len(str(mem))} for pid, mem in all_mem.items()}
        return jsonify({
            "success": True,
            "memory_status": status
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/logs")
def get_logs():
    """Get recent logs"""
    try:
        log_file = os.path.join(os.path.dirname(__file__), '../../logs/app.log')
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
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

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
    app.run(host="0.0.0.0", port=8000, debug=False) 