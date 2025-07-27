import os
import json
from typing import Optional, Dict, Any
import requests
from gtts import gTTS

class VoiceHandler:
    def __init__(self):
        self.config = self._load_config()
        self.default_voice = self.config.get('default_voice', 'google_tts')
        
    def _load_config(self) -> Dict[str, Any]:
        """Load voice configuration"""
        config_path = os.path.join(
            os.path.dirname(__file__),
            'voice_config.json'
        )
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                return json.load(f)
        return {}
        
    def generate_speech(self, text: str, voice_id: str = None) -> bytes:
        """Generate speech from text using specified voice"""
        voice_id = voice_id or self.default_voice
        
        # Google TTS (default/fallback)
        if voice_id == 'google_tts':
            return self._google_tts(text)
            
        # Coqui TTS
        elif voice_id.startswith('coqui_'):
            return self._coqui_tts(text, voice_id)
            
        # ElevenLabs
        elif voice_id.startswith('eleven_'):
            return self._elevenlabs_tts(text, voice_id)
            
        # Fallback to Google TTS
        else:
            return self._google_tts(text)
            
    def _google_tts(self, text: str) -> bytes:
        """Generate speech using Google TTS"""
        tts = gTTS(text=text, lang='bn')
        temp_file = 'temp_speech.mp3'
        tts.save(temp_file)
        with open(temp_file, 'rb') as f:
            audio_data = f.read()
        os.remove(temp_file)
        return audio_data
        
    def _coqui_tts(self, text: str, voice_id: str) -> bytes:
        """Generate speech using Coqui TTS"""
        if 'coqui' not in self.config:
            raise ValueError("Coqui TTS not configured")
            
        # Get model name from voice_id (e.g., coqui_bn_female)
        model = voice_id.replace('coqui_', '')
        
        response = requests.post(
            f"{self.config['coqui']['api_url']}/tts",
            json={
                'text': text,
                'model': model
            },
            headers={
                'Authorization': f"Bearer {self.config['coqui']['api_key']}"
            }
        )
        
        if response.ok:
            return response.content
        else:
            raise Exception(f"Coqui TTS error: {response.text}")
            
    def _elevenlabs_tts(self, text: str, voice_id: str) -> bytes:
        """Generate speech using ElevenLabs"""
        if 'elevenlabs' not in self.config:
            raise ValueError("ElevenLabs not configured")
            
        # Get voice ID from config mapping
        voice = voice_id.replace('eleven_', '')
        voice_id = self.config['elevenlabs']['voices'].get(voice)
        if not voice_id:
            raise ValueError(f"Voice {voice} not found in ElevenLabs config")
            
        response = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            json={
                'text': text,
                'model_id': 'eleven_multilingual_v1'
            },
            headers={
                'xi-api-key': self.config['elevenlabs']['api_key']
            }
        )
        
        if response.ok:
            return response.content
        else:
            raise Exception(f"ElevenLabs error: {response.text}")

# Global instance
voice_handler = VoiceHandler()

def generate_speech(text: str, voice_id: str = None) -> bytes:
    """Generate speech using the voice handler"""
    return voice_handler.generate_speech(text, voice_id) 