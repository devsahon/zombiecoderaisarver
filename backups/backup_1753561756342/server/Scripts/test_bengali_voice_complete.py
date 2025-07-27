#!/usr/bin/env python3
"""
Comprehensive Bengali Voice System Test
সম্পূর্ণ বাংলা ভয়েস সিস্টেম টেস্ট
"""

import requests
import json
import time
import tempfile
import os
import subprocess

def test_voice_server_status():
    """Test voice server status"""
    print("🔍 Testing Voice Server Status")
    print("=" * 40)
    
    try:
        response = requests.get('http://localhost:8001/api/status')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Voice server is running")
            print(f"   Status: {data.get('status', 'unknown')}")
            print(f"   CPU Usage: {data.get('stats', {}).get('cpu_usage', 0)}%")
            print(f"   Memory Usage: {data.get('stats', {}).get('memory_usage', 0)}%")
            print(f"   TTS Requests: {data.get('stats', {}).get('tts_requests', 0)}")
            print(f"   STT Requests: {data.get('stats', {}).get('stt_requests', 0)}")
            print(f"   Queue Size: {data.get('queue_size', 0)}")
            return True
        else:
            print(f"❌ Voice server returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to voice server: {e}")
        return False

def test_bengali_tts():
    """Test Bengali TTS"""
    print("\n🎵 Testing Bengali TTS")
    print("=" * 40)
    
    test_texts = [
        "আমি বাংলায় কথা বলছি। এটি একটি পরীক্ষা।",
        "বাংলা ভাষা খুব সুন্দর।",
        "আমার নাম সাহন। আমি বাংলাদেশ থেকে এসেছি।",
        "আজকের আবহাওয়া খুব ভালো।",
        "ধন্যবাদ আপনাকে।"
    ]
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n📝 Test {i}: {text}")
        
        try:
            # Test streaming TTS
            response = requests.post('http://localhost:8001/api/tts', 
                                   json={
                                       'text': text,
                                       'language': 'bn',
                                       'stream': True
                                   })
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"   ✅ Streaming TTS successful")
                    print(f"   Duration: {data.get('duration', 0)}s")
                    print(f"   Queue Position: {data.get('queue_position', 0)}")
                else:
                    print(f"   ❌ Streaming TTS failed: {data.get('error', 'Unknown error')}")
            else:
                print(f"   ❌ TTS request failed: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ TTS error: {e}")
        
        time.sleep(1)  # Wait between requests

def test_english_tts():
    """Test English TTS"""
    print("\n🎵 Testing English TTS")
    print("=" * 40)
    
    test_texts = [
        "Hello, I am speaking in English.",
        "This is a test of the English voice system.",
        "The weather is nice today.",
        "Thank you for testing.",
        "Have a great day!"
    ]
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n📝 Test {i}: {text}")
        
        try:
            response = requests.post('http://localhost:8001/api/tts', 
                                   json={
                                       'text': text,
                                       'language': 'en',
                                       'stream': True
                                   })
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"   ✅ English TTS successful")
                    print(f"   Duration: {data.get('duration', 0)}s")
                else:
                    print(f"   ❌ English TTS failed: {data.get('error', 'Unknown error')}")
            else:
                print(f"   ❌ TTS request failed: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ TTS error: {e}")
        
        time.sleep(1)

def test_voice_chat():
    """Test voice chat"""
    print("\n💬 Testing Voice Chat")
    print("=" * 40)
    
    test_messages = [
        "আপনি কেমন আছেন?",
        "আজকের দিনটি কেমন যাচ্ছে?",
        "আপনার নাম কী?",
        "আমি কি আপনাকে সাহায্য করতে পারি?",
        "ধন্যবাদ।"
    ]
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n💭 Test {i}: {message}")
        
        try:
            response = requests.post('http://localhost:8001/api/voice_chat', 
                                   json={
                                       'text': message,
                                       'language': 'bn',
                                       'stream': True
                                   })
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"   ✅ Voice chat successful")
                    print(f"   Response: {data.get('response', 'No response')}")
                    print(f"   Duration: {data.get('duration', 0)}s")
                else:
                    print(f"   ❌ Voice chat failed: {data.get('error', 'Unknown error')}")
            else:
                print(f"   ❌ Voice chat request failed: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Voice chat error: {e}")
        
        time.sleep(1)

def test_voices():
    """Test available voices"""
    print("\n🎤 Testing Available Voices")
    print("=" * 40)
    
    try:
        response = requests.get('http://localhost:8001/api/voices')
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                voices = data.get('voices', [])
                print(f"✅ Found {len(voices)} voices:")
                for voice in voices:
                    print(f"   - {voice.get('name', 'Unknown')} ({voice.get('id', 'Unknown')})")
                    print(f"     Languages: {voice.get('languages', [])}")
                    print(f"     Gender: {voice.get('gender', 'Unknown')}")
            else:
                print(f"❌ Failed to get voices: {data.get('error', 'Unknown error')}")
        else:
            print(f"❌ Voices request failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Voices error: {e}")

def test_logs():
    """Test logs endpoint"""
    print("\n📋 Testing Logs")
    print("=" * 40)
    
    try:
        response = requests.get('http://localhost:8001/api/logs')
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                logs = data.get('logs', [])
                print(f"✅ Found {len(logs)} recent logs:")
                for log in logs[-5:]:  # Show last 5 logs
                    print(f"   - {log.get('type', 'Unknown')} ({log.get('language', 'Unknown')})")
                    print(f"     Time: {log.get('timestamp', 'Unknown')}")
                    print(f"     Processing: {log.get('processing_time_ms', 0)}ms")
            else:
                print(f"❌ Failed to get logs: {data.get('error', 'Unknown error')}")
        else:
            print(f"❌ Logs request failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Logs error: {e}")

def test_health():
    """Test health endpoint"""
    print("\n🏥 Testing Health")
    print("=" * 40)
    
    try:
        response = requests.get('http://localhost:8001/api/health')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check successful")
            print(f"   Status: {data.get('status', 'Unknown')}")
            print(f"   Audio System: {data.get('audio_system', False)}")
            print(f"   Timestamp: {data.get('timestamp', 'Unknown')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")

def test_special_characters():
    """Test special character handling"""
    print("\n🔤 Testing Special Characters")
    print("=" * 40)
    
    test_texts = [
        "Hello #world! This is a test.",
        "আমি @বাংলায় কথা বলছি। এটি একটি পরীক্ষা।",
        "Test with symbols: $%^&*()_+",
        "Emoji test: 😀🎉🚀",
        "Mixed: Hello #বাংলা! 😀"
    ]
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n📝 Test {i}: {text}")
        
        try:
            response = requests.post('http://localhost:8001/api/tts', 
                                   json={
                                       'text': text,
                                       'language': 'en',
                                       'stream': True
                                   })
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"   ✅ Special characters handled successfully")
                else:
                    print(f"   ❌ Special characters failed: {data.get('error', 'Unknown error')}")
            else:
                print(f"   ❌ Request failed: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        time.sleep(1)

def main():
    """Main test function"""
    print("🎵 Bengali Voice System - Complete Test")
    print("=" * 50)
    
    # Test server status
    if not test_voice_server_status():
        print("\n❌ Voice server is not running!")
        print("Please start the voice server first:")
        print("python3 sarver/voice-server/app.py")
        return False
    
    # Run all tests
    test_bengali_tts()
    test_english_tts()
    test_voice_chat()
    test_voices()
    test_logs()
    test_health()
    test_special_characters()
    
    print("\n🎉 All tests completed!")
    print("\n💡 Next steps:")
    print("1. Access admin panel: http://localhost:3000/admin/voice")
    print("2. Test streaming and download features")
    print("3. Try voice chat with different messages")
    print("4. Check logs for performance metrics")
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 