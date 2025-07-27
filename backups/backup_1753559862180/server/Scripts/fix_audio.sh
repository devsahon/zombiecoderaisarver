#!/bin/bash

# Audio System Fix Script
# স্পিকার সিস্টেম ঠিক করার স্ক্রিপ্ট

echo "🔊 Fixing Audio System..."
echo "=========================="

# Fix permissions
echo "🔧 Fixing permissions..."
sudo chown -R $USER:$USER /run/user/1000
sudo chmod 755 /run/user/1000

# Create pulse directory
echo "📁 Creating pulse directory..."
mkdir -p /run/user/1000/pulse
chmod 700 /run/user/1000/pulse

# Add user to audio group
echo "👤 Adding user to audio group..."
sudo usermod -a -G audio $USER

# Kill existing pulse processes
echo "🔄 Killing existing pulse processes..."
pkill -f pulseaudio || true

# Start pulse audio
echo "🚀 Starting PulseAudio..."
pulseaudio --start --log-level=0 --disallow-exit --disallow-module-loading=false --high-priority --realtime --no-drop-root --system=false --exit-idle-time=-1 --file=/etc/pulse/default.pa

# Test audio
echo "🎵 Testing audio..."
sleep 2

# Create test audio
echo "📝 Creating test audio..."
espeak-ng -v bengali "আমি বাংলায় কথা বলছি। এটি একটি পরীক্ষা।" -w /tmp/test_audio.wav

# Test playback
echo "🔊 Testing playback..."
if [ -f /tmp/test_audio.wav ]; then
    echo "✅ Audio file created successfully"
    echo "💡 To test audio, run: ffplay -nodisp -autoexit /tmp/test_audio.wav"
else
    echo "❌ Failed to create audio file"
fi

echo ""
echo "🎉 Audio system fix completed!"
echo "💡 Please logout and login again for group changes to take effect"
echo "💡 Then test with: espeak-ng -v bengali 'আমি বাংলায় কথা বলছি'" 