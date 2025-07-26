import os
import sys
import time
import tempfile
import subprocess
import logging
from datetime import datetime
from flask import Flask, request, jsonify, send_file, render_template
from flask_socketio import SocketIO, emit
import pyttsx3
import speech_recognition as sr
from werkzeug.utils import secure_filename
import threading
import queue
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
socketio = SocketIO(app, cors_allowed_origins="*")

# Global variables for tracking
voice_requests = []
system_stats = {
    "cpu_usage": 0,
    "memory_usage": 0,
    "active_connections": 0,
    "tts_requests": 0,
    "stt_requests": 0
}

# Audio configuration
AUDIO_CONFIG = {
    "sample_rate": 16000,
    "channels": 1,
    "format": "wav",
    "volume": 0.9,
    "speed": 150,
    "audio_devices": {
        "default": "default",
        "speakers": "pulse",
        "headphones": "alsa"
    }
}

# Audio playback queue for streaming
audio_queue = queue.Queue()
is_playing = False

def setup_audio_system():
    """Setup audio system for better compatibility"""
    try:
        # Set environment variables for audio
        os.environ['PULSE_RUNTIME_PATH'] = '/run/user/1000/pulse'
        os.environ['XDG_RUNTIME_DIR'] = '/run/user/1000'
        
        # Test audio devices
        test_audio_devices()
        
        logger.info("Audio system configured successfully")
        return True
    except Exception as e:
        logger.error(f"Audio setup failed: {e}")
        return False

def test_audio_devices():
    """Test available audio devices"""
    devices = {
        'pulse': 'pactl list sinks',
        'alsa': 'aplay -l',
        'default': 'ffplay -version'
    }
    
    for device_type, command in devices.items():
        try:
            result = subprocess.run(command.split(), capture_output=True, text=True)
            if result.returncode == 0:
                logger.info(f"✅ {device_type} audio device available")
            else:
                logger.warning(f"⚠️ {device_type} audio device not available")
        except Exception as e:
            logger.warning(f"⚠️ {device_type} test failed: {e}")

def play_audio_stream(audio_file, duration=5):
    """Play audio with streaming support"""
    try:
        # Use ffplay for better compatibility
        cmd = [
            'ffplay', '-nodisp', '-autoexit', '-loglevel', 'error',
            '-af', f'volume={AUDIO_CONFIG["volume"]}',
            audio_file
        ]
        
        # Start playback
        process = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Wait for specified duration or process completion
        try:
            process.wait(timeout=duration)
        except subprocess.TimeoutExpired:
            process.terminate()
            logger.info(f"Audio playback stopped after {duration} seconds")
        
        return True
    except Exception as e:
        logger.error(f"Audio playback failed: {e}")
        return False

def audio_player_worker():
    """Background worker for audio playback"""
    global is_playing
    
    while True:
        try:
            if not audio_queue.empty():
                is_playing = True
                audio_file, duration = audio_queue.get()
                play_audio_stream(audio_file, duration)
                audio_queue.task_done()
            else:
                is_playing = False
                time.sleep(0.1)
        except Exception as e:
            logger.error(f"Audio worker error: {e}")
            is_playing = False

# Start audio worker thread
audio_thread = threading.Thread(target=audio_player_worker, daemon=True)
audio_thread.start()

def update_system_stats():
    """Update system statistics"""
    try:
        # CPU usage
        with open('/proc/loadavg', 'r') as f:
            load = float(f.read().split()[0])
        system_stats["cpu_usage"] = round(load * 100, 2)
        
        # Memory usage
        with open('/proc/meminfo', 'r') as f:
            lines = f.readlines()
            total = int(lines[0].split()[1])
            available = int(lines[2].split()[1])
            used = total - available
        system_stats["memory_usage"] = round((used / total) * 100, 2)
        
        # Active connections
        system_stats["active_connections"] = len(socketio.server.manager.rooms.get('/', {}))
        
    except Exception as e:
        logger.error(f"Stats update error: {e}")

@app.route("/")
def index():
    """Main page"""
    return jsonify({
        "message": "Bengali Voice Server is running!",
        "status": "active",
        "endpoints": {
            "status": "/api/status",
            "tts": "/api/tts",
            "stt": "/api/stt",
            "voice_chat": "/api/voice_chat",
            "voices": "/api/voices",
            "logs": "/api/logs",
            "health": "/api/health"
        }
    })

@app.route("/api/status")
def status():
    """Get system status"""
    update_system_stats()
    return jsonify({
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "stats": system_stats,
        "audio_config": AUDIO_CONFIG,
        "is_playing": is_playing,
        "queue_size": audio_queue.qsize()
    })

@app.route("/api/tts", methods=["POST"])
def text_to_speech():
    """Text-to-Speech endpoint with Bengali support and streaming"""
    data = request.get_json()
    text = data.get("text", "")
    language = data.get("language", "en")
    voice = data.get("voice", "default")
    stream = data.get("stream", False)
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    start_time = time.time()
    
    try:
        # Import Bengali TTS
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        try:
            from shared.utils.bengali_voice import BengaliTTS
        except ImportError:
            BengaliTTS = None
        
        # Clean text (remove special symbols)
        clean_text = clean_text_for_tts(text)
        
        # Initialize TTS engine
        if language == "bn" and BengaliTTS:
            # Use Bengali TTS
            tts = BengaliTTS("pyttsx3_bengali")
            audio_path = tts.text_to_speech(clean_text)
        else:
            # Use regular pyttsx3 for other languages
            engine = pyttsx3.init()
            engine.setProperty('rate', AUDIO_CONFIG["speed"])
            engine.setProperty('volume', AUDIO_CONFIG["volume"])
            
            # Generate audio
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tf:
                engine.save_to_file(clean_text, tf.name)
                engine.runAndWait()
                audio_path = tf.name
        
        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000
        
        # Log request
        voice_requests.append({
            "timestamp": datetime.now().isoformat(),
            "type": "tts",
            "language": language,
            "text_length": len(clean_text),
            "processing_time_ms": round(processing_time, 2)
        })
        
        # Keep only last 100 entries
        if len(voice_requests) > 100:
            voice_requests.pop(0)
        
        # Update stats
        system_stats["tts_requests"] += 1
        
        # Emit real-time update
        socketio.emit('tts_complete', {
            'text_length': len(clean_text),
            'language': language,
            'processing_time': round(processing_time, 2),
            'timestamp': datetime.now().isoformat()
        })
        
        # Handle streaming
        if stream:
            # Add to playback queue
            duration = min(5, len(clean_text) / 10)  # 5 seconds or text-based duration
            audio_queue.put((audio_path, duration))
            
            return jsonify({
                "success": True,
                "message": "Audio queued for playback",
                "duration": duration,
                "queue_position": audio_queue.qsize()
            })
        else:
            # Return audio file
            return send_file(audio_path, mimetype="audio/wav", as_attachment=True, download_name="speech.wav")
        
    except Exception as e:
        logger.error(f"TTS error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

def clean_text_for_tts(text):
    """Clean text for TTS by removing special symbols"""
    import re
    
    # Remove special symbols but keep Bengali text
    cleaned = re.sub(r'[#*@$%^&*()_+\-=\[\]{}|\\:";\'<>?,./]', '', text)
    
    # Remove emojis
    cleaned = re.sub(r'[😀-🙏🌀-🗿🚀-🛿]', '', cleaned)
    
    # Remove extra whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    return cleaned

@app.route("/api/stt", methods=["POST"])
def speech_to_text():
    """Speech-to-Text endpoint with Bengali support"""
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    language = request.form.get("language", "en")
    
    start_time = time.time()
    
    try:
        # Import Bengali STT
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        try:
            from shared.utils.bengali_voice import BengaliSTT
        except ImportError:
            BengaliSTT = None
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tf:
            audio_file.save(tf.name)
            temp_audio_path = tf.name
        
        # Initialize STT
        if language == "bn" and BengaliSTT:
            stt = BengaliSTT("whisper_bengali")
            text = stt.speech_to_text(temp_audio_path)
        else:
            # Use regular speech recognition for other languages
            recognizer = sr.Recognizer()
            with sr.AudioFile(temp_audio_path) as source:
                audio = recognizer.record(source)
            text = recognizer.recognize_google(audio, language="en-US")
        
        # Clean up temporary file
        os.unlink(temp_audio_path)
        
        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000
        
        # Log request
        voice_requests.append({
            "timestamp": datetime.now().isoformat(),
            "type": "stt",
            "language": language,
            "processing_time_ms": round(processing_time, 2)
        })
        
        # Update stats
        system_stats["stt_requests"] += 1
        
        return jsonify({
            "success": True,
            "text": text,
            "language": language,
            "processing_time": round(processing_time, 2)
        })
        
    except Exception as e:
        logger.error(f"STT error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/voice_chat", methods=["POST"])
def voice_chat():
    """Voice chat endpoint with streaming support"""
    data = request.get_json()
    text = data.get("text", "")
    language = data.get("language", "en")
    stream = data.get("stream", True)
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    try:
        # Clean text
        clean_text = clean_text_for_tts(text)
        
        # Generate response (you can integrate with AI here)
        response = f"আপনি বলেছেন: {clean_text}"
        
        # Generate audio
        if language == "bn":
            # Use eSpeak for Bengali
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tf:
                cmd = [
                    "espeak-ng", "-v", "bengali", 
                    "-s", str(AUDIO_CONFIG["speed"]),
                    "-w", tf.name,
                    response
                ]
                subprocess.run(cmd, check=True)
                audio_path = tf.name
        else:
            # Use pyttsx3 for other languages
            engine = pyttsx3.init()
            engine.setProperty('rate', AUDIO_CONFIG["speed"])
            engine.setProperty('volume', AUDIO_CONFIG["volume"])
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tf:
                engine.save_to_file(response, tf.name)
                engine.runAndWait()
                audio_path = tf.name
        
        # Handle streaming
        if stream:
            # Add to playback queue
            duration = min(5, len(response) / 10)
            audio_queue.put((audio_path, duration))
            
            return jsonify({
                "success": True,
                "response": response,
                "audio_queued": True,
                "duration": duration
            })
        else:
            return send_file(audio_path, mimetype="audio/wav", as_attachment=True, download_name="response.wav")
        
    except Exception as e:
        logger.error(f"Voice chat error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/voices")
def get_available_voices():
    """Get available voices"""
    try:
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')
        
        voice_list = []
        for voice in voices:
            voice_list.append({
                "id": voice.id,
                "name": voice.name,
                "languages": voice.languages,
                "gender": voice.gender,
                "age": voice.age
            })
        
        return jsonify({
            "success": True,
            "voices": voice_list
        })
    except Exception as e:
        logger.error(f"Voice list error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/logs")
def get_logs():
    """Get recent voice requests"""
    return jsonify({
        "success": True,
        "logs": voice_requests[-50:]  # Last 50 requests
    })

@app.route("/api/health")
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "audio_system": setup_audio_system()
    })

# WebSocket events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('status', {'message': 'Connected to voice server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('voice_request')
def handle_voice_request(data):
    """Handle voice requests via WebSocket"""
    try:
        text = data.get('text', '')
        language = data.get('language', 'en')
        
        if text:
            # Process TTS request
            response = text_to_speech()
            emit('voice_response', response.get_json())
    except Exception as e:
        emit('error', {'message': str(e)})

if __name__ == "__main__":
    # Setup audio system
    setup_audio_system()
    
    # Start server
    socketio.run(app, host="0.0.0.0", port=8001, debug=True) 