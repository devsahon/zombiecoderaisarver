#!/usr/bin/env python3
"""
Bengali Model Downloader
বাংলা মডেল ডাউনলোডার
"""

import os
import sys
import requests
import zipfile
import tarfile
from pathlib import Path
import subprocess

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def download_file(url: str, filepath: str, description: str = "Downloading"):
    """Download a file with progress bar"""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        
        with open(filepath, 'wb') as file:
            downloaded = 0
            for data in response.iter_content(chunk_size=1024):
                size = file.write(data)
                downloaded += size
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    print(f"\r{description}: {percent:.1f}%", end='', flush=True)
        
        print(f"\n✅ {description} completed")
        return True
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return False

def install_system_dependencies():
    """Install system dependencies for Bengali voice processing"""
    print("🔧 Installing system dependencies...")
    
    # Update package list
    try:
        subprocess.run(["sudo", "apt", "update"], check=True)
    except subprocess.CalledProcessError:
        print("⚠️  Failed to update package list")
    
    # Install audio dependencies
    audio_packages = [
        "espeak-ng",
        "espeak-ng-data",
        "portaudio19-dev",
        "ffmpeg",
        "mpg123"
    ]
    
    for package in audio_packages:
        try:
            print(f"📦 Installing {package}...")
            subprocess.run(["sudo", "apt", "install", "-y", package], check=True)
        except subprocess.CalledProcessError:
            print(f"⚠️  Failed to install {package}, continuing...")
    
    # Install Bengali language support
    try:
        subprocess.run(["sudo", "apt", "install", "-y", "language-pack-bn"], check=True)
        print("✅ Bengali language pack installed")
    except subprocess.CalledProcessError:
        print("⚠️  Bengali language pack installation failed")

def install_python_dependencies():
    """Install Python dependencies for Bengali voice processing"""
    print("\n🐍 Installing Python dependencies...")
    
    python_packages = [
        "pyttsx3",
        "SpeechRecognition",
        "gTTS",
        "pygame",
        "openai-whisper",
        "tqdm"
    ]
    
    for package in python_packages:
        try:
            print(f"📦 Installing {package}...")
            subprocess.run([sys.executable, "-m", "pip", "install", package], check=True)
        except subprocess.CalledProcessError:
            print(f"⚠️  Failed to install {package}, continuing...")

def setup_bengali_environment():
    """Set up Bengali language environment"""
    print("\n🌐 Setting up Bengali language environment...")
    
    # Create necessary directories
    base_dir = Path(__file__).parent.parent
    models_dir = base_dir / "models" / "bengali"
    models_dir.mkdir(parents=True, exist_ok=True)
    (models_dir / "cache").mkdir(exist_ok=True)
    (models_dir / "temp").mkdir(exist_ok=True)
    
    # Create Bengali voice configuration
    bengali_config = {
        "language": "bn",
        "voices": {
            "male": {
                "name": "বাংলা পুরুষ",
                "rate": 150,
                "volume": 0.9
            },
            "female": {
                "name": "বাংলা মহিলা", 
                "rate": 160,
                "volume": 0.9
            }
        },
        "stt": {
            "language": "bn-IN",
            "fallback": "en-US"
        }
    }
    
    config_file = models_dir / "bengali_config.json"
    import json
    with open(config_file, 'w', encoding='utf-8') as f:
        json.dump(bengali_config, f, ensure_ascii=False, indent=2)
    
    print("✅ Bengali environment configured")

def test_bengali_installation():
    """Test Bengali voice installation"""
    print("\n🧪 Testing Bengali voice installation...")
    
    try:
        # Test TTS
        import pyttsx3
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')
        
        bengali_voices = []
        for voice in voices:
            if any(keyword in voice.name.lower() for keyword in ['bengali', 'bangla', 'bn']):
                bengali_voices.append(voice.name)
        
        if bengali_voices:
            print(f"✅ Found Bengali voices: {', '.join(bengali_voices)}")
        else:
            print("⚠️  No Bengali voices found, using default")
        
        # Test basic TTS
        test_text = "আমি বাংলায় কথা বলছি"
        engine.save_to_file(test_text, "/tmp/test_bengali.wav")
        engine.runAndWait()
        print("✅ Basic TTS test successful")
        
    except Exception as e:
        print(f"❌ TTS test failed: {e}")
    
    try:
        # Test STT
        import speech_recognition as sr
        recognizer = sr.Recognizer()
        print("✅ Speech recognition available")
    except Exception as e:
        print(f"❌ Speech recognition test failed: {e}")

def main():
    """Main installation function"""
    print("🚀 Bengali Voice System Installation")
    print("=" * 50)
    
    # Install system dependencies
    install_system_dependencies()
    
    # Install Python dependencies
    install_python_dependencies()
    
    # Set up Bengali environment
    setup_bengali_environment()
    
    # Test installation
    test_bengali_installation()
    
    print("\n" + "=" * 50)
    print("✅ Bengali Voice System Installation Complete!")
    print("\n📋 Next steps:")
    print("1. Start the voice server: python3 sarver/start_servers.py")
    print("2. Test Bengali TTS/STT in the admin panel")
    print("3. Configure voice settings as needed")
    print("\n💡 Tips:")
    print("- For better performance, use lightweight models")
    print("- Internet connection required for initial setup")
    print("- Bengali voices work best with clear pronunciation")

if __name__ == "__main__":
    main() 