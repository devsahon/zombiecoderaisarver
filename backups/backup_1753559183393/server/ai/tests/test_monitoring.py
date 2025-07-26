import unittest
import requests
import websockets
import asyncio
import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor
import logging

class TestMonitoringSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base_url = "http://localhost:5000"
        cls.admin_token = "zombiecoder_admin"
        cls.ws_url = "ws://localhost:8766"
        cls.setup_logging()

    @classmethod
    def setup_logging(cls):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        cls.logger = logging.getLogger(__name__)

    def test_01_health_check(self):
        """Test basic health check endpoint"""
        response = requests.get(f"{self.base_url}/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'healthy')

    def test_02_admin_dashboard(self):
        """Test admin dashboard endpoints"""
        # Test metrics
        response = requests.get(
            f"{self.base_url}/admin/dashboard/metrics",
            headers={"Admin-Token": self.admin_token}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('system_metrics', response.json())

        # Test logs
        response = requests.get(
            f"{self.base_url}/admin/dashboard/logs",
            headers={"Admin-Token": self.admin_token}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('logs', response.json())

    async def test_03_editor_websocket(self):
        """Test editor WebSocket connection"""
        try:
            async with websockets.connect(self.ws_url) as websocket:
                # Send registration
                await websocket.send(json.dumps({
                    "editor_id": "test_editor_1",
                    "type": "registration",
                    "info": {
                        "name": "VS Code",
                        "version": "1.60.0"
                    }
                }))

                # Send test event
                await websocket.send(json.dumps({
                    "type": "file_change",
                    "file": "test.py",
                    "action": "modified"
                }))

                # Wait for response
                response = await websocket.recv()
                self.assertIsNotNone(response)

        except Exception as e:
            self.logger.error(f"WebSocket test failed: {str(e)}")
            self.fail(f"WebSocket test failed: {str(e)}")

    def test_04_system_monitoring(self):
        """Test system monitoring metrics"""
        response = requests.get(
            f"{self.base_url}/admin/dashboard/metrics",
            headers={"Admin-Token": self.admin_token}
        )
        data = response.json()
        
        # Check system metrics
        self.assertIn('system_metrics', data)
        metrics = data['system_metrics']
        self.assertIn('cpu_percent', metrics)
        self.assertIn('memory_percent', metrics)

    def test_05_admin_commands(self):
        """Test admin commands"""
        commands = [
            "@him system status",
            "@him check health",
            "@him show active editors"
        ]

        for cmd in commands:
            response = requests.post(
                f"{self.base_url}/admin/dashboard/commands",
                headers={"Admin-Token": self.admin_token},
                json={"command": cmd}
            )
            self.assertEqual(response.status_code, 200)
            self.assertIn('result', response.json())

def run_async_tests():
    """Run async tests"""
    loop = asyncio.get_event_loop()
    suite = unittest.TestLoader().loadTestsFromTestCase(TestMonitoringSystem)
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)

if __name__ == '__main__':
    run_async_tests()
