#!/usr/bin/env python3
"""
Bengali Voice Demo
বাংলা ভয়েস ডেমো
"""

import os
import sys
import tempfile
import subprocess
import json
import time
from pathlib import Path

def load_config():
    """Load Bengali configuration"""
    config_path = "sarver/models/bengali/bengali_config.json"
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Failed to load config: {e}")
        return None

def tts_espeak(text, output_file=None):
    """Text-to-Speech using eSpeak"""
    try:
        if not output_file:
            output_file = tempfile.mktemp(suffix='.wav')
        
        cmd = [
            "espeak-ng", 
            "-v", "bengali",
            "-s", "150",  # Speed
            "-w", output_file,  # Output file
            text
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ eSpeak TTS: {text}")
            return output_file
        else:
            print(f"❌ eSpeak failed: {result.stderr}")
            return None
    except Exception as e:
        print(f"❌ eSpeak error: {e}")
        return None

def tts_pyttsx3(text, output_file=None):
    """Text-to-Speech using pyttsx3"""
    try:
        import pyttsx3
        
        if not output_file:
            output_file = tempfile.mktemp(suffix='.wav')
        
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)
        engine.setProperty('volume', 0.9)
        
        # Try to set Bengali voice
        voices = engine.getProperty('voices')
        for voice in voices:
            if any(keyword in voice.name.lower() for keyword in ['bengali', 'bangla', 'bn']):
                engine.setProperty('voice', voice.id)
                break
        
        engine.save_to_file(text, output_file)
        engine.runAndWait()
        
        print(f"✅ pyttsx3 TTS: {text}")
        return output_file
    except Exception as e:
        print(f"❌ pyttsx3 error: {e}")
        return None

def play_audio(audio_file):
    """Play audio file"""
    try:
        # Try different audio players
        players = ['mpg123', 'ffplay', 'aplay']
        
        for player in players:
            try:
                if player == 'mpg123':
                    subprocess.run([player, audio_file], check=True)
                elif player == 'ffplay':
                    subprocess.run([player, '-nodisp', '-autoexit', audio_file], check=True)
                elif player == 'aplay':
                    subprocess.run([player, audio_file], check=True)
                
                print(f"✅ Audio played with {player}")
                return True
            except (subprocess.CalledProcessError, FileNotFoundError):
                continue
        
        print("❌ No audio player found")
        return False
    except Exception as e:
        print(f"❌ Audio play error: {e}")
        return False

def demo_tts():
    """Demo Text-to-Speech"""
    print("\n🔊 Bengali TTS Demo")
    print("=" * 30)
    
    test_texts = [
        "আমি বাংলায় কথা বলছি।",
        "এটি একটি পরীক্ষা।",
        "ধন্যবাদ।",
        "আপনার দিনটি শুভ হোক।"
    ]
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n📝 Test {i}: {text}")
        
        # Try eSpeak first
        audio_file = tts_espeak(text)
        if audio_file and os.path.exists(audio_file):
            print("🎵 Playing eSpeak audio...")
            play_audio(audio_file)
            os.remove(audio_file)
            time.sleep(1)
        else:
            # Fallback to pyttsx3
            audio_file = tts_pyttsx3(text)
            if audio_file and os.path.exists(audio_file):
                print("🎵 Playing pyttsx3 audio...")
                play_audio(audio_file)
                os.remove(audio_file)
                time.sleep(1)

def demo_stt():
    """Demo Speech-to-Text"""
    print("\n🎤 Bengali STT Demo")
    print("=" * 30)
    
    print("⚠️  STT demo requires audio input file")
    print("💡 You can test STT via the admin panel:")
    print("   http://localhost:3000/admin/voice")
    print("   Upload an audio file and select Bengali language")

def main():
    """Main demo function"""
    print("🚀 Bengali Voice System Demo")
    print("=" * 40)
    
    # Load configuration
    config = load_config()
    if config:
        print(f"✅ Configuration loaded: {config['language']}")
        print(f"   TTS: eSpeak={config['tts']['espeak']['enabled']}")
        print(f"   TTS: pyttsx3={config['tts']['pyttsx3']['enabled']}")
        print(f"   STT: Google={config['stt']['google']['enabled']}")
    
    # Run TTS demo
    demo_tts()
    
    # Run STT demo
    demo_stt()
    
    print("\n" + "=" * 40)
    print("✅ Bengali Voice Demo Complete!")
    print("\n💡 Next steps:")
    print("1. Test in admin panel: http://localhost:3000/admin/voice")
    print("2. Use language 'bn' for Bengali TTS/STT")
    print("3. Upload audio files for STT testing")

if __name__ == "__main__":
    main() 