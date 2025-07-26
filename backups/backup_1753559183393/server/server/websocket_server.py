import asyncio
import json
import logging
from typing import Dict, Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NotificationManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "agent_status": set(),
            "provider_status": set(),
            "system_status": set()
        }

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)
        logger.info(f"Client connected to channel: {channel}")

    def disconnect(self, websocket: WebSocket, channel: str):
        self.active_connections[channel].remove(websocket)
        logger.info(f"Client disconnected from channel: {channel}")

    async def broadcast(self, message: dict, channel: str):
        if channel not in self.active_connections:
            return
        
        dead_connections = set()
        for connection in self.active_connections[channel]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                dead_connections.add(connection)
        
        # Clean up dead connections
        for dead in dead_connections:
            self.active_connections[channel].remove(dead)

class StatusUpdate(BaseModel):
    type: str
    id: str
    status: str
    details: dict = {}

app = FastAPI()
manager = NotificationManager()

@app.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    await manager.connect(websocket, channel)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                # Handle client messages if needed
                await websocket.send_json({"status": "received"})
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)

@app.post("/notify/{channel}")
async def notify(channel: str, update: StatusUpdate):
    """Send notification to all connected clients on a specific channel"""
    message = {
        "type": update.type,
        "id": update.id,
        "status": update.status,
        "details": update.details,
        "timestamp": str(asyncio.get_event_loop().time())
    }
    await manager.broadcast(message, channel)
    return {"status": "notification sent"}

# Example usage in other parts of the application:
"""
# Send agent status update:
await requests.post(
    "http://localhost:8000/notify/agent_status",
    json={
        "type": "agent_status",
        "id": "procoder_agent",
        "status": "active",
        "details": {
            "memory_usage": "45MB",
            "response_time": "120ms"
        }
    }
)

# Send provider status update:
await requests.post(
    "http://localhost:8000/notify/provider_status",
    json={
        "type": "provider_status",
        "id": "openai",
        "status": "error",
        "details": {
            "error": "API rate limit exceeded",
            "retry_after": "60s"
        }
    }
)

# JavaScript client example:
const ws = new WebSocket('ws://localhost:8000/ws/agent_status');
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received update:', data);
    // Update UI based on the notification
    if (data.type === 'agent_status') {
        updateAgentStatus(data);
    }
};
"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 