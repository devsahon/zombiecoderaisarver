import os
import sys
import logging
import time
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import psutil

# Create logs directory if it doesn't exist
os.makedirs('logs', exist_ok=True)

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

app = Flask(__name__)
CORS(app)

# AI Server Configuration
AI_SERVER_CONFIG = {
    'name': 'AI Server',
    'port': 8002,
    'version': '2.0.0',
    'status': 'running',
    'start_time': time.time(),
    'providers': {
        # AI Models
        'local': {
            'name': 'Local AI Model',
            'type': 'ai',
            'category': 'local',
            'status': 'active',
            'priority': 1,
            'requests': 0,
            'last_used': None
        },
        'ollama': {
            'name': 'Ollama (Mistral/Llama)',
            'type': 'ai',
            'category': 'local',
            'status': 'active',
            'priority': 2,
            'requests': 0,
            'last_used': None
        },
        'perplexity': {
            'name': 'Perplexity API',
            'type': 'ai',
            'category': 'cloud',
            'status': 'active',
            'priority': 3,
            'requests': 0,
            'last_used': None
        },
        'openai': {
            'name': 'OpenAI GPT-4',
            'type': 'ai',
            'category': 'cloud',
            'status': 'inactive',  # Paid provider, disabled by default
            'priority': 4,
            'requests': 0,
            'last_used': None
        },
        'mistral': {
            'name': 'Mistral AI',
            'type': 'ai',
            'category': 'cloud',
            'status': 'inactive',  # Paid provider, disabled by default
            'priority': 5,
            'requests': 0,
            'last_used': None
        },
        'anthropic': {
            'name': 'Anthropic Claude',
            'type': 'ai',
            'category': 'cloud',
            'status': 'inactive',  # Paid provider, disabled by default
            'priority': 6,
            'requests': 0,
            'last_used': None
        },
        'gemini': {
            'name': 'Google Gemini',
            'type': 'ai',
            'category': 'cloud',
            'status': 'inactive',  # Paid provider, disabled by default
            'priority': 7,
            'requests': 0,
            'last_used': None
        },
        
        # Image Generation
        'stable_diffusion': {
            'name': 'Stable Diffusion',
            'type': 'image',
            'category': 'local',
            'status': 'active',
            'priority': 1,
            'requests': 0,
            'last_used': None
        },
        'dalle': {
            'name': 'OpenAI DALL-E',
            'type': 'image',
            'category': 'cloud',
            'status': 'inactive',  # Paid provider, disabled by default
            'priority': 2,
            'requests': 0,
            'last_used': None
        },
        'midjourney': {
            'name': 'Midjourney API',
            'type': 'image',
            'category': 'cloud',
            'status': 'inactive',  # Paid provider, disabled by default
            'priority': 3,
            'requests': 0,
            'last_used': None
        },
        
        # Video Generation
        'runwayml': {
            'name': 'RunwayML',
            'type': 'video',
            'category': 'cloud',
            'status': 'inactive',  # Paid provider, disabled by default
            'priority': 1,
            'requests': 0,
            'last_used': None
        },
        'pika': {
            'name': 'Pika Labs',
            'type': 'video',
            'category': 'cloud',
            'status': 'inactive',  # Paid provider, disabled by default
            'priority': 2,
            'requests': 0,
            'last_used': None
        },
        
        # Communication
        'mailgun': {
            'name': 'Mailgun',
            'type': 'email',
            'category': 'cloud',
            'status': 'inactive',  # Paid provider, disabled by default
            'priority': 1,
            'requests': 0,
            'last_used': None
        },
        'twilio': {
            'name': 'Twilio SMS',
            'type': 'sms',
            'category': 'cloud',
            'status': 'inactive',  # Paid provider, disabled by default
            'priority': 1,
            'requests': 0,
            'last_used': None
        }
    },
    'memory_system': {
        'enabled': True,
        'cache_size': 1000,
        'current_items': 0
    },
    'dispatcher': {
        'enabled': True,
        'smart_routing': True,
        'fallback_enabled': True
    }
}

# Memory system for caching responses
memory_cache = {}
usage_stats = {}

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get AI server status"""
    try:
        cpu_usage = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        
        status = {
            'server': AI_SERVER_CONFIG['name'],
            'port': AI_SERVER_CONFIG['port'],
            'status': AI_SERVER_CONFIG['status'],
            'version': AI_SERVER_CONFIG['version'],
            'uptime': time.time() - AI_SERVER_CONFIG['start_time'],
            'system': {
                'cpu_usage': cpu_usage,
                'memory_usage': memory.percent,
                'memory_available': memory.available // (1024 * 1024)  # MB
            },
            'providers': AI_SERVER_CONFIG['providers'],
            'memory_system': AI_SERVER_CONFIG['memory_system'],
            'dispatcher': AI_SERVER_CONFIG['dispatcher'],
            'usage_stats': usage_stats,
            'timestamp': time.time()
        }
        
        logger.info(f"Status request - CPU: {cpu_usage}%, Memory: {memory.percent}%")
        return jsonify(status)
    
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def generate_response():
    """Generate AI response with smart routing"""
    try:
        data = request.get_json()
        user_input = data.get('input', '')
        user_id = data.get('user_id', 'anonymous')
        
        if not user_input:
            return jsonify({'error': 'Input is required'}), 400
        
        # Check memory cache first
        cache_key = f"{user_id}:{hash(user_input)}"
        if cache_key in memory_cache:
            logger.info(f"Cache hit for user {user_id}")
            return jsonify({
                'response': memory_cache[cache_key],
                'source': 'cache',
                'provider': 'memory_system'
            })
        
        # Smart routing based on input analysis
        selected_provider = smart_route_request(user_input)
        
        # Generate response
        response = generate_with_provider(selected_provider, user_input)
        
        # Cache the response
        if AI_SERVER_CONFIG['memory_system']['enabled']:
            cache_response(cache_key, response)
        
        # Update usage stats
        update_usage_stats(selected_provider, user_input)
        
        logger.info(f"Generated response using {selected_provider} for user {user_id}")
        
        return jsonify({
            'response': response,
            'source': 'provider',
            'provider': selected_provider,
            'cached': False
        })
    
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/providers', methods=['GET'])
def get_providers():
    """Get provider information"""
    try:
        providers = []
        for key, provider in AI_SERVER_CONFIG['providers'].items():
            providers.append({
                'id': key,
                'name': provider['name'],
                'status': provider['status'],
                'priority': provider['priority'],
                'requests': provider['requests'],
                'last_used': provider['last_used'],
                'health': check_provider_health(key)
            })
        
        return jsonify({
            'providers': providers,
            'total': len(providers),
            'active': len([p for p in providers if p['status'] == 'active'])
        })
    
    except Exception as e:
        logger.error(f"Error getting providers: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/memory', methods=['GET'])
def get_memory_stats():
    """Get memory system statistics"""
    try:
        return jsonify({
            'enabled': AI_SERVER_CONFIG['memory_system']['enabled'],
            'cache_size': AI_SERVER_CONFIG['memory_system']['cache_size'],
            'current_items': len(memory_cache),
            'cache_hit_rate': calculate_cache_hit_rate(),
            'memory_usage': len(memory_cache) / AI_SERVER_CONFIG['memory_system']['cache_size'] * 100
        })
    
    except Exception as e:
        logger.error(f"Error getting memory stats: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/dispatcher', methods=['GET'])
def get_dispatcher_info():
    """Get dispatcher configuration and rules"""
    try:
        return jsonify({
            'enabled': AI_SERVER_CONFIG['dispatcher']['enabled'],
            'smart_routing': AI_SERVER_CONFIG['dispatcher']['smart_routing'],
            'fallback_enabled': AI_SERVER_CONFIG['dispatcher']['fallback_enabled'],
            'routing_rules': get_routing_rules(),
            'usage_stats': usage_stats
        })
    
    except Exception as e:
        logger.error(f"Error getting dispatcher info: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Check all active providers
        active_providers = []
        for key, provider in AI_SERVER_CONFIG['providers'].items():
            if provider['status'] == 'active':
                health_status = check_provider_health(key)
                active_providers.append({
                    'name': provider['name'],
                    'type': provider['type'],
                    'category': provider['category'],
                    'healthy': health_status
                })
        
        return jsonify({
            'status': 'healthy',
            'server': AI_SERVER_CONFIG['name'],
            'version': AI_SERVER_CONFIG['version'],
            'uptime': time.time() - AI_SERVER_CONFIG['start_time'],
            'active_providers': active_providers,
            'memory_system': {
                'enabled': AI_SERVER_CONFIG['memory_system']['enabled'],
                'cache_hit_rate': calculate_cache_hit_rate(),
                'current_items': len(memory_cache)
            },
            'timestamp': time.time()
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/api/generate/image', methods=['POST'])
def generate_image():
    """Generate image using AI"""
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        width = data.get('width', 512)
        height = data.get('height', 512)
        style = data.get('style', 'realistic')
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Check cache first
        cache_key = f"image:{prompt}:{width}:{height}:{style}"
        if cache_key in memory_cache:
            logger.info(f"Image cache hit for: {prompt}")
            return jsonify({
                'success': True,
                'data': memory_cache[cache_key],
                'cached': True
            })
        
        # Route to appropriate image provider
        image_providers = [k for k, v in AI_SERVER_CONFIG['providers'].items() 
                          if v['type'] == 'image' and v['status'] == 'active']
        
        if not image_providers:
            return jsonify({'error': 'No active image generation providers'}), 503
        
        # Use highest priority provider
        selected_provider = min(image_providers, 
                              key=lambda x: AI_SERVER_CONFIG['providers'][x]['priority'])
        
        # Simulate image generation
        image_url = f"https://example.com/generated/image_{int(time.time())}.png"
        result = {
            'id': int(time.time()),
            'prompt': prompt,
            'width': width,
            'height': height,
            'style': style,
            'image_url': image_url,
            'provider': selected_provider,
            'processing_time': 2000,
            'status': 'completed'
        }
        
        # Cache the result
        cache_response(cache_key, result)
        update_usage_stats(selected_provider, prompt)
        
        logger.info(f"Image generated using {selected_provider}: {prompt}")
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate/video', methods=['POST'])
def generate_video():
    """Generate video using AI"""
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        duration = data.get('duration', 5)
        fps = data.get('fps', 24)
        resolution = data.get('resolution', '1920x1080')
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Check cache first
        cache_key = f"video:{prompt}:{duration}:{fps}:{resolution}"
        if cache_key in memory_cache:
            logger.info(f"Video cache hit for: {prompt}")
            return jsonify({
                'success': True,
                'data': memory_cache[cache_key],
                'cached': True
            })
        
        # Route to appropriate video provider
        video_providers = [k for k, v in AI_SERVER_CONFIG['providers'].items() 
                          if v['type'] == 'video' and v['status'] == 'active']
        
        if not video_providers:
            return jsonify({'error': 'No active video generation providers'}), 503
        
        # Use highest priority provider
        selected_provider = min(video_providers, 
                              key=lambda x: AI_SERVER_CONFIG['providers'][x]['priority'])
        
        # Simulate video generation
        video_url = f"https://example.com/generated/video_{int(time.time())}.mp4"
        result = {
            'id': int(time.time()),
            'prompt': prompt,
            'duration': duration,
            'fps': fps,
            'resolution': resolution,
            'video_url': video_url,
            'provider': selected_provider,
            'processing_time': 15000,
            'status': 'completed'
        }
        
        # Cache the result
        cache_response(cache_key, result)
        update_usage_stats(selected_provider, prompt)
        
        logger.info(f"Video generated using {selected_provider}: {prompt}")
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Video generation failed: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/communications/send', methods=['POST'])
def send_communication():
    """Send email or SMS"""
    try:
        data = request.get_json()
        comm_type = data.get('type')  # 'email' or 'sms'
        recipient = data.get('recipient')
        subject = data.get('subject', '')
        content = data.get('content')
        
        if not comm_type or not recipient or not content:
            return jsonify({'error': 'Type, recipient, and content are required'}), 400
        
        if comm_type not in ['email', 'sms']:
            return jsonify({'error': 'Type must be email or sms'}), 400
        
        # Route to appropriate communication provider
        comm_providers = [k for k, v in AI_SERVER_CONFIG['providers'].items() 
                         if v['type'] == comm_type and v['status'] == 'active']
        
        if not comm_providers:
            return jsonify({'error': f'No active {comm_type} providers'}), 503
        
        # Use highest priority provider
        selected_provider = min(comm_providers, 
                              key=lambda x: AI_SERVER_CONFIG['providers'][x]['priority'])
        
        # Simulate sending
        result = {
            'id': int(time.time()),
            'type': comm_type,
            'recipient': recipient,
            'subject': subject,
            'content': content,
            'provider': selected_provider,
            'status': 'sent',
            'sent_at': time.time()
        }
        
        update_usage_stats(selected_provider, f"{comm_type}:{recipient}")
        
        logger.info(f"{comm_type.capitalize()} sent using {selected_provider}: {recipient}")
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Communication failed: {e}")
        return jsonify({'error': str(e)}), 500

def smart_route_request(user_input):
    """Smart routing based on input analysis"""
    try:
        # Analyze input type
        input_type = analyze_input_type(user_input)
        
        # Get available providers sorted by priority
        available_providers = [
            key for key, provider in AI_SERVER_CONFIG['providers'].items()
            if provider['status'] == 'active' and check_provider_health(key)
        ]
        
        if not available_providers:
            raise Exception("No active providers available")
        
        # Route based on input type and provider capabilities
        if input_type == 'code' and 'local' in available_providers:
            return 'local'
        elif input_type == 'creative' and 'openai' in available_providers:
            return 'openai'
        elif input_type == 'technical' and 'mistral' in available_providers:
            return 'mistral'
        else:
            # Return highest priority available provider
            return available_providers[0]
    
    except Exception as e:
        logger.error(f"Smart routing error: {e}")
        # Fallback to first available provider
        available = [key for key, provider in AI_SERVER_CONFIG['providers'].items() if provider['status'] == 'active']
        return available[0] if available else 'local'

def analyze_input_type(user_input):
    """Analyze input type for smart routing"""
    input_lower = user_input.lower()
    
    # Code-related keywords
    code_keywords = ['function', 'class', 'def', 'import', 'var', 'const', 'if', 'for', 'while', 'return', 'console.log', 'print']
    if any(keyword in input_lower for keyword in code_keywords):
        return 'code'
    
    # Creative keywords
    creative_keywords = ['story', 'poem', 'creative', 'imagine', 'describe', 'write about', 'narrative']
    if any(keyword in input_lower for keyword in creative_keywords):
        return 'creative'
    
    # Technical keywords
    technical_keywords = ['explain', 'how to', 'tutorial', 'guide', 'technical', 'architecture', 'system']
    if any(keyword in input_lower for keyword in technical_keywords):
        return 'technical'
    
    return 'general'

def generate_with_provider(provider_key, user_input):
    """Generate response using specified provider"""
    try:
        provider = AI_SERVER_CONFIG['providers'][provider_key]
        
        # Simulate provider response (replace with actual API calls)
        if provider_key == 'local':
            response = f"Local AI response: {user_input} - Processed locally for better performance."
        elif provider_key == 'openai':
            response = f"OpenAI GPT-4 response: {user_input} - Enhanced with advanced language model."
        elif provider_key == 'mistral':
            response = f"Mistral AI response: {user_input} - Optimized for technical content."
        else:
            response = f"Provider {provider_key} response: {user_input}"
        
        # Update provider stats
        provider['requests'] += 1
        provider['last_used'] = time.time()
        
        return response
    
    except Exception as e:
        logger.error(f"Error generating with provider {provider_key}: {e}")
        raise

def check_provider_health(provider_key):
    """Check if provider is healthy"""
    try:
        # Simulate health check (replace with actual health checks)
        if provider_key == 'local':
            return True  # Local provider is always available
        elif provider_key == 'openai':
            # Simulate API check
            return True
        elif provider_key == 'mistral':
            # Simulate API check
            return True
        else:
            return False
    
    except Exception as e:
        logger.error(f"Health check failed for {provider_key}: {e}")
        return False

def cache_response(key, response):
    """Cache response in memory"""
    try:
        if len(memory_cache) >= AI_SERVER_CONFIG['memory_system']['cache_size']:
            # Remove oldest item
            oldest_key = next(iter(memory_cache))
            del memory_cache[oldest_key]
        
        memory_cache[key] = response
        AI_SERVER_CONFIG['memory_system']['current_items'] = len(memory_cache)
        
    except Exception as e:
        logger.error(f"Error caching response: {e}")

def update_usage_stats(provider, user_input):
    """Update usage statistics"""
    try:
        if provider not in usage_stats:
            usage_stats[provider] = {
                'total_requests': 0,
                'successful_requests': 0,
                'failed_requests': 0,
                'last_used': None,
                'average_response_time': 0
            }
        
        usage_stats[provider]['total_requests'] += 1
        usage_stats[provider]['successful_requests'] += 1
        usage_stats[provider]['last_used'] = time.time()
        
    except Exception as e:
        logger.error(f"Error updating usage stats: {e}")

def calculate_cache_hit_rate():
    """Calculate cache hit rate"""
    try:
        # This would be calculated from actual usage data
        return 0.75  # Simulated 75% hit rate
    except Exception as e:
        logger.error(f"Error calculating cache hit rate: {e}")
        return 0

def get_routing_rules():
    """Get current routing rules"""
    return {
        'code_requests': 'local',
        'creative_requests': 'openai',
        'technical_requests': 'mistral',
        'fallback': 'local'
    }

# Background health check thread
def health_check_worker():
    """Background worker for periodic health checks"""
    while True:
        try:
            logger.info("Running periodic health check...")
            for provider_key in AI_SERVER_CONFIG['providers']:
                health = check_provider_health(provider_key)
                if not health:
                    logger.warning(f"Provider {provider_key} is unhealthy")
                    AI_SERVER_CONFIG['providers'][provider_key]['status'] = 'inactive'
                else:
                    AI_SERVER_CONFIG['providers'][provider_key]['status'] = 'active'
            
            time.sleep(300)  # Check every 5 minutes
            
        except Exception as e:
            logger.error(f"Health check worker error: {e}")
            time.sleep(60)

if __name__ == '__main__':
    logger.info("Starting AI Server on port 8002...")
    
    # Start health check worker
    health_thread = threading.Thread(target=health_check_worker, daemon=True)
    health_thread.start()
    
    app.run(host='0.0.0.0', port=8002, debug=True) 