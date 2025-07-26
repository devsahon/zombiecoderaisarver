#!/usr/bin/env python3
"""
ZombieCoder AI Management System - Server Launcher
Starts all microservices in the correct order
"""

import os
import sys
import time
import subprocess
import threading
import signal
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/server_launcher.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class ServerManager:
    def __init__(self):
        self.processes = {}
        self.running = True
        
        # Server configurations
        self.servers = {
            'ai-server': {
                'path': 'ai-server/app.py',
                'port': 8000,
                'name': 'AI Server',
                'description': 'Agent management and AI processing'
            },
            'voice-server': {
                'path': 'voice-server/app.py',
                'port': 8001,
                'name': 'Voice Server',
                'description': 'TTS/STT and voice processing'
            }
        }
        
        # Handle graceful shutdown
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info(f"Received signal {signum}, shutting down servers...")
        self.running = False
        self.stop_all_servers()
        sys.exit(0)
    
    def create_logs_directory(self):
        """Create logs directory if it doesn't exist"""
        os.makedirs('logs', exist_ok=True)
        for server_name in self.servers:
            os.makedirs(f'logs/{server_name}', exist_ok=True)
    
    def check_port_available(self, port):
        """Check if a port is available"""
        import socket
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return True
        except OSError:
            return False
    
    def start_server(self, server_name, server_config):
        """Start a single server"""
        try:
            if not self.check_port_available(server_config['port']):
                logger.error(f"Port {server_config['port']} is already in use for {server_name}")
                return False
            
            # Set environment variables
            env = os.environ.copy()
            env['PYTHONPATH'] = os.getcwd()
            env['SERVER_NAME'] = server_name
            env['SERVER_PORT'] = str(server_config['port'])
            
            # Start the server process
            process = subprocess.Popen(
                [sys.executable, server_config['path']],
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            self.processes[server_name] = process
            logger.info(f"Started {server_config['name']} on port {server_config['port']} (PID: {process.pid})")
            
            # Wait a moment for server to start
            time.sleep(2)
            
            # Check if process is still running
            if process.poll() is None:
                logger.info(f"{server_config['name']} is running successfully")
                return True
            else:
                stdout, stderr = process.communicate()
                logger.error(f"Failed to start {server_config['name']}: {stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Error starting {server_name}: {str(e)}")
            return False
    
    def stop_server(self, server_name):
        """Stop a single server"""
        if server_name in self.processes:
            process = self.processes[server_name]
            try:
                process.terminate()
                process.wait(timeout=10)
                logger.info(f"Stopped {server_name}")
            except subprocess.TimeoutExpired:
                process.kill()
                logger.warning(f"Force killed {server_name}")
            except Exception as e:
                logger.error(f"Error stopping {server_name}: {str(e)}")
    
    def stop_all_servers(self):
        """Stop all running servers"""
        logger.info("Stopping all servers...")
        for server_name in list(self.processes.keys()):
            self.stop_server(server_name)
        self.processes.clear()
    
    def monitor_servers(self):
        """Monitor server processes and restart if needed"""
        while self.running:
            for server_name, process in list(self.processes.items()):
                if process.poll() is not None:
                    logger.warning(f"{server_name} has stopped, restarting...")
                    server_config = self.servers[server_name]
                    self.processes.pop(server_name)
                    if self.start_server(server_name, server_config):
                        logger.info(f"Successfully restarted {server_name}")
                    else:
                        logger.error(f"Failed to restart {server_name}")
            time.sleep(5)
    
    def start_all_servers(self):
        """Start all servers"""
        logger.info("Starting ZombieCoder AI Management System...")
        logger.info(f"Python version: {sys.version}")
        logger.info(f"Working directory: {os.getcwd()}")
        
        # Create logs directory
        self.create_logs_directory()
        
        # Start servers in order
        started_servers = []
        for server_name, server_config in self.servers.items():
            logger.info(f"Starting {server_config['name']}...")
            if self.start_server(server_name, server_config):
                started_servers.append(server_name)
            else:
                logger.error(f"Failed to start {server_config['name']}")
        
        if started_servers:
            logger.info(f"Successfully started {len(started_servers)} servers: {', '.join(started_servers)}")
            
            # Start monitoring in a separate thread
            monitor_thread = threading.Thread(target=self.monitor_servers, daemon=True)
            monitor_thread.start()
            
            # Keep main thread alive
            try:
                while self.running:
                    time.sleep(1)
            except KeyboardInterrupt:
                logger.info("Received keyboard interrupt")
                self.running = False
        else:
            logger.error("No servers were started successfully")
            return False
        
        return True
    
    def health_check(self):
        """Perform health check on all servers"""
        import requests
        
        health_status = {}
        for server_name, server_config in self.servers.items():
            try:
                response = requests.get(f"http://localhost:{server_config['port']}/api/health", timeout=5)
                if response.status_code == 200:
                    health_status[server_name] = "healthy"
                else:
                    health_status[server_name] = f"unhealthy (status: {response.status_code})"
            except Exception as e:
                health_status[server_name] = f"unreachable ({str(e)})"
        
        return health_status

def main():
    """Main function"""
    print("🚀 ZombieCoder AI Management System - Server Launcher")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists('ai-server') or not os.path.exists('voice-server'):
        print("❌ Error: Please run this script from the sarver directory")
        sys.exit(1)
    
    # Create server manager
    manager = ServerManager()
    
    # Start all servers
    if manager.start_all_servers():
        print("\n✅ All servers started successfully!")
        print("\n📊 Server Status:")
        print("- AI Server: http://localhost:8000")
        print("- Voice Server: http://localhost:8001")
        print("- Admin Panel: http://localhost:3000")
        print("\n🔧 Health Check:")
        
        # Perform health check
        health_status = manager.health_check()
        for server_name, status in health_status.items():
            print(f"  - {server_name}: {status}")
        
        print("\n⏹️  Press Ctrl+C to stop all servers")
        
        # Wait for shutdown
        try:
            while manager.running:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Shutting down servers...")
            manager.stop_all_servers()
            print("✅ All servers stopped")
    else:
        print("❌ Failed to start servers")
        sys.exit(1)

if __name__ == "__main__":
    main() 