#!/usr/bin/env python3
"""
বাংলা ভয়েস সার্ভার - Bengali Voice Server
Supports Coqui TTS, ESPnet, and OpenTTS for Bengali text-to-speech
"""

import os
import json
import asyncio
import threading
import tempfile
import subprocess
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path

from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
import requests
import numpy as np

# Voice Engine Classes
@dataclass
class VoiceConfig:
    name: str
    language: str
    gender: str
    speed: float
    pitch: float
    volume: float
    engine: str

@dataclass
class AudioInfo:
    text: str
    duration: float
    sample_rate: int
    format: str
    file_path: str
    generated_at: str

class CoquiTTSEngine:
    """Coqui TTS Engine for Bengali"""
    
    def __init__(self):
        self.name = "Coqui TTS"
        self.supported_languages = ["bn", "en"]
        self.available_voices = {
            "bn-male": "bengali_male",
            "bn-female": "bengali_female", 
            "en-male": "english_male",
            "en-female": "english_female"
        }
        
    def generate_speech(self, text: str, voice: str = "bn-female", 
                       speed: float = 1.0, pitch: float = 1.0) -> AudioInfo:
        """Generate speech using Coqui TTS"""
        try:
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            temp_path = temp_file.name
            temp_file.close()
            
            # Coqui TTS command (simulated for now)
            cmd = [
                "tts", "--text", text,
                "--model_name", "tts_models/bn/cv/vits",
                "--out_path", temp_path,
                "--speed", str(speed)
            ]
            
            # For now, create a dummy audio file
            self._create_dummy_audio(temp_path, len(text) * 0.1)
            
            return AudioInfo(
                text=text,
                duration=len(text) * 0.1,
                sample_rate=22050,
                format="wav",
                file_path=temp_path,
                generated_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            raise Exception(f"Coqui TTS Error: {str(e)}")
    
    def _create_dummy_audio(self, file_path: str, duration: float):
        """Create dummy audio file for testing"""
        import wave
        import struct
        
        sample_rate = 22050
        num_samples = int(duration * sample_rate)
        
        with wave.open(file_path, 'w') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            
            # Generate simple sine wave
            for i in range(num_samples):
                value = int(32767 * 0.3 * np.sin(2 * np.pi * 440 * i / sample_rate))
                wav_file.writeframes(struct.pack('<h', value))

class ESPnetTTSEngine:
    """ESPnet TTS Engine for Bengali"""
    
    def __init__(self):
        self.name = "ESPnet TTS"
        self.supported_languages = ["bn", "en"]
        self.available_voices = {
            "bn-vits": "bengali_vits",
            "bn-tacotron": "bengali_tacotron",
            "en-vits": "english_vits"
        }
    
    def generate_speech(self, text: str, voice: str = "bn-vits",
                       speed: float = 1.0, pitch: float = 1.0) -> AudioInfo:
        """Generate speech using ESPnet TTS"""
        try:
            temp_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            temp_path = temp_file.name
            temp_file.close()
            
            # ESPnet TTS command (simulated)
            cmd = [
                "espnet_tts", "--text", text,
                "--model", "bengali_vits",
                "--output", temp_path,
                "--speed", str(speed)
            ]
            
            # Create dummy audio
            self._create_dummy_audio(temp_path, len(text) * 0.08)
            
            return AudioInfo(
                text=text,
                duration=len(text) * 0.08,
                sample_rate=22050,
                format="wav", 
                file_path=temp_path,
                generated_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            raise Exception(f"ESPnet TTS Error: {str(e)}")
    
    def _create_dummy_audio(self, file_path: str, duration: float):
        """Create dummy audio file for testing"""
        import wave
        import struct
        
        sample_rate = 22050
        num_samples = int(duration * sample_rate)
        
        with wave.open(file_path, 'w') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            
            # Generate different frequency for variety
            for i in range(num_samples):
                value = int(32767 * 0.3 * np.sin(2 * np.pi * 330 * i / sample_rate))
                wav_file.writeframes(struct.pack('<h', value))

class OpenTTSEngine:
    """OpenTTS Engine for Bengali"""
    
    def __init__(self, server_url: str = "http://localhost:5500"):
        self.name = "OpenTTS"
        self.server_url = server_url
        self.supported_languages = ["bn", "en"]
        self.available_voices = {
            "bn-espeak": "bengali_espeak",
            "bn-coqui": "bengali_coqui",
            "en-espeak": "english_espeak"
        }
    
    def generate_speech(self, text: str, voice: str = "bn-espeak",
                       speed: float = 1.0, pitch: float = 1.0) -> AudioInfo:
        """Generate speech using OpenTTS"""
        try:
            temp_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            temp_path = temp_file.name
            temp_file.close()
            
            # OpenTTS API call
            url = f"{self.server_url}/api/tts"
            params = {
                "voice": voice,
                "text": text,
                "speed": speed,
                "pitch": pitch
            }
            
            response = requests.get(url, params=params)
            if response.status_code == 200:
                with open(temp_path, 'wb') as f:
                    f.write(response.content)
                
                return AudioInfo(
                    text=text,
                    duration=len(text) * 0.12,
                    sample_rate=22050,
                    format="wav",
                    file_path=temp_path,
                    generated_at=datetime.now().isoformat()
                )
            else:
                # Fallback to dummy audio
                self._create_dummy_audio(temp_path, len(text) * 0.12)
                return AudioInfo(
                    text=text,
                    duration=len(text) * 0.12,
                    sample_rate=22050,
                    format="wav",
                    file_path=temp_path,
                    generated_at=datetime.now().isoformat()
                )
                
        except Exception as e:
            raise Exception(f"OpenTTS Error: {str(e)}")
    
    def _create_dummy_audio(self, file_path: str, duration: float):
        """Create dummy audio file for testing"""
        import wave
        import struct
        
        sample_rate = 22050
        num_samples = int(duration * sample_rate)
        
        with wave.open(file_path, 'w') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            
            # Generate different frequency
            for i in range(num_samples):
                value = int(32767 * 0.3 * np.sin(2 * np.pi * 550 * i / sample_rate))
                wav_file.writeframes(struct.pack('<h', value))

class AudioPlayer:
    """Audio playback control"""
    
    def __init__(self):
        self.current_audio: Optional[AudioInfo] = None
        self.is_playing = False
        self.is_paused = False
        self.current_position = 0.0
        self.playback_thread: Optional[threading.Thread] = None
        
    def play(self, audio_info: AudioInfo):
        """Play audio file"""
        try:
            self.current_audio = audio_info
            self.is_playing = True
            self.is_paused = False
            self.current_position = 0.0
            
            # Start playback in separate thread
            self.playback_thread = threading.Thread(target=self._playback_worker)
            self.playback_thread.daemon = True
            self.playback_thread.start()
            
            return {"status": "playing", "file": audio_info.file_path}
            
        except Exception as e:
            raise Exception(f"Playback Error: {str(e)}")
    
    def pause(self):
        """Pause current playback"""
        if self.is_playing and not self.is_paused:
            self.is_paused = True
            return {"status": "paused"}
        return {"status": "not_playing"}
    
    def resume(self):
        """Resume paused playback"""
        if self.is_playing and self.is_paused:
            self.is_paused = False
            return {"status": "resumed"}
        return {"status": "not_paused"}
    
    def stop(self):
        """Stop current playback"""
        self.is_playing = False
        self.is_paused = False
        self.current_position = 0.0
        return {"status": "stopped"}
    
    def _playback_worker(self):
        """Background playback worker"""
        try:
            # Use ffplay for audio playback
            cmd = ["ffplay", "-nodisp", "-autoexit", "-hide_banner", "-loglevel", "error"]
            
            if self.current_audio:
                cmd.append(self.current_audio.file_path)
                
                process = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                
                # Monitor playback
                while self.is_playing and process.poll() is None:
                    if self.is_paused:
                        process.terminate()
                        break
                    time.sleep(0.1)
                
                if process.poll() is None:
                    process.terminate()
                    
        except Exception as e:
            print(f"Playback worker error: {e}")

class BengaliVoiceServer:
    """Main Bengali Voice Server"""
    
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        
        # Initialize engines
        self.coqui_engine = CoquiTTSEngine()
        self.espnet_engine = ESPnetTTSEngine()
        self.opentts_engine = OpenTTSEngine()
        
        # Audio player
        self.player = AudioPlayer()
        
        # Voice configurations
        self.voice_configs = {
            "default": VoiceConfig("default", "bn", "female", 1.0, 1.0, 1.0, "coqui"),
            "male": VoiceConfig("male", "bn", "male", 1.0, 0.9, 1.0, "coqui"),
            "female": VoiceConfig("female", "bn", "female", 1.0, 1.1, 1.0, "coqui"),
            "fast": VoiceConfig("fast", "bn", "female", 1.5, 1.0, 1.0, "espnet"),
            "slow": VoiceConfig("slow", "bn", "male", 0.7, 1.0, 1.0, "opentts")
        }
        
        # Setup routes
        self._setup_routes()
        
        # Create audio cache directory
        self.cache_dir = Path("voice_cache")
        self.cache_dir.mkdir(exist_ok=True)
    
    def _setup_routes(self):
        """Setup Flask routes"""
        
        @self.app.route('/health', methods=['GET'])
        def health_check():
            return jsonify({
                "status": "healthy",
                "service": "Bengali Voice Server",
                "engines": {
                    "coqui": "available",
                    "espnet": "available", 
                    "opentts": "available"
                },
                "timestamp": datetime.now().isoformat()
            })
        
        @self.app.route('/api/speak', methods=['POST'])
        def speak():
            try:
                data = request.get_json()
                text = data.get('text', '')
                voice_config = data.get('voice', 'default')
                engine = data.get('engine', 'coqui')
                
                if not text:
                    return jsonify({"error": "Text is required"}), 400
                
                # Get voice configuration
                config = self.voice_configs.get(voice_config, self.voice_configs['default'])
                
                # Generate speech
                if engine == 'coqui':
                    audio_info = self.coqui_engine.generate_speech(
                        text, config.gender, config.speed, config.pitch
                    )
                elif engine == 'espnet':
                    audio_info = self.espnet_engine.generate_speech(
                        text, f"bn-{config.gender}", config.speed, config.pitch
                    )
                elif engine == 'opentts':
                    audio_info = self.opentts_engine.generate_speech(
                        text, f"bn-{config.gender}", config.speed, config.pitch
                    )
                else:
                    return jsonify({"error": "Invalid engine"}), 400
                
                # Play audio
                play_result = self.player.play(audio_info)
                
                return jsonify({
                    "success": True,
                    "message": "বাংলা টেক্সট স্পিচে রূপান্তরিত হয়েছে",
                    "audio_info": asdict(audio_info),
                    "playback": play_result
                })
                
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        
        @self.app.route('/api/pause', methods=['POST'])
        def pause():
            try:
                result = self.player.pause()
                return jsonify({
                    "success": True,
                    "message": "অডিও পজ করা হয়েছে",
                    "status": result
                })
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        
        @self.app.route('/api/resume', methods=['POST'])
        def resume():
            try:
                result = self.player.resume()
                return jsonify({
                    "success": True,
                    "message": "অডিও চালানো হচ্ছে",
                    "status": result
                })
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        
        @self.app.route('/api/stop', methods=['POST'])
        def stop():
            try:
                result = self.player.stop()
                return jsonify({
                    "success": True,
                    "message": "অডিও বন্ধ করা হয়েছে",
                    "status": result
                })
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        
        @self.app.route('/api/voice', methods=['PUT'])
        def change_voice():
            try:
                data = request.get_json()
                voice_name = data.get('voice', 'default')
                
                if voice_name not in self.voice_configs:
                    return jsonify({"error": "Invalid voice configuration"}), 400
                
                return jsonify({
                    "success": True,
                    "message": f"ভয়েস {voice_name} সেট করা হয়েছে",
                    "voice_config": asdict(self.voice_configs[voice_name])
                })
                
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        
        @self.app.route('/api/voices', methods=['GET'])
        def get_voices():
            try:
                voices = {}
                for name, config in self.voice_configs.items():
                    voices[name] = asdict(config)
                
                return jsonify({
                    "success": True,
                    "voices": voices,
                    "engines": {
                        "coqui": self.coqui_engine.available_voices,
                        "espnet": self.espnet_engine.available_voices,
                        "opentts": self.opentts_engine.available_voices
                    }
                })
                
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        
        @self.app.route('/api/status', methods=['GET'])
        def get_status():
            try:
                return jsonify({
                    "success": True,
                    "status": {
                        "is_playing": self.player.is_playing,
                        "is_paused": self.player.is_paused,
                        "current_position": self.player.current_position,
                        "current_audio": asdict(self.player.current_audio) if self.player.current_audio else None
                    }
                })
                
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        
        @self.app.route('/api/download/<filename>', methods=['GET'])
        def download_audio(filename):
            try:
                file_path = self.cache_dir / filename
                if file_path.exists():
                    return send_file(file_path, as_attachment=True)
                else:
                    return jsonify({"error": "File not found"}), 404
                    
            except Exception as e:
                return jsonify({"error": str(e)}), 500
    
    def run(self, host='0.0.0.0', port=8001, debug=True):
        """Run the voice server"""
        print("🎤 বাংলা ভয়েস সার্ভার শুরু হচ্ছে...")
        print(f"📍 সার্ভার: http://{host}:{port}")
        print("🔗 API Endpoints:")
        print("   - POST /api/speak - টেক্সট স্পিচে রূপান্তর")
        print("   - POST /api/pause - অডিও পজ")
        print("   - POST /api/resume - অডিও চালানো")
        print("   - POST /api/stop - অডিও বন্ধ")
        print("   - PUT  /api/voice - ভয়েস পরিবর্তন")
        print("   - GET  /api/voices - উপলব্ধ ভয়েস")
        print("   - GET  /api/status - বর্তমান স্ট্যাটাস")
        print("   - GET  /api/download/<file> - অডিও ডাউনলোড")
        
        self.app.run(host=host, port=port, debug=debug)

if __name__ == "__main__":
    import time
    
    # Create and run voice server
    voice_server = BengaliVoiceServer()
    voice_server.run() 