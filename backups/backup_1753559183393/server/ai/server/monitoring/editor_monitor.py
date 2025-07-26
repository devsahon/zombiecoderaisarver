from typing import Dict, List, Optional
import threading
import json
import websockets
import asyncio
import logging
from datetime import datetime

class EditorMonitor:
    def __init__(self):
        self.connected_editors = {}
        self.editor_events = []
        self.max_events = 1000
        self.logger = self._setup_logger()
        self.lock = threading.Lock()
        self.server = None
        
    async def start_websocket_server(self):
        """Start WebSocket server"""
        try:
            self.server = await websockets.serve(
                self.handle_editor_connection,
                "localhost",
                8766  # Different port from system monitor
            )
            self.logger.info("Editor WebSocket server started on port 8766")
            await self.server.wait_closed()
        except Exception as e:
            self.logger.error(f"Failed to start WebSocket server: {str(e)}")
            raise
        
    def _setup_logger(self):
        logger = logging.getLogger('editor_monitor')
        logger.setLevel(logging.INFO)
        handler = logging.FileHandler('logs/editor_monitor.log')
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        return logger
        
    async def handle_editor_connection(self, websocket, path):
        """Handle new editor connection"""
        editor_id = None
        try:
            # Registration
            registration = await websocket.recv()
            editor_info = json.loads(registration)
            editor_id = editor_info['editor_id']
            
            with self.lock:
                self.connected_editors[editor_id] = {
                    'websocket': websocket,
                    'info': editor_info,
                    'connected_at': datetime.now().isoformat(),
                    'last_active': datetime.now().isoformat()
                }
            
            self.log_event('connection', f'Editor {editor_id} connected')
            
            # Handle events
            try:
                async for message in websocket:
                    await self.process_editor_event(editor_id, message)
            except websockets.exceptions.ConnectionClosed:
                pass
            
        finally:
            if editor_id:
                with self.lock:
                    self.connected_editors.pop(editor_id, None)
                self.log_event('disconnection', f'Editor {editor_id} disconnected')
                
    async def process_editor_event(self, editor_id: str, message: str):
        """Process incoming editor event"""
        try:
            event = json.loads(message)
            event['editor_id'] = editor_id
            event['timestamp'] = datetime.now().isoformat()
            
            with self.lock:
                self.editor_events.append(event)
                if len(self.editor_events) > self.max_events:
                    self.editor_events.pop(0)
                
                # Update last active timestamp
                if editor_id in self.connected_editors:
                    self.connected_editors[editor_id]['last_active'] = event['timestamp']
                    
            self.log_event('editor_event', f'Received event from {editor_id}: {event["type"]}')
            
            # Process specific event types
            if event['type'] == 'file_change':
                await self.handle_file_change(editor_id, event)
            elif event['type'] == 'command_execution':
                await self.handle_command_execution(editor_id, event)
            elif event['type'] == 'diagnostic':
                await self.handle_diagnostic(editor_id, event)
                
        except json.JSONDecodeError:
            self.logger.error(f'Invalid JSON from editor {editor_id}')
        except Exception as e:
            self.logger.error(f'Error processing editor event: {str(e)}')
            
    async def handle_file_change(self, editor_id: str, event: Dict):
        """Handle file change events"""
        # Track file changes
        pass
        
    async def handle_command_execution(self, editor_id: str, event: Dict):
        """Handle command execution events"""
        # Track command executions
        pass
        
    async def handle_diagnostic(self, editor_id: str, event: Dict):
        """Handle diagnostic events"""
        # Track diagnostics
        pass
        
    def get_active_editors(self) -> List[Dict]:
        """Get list of currently connected editors"""
        with self.lock:
            return [{
                'editor_id': editor_id,
                'info': info['info'],
                'connected_at': info['connected_at'],
                'last_active': info['last_active']
            } for editor_id, info in self.connected_editors.items()]
            
    def get_recent_events(self, limit: int = 100) -> List[Dict]:
        """Get recent editor events"""
        with self.lock:
            return self.editor_events[-limit:]
            
    def get_editor_metrics(self) -> Dict:
        """Get editor monitoring metrics"""
        with self.lock:
            return {
                'active_editors': len(self.connected_editors),
                'total_events': len(self.editor_events),
                'event_types': self._count_event_types()
            }
            
    def _count_event_types(self) -> Dict:
        """Count events by type"""
        counts = {}
        for event in self.editor_events:
            event_type = event.get('type')
            counts[event_type] = counts.get(event_type, 0) + 1
        return counts
        
    def log_event(self, event_type: str, message: str):
        """Log monitoring events"""
        self.logger.info(f"{event_type}: {message}")
        
editor_monitor = EditorMonitor()
