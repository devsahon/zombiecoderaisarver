import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import Flask, jsonify, render_template, send_file, request, Response
from flask_cors import CORS
import logging
import yaml
from gtts import gTTS
import tempfile
from ai.server.mcp.dispatcher import run_agent
import requests
import socket
import time
from datetime import datetime
import json

# Application root path
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(APP_ROOT)
LOGS_DIR = os.path.join(PROJECT_ROOT, 'logs')

# Create logs directory if it doesn't exist
if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

# Configure logging
log_file = os.path.join(LOGS_DIR, 'python_backend.log')
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Console handler first
    ]
)
# Add file handler after basicConfig
logger = logging.getLogger(__name__)
file_handler = logging.FileHandler(log_file)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(file_handler)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Template directory path
TEMPLATE_DIR = os.path.join(os.path.dirname(APP_ROOT), 'templates')
app.template_folder = TEMPLATE_DIR

# Global variable to store the currently selected agent
selected_agent_id = None

@app.route('/api/status')
def api_status():
    logger.info("API Status endpoint called")
    return jsonify({
        "status": "online",
        "services": {
            "api_server": "running",
            "agent_dispatcher": "running",
            "database": "connected"
        }
    })

@app.route('/api/tts', methods=['POST'])
def tts_api():
    data = request.get_json()
    text = data.get('text', '')
    lang = data.get('lang', 'bn')
    if not text.strip():
        return {'success': False, 'error': 'No text provided'}, 400
    try:
        tts = gTTS(text=text, lang=lang)
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
        tts.save(tmp.name)
        tmp.close()
        return send_file(tmp.name, as_attachment=True, download_name='reply.mp3', mimetype='audio/mpeg')
    except Exception as e:
        return {'success': False, 'error': str(e)}, 500

def load_agent_config(agent_id=None):
    import yaml
    
    # Load master config first
    master_config_path = os.path.join(os.path.dirname(APP_ROOT), 'ai', 'agents', 'config', 'master_config.yaml')
    master_config = {}
    
    if os.path.exists(master_config_path):
        try:
            with open(master_config_path, 'r', encoding='utf-8') as f:
                master_config = yaml.safe_load(f) or {}
                logger.info(f"Loaded master config: {master_config}")
        except Exception as e:
            logger.warning(f"Failed to load master config: {e}")
    else:
        logger.info("Master config file not found, using empty config")
    
    agent_categories = master_config.get('agent_categories', {})
    
    # Load registry if exists
    registry_path = os.path.join(os.path.dirname(APP_ROOT), 'ai', 'agents', 'registry.yaml')
    try:
        with open(registry_path, 'r', encoding='utf-8') as f:
            registry = yaml.safe_load(f)
            logger.info(f"Loaded registry: {registry}")
    except Exception as e:
        logger.warning(f"Failed to load registry: {e}")
        registry = {}
    
    # If agent_id is provided, try to load its specific config
    if agent_id:
        # Check in ai/agents directory and its subdirectories
        base_agents_dir = os.path.join(os.path.dirname(APP_ROOT), 'ai', 'agents')
        agent_config = {}
        
        # Try to find agent config in any subdirectory
        for category in os.listdir(base_agents_dir):
            category_dir = os.path.join(base_agents_dir, category)
            if not os.path.isdir(category_dir):
                continue
                
            potential_config = os.path.join(category_dir, agent_id, 'config.yaml')
            potential_personality = os.path.join(category_dir, agent_id, 'personality.yaml')
            
            try:
                if os.path.exists(potential_config):
                    with open(potential_config, 'r', encoding='utf-8') as f:
                        agent_config.update(yaml.safe_load(f))
                if os.path.exists(potential_personality):
                    with open(potential_personality, 'r', encoding='utf-8') as f:
                        agent_config.update(yaml.safe_load(f))
            except Exception as e:
                logger.warning(f"Failed to load config for {agent_id} in {category}: {e}")
                
        if registry and agent_id in registry:
            agent_config.update(registry[agent_id])
            
        return agent_categories, agent_config
            
    return agent_categories, {}

@app.route('/api/agents')
def list_agents():
    import yaml
    logger.info("Agents list endpoint called")
    
    # Get agent categories from master config
    agent_categories, _ = load_agent_config()
    
    # Get paths to check for agents
    agents_dirs = [
        os.path.join(os.path.dirname(APP_ROOT), 'agents'),
        os.path.join(os.path.dirname(APP_ROOT), 'ai', 'agents'),
    ]
    
    agents = []
    processed_agents = set()  # Track processed agents to avoid duplicates
    
    for agents_dir in agents_dirs:
        if not os.path.exists(agents_dir):
            logger.warning(f"Agents directory not found: {agents_dir}")
            continue
            
        try:
            # Get all .yaml files recursively
            for root, _, files in os.walk(agents_dir):
                for filename in files:
                    if not filename.endswith('.yaml') or filename in ['master_config.yaml']:
                        continue
                        
                    agent_file = os.path.join(root, filename)
                    agent_id = os.path.splitext(filename)[0]
                    
                    # Skip if we've already processed this agent ID
                    if agent_id in processed_agents:
                        continue
                        
                    try:
                        # Load agent's specific config
                        _, agent_config = load_agent_config(agent_id)
                        
                        # Also load the current file
                        with open(agent_file, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if content.strip():
                                file_config = yaml.safe_load(content)
                                if file_config:
                                    # Update with file config, but don't override specific config
                                    merged_config = {**file_config, **agent_config}
                                else:
                                    merged_config = agent_config
                            else:
                                merged_config = agent_config
                            
                            if not merged_config:
                                continue
                                
                            # Determine agent type/category
                            agent_type = "ai_agent"
                            for category, agent_list in agent_categories.items():
                                if agent_id in agent_list:
                                    agent_type = category
                                    break
                            
                            agent_info = {
                                "id": agent_id,
                                "name": merged_config.get('name', '') or merged_config.get('agent_name', agent_id),
                                "status": "active",
                                "type": agent_type,
                                "personality": merged_config.get('personality', ''),
                                "model_preference": (
                                    merged_config.get('model_preference', []) or 
                                    merged_config.get('allowed_providers', [])
                                )
                            }
                            
                            agents.append(agent_info)
                            processed_agents.add(agent_id)
                            logger.info(f"Added agent: {agent_info}")
                            
                    except Exception as e:
                        logger.error(f"Error processing {agent_file}: {e}")
                        continue
                        
        except Exception as e:
            logger.error(f"Error scanning directory {agents_dir}: {e}")
            continue
    
    if not agents:
        logger.warning("No valid agents found")
        return jsonify({"agents": []})
        
    return jsonify({
        "agents": agents,
        "categories": agent_categories
    })

@app.route('/api/agents/status')
def get_agent_status():
    from ai.agents.memory_system import MemoryManager
    memory = MemoryManager()
    agent_categories, _ = load_agent_config()
    agents = []
    for agent_id in agent_categories:
        for aid in agent_categories[agent_id]:
            # Try to load config and personality
            _, agent_config = load_agent_config(aid)
            personality = agent_config.get('personality', {})
            mem_data = memory.get_all(aid, is_agent=True)
            agents.append({
                'id': aid,
                'name': agent_config.get('name', aid),
                'status': 'active',
                'type': agent_id,
                'personality': personality,
                'memory_count': len(mem_data),
                'memory_last_updated': None,  # Optionally add timestamp if tracked
                'integrations': agent_config.get('integrations', []),
                'supported_languages': agent_config.get('supported_languages', ['bn'])
            })
    return jsonify({'agents': agents})

@app.route('/api/chat', methods=['POST'])
def api_chat():
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        language = data.get('language', 'bn')
        if not message:
            return jsonify({'success': False, 'error': 'No message provided.'}), 400
        if message.startswith('@him'):
            prompt = f"তুমি একজন কল্পিত প্রেমিকা, খুব কিউট, দুষ্টুমি করো, সবসময় বাংলা ভাষায় কথা বলো। ইউজার: {message[4:].strip()}"
            agent_type = 'girlfriend-gpt'
            response = run_agent(agent_type, prompt=prompt, model=None)
        elif message.lower().startswith('sms:'):
            prompt = message[4:].strip()
            agent_type = 'sms_reply'
            response = run_agent(agent_type, prompt=prompt, model=None)
        else:
            response = run_agent('mcp', prompt=message, model=None)
            agent_type = response.get('agent_type', 'unknown') if isinstance(response, dict) else 'unknown'
        text = response["result"] if isinstance(response, dict) else str(response)
        return jsonify({
            'success': True,
            'user_message': message,
            'agent_message': text,
            'agent_type': agent_type
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def check_provider_health(provider_id: str, config: dict) -> dict:
    """Check provider health via API call or TCP ping"""
    start_time = time.time()
    result = {
        'id': provider_id,
        'status': 'offline',
        'latency': 0,
        'last_checked': datetime.now().isoformat(),
        'error': None
    }
    
    try:
        # Try API health endpoint if available
        if 'health_endpoint' in config:
            response = requests.get(
                config['health_endpoint'],
                timeout=5,
                verify=False  # For local development
            )
            result['latency'] = (time.time() - start_time) * 1000
            result['status'] = 'online' if response.ok else 'error'
            if not response.ok:
                result['error'] = f"HTTP {response.status_code}"
                
        # Try TCP ping if port available
        elif 'port' in config:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            if sock.connect_ex(('localhost', config['port'])) == 0:
                result['status'] = 'online'
            sock.close()
            result['latency'] = (time.time() - start_time) * 1000
            
    except Exception as e:
        result['error'] = str(e)
        
    return result

@app.route('/api/providers')
def list_providers():
    import os, yaml
    providers_dir = os.path.join(os.path.dirname(APP_ROOT), 'ai', 'server', 'config', 'providers')
    providers = []
    for root, dirs, files in os.walk(providers_dir):
        for file in files:
            if file.endswith('.json') or file.endswith('.yaml'):
                provider_id = os.path.splitext(file)[0]
                providers.append({'id': provider_id, 'file': file, 'path': os.path.join(root, file)})
    return jsonify({'providers': providers})

@app.route('/api/providers/status')
def providers_status():
    """Get real-time status of all providers with health check"""
    providers_dir = os.path.join(os.path.dirname(APP_ROOT), 'ai', 'server', 'config', 'providers')
    results = []
    
    for root, dirs, files in os.walk(providers_dir):
        for file in files:
            if file.endswith('.json') or file.endswith('.yaml'):
                provider_id = os.path.splitext(file)[0]
                config_path = os.path.join(root, file)
                
                # Load provider config
                try:
                    with open(config_path, 'r') as f:
                        if file.endswith('.json'):
                            config = json.load(f)
                        else:
                            config = yaml.safe_load(f)
                except Exception as e:
                    results.append({
                        'id': provider_id,
                        'status': 'error',
                        'error': f"Failed to load config: {str(e)}"
                    })
                    continue
                
                # Check provider health
                status = check_provider_health(provider_id, config)
                results.append(status)
    
    return jsonify({'providers': results})

@app.route('/')
def home():
    logger.info("Home endpoint called")
    return render_template('index.html')

@app.route('/system/overview')
def system_overview():
    logger.info("System overview endpoint called")
    return render_template('system_overview.html')

@app.route('/admin')
def admin_dashboard():
    logger.info("Admin dashboard called")
    return render_template('admin/dashboard.html')

@app.route('/admin/agents')
def admin_agents():
    logger.info("Admin agents page called")
    return render_template('admin/agents.html')

@app.route('/admin/settings')
def admin_settings():
    logger.info("Admin settings page called")
    return render_template('admin/settings.html')

@app.route('/admin/agent_config')
def admin_agent_config():
    logger.info("Admin agent config page called")
    return render_template('admin/agent_config.html')

@app.route('/chat')
def chat_interface():
    logger.info("Chat interface page called")
    return render_template('chat.html')

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

@app.route('/api/agents/personalities')
def list_agent_personalities():
    """Get all agent personalities with their details"""
    agent_categories, _ = load_agent_config()
    agents = []
    
    for agent_id in agent_categories:
        for aid in agent_categories[agent_id]:
            _, agent_config = load_agent_config(aid)
            personality = agent_config.get('personality', {})
            agents.append({
                'id': aid,
                'name': agent_config.get('name', aid),
                'status': 'active',
                'personality': personality
            })
    
    return jsonify({'agents': agents})

@app.route('/api/agents/personalities/<agent_id>', methods=['GET', 'POST'])
def agent_personality(agent_id):
    """Get or update an agent's personality"""
    if request.method == 'GET':
        _, agent_config = load_agent_config(agent_id)
        return jsonify({
            'id': agent_id,
            'name': agent_config.get('name', agent_id),
            'personality': agent_config.get('personality', {})
        })
    else:
        data = request.json
        personality = data.get('personality', {})
        # Update personality in config
        _, agent_config = load_agent_config(agent_id)
        agent_config['personality'] = personality
        # Save updated config
        config_path = os.path.join(
            os.path.dirname(APP_ROOT),
            'ai/agents',
            agent_id,
            'config.yaml'
        )
        with open(config_path, 'w') as f:
            yaml.dump(agent_config, f)
        return jsonify({'success': True})

@app.route('/api/chat/audio', methods=['POST'])
def generate_chat_audio():
    """Generate audio from chat text using TTS"""
    data = request.json
    text = data.get('text')
    voice_id = data.get('voice_id', 'default')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
        
    try:
        # Generate audio using TTS
        from ai.voice.voice_handler import generate_speech
        audio_data = generate_speech(text, voice_id)
        
        # Save to temp file
        temp_file = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False)
        temp_file.write(audio_data)
        temp_file.close()
        
        # Stream audio file
        return send_file(
            temp_file.name,
            mimetype='audio/mpeg',
            as_attachment=True,
            download_name='chat_response.mp3'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/audio/stream')
def stream_chat_audio():
    """Stream chat audio in chunks"""
    text = request.args.get('text')
    voice_id = request.args.get('voice_id', 'default')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
        
    try:
        # Generate audio stream
        from ai.voice.voice_streamer import stream_speech
        return Response(
            stream_speech(text, voice_id),
            mimetype='audio/mpeg'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/agents/select', methods=['POST'])
def select_agent():
    global selected_agent_id
    data = request.get_json()
    agent_id = data.get('agent_id')
    if not agent_id:
        return jsonify({'success': False, 'error': 'No agent_id provided.'}), 400
    # Optionally, validate agent_id exists
    agent_categories, _ = load_agent_config()
    all_agents = [aid for cat in agent_categories.values() for aid in cat]
    if agent_id not in all_agents:
        return jsonify({'success': False, 'error': 'Invalid agent_id.'}), 404
    selected_agent_id = agent_id
    return jsonify({'success': True, 'selected_agent_id': selected_agent_id})

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        logger.error(f"Error starting server: {e}")