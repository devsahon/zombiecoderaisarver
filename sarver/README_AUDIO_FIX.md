# Audio System Fix Guide
# স্পিকার সিস্টেম ঠিক করার গাইড

## 🚨 Problem: No Sound from Speakers

If you're experiencing no sound from speakers, follow these steps:

## 🔧 Quick Fix

### 1. Run Audio Fix Script
```bash
chmod +x sarver/scripts/fix_audio.sh
./sarver/scripts/fix_audio.sh
```

### 2. Logout and Login Again
After running the script, logout and login again for group changes to take effect.

### 3. Test Audio
```bash
# Test Bengali TTS
espeak-ng -v bengali "আমি বাংলায় কথা বলছি।"

# Test with file
espeak-ng -v bengali "আমি বাংলায় কথা বলছি।" -w test.wav
ffplay -nodisp -autoexit test.wav
```

## 🛠️ Manual Fix Steps

### Step 1: Fix Permissions
```bash
# Fix user directory permissions
sudo chown -R $USER:$USER /run/user/1000
sudo chmod 755 /run/user/1000

# Create pulse directory
mkdir -p /run/user/1000/pulse
chmod 700 /run/user/1000/pulse
```

### Step 2: Add User to Audio Group
```bash
sudo usermod -a -G audio $USER
```

### Step 3: Install Audio Packages
```bash
sudo apt update
sudo apt install -y pulseaudio pulseaudio-utils alsa-utils
```

### Step 4: Start PulseAudio
```bash
# Kill existing processes
pkill -f pulseaudio

# Start pulse audio
pulseaudio --start --log-level=0
```

### Step 5: Test Audio System
```bash
# Check pulse audio
pactl info

# Check audio devices
pactl list sinks

# Test volume
pactl get-sink-volume @DEFAULT_SINK@
```

## 🎯 Bengali Voice System Features

### ✅ Working Features
- **eSpeak Bengali TTS**: Lightweight and fast
- **pyttsx3 TTS**: System integration
- **Speech Recognition**: Google STT with Bengali support
- **Streaming Audio**: 5-second preview for long content
- **Download Support**: Save audio files locally
- **Special Symbol Filtering**: Removes #*@$%^&*() symbols
- **Emoji Removal**: Cleans text for better TTS

### 🎵 Audio Configuration
```json
{
  "volume": 0.9,
  "speed": 150,
  "format": "wav",
  "sample_rate": 16000,
  "channels": 1
}
```

### 📱 Admin Panel Features
- **Real-time Streaming**: Audio plays immediately
- **Queue Management**: Multiple audio files in queue
- **Download Option**: Save audio files
- **Language Selection**: Bengali (bn) and English (en)
- **Voice Selection**: Multiple voice options
- **Recording Support**: Built-in audio recording
- **Chat History**: Voice chat with AI

## 🔍 Troubleshooting

### Common Issues

1. **"Failed to create secure directory"**
   ```bash
   sudo chown -R $USER:$USER /run/user/1000
   mkdir -p /run/user/1000/pulse
   chmod 700 /run/user/1000/pulse
   ```

2. **"Device or resource busy"**
   ```bash
   pkill -f pulseaudio
   pulseaudio --start
   ```

3. **"User not in audio group"**
   ```bash
   sudo usermod -a -G audio $USER
   # Logout and login again
   ```

4. **"No audio devices found"**
   ```bash
   sudo apt install pulseaudio alsa-utils
   pulseaudio --start
   ```

### Audio Test Commands

```bash
# Test eSpeak
espeak-ng -v bengali "আমি বাংলায় কথা বলছি।"

# Test with file
espeak-ng -v bengali "আমি বাংলায় কথা বলছি।" -w test.wav

# Test playback
ffplay -nodisp -autoexit test.wav
paplay test.wav
aplay test.wav

# Test volume
pactl set-sink-volume @DEFAULT_SINK@ 50%
```

## 🎉 Success Indicators

When audio is working correctly, you should see:
- ✅ No "Failed to create secure directory" errors
- ✅ Audio plays through speakers
- ✅ Volume control works
- ✅ Bengali TTS sounds natural
- ✅ Admin panel shows "Connected" status

## 📞 Support

If you still have issues:
1. Check system volume settings
2. Try different audio players (ffplay, paplay, aplay)
3. Restart the voice server
4. Check browser audio permissions
5. Try different audio formats (wav, mp3)

## 🚀 Next Steps

After fixing audio:
1. Start voice server: `python3 sarver/voice-server/app.py`
2. Access admin panel: `http://localhost:3000/admin/voice`
3. Test Bengali TTS/STT
4. Try streaming and download features
5. Test voice chat functionality 