import unittest
import requests
import json
import os
from typing import Dict, Optional
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from ai.server.mcp.dispatcher import MCPDispatcher

class TestMCPSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base_url = "http://localhost:5000"
        cls.dispatcher = MCPDispatcher()
        cls.admin_token = "zombiecoder_admin"  # এডমিন টোকেন
        
    def test_system_status(self):
        """Test system status and provider health"""
        response = requests.get(f"{self.base_url}/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        
    def test_local_query(self):
        """Test query processing with local model"""
        query = "@him test local processing"
        response = requests.post(
            f"{self.base_url}/query",
            json={
                "query": query,
                "agent": "procoder",
                "admin_token": self.admin_token
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("result", data)
        self.assertEqual(data.get("provider"), "local")
        
    def test_fallback_system(self):
        """Test fallback system when local processing fails"""
        query = "@him test fallback system"
        response = requests.post(
            f"{self.base_url}/query",
            json={
                "query": query,
                "agent": "procoder",
                "force_fallback": True,
                "admin_token": self.admin_token
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("result", data)
        self.assertEqual(data.get("provider"), "fallback")
        
    def test_tts_generation(self):
        """Test text-to-speech generation"""
        text = "@him convert this text to speech"
        response = requests.post(
            f"{self.base_url}/tts",
            json={
                "text": text,
                "lang": "en",
                "admin_token": self.admin_token
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.content)  # Check if audio content exists
        
    def test_bengali_tts(self):
        """Test Bengali text-to-speech"""
        text = "বাংলা টেক্সট থেকে স্পীচ তৈরি"
        response = requests.post(
            f"{self.base_url}/tts",
            json={
                "text": text,
                "lang": "bn",
                "admin_token": self.admin_token
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.content)
        
    def test_document_processing(self):
        """Test document processing and TTS conversion"""
        with open("test_document.txt", "w", encoding="utf-8") as f:
            f.write("This is a test document.\nTesting document to speech conversion.")
            
        with open("test_document.txt", "rb") as f:
            response = requests.post(
                f"{self.base_url}/process_document",
                files={"document": f},
                data={"admin_token": self.admin_token}
            )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.content)  # Check if audio content exists
        
    def test_monitoring_system(self):
        """Test monitoring system functionality"""
        # Test metrics endpoint
        response = requests.get(
            f"{self.base_url}/dashboard/metrics",
            headers={"Admin-Token": self.admin_token}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('system_metrics', data)
        self.assertIn('provider_status', data)
        
        # Test logs endpoint
        response = requests.get(
            f"{self.base_url}/dashboard/logs",
            headers={"Admin-Token": self.admin_token}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('logs', response.json())
        
        # Test editor status
        response = requests.get(
            f"{self.base_url}/dashboard/editor/status",
            headers={"Admin-Token": self.admin_token}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('connected_editors', data)
        self.assertIn('active_sessions', data)
        
    def test_admin_commands(self):
        """Test various admin commands"""
        commands = [
            "@him system status",
            "@him reload providers",
            "@him check health",
            "@him clear cache",
            "@him monitor editors",
            "@him show active sessions",
            "@him provider performance"
        ]
        
        for cmd in commands:
            response = requests.post(
                f"{self.base_url}/query",
                json={
                    "query": cmd,
                    "admin_token": self.admin_token
                }
            )
            self.assertEqual(response.status_code, 200)
            self.assertIn("result", response.json())

if __name__ == "__main__":
    unittest.main(verbosity=2)
