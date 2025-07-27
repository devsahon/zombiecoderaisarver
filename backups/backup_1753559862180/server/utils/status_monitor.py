import asyncio
import logging
import aiohttp
import socket
from typing import Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class StatusMonitor:
    def __init__(self, notification_url: str, check_interval: int = 30):
        self.notification_url = notification_url
        self.check_interval = check_interval
        self.running = False
        self.last_status: Dict[str, Dict] = {}

    async def start(self):
        """Start the status monitoring loop"""
        self.running = True
        while self.running:
            await self.check_all_statuses()
            await asyncio.sleep(self.check_interval)

    def stop(self):
        """Stop the status monitoring loop"""
        self.running = False

    async def check_all_statuses(self):
        """Check status of all agents and providers"""
        # Check agents
        agents = self.get_active_agents()
        for agent in agents:
            await self.check_agent_status(agent)

        # Check providers
        providers = self.get_configured_providers()
        for provider in providers:
            await self.check_provider_status(provider)

    def get_active_agents(self) -> list:
        """Get list of active agents from registry"""
        # TODO: Implement actual agent discovery
        return [
            {
                'id': 'procoder',
                'type': 'development',
                'config': {'memory_limit': '100MB'}
            },
            {
                'id': 'creative_writer',
                'type': 'creative',
                'config': {'memory_limit': '80MB'}
            }
        ]

    def get_configured_providers(self) -> list:
        """Get list of configured providers"""
        # TODO: Implement actual provider discovery
        return [
            {
                'id': 'openai',
                'type': 'api',
                'config': {
                    'health_endpoint': 'https://api.openai.com/v1/health',
                    'timeout': 5
                }
            },
            {
                'id': 'local_model',
                'type': 'local',
                'config': {
                    'port': 5000,
                    'host': 'localhost'
                }
            }
        ]

    async def check_agent_status(self, agent: Dict):
        """Check status of a single agent"""
        agent_id = agent['id']
        try:
            # Check agent process and memory usage
            memory_usage = self.get_agent_memory_usage(agent_id)
            response_time = await self.measure_agent_response_time(agent_id)
            
            status = 'active' if memory_usage and response_time else 'error'
            details = {
                'memory_usage': memory_usage,
                'response_time': f"{response_time:.2f}ms" if response_time else 'N/A',
                'last_check': datetime.now().isoformat()
            }

            # Only notify if status changed
            if self.has_status_changed(agent_id, status, details):
                await self.send_notification('agent_status', agent_id, status, details)
                self.last_status[agent_id] = {'status': status, 'details': details}

        except Exception as e:
            logger.error(f"Error checking agent {agent_id}: {e}")
            await self.send_notification('agent_status', agent_id, 'error', {'error': str(e)})

    async def check_provider_status(self, provider: Dict):
        """Check status of a single provider"""
        provider_id = provider['id']
        try:
            status = 'offline'
            details = {}

            if provider['type'] == 'api':
                status, details = await self.check_api_provider(provider)
            elif provider['type'] == 'local':
                status, details = self.check_local_provider(provider)

            # Only notify if status changed
            if self.has_status_changed(provider_id, status, details):
                await self.send_notification('provider_status', provider_id, status, details)
                self.last_status[provider_id] = {'status': status, 'details': details}

        except Exception as e:
            logger.error(f"Error checking provider {provider_id}: {e}")
            await self.send_notification('provider_status', provider_id, 'error', {'error': str(e)})

    async def check_api_provider(self, provider: Dict) -> tuple:
        """Check status of an API-based provider"""
        async with aiohttp.ClientSession() as session:
            try:
                start_time = asyncio.get_event_loop().time()
                async with session.get(
                    provider['config']['health_endpoint'],
                    timeout=provider['config'].get('timeout', 5)
                ) as response:
                    latency = (asyncio.get_event_loop().time() - start_time) * 1000
                    
                    if response.status == 200:
                        return 'online', {
                            'latency': f"{latency:.2f}ms",
                            'last_check': datetime.now().isoformat()
                        }
                    else:
                        return 'error', {
                            'error': f"HTTP {response.status}",
                            'last_check': datetime.now().isoformat()
                        }
            except asyncio.TimeoutError:
                return 'error', {
                    'error': 'Timeout',
                    'last_check': datetime.now().isoformat()
                }
            except Exception as e:
                return 'error', {
                    'error': str(e),
                    'last_check': datetime.now().isoformat()
                }

    def check_local_provider(self, provider: Dict) -> tuple:
        """Check status of a local provider using TCP connection"""
        try:
            start_time = asyncio.get_event_loop().time()
            with socket.create_connection(
                (provider['config']['host'], provider['config']['port']),
                timeout=2
            ):
                latency = (asyncio.get_event_loop().time() - start_time) * 1000
                return 'online', {
                    'latency': f"{latency:.2f}ms",
                    'last_check': datetime.now().isoformat()
                }
        except (socket.timeout, ConnectionRefusedError):
            return 'offline', {
                'error': 'Connection failed',
                'last_check': datetime.now().isoformat()
            }
        except Exception as e:
            return 'error', {
                'error': str(e),
                'last_check': datetime.now().isoformat()
            }

    def get_agent_memory_usage(self, agent_id: str) -> Optional[str]:
        """Get memory usage of an agent process"""
        # TODO: Implement actual memory usage check
        return "45MB"

    async def measure_agent_response_time(self, agent_id: str) -> Optional[float]:
        """Measure agent response time"""
        # TODO: Implement actual response time measurement
        return 120.5

    def has_status_changed(self, id: str, status: str, details: Dict) -> bool:
        """Check if status has changed since last check"""
        if id not in self.last_status:
            return True
        
        last = self.last_status[id]
        return (
            last['status'] != status or
            last['details'].get('error') != details.get('error') or
            abs(float(last['details'].get('latency', '0').rstrip('ms')) -
                float(details.get('latency', '0').rstrip('ms'))) > 100
        )

    async def send_notification(self, type: str, id: str, status: str, details: Dict):
        """Send status notification to the WebSocket server"""
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(
                    f"{self.notification_url}/{type}",
                    json={
                        'type': type,
                        'id': id,
                        'status': status,
                        'details': details
                    }
                )
        except Exception as e:
            logger.error(f"Error sending notification: {e}")

# Usage example:
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    monitor = StatusMonitor("http://localhost:8000/notify")
    
    try:
        asyncio.run(monitor.start())
    except KeyboardInterrupt:
        monitor.stop()
        print("\nMonitoring stopped") 