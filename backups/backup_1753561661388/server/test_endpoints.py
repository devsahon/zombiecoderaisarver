import requests
import websockets
import asyncio
import json
import time
from datetime import datetime

class EndpointTester:
    def __init__(self):
        self.base_url = "http://localhost:5000"
        self.ws_url = "ws://localhost:8766"
        self.admin_token = "zombiecoder_admin"
        self.results = []

    def log_result(self, endpoint: str, success: bool, response: str):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        result = {
            "timestamp": timestamp,
            "endpoint": endpoint,
            "success": success,
            "response": response
        }
        self.results.append(result)
        status = "✅" if success else "❌"
        print(f"{status} {timestamp} - {endpoint}: {response}")

    def test_health(self):
        """Test health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health")
            success = response.status_code == 200
            self.log_result(
                "Health Check", 
                success, 
                f"Status: {response.status_code}, Response: {response.json()}"
            )
        except Exception as e:
            self.log_result("Health Check", False, f"Error: {str(e)}")

    def test_metrics(self):
        """Test metrics endpoint"""
        try:
            response = requests.get(
                f"{self.base_url}/admin/dashboard/metrics",
                headers={"Admin-Token": self.admin_token}
            )
            success = response.status_code == 200
            self.log_result(
                "Metrics Dashboard", 
                success, 
                f"Status: {response.status_code}, Data received: {bool(response.json())}"
            )
        except Exception as e:
            self.log_result("Metrics Dashboard", False, f"Error: {str(e)}")

    def test_logs(self):
        """Test logs endpoint"""
        try:
            response = requests.get(
                f"{self.base_url}/admin/dashboard/logs",
                headers={"Admin-Token": self.admin_token}
            )
            success = response.status_code == 200
            self.log_result(
                "Logs Dashboard", 
                success, 
                f"Status: {response.status_code}, Logs available: {bool(response.json().get('logs'))}"
            )
        except Exception as e:
            self.log_result("Logs Dashboard", False, f"Error: {str(e)}")

    def test_editor_status(self):
        """Test editor status endpoint"""
        try:
            response = requests.get(
                f"{self.base_url}/admin/dashboard/editor/status",
                headers={"Admin-Token": self.admin_token}
            )
            success = response.status_code == 200
            self.log_result(
                "Editor Status", 
                success, 
                f"Status: {response.status_code}, Data: {response.json()}"
            )
        except Exception as e:
            self.log_result("Editor Status", False, f"Error: {str(e)}")

    async def test_websocket(self):
        """Test WebSocket connection"""
        try:
            async with websockets.connect(self.ws_url) as websocket:
                # Send registration
                reg_data = {
                    "editor_id": "test_editor",
                    "type": "registration",
                    "info": {
                        "name": "VS Code Test",
                        "version": "1.0.0"
                    }
                }
                await websocket.send(json.dumps(reg_data))
                
                # Wait for response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    self.log_result(
                        "WebSocket Connection", 
                        True, 
                        f"Connected and registered successfully: {response}"
                    )
                except asyncio.TimeoutError:
                    self.log_result(
                        "WebSocket Connection", 
                        False, 
                        "Timeout waiting for response"
                    )
        except Exception as e:
            self.log_result("WebSocket Connection", False, f"Error: {str(e)}")

    def test_admin_command(self):
        """Test admin command execution"""
        commands = [
            "@him system status",
            "@him check health",
            "@him show active editors"
        ]
        
        for cmd in commands:
            try:
                response = requests.post(
                    f"{self.base_url}/admin/dashboard/commands",
                    headers={"Admin-Token": self.admin_token},
                    json={"command": cmd}
                )
                success = response.status_code == 200
                self.log_result(
                    f"Admin Command: {cmd}", 
                    success, 
                    f"Status: {response.status_code}, Response: {response.json()}"
                )
            except Exception as e:
                self.log_result(f"Admin Command: {cmd}", False, f"Error: {str(e)}")

    async def run_all_tests(self):
        """Run all tests"""
        print("\n=== Starting Endpoint Tests ===\n")
        
        # REST API tests
        self.test_health()
        time.sleep(1)
        self.test_metrics()
        time.sleep(1)
        self.test_logs()
        time.sleep(1)
        self.test_editor_status()
        time.sleep(1)
        self.test_admin_command()
        time.sleep(1)
        
        # WebSocket test
        await self.test_websocket()
        
        print("\n=== Test Results Summary ===")
        total_tests = len(self.results)
        successful_tests = len([r for r in self.results if r["success"]])
        print(f"\nTotal Tests: {total_tests}")
        print(f"Successful: {successful_tests}")
        print(f"Failed: {total_tests - successful_tests}")
        
        # Save results to file
        with open("test_results.json", "w") as f:
            json.dump(self.results, f, indent=2)
        print("\nDetailed results saved to test_results.json")

if __name__ == "__main__":
    tester = EndpointTester()
    asyncio.run(tester.run_all_tests())
