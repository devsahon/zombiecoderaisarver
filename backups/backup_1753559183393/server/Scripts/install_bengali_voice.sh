#!/bin/bash

# Bengali Voice System Installation Script
# বাংলা ভয়েস সিস্টেম ইনস্টলেশন স্ক্রিপ্ট

set -e  # Exit on any error

echo "🚀 Bengali Voice System Installation Started"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root is not recommended for this installation"
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update

# Install system dependencies
print_status "Installing system dependencies..."
sudo apt install -y \
    espeak-ng \
    espeak-ng-data \
    portaudio19-dev \
    python3-pyaudio \
    ffmpeg \
    mpg123 \
    libsndfile1-dev \
    language-pack-bn \
    wget \
    unzip \
    curl

# Install Python dependencies
print_status "Installing Python dependencies..."
pip3 install --user \
    pyttsx3 \
    SpeechRecognition \
    gTTS \
    pygame \
    vosk \
    tqdm \
    requests \
    pydub \
    soundfile

# Create necessary directories
print_status "Creating directories..."
mkdir -p sarver/models/bengali/vosk_bengali
mkdir -p sarver/models/bengali/espeak_bengali
mkdir -p sarver/models/bengali/cache
mkdir -p sarver/models/bengali/temp

# Download Vosk Bengali model
print_status "Downloading Vosk Bengali model..."
cd sarver/models/bengali/vosk_bengali

VOSK_MODEL_URL="https://alphacephei.com/vosk/models/vosk-model-small-bn-0.22.zip"
VOSK_MODEL_FILE="vosk-model-small-bn-0.22.zip"

if [ ! -f "$VOSK_MODEL_FILE" ]; then
    print_status "Downloading Vosk Bengali model (50MB)..."
    wget -q --show-progress "$VOSK_MODEL_URL" -O "$VOSK_MODEL_FILE"
    
    if [ $? -eq 0 ]; then
        print_status "Extracting Vosk model..."
        unzip -q "$VOSK_MODEL_FILE"
        rm "$VOSK_MODEL_FILE"
        print_success "Vosk Bengali model installed successfully"
    else
        print_error "Failed to download Vosk model"
        exit 1
    fi
else
    print_success "Vosk model already exists"
fi

# Go back to original directory
cd /home/sahon/Desktop

# Create Bengali configuration file
print_status "Creating Bengali configuration..."
cat > sarver/models/bengali/bengali_config.json << 'EOF'
{
  "language": "bn",
  "tts": {
    "espeak": {
      "enabled": true,
      "voice": "bengali",
      "rate": 150,
      "volume": 0.9
    },
    "pyttsx3": {
      "enabled": true,
      "rate": 150,
      "volume": 0.9
    }
  },
  "stt": {
    "vosk": {
      "enabled": true,
      "model_path": "vosk_bengali/vosk-model-small-bn-0.22",
      "language": "bn"
    },
    "whisper": {
      "enabled": false,
      "model_size": "base"
    }
  },
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
  }
}
EOF

# Create test script
print_status "Creating test script..."
cat > sarver/scripts/test_bengali_voice.py << 'EOF'
#!/usr/bin/env python3
"""
Test Bengali Voice System
বাংলা ভয়েস সিস্টেম টেস্ট
"""

import os
import sys
import tempfile
import subprocess
from pathlib import Path

def test_espeak():
    """Test eSpeak Bengali TTS"""
    print("🔊 Testing eSpeak Bengali TTS...")
    try:
        # Test eSpeak command
        result = subprocess.run([
            "espeak-ng", "-v", "bengali", 
            "আমি বাংলায় কথা বলছি। এটি একটি পরীক্ষা।",
            "--stdout"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ eSpeak Bengali TTS working")
            return True
        else:
            print("❌ eSpeak test failed")
            return False
    except Exception as e:
        print(f"❌ eSpeak error: {e}")
        return False

def test_vosk():
    """Test Vosk Bengali STT"""
    print("🎤 Testing Vosk Bengali STT...")
    try:
        from vosk import Model, KaldiRecognizer
        import wave
        
        model_path = "sarver/models/bengali/vosk_bengali/vosk-model-small-bn-0.22"
        
        if not os.path.exists(model_path):
            print("❌ Vosk model not found")
            return False
        
        model = Model(model_path)
        print("✅ Vosk model loaded successfully")
        return True
    except ImportError:
        print("❌ Vosk not installed")
        return False
    except Exception as e:
        print(f"❌ Vosk error: {e}")
        return False

def test_pyttsx3():
    """Test pyttsx3 TTS"""
    print("🔊 Testing pyttsx3 TTS...")
    try:
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
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tf:
            engine.save_to_file(test_text, tf.name)
            engine.runAndWait()
            print("✅ pyttsx3 TTS test successful")
        
        return True
    except Exception as e:
        print(f"❌ pyttsx3 error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Bengali Voice System Test")
    print("=" * 40)
    
    tests = [
        ("eSpeak TTS", test_espeak),
        ("Vosk STT", test_vosk),
        ("pyttsx3 TTS", test_pyttsx3)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 Testing {test_name}...")
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 40)
    print("📊 Test Results:")
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! Bengali voice system is ready.")
    else:
        print("⚠️  Some tests failed. Check the output above.")

if __name__ == "__main__":
    main()
EOF

# Make test script executable
chmod +x sarver/scripts/test_bengali_voice.py

# Test the installation
print_status "Testing Bengali voice installation..."
python3 sarver/scripts/test_bengali_voice.py

# Create startup script
print_status "Creating startup script..."
cat > sarver/start_bengali_voice.sh << 'EOF'
#!/bin/bash

# Start Bengali Voice Server
echo "🚀 Starting Bengali Voice Server..."

# Set environment variables
export BENGALI_VOICE_ENABLED=true
export VOSK_MODEL_PATH="sarver/models/bengali/vosk_bengali/vosk-model-small-bn-0.22"
export ESPEAK_VOICE="bengali"

# Start the voice server
cd /home/sahon/Desktop
python3 sarver/voice-server/app.py
EOF

chmod +x sarver/start_bengali_voice.sh

# Create systemd service (optional)
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/bengali-voice.service > /dev/null << EOF
[Unit]
Description=Bengali Voice Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/sahon/Desktop
Environment=BENGALI_VOICE_ENABLED=true
Environment=VOSK_MODEL_PATH=sarver/models/bengali/vosk_bengali/vosk-model-small-bn-0.22
Environment=ESPEAK_VOICE=bengali
ExecStart=/usr/bin/python3 sarver/voice-server/app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable service (optional)
# sudo systemctl enable bengali-voice.service

print_success "Bengali Voice System Installation Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Test the system: python3 sarver/scripts/test_bengali_voice.py"
echo "2. Start voice server: ./sarver/start_bengali_voice.sh"
echo "3. Access admin panel: http://localhost:3000/admin/voice"
echo ""
echo "💡 Tips:"
echo "- eSpeak is lightweight and fast"
echo "- Vosk provides offline Bengali speech recognition"
echo "- All models are local, no internet required after installation"
echo ""
echo "🔧 Troubleshooting:"
echo "- If eSpeak fails, run: sudo apt install espeak-ng espeak-ng-data"
echo "- If Vosk fails, check model path in configuration"
echo "- For audio issues, check: sudo apt install portaudio19-dev" 