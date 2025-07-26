"""
Bengali Voice Processing Utilities
বাংলা ভয়েস প্রসেসিং ইউটিলিটি
"""

import os
import tempfile
import logging
from typing import Optional, Dict, Any
from pathlib import Path

# Import voice processing libraries
try:
    import pyttsx3
    import speech_recognition as sr
    from gtts import gTTS
    import pygame
    PYTTSX3_AVAILABLE = True
    GTTS_AVAILABLE = True
    PYGAME_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False
    GTTS_AVAILABLE = False
    PYGAME_AVAILABLE = False

try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False

from .bengali_models import (
    BENGALI_TTS_MODELS, 
    BENGALI_STT_MODELS,
    BENGALI_VOICE_SETTINGS,
    BENGALI_STT_SETTINGS,
    get_model_path,
    is_model_downloaded
)

logger = logging.getLogger(__name__)

class BengaliTTS:
    """Bengali Text-to-Speech processor"""
    
    def __init__(self, model_name: str = "pyttsx3_bengali"):
        self.model_name = model_name
        self.engine = None
        self.model_config = BENGALI_TTS_MODELS.get(model_name, {})
        self.settings = BENGALI_VOICE_SETTINGS
        self._initialize_engine()
    
    def _initialize_engine(self):
        """Initialize the TTS engine"""
        try:
            if self.model_name == "pyttsx3_bengali" and PYTTSX3_AVAILABLE:
                self.engine = pyttsx3.init()
                self._configure_engine()
            elif self.model_name == "coqui_bengali":
                # Coqui TTS implementation would go here
                logger.info("Coqui TTS not implemented yet, falling back to pyttsx3")
                self.engine = pyttsx3.init()
                self._configure_engine()
            else:
                logger.warning(f"Model {self.model_name} not available, using fallback")
                self.engine = pyttsx3.init()
                self._configure_engine()
        except Exception as e:
            logger.error(f"Failed to initialize TTS engine: {e}")
            self.engine = None
    
    def _configure_engine(self):
        """Configure the TTS engine settings"""
        if not self.engine:
            return
        
        try:
            # Set speech rate
            self.engine.setProperty('rate', self.settings["speech_rate"])
            
            # Set volume
            self.engine.setProperty('volume', self.settings["volume"])
            
            # Try to set Bengali voice
            voices = self.engine.getProperty('voices')
            bengali_voice = None
            
            for voice in voices:
                voice_name = voice.name.lower()
                if any(keyword in voice_name for keyword in ['bengali', 'bangla', 'bn', 'bd']):
                    bengali_voice = voice.id
                    break
            
            if bengali_voice:
                self.engine.setProperty('voice', bengali_voice)
                logger.info(f"Set Bengali voice: {bengali_voice}")
            else:
                logger.warning("No Bengali voice found, using default")
                
        except Exception as e:
            logger.error(f"Failed to configure TTS engine: {e}")
    
    def text_to_speech(self, text: str, output_path: Optional[str] = None) -> Optional[str]:
        """Convert Bengali text to speech"""
        if not self.engine:
            logger.error("TTS engine not initialized")
            return None
        
        try:
            if not output_path:
                # Create temporary file
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
                output_path = temp_file.name
                temp_file.close()
            
            # Generate speech
            self.engine.save_to_file(text, output_path)
            self.engine.runAndWait()
            
            logger.info(f"Generated speech: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Failed to generate speech: {e}")
            return None
    
    def play_speech(self, audio_path: str):
        """Play the generated speech"""
        try:
            if PYGAME_AVAILABLE:
                pygame.mixer.init()
                pygame.mixer.music.load(audio_path)
                pygame.mixer.music.play()
                while pygame.mixer.music.get_busy():
                    pygame.time.Clock().tick(10)
                pygame.mixer.quit()
            else:
                # Fallback to system command
                os.system(f"mpg123 {audio_path}")
        except Exception as e:
            logger.error(f"Failed to play speech: {e}")

class BengaliSTT:
    """Bengali Speech-to-Text processor"""
    
    def __init__(self, model_name: str = "whisper_bengali"):
        self.model_name = model_name
        self.model = None
        self.recognizer = None
        self.model_config = BENGALI_STT_MODELS.get(model_name, {})
        self.settings = BENGALI_STT_SETTINGS
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the STT model"""
        try:
            if self.model_name == "whisper_bengali" and WHISPER_AVAILABLE:
                # Load Whisper model
                model_size = "base"  # Can be tiny, base, small, medium, large
                self.model = whisper.load_model(model_size)
                logger.info(f"Loaded Whisper model: {model_size}")
            else:
                # Fallback to speech recognition
                self.recognizer = sr.Recognizer()
                logger.info("Using speech recognition fallback")
        except Exception as e:
            logger.error(f"Failed to initialize STT model: {e}")
    
    def speech_to_text(self, audio_path: str) -> Optional[str]:
        """Convert Bengali speech to text"""
        try:
            if self.model_name == "whisper_bengali" and self.model:
                # Use Whisper for Bengali
                result = self.model.transcribe(
                    audio_path,
                    language="bn",
                    task="transcribe"
                )
                return result["text"]
            
            elif self.recognizer:
                # Use speech recognition
                with sr.AudioFile(audio_path) as source:
                    audio = self.recognizer.record(source)
                
                # Try Bengali first, then English
                try:
                    text = self.recognizer.recognize_google(
                        audio, 
                        language="bn-IN"
                    )
                except:
                    text = self.recognizer.recognize_google(
                        audio, 
                        language="en-US"
                    )
                
                return text
            
            else:
                logger.error("No STT model available")
                return None
                
        except Exception as e:
            logger.error(f"Failed to convert speech to text: {e}")
            return None
    
    def listen_and_convert(self, duration: int = 5) -> Optional[str]:
        """Listen to microphone and convert to text"""
        if not self.recognizer:
            logger.error("Speech recognition not available")
            return None
        
        try:
            with sr.Microphone() as source:
                logger.info("Listening...")
                audio = self.recognizer.listen(source, timeout=duration)
                
                # Try Bengali first, then English
                try:
                    text = self.recognizer.recognize_google(
                        audio, 
                        language="bn-IN"
                    )
                except:
                    text = self.recognizer.recognize_google(
                        audio, 
                        language="en-US"
                    )
                
                return text
                
        except Exception as e:
            logger.error(f"Failed to listen and convert: {e}")
            return None

class BengaliVoiceChat:
    """Bengali Voice Chat processor"""
    
    def __init__(self, tts_model: str = "pyttsx3_bengali", stt_model: str = "whisper_bengali"):
        self.tts = BengaliTTS(tts_model)
        self.stt = BengaliSTT(stt_model)
    
    def process_voice_chat(self, audio_input_path: str, ai_response: str) -> Optional[str]:
        """Process voice chat: STT -> AI -> TTS"""
        try:
            # Step 1: Convert speech to text
            user_text = self.stt.speech_to_text(audio_input_path)
            if not user_text:
                return None
            
            logger.info(f"User said: {user_text}")
            
            # Step 2: Generate AI response (this would come from AI server)
            # For now, we'll use the provided response
            ai_text = ai_response
            
            # Step 3: Convert AI response to speech
            output_path = self.tts.text_to_speech(ai_text)
            
            return output_path
            
        except Exception as e:
            logger.error(f"Failed to process voice chat: {e}")
            return None

def get_available_bengali_voices() -> list:
    """Get available Bengali TTS voices"""
    voices = []
    
    if PYTTSX3_AVAILABLE:
        try:
            engine = pyttsx3.init()
            system_voices = engine.getProperty('voices')
            
            for voice in system_voices:
                voice_name = voice.name.lower()
                if any(keyword in voice_name for keyword in ['bengali', 'bangla', 'bn', 'bd']):
                    voices.append({
                        "id": voice.id,
                        "name": voice.name,
                        "languages": voice.languages,
                        "gender": voice.gender,
                        "type": "system"
                    })
        except Exception as e:
            logger.error(f"Failed to get system voices: {e}")
    
    return voices

def test_bengali_voice_system():
    """Test the Bengali voice system"""
    print("🔊 Testing Bengali Voice System...")
    
    # Test TTS
    print("\n📝 Testing Text-to-Speech...")
    tts = BengaliTTS()
    test_text = "আমি বাংলায় কথা বলছি। এটি একটি পরীক্ষা।"
    
    audio_path = tts.text_to_speech(test_text)
    if audio_path:
        print(f"✅ TTS successful: {audio_path}")
        # tts.play_speech(audio_path)  # Uncomment to play
    else:
        print("❌ TTS failed")
    
    # Test STT
    print("\n🎤 Testing Speech-to-Text...")
    stt = BengaliSTT()
    
    # Note: This would need an actual audio file for testing
    print("ℹ️  STT testing requires audio file input")
    
    # Test Voice Chat
    print("\n💬 Testing Voice Chat...")
    voice_chat = BengaliVoiceChat()
    print("ℹ️  Voice chat testing requires audio file input")
    
    print("\n✅ Bengali voice system test completed!")

if __name__ == "__main__":
    test_bengali_voice_system() 