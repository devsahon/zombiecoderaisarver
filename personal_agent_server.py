from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add the ai/agents directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai', 'agents'))

app = Flask(__name__)
CORS(app)

# Import the personal agent
try:
    from personal_agent.logic import handle_request as personal_agent_handler
    print("✅ Personal agent loaded successfully!")
except ImportError as e:
    print(f"❌ Warning: Could not import personal agent: {e}")
    personal_agent_handler = None

# Import MCP Dispatcher
try:
    from ai.dispatcher.mcp_dispatcher import dispatcher
    DISPATCHER_AVAILABLE = True
    print("✅ MCP Dispatcher loaded successfully!")
except ImportError as e:
    print(f"⚠️ Warning: Could not import MCP dispatcher: {e}")
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
        
        print(f"📨 Received request: {data.get('input', '')}")
        
        # Call the personal agent
        result = personal_agent_handler(data)
        
        print(f"🤖 Agent response: {result.get('action', 'unknown')}")
        
        return jsonify({
            "success": True,
            "data": result,
            "message": "Personal agent processed successfully"
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
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
        
        print(f"📤 Dispatching request: {data.get('input', '')}")
        
        # Dispatch request
        import asyncio
        result = asyncio.run(dispatcher.dispatch_request(data['input'], data.get('context')))
        
        print(f"📥 Dispatch result: {result.get('success', False)}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Dispatch error: {e}")
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

@app.route('/')
def home():
    return jsonify({
        "message": "Personal Agent API Server",
        "version": "1.0.0",
        "endpoints": {
            "personal_agent": "/api/agent/personal",
            "personal_agent_status": "/api/agent/personal/status",
            "personal_agent_memory": "/api/agent/personal/memory"
        }
    })

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "agent_loaded": personal_agent_handler is not None
    })

if __name__ == '__main__':
    print("🚀 Starting Personal Agent Server...")
    print("📍 Server will run on http://localhost:8000")
    print("🔗 API endpoints:")
    print("   - POST /api/agent/personal")
    print("   - GET  /api/agent/personal/status")
    print("   - GET  /api/agent/personal/memory")
    print("   - DELETE /api/agent/personal/memory")
    app.run(debug=True, host='0.0.0.0', port=8000) 