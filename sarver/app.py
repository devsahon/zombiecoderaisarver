import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from ai.server.monitoring.admin_dashboard import admin_bp
from ai.server.monitoring.system_monitor import system_monitor
from ai.server.monitoring.editor_monitor import editor_monitor
import logging
import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor
from api.voice_api import voice_bp
from api.docs_api import docs_bp

# Add the ai/agents directory to the path
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ai', 'agents'))

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(voice_bp, url_prefix='/api/voice')
app.register_blueprint(docs_bp, url_prefix='/api/docs')

# Import the personal agent
try:
    from personal_agent.logic import handle_request as personal_agent_handler
except ImportError as e:
    print(f"Warning: Could not import personal agent: {e}")
    personal_agent_handler = None

# Import MCP Dispatcher
try:
    from ai.dispatcher.mcp_dispatcher import dispatcher
    DISPATCHER_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import MCP dispatcher: {e}")
    DISPATCHER_AVAILABLE = False

@app.route('/api/agent/personal', methods=['POST'])
def run_personal_agent():
    """Personal Agent API endpoint"""
    try:
        if personal_agent_handler is None:
            return jsonify({
                "success": False,
                "error": "Personal agent not available",
                "message": "Personal agent module could not be loaded"
            }), 500
        
        data = request.json
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided",
                "message": "Please provide input data"
            }), 400
        
        # Call the personal agent
        result = personal_agent_handler(data)
        
        return jsonify({
            "success": True,
            "data": result,
            "message": "Personal agent processed successfully"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error processing personal agent request"
        }), 500

@app.route('/api/agent/personal/status', methods=['GET'])
def get_personal_agent_status():
    """Get personal agent status"""
    try:
        if personal_agent_handler is None:
            return jsonify({
                "success": False,
                "status": "unavailable",
                "message": "Personal agent not loaded"
            }), 500
        
        return jsonify({
            "success": True,
            "status": "active",
            "message": "Personal agent is ready",
            "capabilities": [
                "system_diagnose",
                "code_review", 
                "image_to_html",
                "project_suggestion",
                "database_analyze",
                "provider_manage",
                "general_conversation"
            ]
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error checking personal agent status"
        }), 500

@app.route('/api/agent/personal/memory', methods=['GET'])
def get_personal_agent_memory():
    """Get personal agent memory (for debugging)"""
    try:
        if personal_agent_handler is None:
            return jsonify({
                "success": False,
                "error": "Personal agent not available"
            }), 500
        
        # Import the agent instance to access memory
        from personal_agent.logic import personal_agent
        
        return jsonify({
            "success": True,
            "data": personal_agent.memory
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error accessing personal agent memory"
        }), 500

@app.route('/api/agent/personal/memory', methods=['DELETE'])
def clear_personal_agent_memory():
    """Clear personal agent memory"""
    try:
        if personal_agent_handler is None:
            return jsonify({
                "success": False,
                "error": "Personal agent not available"
            }), 500
        
        # Import the agent instance to clear memory
        from personal_agent.logic import personal_agent
        
        # Reset memory to initial state
        personal_agent.memory = {
            "user_mood": "neutral",
            "project_focus": "ZombieCoder",
            "last_task": None,
            "conversation_history": [],
            "system_status": {},
            "preferences": {}
        }
        personal_agent.save_memory()
        
        return jsonify({
            "success": True,
            "message": "Personal agent memory cleared successfully"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error clearing personal agent memory"
        }), 500

@app.route('/api/dispatcher', methods=['POST'])
def dispatch_request():
    """MCP Dispatcher API endpoint"""
    try:
        if not DISPATCHER_AVAILABLE:
            return jsonify({
                "success": False,
                "error": "Dispatcher not available",
                "message": "MCP dispatcher module could not be loaded"
            }), 500
        
        data = request.json
        if not data or 'input' not in data:
            return jsonify({
                "success": False,
                "error": "No input provided",
                "message": "ইনপুট প্রয়োজন"
            }), 400
        
        # Dispatch request
        import asyncio
        result = asyncio.run(dispatcher.dispatch_request(data['input'], data.get('context')))
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error processing dispatch request"
        }), 500

@app.route('/api/dispatcher/status', methods=['GET'])
def get_dispatcher_status():
    """Get MCP Dispatcher status"""
    try:
        if not DISPATCHER_AVAILABLE:
            return jsonify({
                "success": False,
                "status": "unavailable",
                "message": "MCP dispatcher not loaded"
            }), 500
        
        status = dispatcher.get_status()
        return jsonify({
            "success": True,
            **status
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error getting dispatcher status"
        }), 500

# Existing routes...
@app.route('/')
def home():
    return jsonify({
        "message": "AI Management System API",
        "version": "1.0.0",
        "endpoints": {
            "personal_agent": "/api/agent/personal",
            "personal_agent_status": "/api/agent/personal/status",
            "personal_agent_memory": "/api/agent/personal/memory"
        }
    })

# Create logs directory if it doesn't exist
os.makedirs('logs', exist_ok=True)

@app.route('/health')
def health_check():
    """Basic health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'monitors': {
            'system': system_monitor is not None,
            'editor': editor_monitor is not None
        }
    })

def run_flask():
    """Run Flask app in a separate thread"""
    app.run(host='0.0.0.0', port=5000, debug=False)

def run_websocket_server():
    """Run WebSocket server in a separate thread"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(editor_monitor.start_websocket_server())
    loop.close()

def start_services():
    """Start all services"""
    try:
        # Start system monitor
        logger.info("Starting system monitor...")
        system_monitor.start_monitoring()

        # Start editor monitor in a separate thread
        logger.info("Starting editor monitor...")
        threading.Thread(target=run_websocket_server, daemon=True).start()

        # Start Flask app
        logger.info("Starting Flask application...")
        run_flask()

    except Exception as e:
        logger.error(f"Error starting services: {str(e)}")
        raise

if __name__ == '__main__':
    start_services()
