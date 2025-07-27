#!/usr/bin/env python3
"""
Test Bengali Voice System
বাংলা ভয়েস সিস্টেম টেস্ট
"""

import os
import sys
import tempfile
import subprocess
import json
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

def test_speech_recognition():
    """Test Speech Recognition"""
    print("🎤 Testing Speech Recognition...")
    try:
        import speech_recognition as sr
        recognizer = sr.Recognizer()
        print("✅ Speech recognition available")
        return True
    except Exception as e:
        print(f"❌ Speech recognition test failed: {e}")
        return False

def test_configuration():
    """Test Bengali configuration"""
    print("⚙️  Testing Bengali configuration...")
    try:
        config_path = "sarver/models/bengali/bengali_config.json"
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        print(f"✅ Configuration loaded: {config['language']}")
        print(f"   TTS: eSpeak={config['tts']['espeak']['enabled']}, pyttsx3={config['tts']['pyttsx3']['enabled']}")
        print(f"   STT: Google={config['stt']['google']['enabled']}")
        return True
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Bengali Voice System Test")
    print("=" * 40)
    
    tests = [
        ("eSpeak TTS", test_espeak),
        ("pyttsx3 TTS", test_pyttsx3),
        ("Speech Recognition", test_speech_recognition),
        ("Configuration", test_configuration)
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
    
    print("\n💡 Next steps:")
    print("1. Start voice server: source sarver/venv/bin/activate && python3 sarver/voice-server/app.py")
    print("2. Test in admin panel: http://localhost:3000/admin/voice")
    print("3. Use Bengali language (bn) in TTS/STT requests")

if __name__ == "__main__":
    main() 