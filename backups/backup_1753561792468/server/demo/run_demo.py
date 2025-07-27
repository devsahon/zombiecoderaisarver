import asyncio
import webbrowser
import subprocess
import time
import sys
import os
from pathlib import Path

class FeatureDemo:
    def __init__(self):
        self.server_process = None
        self.monitor_process = None
        self.demo_url = "http://localhost:8000"

    async def start_services(self):
        """Start server and monitoring services"""
        print("Starting services...")
        
        # Start main server
        server_cmd = [sys.executable, "server/app.py"]
        self.server_process = subprocess.Popen(
            server_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Start status monitor
        monitor_cmd = [sys.executable, "utils/status_monitor.py"]
        self.monitor_process = subprocess.Popen(
            monitor_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for services to start
        await asyncio.sleep(2)
        print("✅ Services started")

    def stop_services(self):
        """Stop all services"""
        if self.server_process:
            self.server_process.terminate()
        if self.monitor_process:
            self.monitor_process.terminate()
        print("\n❌ Services stopped")

    async def open_demo_pages(self):
        """Open demo pages in browser"""
        pages = [
            ("Voice Studio", "/voice-studio"),
            ("VSCode Integration", "/docs/vscode-integration"),
            ("Cursor AI Integration", "/docs/cursor-integration"),
            ("Status Dashboard", "/status"),
        ]

        print("\nOpening demo pages...")
        for name, path in pages:
            url = f"{self.demo_url}{path}"
            webbrowser.open(url)
            print(f"✅ Opened {name}: {url}")
            await asyncio.sleep(1)

    async def simulate_activities(self):
        """Simulate some activities to demonstrate features"""
        print("\nSimulating activities...")
        
        # Simulate agent status changes
        print("1. Simulating agent status changes...")
        agents = ["procoder", "creative_writer"]
        statuses = ["active", "busy", "error", "active"]
        
        for agent in agents:
            for status in statuses:
                await self.send_notification("agent_status", agent, status)
                await asyncio.sleep(2)
        
        # Simulate provider status changes
        print("\n2. Simulating provider status changes...")
        providers = ["openai", "local_model"]
        statuses = ["online", "error", "degraded", "online"]
        
        for provider in providers:
            for status in statuses:
                await self.send_notification("provider_status", provider, status)
                await asyncio.sleep(2)

        # Simulate voice generation
        print("\n3. Simulating voice generation...")
        text = "Hello! This is a demonstration of our text-to-speech feature."
        await self.generate_voice(text)
        
        print("\n✅ Activities simulation completed")

    async def send_notification(self, type: str, id: str, status: str):
        """Send test notification"""
        import aiohttp
        
        details = {
            "timestamp": time.time(),
            "message": f"Test {status} status for {id}"
        }
        
        if status == "error":
            details["error"] = "Simulated error for testing"
        elif status == "degraded":
            details["latency"] = "500ms"
        
        async with aiohttp.ClientSession() as session:
            await session.post(
                f"{self.demo_url}/notify/{type}",
                json={
                    "type": type,
                    "id": id,
                    "status": status,
                    "details": details
                }
            )
        print(f"✅ Sent {status} notification for {id}")

    async def generate_voice(self, text: str):
        """Generate test voice"""
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            response = await session.post(
                f"{self.demo_url}/api/chat/audio",
                json={
                    "text": text,
                    "voice_id": "google_tts"
                }
            )
            
            if response.status == 200:
                # Save audio file
                output_file = Path("demo/test_output.mp3")
                output_file.parent.mkdir(exist_ok=True)
                
                with open(output_file, "wb") as f:
                    f.write(await response.read())
                print(f"✅ Generated voice file: {output_file}")
            else:
                print(f"❌ Voice generation failed: {response.status}")

async def main():
    """Run the feature demonstration"""
    demo = FeatureDemo()
    
    try:
        # Start services
        await demo.start_services()
        
        # Open demo pages
        await demo.open_demo_pages()
        
        # Run simulations
        await demo.simulate_activities()
        
        # Keep running until user stops
        print("\nDemo is running. Press Ctrl+C to stop...")
        while True:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        print("\nStopping demo...")
    finally:
        demo.stop_services()

if __name__ == "__main__":
    print("=== ZombieCoder AI Feature Demo ===")
    asyncio.run(main()) 