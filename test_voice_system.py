#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎤 বাংলা ভয়েস সিস্টেম টেস্ট স্ক্রিপ্ট
ZombieCoder AI Management System
"""

import requests
import json
import time
import os
import subprocess
import sys
from pathlib import Path

class VoiceSystemTester:
    def __init__(self):
        self.base_url = "http://localhost:8001"
        self.test_texts = [
            "আসসালামু আলাইকুম বস, আমাদের সিস্টেম সফলভাবে কাজ করছে",
            "আল্লাহ তাআলা আমাদের সাহায্য করুন",
            "ইচ্ছে থাকলে আল্লাহ তাআলা বান্দাদেরকে ঠকায় না",
            "আমাদের লক্ষ্য অসহায় মানুষের জন্য ফ্রি AI সেবা",
            "ZombieCoder AI Management System - বাংলা ভয়েস টেস্ট"
        ]
        
    def print_banner(self):
        """টেস্ট ব্যানার প্রিন্ট"""
        print("🎤" + "="*60 + "🎤")
        print("    বাংলা ভয়েস সিস্টেম টেস্ট - ZombieCoder AI")
        print("🎤" + "="*60 + "🎤")
        print()
        
    def test_server_health(self):
        """সার্ভার হেলথ চেক"""
        print("🔍 সার্ভার হেলথ চেক করছি...")
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ সার্ভার স্ট্যাটাস: {data['status']}")
                print(f"📅 টাইমস্ট্যাম্প: {data['timestamp']}")
                print(f"🔧 সেবা: {data['service']}")
                print("🎯 ইঞ্জিন স্ট্যাটাস:")
                for engine, status in data['engines'].items():
                    print(f"   - {engine}: {status}")
                return True
            else:
                print(f"❌ সার্ভার রেসপন্স: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ সার্ভার কানেকশন ত্রুটি: {e}")
            return False
            
    def test_available_voices(self):
        """উপলব্ধ ভয়েস চেক"""
        print("\n🎵 উপলব্ধ ভয়েস চেক করছি...")
        try:
            response = requests.get(f"{self.base_url}/api/voices", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ ভয়েস সংখ্যা: {len(data['voices'])}")
                print("🎤 ভয়েস তালিকা:")
                for voice_name, voice_info in data['voices'].items():
                    print(f"   - {voice_name}: {voice_info['language']} ({voice_info['engine']})")
                return True
            else:
                print(f"❌ ভয়েস API ত্রুটি: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ ভয়েস API কানেকশন ত্রুটি: {e}")
            return False
            
    def test_text_to_speech(self, text, voice="default"):
        """টেক্সট-টু-স্পিচ টেস্ট"""
        print(f"\n🎤 TTS টেস্ট: '{text[:30]}...'")
        try:
            payload = {
                "text": text,
                "voice": voice,
                "engine": "coqui"
            }
            response = requests.post(
                f"{self.base_url}/api/speak",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ অডিও জেনারেটেড: {data['audio_info']['file_path']}")
                print(f"⏱️ ডুরেশন: {data['audio_info']['duration']:.2f} সেকেন্ড")
                print(f"📊 স্যাম্পল রেট: {data['audio_info']['sample_rate']} Hz")
                print(f"🎵 প্লেব্যাক স্ট্যাটাস: {data['playback']['status']}")
                return data['audio_info']['file_path']
            else:
                print(f"❌ TTS API ত্রুটি: {response.status_code}")
                print(f"📝 রেসপন্স: {response.text}")
                return None
        except Exception as e:
            print(f"❌ TTS কানেকশন ত্রুটি: {e}")
            return None
            
    def test_audio_playback(self, audio_file):
        """অডিও প্লেব্যাক টেস্ট"""
        if not audio_file or not os.path.exists(audio_file):
            print("❌ অডিও ফাইল পাওয়া যায়নি")
            return False
            
        print(f"\n🔊 অডিও প্লেব্যাক টেস্ট: {audio_file}")
        
        # ফাইল সাইজ চেক
        file_size = os.path.getsize(audio_file)
        print(f"📁 ফাইল সাইজ: {file_size:,} bytes")
        
        # FFplay দিয়ে প্লে করার চেষ্টা
        try:
            print("🎵 FFplay দিয়ে প্লে করছি...")
            result = subprocess.run(
                ["ffplay", "-nodisp", "-autoexit", audio_file],
                capture_output=True,
                timeout=10
            )
            if result.returncode == 0:
                print("✅ অডিও সফলভাবে প্লে হয়েছে")
                return True
            else:
                print(f"⚠️ FFplay ত্রুটি: {result.stderr.decode()}")
                return False
        except FileNotFoundError:
            print("⚠️ FFplay পাওয়া যায়নি, ইনস্টল করুন: sudo apt install ffmpeg")
            return False
        except subprocess.TimeoutExpired:
            print("✅ অডিও প্লে সম্পন্ন (টাইমআউট)")
            return True
        except Exception as e:
            print(f"❌ প্লেব্যাক ত্রুটি: {e}")
            return False
            
    def test_voice_controls(self):
        """ভয়েস কন্ট্রোল টেস্ট"""
        print("\n🎛️ ভয়েস কন্ট্রোল টেস্ট...")
        
        controls = [
            ("pause", "পজ"),
            ("resume", "চালানো"),
            ("stop", "বন্ধ")
        ]
        
        for action, description in controls:
            try:
                response = requests.get(f"{self.base_url}/api/{action}", timeout=5)
                if response.status_code == 200:
                    print(f"✅ {description}: সফল")
                else:
                    print(f"⚠️ {description}: {response.status_code}")
            except Exception as e:
                print(f"❌ {description}: {e}")
                
    def test_status_endpoint(self):
        """স্ট্যাটাস এন্ডপয়েন্ট টেস্ট"""
        print("\n📊 স্ট্যাটাস এন্ডপয়েন্ট টেস্ট...")
        try:
            response = requests.get(f"{self.base_url}/api/status", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ বর্তমান স্ট্যাটাস: {data.get('status', 'unknown')}")
                print(f"🎵 বর্তমান ভয়েস: {data.get('current_voice', 'unknown')}")
                return True
            else:
                print(f"❌ স্ট্যাটাস API ত্রুটি: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ স্ট্যাটাস কানেকশন ত্রুটি: {e}")
            return False
            
    def run_comprehensive_test(self):
        """সম্পূর্ণ টেস্ট রান"""
        self.print_banner()
        
        # 1. সার্ভার হেলথ চেক
        if not self.test_server_health():
            print("❌ সার্ভার হেলথ চেক ব্যর্থ - টেস্ট বন্ধ")
            return False
            
        # 2. ভয়েস তালিকা চেক
        if not self.test_available_voices():
            print("⚠️ ভয়েস তালিকা লোড করতে সমস্যা")
            
        # 3. স্ট্যাটাস এন্ডপয়েন্ট
        self.test_status_endpoint()
        
        # 4. ভয়েস কন্ট্রোল
        self.test_voice_controls()
        
        # 5. TTS টেস্ট
        print("\n🎤 TTS টেস্ট শুরু...")
        success_count = 0
        
        for i, text in enumerate(self.test_texts, 1):
            print(f"\n--- টেস্ট {i}/{len(self.test_texts)} ---")
            audio_file = self.test_text_to_speech(text)
            
            if audio_file:
                if self.test_audio_playback(audio_file):
                    success_count += 1
                    print(f"✅ টেস্ট {i} সফল")
                else:
                    print(f"⚠️ টেস্ট {i} প্লেব্যাক সমস্যা")
            else:
                print(f"❌ টেস্ট {i} TTS সমস্যা")
                
            # টেস্টের মধ্যে বিরতি
            time.sleep(2)
            
        # ফলাফল
        print("\n" + "="*60)
        print(f"🎯 টেস্ট ফলাফল: {success_count}/{len(self.test_texts)} সফল")
        
        if success_count == len(self.test_texts):
            print("🎉 সব টেস্ট সফল! ভয়েস সিস্টেম পারফেক্ট কাজ করছে")
        elif success_count > 0:
            print("⚠️ আংশিক সফল - কিছু সমস্যা আছে")
        else:
            print("❌ সব টেস্ট ব্যর্থ - গুরুতর সমস্যা")
            
        return success_count > 0

def main():
    """মেইন ফাংশন"""
    tester = VoiceSystemTester()
    
    try:
        success = tester.run_comprehensive_test()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⏹️ টেস্ট বন্ধ করা হয়েছে")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ অপ্রত্যাশিত ত্রুটি: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 