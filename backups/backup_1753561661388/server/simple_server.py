from flask import Flask, jsonify
import psutil
import time
import os

app = Flask(__name__)

@app.route('/api/status')
def status():
    """Get server status"""
    try:
        # Get system information
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return jsonify({
            'dispatcher_active': True,
            'latency_log': [
                {
                    'timestamp': time.time(),
                    'latency_ms': 150,
                    'agent': 'test_agent'
                }
            ],
            'agents_status': {
                'test_agent': {
                    'status': 'active',
                    'last_used': time.time(),
                    'memory_usage': '1.2MB'
                }
            },
            'fallback_info': {
                'provider': 'openai',
                'fallback': False,
                'last_error': None,
                'fallback_chain': ['openai', 'anthropic']
            },
            'system': {
                'ram_percent': memory.percent,
                'ram_total_gb': round(memory.total / (1024**3), 2),
                'ram_available_gb': round(memory.available / (1024**3), 2),
                'cpu_percent': cpu_percent,
                'disk_percent': disk.percent,
                'disk_total_gb': round(disk.total / (1024**3), 2),
                'disk_free_gb': round(disk.free / (1024**3), 2),
                'timestamp': time.time()
            },
            'server_info': {
                'port': 8000,
                'uptime': time.time(),
                'version': '1.0.0'
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/agents')
def agents():
    """Get available agents"""
    return jsonify({
        'success': True,
        'agents': {
            'test_agent': 'Test agent for demonstration',
            'voice_agent': 'Voice processing agent',
            'ai_agent': 'AI processing agent'
        }
    })

@app.route('/api/providers')
def providers():
    """Get AI providers"""
    return jsonify({
        'success': True,
        'providers': {
            'openai': {
                'type': 'llm',
                'status': 'active'
            },
            'anthropic': {
                'type': 'llm',
                'status': 'active'
            }
        }
    })

@app.route('/api/logs')
def logs():
    """Get server logs"""
    return jsonify({
        'success': True,
        'logs': [
            f'[{time.strftime("%Y-%m-%d %H:%M:%S")}] Server started',
            f'[{time.strftime("%Y-%m-%d %H:%M:%S")}] Status check completed',
            f'[{time.strftime("%Y-%m-%d %H:%M:%S")}] All systems operational'
        ]
    })

@app.route('/api/dispatch', methods=['POST'])
def dispatch():
    """Test agent dispatch"""
    return jsonify({
        'success': True,
        'result': {
            'result': 'Test response from agent'
        }
    })

if __name__ == '__main__':
    print("Starting simple server on port 8000...")
    app.run(host='0.0.0.0', port=8000, debug=True) 