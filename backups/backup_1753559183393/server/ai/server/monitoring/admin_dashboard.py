from flask import Blueprint, jsonify, request
from .system_monitor import system_monitor
from ..mcp.admin_handler import AdminHandler
from typing import Dict, List
import json

admin_bp = Blueprint('admin', __name__)
admin_handler = AdminHandler()

@admin_bp.route('/dashboard/metrics', methods=['GET'])
def get_dashboard_metrics():
    """Get all system metrics for dashboard"""
    if not admin_handler.validate_admin_token(request.headers.get('Admin-Token')):
        return jsonify({'error': 'Unauthorized'}), 401

    return jsonify({
        'system_metrics': system_monitor.get_current_metrics(),
        'provider_status': _get_provider_status(),
        'active_sessions': _get_active_sessions(),
        'recent_activities': _get_recent_activities()
    })

@admin_bp.route('/dashboard/logs', methods=['GET'])
def get_system_logs():
    """Get system logs"""
    if not admin_handler.validate_admin_token(request.headers.get('Admin-Token')):
        return jsonify({'error': 'Unauthorized'}), 401

    log_type = request.args.get('type', 'all')
    limit = int(request.args.get('limit', 100))
    
    logs = _get_logs(log_type, limit)
    return jsonify({'logs': logs})

@admin_bp.route('/dashboard/editor/status', methods=['GET'])
def get_editor_status():
    """Get connected editor status"""
    if not admin_handler.validate_admin_token(request.headers.get('Admin-Token')):
        return jsonify({'error': 'Unauthorized'}), 401

    return jsonify({
        'connected_editors': _get_connected_editors(),
        'active_sessions': _get_editor_sessions(),
        'recent_operations': _get_recent_editor_operations()
    })

@admin_bp.route('/dashboard/provider/status', methods=['GET'])
def get_provider_status():
    """Get detailed provider status"""
    if not admin_handler.validate_admin_token(request.headers.get('Admin-Token')):
        return jsonify({'error': 'Unauthorized'}), 401

    return jsonify({
        'providers': _get_detailed_provider_status(),
        'fallback_history': _get_fallback_history(),
        'performance_metrics': _get_provider_performance()
    })

@admin_bp.route('/dashboard/commands', methods=['POST'])
def execute_admin_command():
    """Execute admin command"""
    if not admin_handler.validate_admin_token(request.headers.get('Admin-Token')):
        return jsonify({'error': 'Unauthorized'}), 401

    command = request.json.get('command')
    if not command:
        return jsonify({'error': 'No command provided'}), 400

    result = admin_handler.process_admin_command(command, request.headers.get('Admin-Token'))
    return jsonify(result)

def _get_provider_status() -> Dict:
    """Get current status of all providers"""
    return {
        'active_providers': len(system_monitor.metrics_history['provider_status']),
        'health_status': {
            'healthy': 0,
            'degraded': 0,
            'offline': 0
        }
    }

def _get_active_sessions() -> List[Dict]:
    """Get list of active sessions"""
    return []

def _get_recent_activities() -> List[Dict]:
    """Get recent system activities"""
    return list(system_monitor.metrics_history['api_calls'])[-10:]

def _get_logs(log_type: str, limit: int) -> List[Dict]:
    """Get system logs by type"""
    return []

def _get_connected_editors() -> List[Dict]:
    """Get list of connected editors"""
    return []

def _get_editor_sessions() -> List[Dict]:
    """Get active editor sessions"""
    return []

def _get_recent_editor_operations() -> List[Dict]:
    """Get recent editor operations"""
    return []

def _get_detailed_provider_status() -> Dict:
    """Get detailed status of all providers"""
    return {}

def _get_fallback_history() -> List[Dict]:
    """Get history of fallback operations"""
    return []

def _get_provider_performance() -> Dict:
    """Get provider performance metrics"""
    return {}
