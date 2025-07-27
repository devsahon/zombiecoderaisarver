import psutil
import threading
import time
import json
from datetime import datetime
from typing import Dict, List, Optional
import os
from collections import deque
try:
    from websockets.server import serve
    WEBSOCKETS_AVAILABLE = True
except ImportError:
    WEBSOCKETS_AVAILABLE = False
    print("Warning: websockets not available, WebSocket server disabled")
import asyncio
import logging

class SystemMonitor:
    def __init__(self):
        self.metrics_history = {
            'cpu': deque(maxlen=100),
            'memory': deque(maxlen=100),
            'network': deque(maxlen=100),
            'api_calls': deque(maxlen=1000),
            'editor_events': deque(maxlen=1000),
            'provider_status': deque(maxlen=100)
        }
        self.connected_clients = set()
        self.logger = self._setup_logger()
        self.start_monitoring()
        
    def _setup_logger(self):
        logger = logging.getLogger('system_monitor')
        logger.setLevel(logging.INFO)
        handler = logging.FileHandler('logs/system_monitor.log')
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        return logger

    def start_monitoring(self):
        """Start all monitoring threads"""
        threading.Thread(target=self._monitor_system_metrics, daemon=True).start()
        threading.Thread(target=self._monitor_api_usage, daemon=True).start()
        threading.Thread(target=self._monitor_editor_integration, daemon=True).start()
        
        # Start WebSocket server only if available
        if WEBSOCKETS_AVAILABLE:
            try:
                asyncio.get_event_loop().run_until_complete(self._start_websocket_server())
            except Exception as e:
                print(f"WebSocket server failed to start: {e}")
        else:
            print("WebSocket server disabled - websockets not available")

    async def _start_websocket_server(self):
        """Start WebSocket server for real-time updates"""
        async with serve(self._handle_client, "localhost", 8765):
            await asyncio.Future()  # run forever

    async def _handle_client(self, websocket):
        """Handle WebSocket client connection"""
        self.connected_clients.add(websocket)
        try:
            while True:
                # Send real-time updates to client
                metrics = self.get_current_metrics()
                await websocket.send(json.dumps(metrics))
                await asyncio.sleep(1)
        finally:
            self.connected_clients.remove(websocket)

    def _monitor_system_metrics(self):
        """Monitor system metrics (CPU, Memory, Network)"""
        while True:
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'cpu_percent': psutil.cpu_percent(interval=1),
                'memory_percent': psutil.virtual_memory().percent,
                'network_io': self._get_network_io()
            }
            self.metrics_history['cpu'].append(metrics)
            self.broadcast_update('system_metrics', metrics)
            time.sleep(1)

    def _monitor_api_usage(self):
        """Monitor API calls and performance"""
        while True:
            metrics = self._get_api_metrics()
            self.metrics_history['api_calls'].append(metrics)
            self.broadcast_update('api_metrics', metrics)
            time.sleep(5)

    def _monitor_editor_integration(self):
        """Monitor editor events and integrations"""
        while True:
            events = self._get_editor_events()
            self.metrics_history['editor_events'].append(events)
            self.broadcast_update('editor_events', events)
            time.sleep(1)

    def _get_network_io(self) -> Dict:
        """Get network I/O statistics"""
        net_io = psutil.net_io_counters()
        return {
            'bytes_sent': net_io.bytes_sent,
            'bytes_recv': net_io.bytes_recv
        }

    def _get_api_metrics(self) -> Dict:
        """Get API performance metrics"""
        # Implement API metrics collection
        return {
            'timestamp': datetime.now().isoformat(),
            'total_requests': 0,
            'response_times': [],
            'error_rate': 0.0
        }

    def _get_editor_events(self) -> Dict:
        """Get editor integration events"""
        # Implement editor event collection
        return {
            'timestamp': datetime.now().isoformat(),
            'active_editors': [],
            'event_count': 0
        }

    def get_current_metrics(self) -> Dict:
        """Get current system metrics"""
        return {
            'system': list(self.metrics_history['cpu'])[-1],
            'api': list(self.metrics_history['api_calls'])[-1],
            'editor': list(self.metrics_history['editor_events'])[-1]
        }

    def broadcast_update(self, event_type: str, data: Dict):
        """Broadcast updates to all connected clients"""
        message = json.dumps({
            'type': event_type,
            'data': data
        })
        asyncio.get_event_loop().run_until_complete(self._broadcast(message))

    async def _broadcast(self, message: str):
        """Send message to all connected WebSocket clients"""
        if self.connected_clients:
            await asyncio.gather(
                *[client.send(message) for client in self.connected_clients]
            )

    def log_event(self, event_type: str, message: str):
        """Log monitoring events"""
        self.logger.info(f"{event_type}: {message}")

system_monitor = SystemMonitor()
