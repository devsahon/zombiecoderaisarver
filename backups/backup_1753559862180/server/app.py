import os
from flask import Flask, jsonify
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
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(voice_bp, url_prefix='/api/voice')
app.register_blueprint(docs_bp, url_prefix='/api/docs')

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
