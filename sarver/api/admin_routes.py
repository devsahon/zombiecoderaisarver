from flask import Blueprint, render_template, jsonify, request
import psutil
import os
import json
from datetime import datetime
from typing import Dict, Any, List

# Import agent-related modules
try:
    from agents.voice import BengaliVoiceModel
    from agents.base import AgentManager
    AGENT_IMPORTS_AVAILABLE = True
except ImportError:
    AGENT_IMPORTS_AVAILABLE = False

# Initialize agent manager if available
agent_manager = AgentManager() if AGENT_IMPORTS_AVAILABLE else None

admin_bp = Blueprint('admin', __name__)

# Server configuration
SERVERS = {
    'model-server': {'port': 5000, 'script': 'model_server.py'},
    'main-server': {'port': 5001, 'script': 'simple_main_server.py'},
    'client-api': {'port': 5002, 'script': 'client_monitoring_api.py'},
    'audio-api': {'port': 5003, 'script': 'zonemind_audio_api.py'},
    'mcp-server': {'port': 11435, 'script': 'mcp_server.py'}
}

def get_server_status(server_id: str) -> Dict[str, Any]:
    """Get status information for a specific server"""
    server = SERVERS.get(server_id)
    if not server:
        return {'status': 'unknown'}
        
    port = server['port']
    try:
        # Check if process is running on the specified port
        for conn in psutil.net_connections():
            if conn.laddr.port == port:
                process = psutil.Process(conn.pid)
                return {
                    'status': 'online',
                    'pid': process.pid,
                    'cpu_percent': process.cpu_percent(),
                    'memory_percent': process.memory_percent(),
                    'uptime': datetime.now().timestamp() - process.create_time()
                }
        return {'status': 'offline'}
    except:
        return {'status': 'error'}

@admin_bp.route('/admin')
def admin_dashboard():
    """Render the admin dashboard"""
    return render_template('admin/dashboard.html')

@admin_bp.route('/admin/server-control')
def server_control():
    """Render the server control panel"""
    return render_template('admin/server_control.html')

@admin_bp.route('/api/server/status')
def get_all_server_status():
    """Get status of all servers"""
    status = {}
    for server_id in SERVERS:
        status[server_id] = get_server_status(server_id)
    return jsonify(status)

@admin_bp.route('/api/server/status/<server_id>')
def get_single_server_status(server_id):
    """Get status of a specific server"""
    status = get_server_status(server_id)
    return jsonify(status)

@admin_bp.route('/api/server/control', methods=['POST'])
def control_server():
    """Control server operations (start/stop/restart)"""
    data = request.json
    server_id = data.get('server')
    action = data.get('action')
    
    if not server_id or not action or server_id not in SERVERS:
        return jsonify({'success': False, 'message': 'Invalid request'})
        
    server = SERVERS[server_id]
    script_path = os.path.join(os.path.dirname(__file__), '..', server['script'])
    
    try:
        if action == 'start':
            # Kill any existing process on the port
            for conn in psutil.net_connections():
                if conn.laddr.port == server['port']:
                    psutil.Process(conn.pid).kill()
            
            # Start new process
            os.system(f'python {script_path} --port {server["port"]} &')
            
        elif action == 'stop':
            for conn in psutil.net_connections():
                if conn.laddr.port == server['port']:
                    psutil.Process(conn.pid).kill()
                    
        elif action == 'restart':
            # Stop then start
            for conn in psutil.net_connections():
                if conn.laddr.port == server['port']:
                    psutil.Process(conn.pid).kill()
            os.system(f'python {script_path} --port {server["port"]} &')
            
        else:
            return jsonify({'success': False, 'message': 'Invalid action'})
            
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@admin_bp.route('/api/server/logs/<server_id>')
def get_server_logs(server_id):
    """Get logs for a specific server"""
    if server_id not in SERVERS:
        return jsonify({'success': False, 'message': 'Invalid server'})
        
    log_path = os.path.join(os.path.dirname(__file__), '..', 'logs', f'{server_id}.log')
    try:
        with open(log_path, 'r') as f:
            # Get last 100 lines
            lines = f.readlines()[-100:]
            return jsonify({'success': True, 'logs': lines})
    except:
        return jsonify({'success': False, 'message': 'Error reading logs'})

@admin_bp.route('/api/server/metrics')
def get_all_metrics():
    """Get metrics for all servers"""
    metrics = {}
    for server_id in SERVERS:
        status = get_server_status(server_id)
        if status['status'] == 'online':
            metrics[server_id] = {
                'cpu_percent': status['cpu_percent'],
                'memory_percent': status['memory_percent'],
                'uptime': status['uptime']
            }
    return jsonify(metrics)

@admin_bp.route('/api/system/health')
def get_system_health():
    """Get overall system health metrics"""
    cpu_percent = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return jsonify({
        'cpu': {
            'percent': cpu_percent,
            'cores': psutil.cpu_count()
        },
        'memory': {
            'total': memory.total,
            'available': memory.available,
            'percent': memory.percent
        },
        'disk': {
            'total': disk.total,
            'used': disk.used,
            'free': disk.free,
            'percent': disk.percent
        },
        'timestamp': datetime.now().timestamp()
    })

@admin_bp.route('/admin/agent-config')
def agent_config():
    """Render the agent configuration page"""
    return render_template('admin/agent_config.html')

@admin_bp.route('/admin/vscode-integration')
def vscode_integration():
    """Render the VS Code integration page"""
    return render_template('admin/vscode_integration.html')

@admin_bp.route('/api/agents/status')
def get_agent_status():
    """Get status of all agents"""
    if not AGENT_IMPORTS_AVAILABLE or not agent_manager:
        return jsonify({
            'success': False,
            'message': 'Agent system not available'
        })

    agents = agent_manager.get_all_agents()
    return jsonify({
        'success': True,
        'agents': [
            {
                'id': agent.id,
                'name': agent.name,
                'type': agent.type,
                'status': agent.status,
                'active': agent.is_active,
                'supported_languages': agent.supported_languages
            }
            for agent in agents
        ]
    })

@admin_bp.route('/api/agents/config', methods=['POST'])
def configure_agent():
    """Configure an agent"""
    if not AGENT_IMPORTS_AVAILABLE or not agent_manager:
        return jsonify({
            'success': False,
            'message': 'Agent system not available'
        })

    data = request.json
    agent_id = data.get('agent_id')
    config = data.get('config', {})

    try:
        agent_manager.configure_agent(agent_id, config)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@admin_bp.route('/api/agents/voice/preview', methods=['POST'])
def preview_voice():
    """Generate a voice preview"""
    if not AGENT_IMPORTS_AVAILABLE:
        return jsonify({
            'success': False,
            'message': 'Voice system not available'
        })

    data = request.json
    text = data.get('text')
    voice_id = data.get('voice_id')

    try:
        voice_model = BengaliVoiceModel()
        audio_data = voice_model.generate_preview(text, voice_id)
        return jsonify({
            'success': True,
            'audio_data': audio_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@admin_bp.route('/api/vscode/status')
def get_vscode_status():
    """Get VS Code integration status"""
    try:
        active_sessions = []
        for conn in psutil.net_connections():
            if conn.laddr[1] in [5000, 5001, 5002]:  # VS Code integration ports
                process = psutil.Process(conn.pid)
                active_sessions.append({
                    'pid': process.pid,
                    'port': conn.laddr[1],
                    'uptime': datetime.now().timestamp() - process.create_time()
                })

        return jsonify({
            'success': True,
            'connected': len(active_sessions) > 0,
            'sessions': active_sessions
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })
