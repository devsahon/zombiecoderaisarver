# Bengali Voice System

# বাংলা ভয়েস সিস্টেম

## 🚀 Installation & Setup

### System Dependencies

```bash
sudo apt update
sudo apt install -y espeak-ng espeak-ng-data portaudio19-dev python3-pyaudio ffmpeg mpg123 libsndfile1-dev language-pack-bn
```

### Python Dependencies

```bash
# Create virtual environment
python3 -m venv sarver/venv

# Activate virtual environment
source sarver/venv/bin/activate

# Install Python packages
pip install pyttsx3 SpeechRecognition gTTS pygame vosk tqdm requests pydub soundfile
```

## 📁 Directory Structure

```
sarver/
├── models/
│   └── bengali/
│       ├── bengali_config.json    # Bengali configuration
│       ├── vosk_bengali/          # Vosk STT models
│       ├── espeak_bengali/        # eSpeak TTS data
│       ├── cache/                 # Model cache
│       └── temp/                  # Temporary files
├── scripts/
│   ├── test_bengali_voice.py      # Test script
│   └── bengali_voice_demo.py      # Demo script
└── voice-server/
    └── app.py                     # Voice server with Bengali support
```

## 🔧 Configuration

### Bengali Configuration (`sarver/models/bengali/bengali_config.json`)

```json
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
    "google": {
      "enabled": true,
      "language": "bn-IN",
      "fallback": "en-US"
    }
  }
}
```

## 🎯 Usage

### 1. Start Voice Server

```bash
# Activate virtual environment
source sarver/venv/bin/activate

# Start voice server
python3 sarver/voice-server/app.py
```

### 2. Test Bengali TTS

```bash
# Test eSpeak
espeak-ng -v bengali "আমি বাংলায় কথা বলছি।" -w output.wav

# Test pyttsx3
python3 -c "
import pyttsx3
engine = pyttsx3.init()
engine.save_to_file('আমি বাংলায় কথা বলছি।', 'output.wav')
engine.runAndWait()
"
```

### 3. API Usage

#### Text-to-Speech (TTS)

```bash
curl -X POST http://localhost:8001/api/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "আমি বাংলায় কথা বলছি।",
    "language": "bn",
    "voice": "espeak_bengali"
  }' \
  --output speech.mp3
```

#### Speech-to-Text (STT)

```bash
curl -X POST http://localhost:8001/api/stt \
  -F "audio=@your_audio.wav" \
  -F "language=bn"
```

## 🌐 Admin Panel

Access the Bengali voice interface at:

```
http://localhost:3000/admin/voice
```

### Features

- **Text-to-Speech**: Convert Bengali text to speech
- **Speech-to-Text**: Convert Bengali speech to text
- **Voice Chat**: Bengali voice conversations
- **Language Selection**: Bengali (bn) and English (en)
- **Real-time Monitoring**: System status and performance

## 📊 Available Models

### TTS (Text-to-Speech)

1. **eSpeak Bengali** (Recommended)
   - ✅ Lightweight and fast
   - ✅ Works offline
   - ✅ Good Bengali pronunciation
   - 📦 Size: ~5MB

2. **pyttsx3 Bengali**
   - ✅ System integration
   - ✅ Multiple voice options
   - ⚠️ Depends on system voices
   - 📦 Size: ~10MB

### STT (Speech-to-Text)

1. **Google Speech Recognition**
   - ✅ High accuracy
   - ✅ Bengali language support
   - ❌ Requires internet
   - 🌐 Online service

2. **Vosk Bengali** (Future)
   - ✅ Offline recognition
   - ✅ Fast processing
   - 📦 Size: ~50MB
   - ⚠️ Model download required

## 🔍 Testing

### Quick Test

```bash
# Test eSpeak
espeak-ng -v bengali "আমি বাংলায় কথা বলছি।"

# Test configuration
python3 -c "
import json
with open('sarver/models/bengali/bengali_config.json') as f:
    config = json.load(f)
print('Bengali config loaded:', config['language'])
"
```

### Full System Test

```bash
# Run test script
source sarver/venv/bin/activate
python3 sarver/scripts/test_bengali_voice.py
```

## 🛠️ Troubleshooting

### Common Issues

1. **eSpeak not found**

   ```bash
   sudo apt install espeak-ng espeak-ng-data
   ```

2. **Audio playback issues**

   ```bash
   sudo apt install mpg123 ffmpeg
   ```

3. **Python import errors**

   ```bash
   source sarver/venv/bin/activate
   pip install -r sarver/requirements.txt
   ```

4. **Permission denied for audio**

   ```bash
   # Add user to audio group
   sudo usermod -a -G audio $USER
   # Logout and login again
   ```

### Performance Tips

1. **For low-resource systems**:
   - Use eSpeak for TTS (lightweight)
   - Use Google STT (no local models needed)

2. **For better quality**:
   - Use pyttsx3 with system Bengali voices
   - Consider Whisper for STT (if resources allow)

3. **For offline use**:
   - eSpeak works completely offline
   - Vosk provides offline STT (when available)

## 📝 Examples

### Bengali TTS Examples

```python
# eSpeak TTS
import subprocess
subprocess.run([
    "espeak-ng", "-v", "bengali", 
    "-s", "150", "-w", "output.wav",
    "আমি বাংলায় কথা বলছি। এটি একটি পরীক্ষা।"
])

# pyttsx3 TTS
import pyttsx3
engine = pyttsx3.init()
engine.setProperty('rate', 150)
engine.save_to_file("আমি বাংলায় কথা বলছি।", "output.wav")
engine.runAndWait()
```

### Bengali STT Examples

```python
import speech_recognition as sr

recognizer = sr.Recognizer()
with sr.AudioFile("input.wav") as source:
    audio = recognizer.record(source)
    
# Try Bengali first, fallback to English
try:
    text = recognizer.recognize_google(audio, language="bn-IN")
except:
    text = recognizer.recognize_google(audio, language="en-US")
```

## 🎉 Success

Your Bengali voice system is now ready!

- ✅ eSpeak Bengali TTS installed
- ✅ pyttsx3 TTS configured
- ✅ Speech recognition available
- ✅ Voice server running
- ✅ Admin panel accessible

**Next steps:**

1. Test the system: `http://localhost:3000/admin/voice`
2. Try Bengali TTS/STT in the admin panel
3. Use language code "bn" for Bengali requests
4. Upload audio files for STT testing

**Support:**

- For issues, check the troubleshooting section
- All models work locally (except Google STT)
- Bengali language fully supported
