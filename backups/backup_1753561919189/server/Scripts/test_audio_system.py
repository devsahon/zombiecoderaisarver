#!/usr/bin/env python3
"""
Audio System Test Script
স্পিকার সিস্টেম টেস্ট স্ক্রিপ্ট
"""

import os
import sys
import subprocess
import tempfile
import time
import json
from pathlib import Path

def test_audio_devices():
    """Test all available audio devices"""
    print("🔊 Testing Audio Devices")
    print("=" * 40)
    
    devices = {
        'pulse': {
            'test': 'pactl list sinks',
            'play': 'paplay',
            'name': 'PulseAudio'
        },
        'alsa': {
            'test': 'aplay -l',
            'play': 'aplay',
            'name': 'ALSA'
        },
        'ffplay': {
            'test': 'ffplay -version',
            'play': 'ffplay',
            'name': 'FFmpeg'
        },
        'mpg123': {
            'test': 'mpg123 --version',
            'play': 'mpg123',
            'name': 'MPG123'
        }
    }
    
    available_devices = {}
    
    for device_type, config in devices.items():
        try:
            result = subprocess.run(config['test'].split(), capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ {config['name']} available")
                available_devices[device_type] = config
            else:
                print(f"❌ {config['name']} not available")
        except Exception as e:
            print(f"❌ {config['name']} test failed: {e}")
    
    return available_devices

def create_test_audio():
    """Create a test audio file using eSpeak"""
    print("\n🎵 Creating Test Audio")
    print("=" * 40)
    
    try:
        # Create test audio file
        test_file = tempfile.mktemp(suffix='.wav')
        
        # Generate Bengali test audio
        cmd = [
            "espeak-ng", 
            "-v", "bengali",
            "-s", "150",
            "-w", test_file,
            "আমি বাংলায় কথা বলছি। এটি একটি পরীক্ষা।"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0 and os.path.exists(test_file):
            print(f"✅ Test audio created: {test_file}")
            return test_file
        else:
            print(f"❌ Failed to create test audio: {result.stderr}")
            return None
    except Exception as e:
        print(f"❌ Audio creation error: {e}")
        return None

def test_audio_playback(audio_file, devices):
    """Test audio playback with different devices"""
    print("\n🔊 Testing Audio Playback")
    print("=" * 40)
    
    if not audio_file or not os.path.exists(audio_file):
        print("❌ No audio file to test")
        return False
    
    success_count = 0
    
    for device_type, config in devices.items():
        print(f"\n📻 Testing {config['name']}...")
        
        try:
            if device_type == 'pulse':
                cmd = ['paplay', audio_file]
            elif device_type == 'alsa':
                cmd = ['aplay', audio_file]
            elif device_type == 'ffplay':
                cmd = ['ffplay', '-nodisp', '-autoexit', '-loglevel', 'error', audio_file]
            elif device_type == 'mpg123':
                cmd = ['mpg123', audio_file]
            else:
                continue
            
            # Start playback with timeout
            process = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            # Wait for 3 seconds or process completion
            try:
                process.wait(timeout=3)
                print(f"✅ {config['name']} playback successful")
                success_count += 1
            except subprocess.TimeoutExpired:
                process.terminate()
                print(f"✅ {config['name']} playback started (stopped after 3s)")
                success_count += 1
                
        except Exception as e:
            print(f"❌ {config['name']} playback failed: {e}")
    
    return success_count > 0

def test_audio_permissions():
    """Test audio permissions and setup"""
    print("\n🔐 Testing Audio Permissions")
    print("=" * 40)
    
    # Check if user is in audio group
    try:
        import grp
        audio_group = grp.getgrnam('audio')
        current_user = os.getenv('USER')
        
        if current_user in audio_group.gr_mem:
            print("✅ User is in audio group")
        else:
            print("⚠️  User not in audio group")
            print("   Run: sudo usermod -a -G audio $USER")
            print("   Then logout and login again")
    except Exception as e:
        print(f"⚠️  Could not check audio group: {e}")
    
    # Check pulse audio runtime
    pulse_runtime = '/run/user/1000/pulse'
    if os.path.exists(pulse_runtime):
        print("✅ PulseAudio runtime exists")
    else:
        print("⚠️  PulseAudio runtime not found")
        print("   This might cause audio issues")
    
    # Check environment variables
    env_vars = ['PULSE_RUNTIME_PATH', 'XDG_RUNTIME_DIR']
    for var in env_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var} is set: {value}")
        else:
            print(f"⚠️  {var} is not set")

def setup_audio_environment():
    """Setup audio environment variables"""
    print("\n⚙️  Setting up Audio Environment")
    print("=" * 40)
    
    # Set environment variables
    os.environ['PULSE_RUNTIME_PATH'] = '/run/user/1000/pulse'
    os.environ['XDG_RUNTIME_DIR'] = '/run/user/1000'
    
    # Test if pulse audio is running
    try:
        result = subprocess.run(['pactl', 'info'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ PulseAudio is running")
        else:
            print("⚠️  PulseAudio not running")
            print("   Try: pulseaudio --start")
    except Exception as e:
        print(f"⚠️  Could not check PulseAudio: {e}")

def test_volume_control():
    """Test volume control"""
    print("\n🔊 Testing Volume Control")
    print("=" * 40)
    
    try:
        # Get current volume
        result = subprocess.run(['pactl', 'get-sink-volume', '@DEFAULT_SINK@'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Volume control working")
            print(f"   Current volume: {result.stdout.strip()}")
        else:
            print("⚠️  Volume control not working")
    except Exception as e:
        print(f"⚠️  Volume control test failed: {e}")

def main():
    """Main test function"""
    print("🎵 Audio System Test")
    print("=" * 50)
    
    # Setup audio environment
    setup_audio_environment()
    
    # Test permissions
    test_audio_permissions()
    
    # Test devices
    devices = test_audio_devices()
    
    if not devices:
        print("\n❌ No audio devices available!")
        print("Please install audio packages:")
        print("sudo apt install pulseaudio alsa-utils ffmpeg mpg123")
        return False
    
    # Create test audio
    audio_file = create_test_audio()
    
    if audio_file:
        # Test playback
        success = test_audio_playback(audio_file, devices)
        
        # Test volume control
        test_volume_control()
        
        # Cleanup
        try:
            os.remove(audio_file)
        except:
            pass
        
        if success:
            print("\n🎉 Audio system is working!")
            return True
        else:
            print("\n❌ Audio playback failed!")
            return False
    else:
        print("\n❌ Could not create test audio!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 