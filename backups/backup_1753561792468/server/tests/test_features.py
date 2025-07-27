import asyncio
import pytest
import aiohttp
import websockets
import json
from fastapi.testclient import TestClient
from server.app import app
from utils.status_monitor import StatusMonitor

client = TestClient(app)

async def test_websocket_connection():
    """Test WebSocket connection and notifications"""
    uri = "ws://localhost:8000/ws/agent_status"
    async with websockets.connect(uri) as websocket:
        # Should receive initial connection message
        response = await websocket.recv()
        data = json.loads(response)
        assert "status" in data
        assert data["status"] == "connected"

async def test_voice_studio():
    """Test Voice Studio API endpoints"""
    # Test text-to-speech generation
    response = client.post("/api/chat/audio", json={
        "text": "Hello, this is a test",
        "voice_id": "google_tts"
    })
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"

    # Test voice list
    response = client.get("/api/voices")
    assert response.status_code == 200
    voices = response.json()
    assert len(voices) > 0
    assert all("id" in voice for voice in voices)

async def test_status_monitor():
    """Test status monitoring system"""
    monitor = StatusMonitor("http://localhost:8000/notify")
    
    # Test agent status check
    agent = {
        'id': 'test_agent',
        'type': 'test',
        'config': {'memory_limit': '100MB'}
    }
    await monitor.check_agent_status(agent)
    
    # Test provider status check
    provider = {
        'id': 'test_provider',
        'type': 'local',
        'config': {
            'port': 5000,
            'host': 'localhost'
        }
    }
    await monitor.check_provider_status(provider)

async def test_notifications():
    """Test notification delivery"""
    async with aiohttp.ClientSession() as session:
        # Send test notification
        response = await session.post(
            "http://localhost:8000/notify/test",
            json={
                "type": "test",
                "id": "test_notification",
                "status": "success",
                "details": {"message": "Test notification"}
            }
        )
        assert response.status == 200

def test_documentation():
    """Test documentation endpoints"""
    # Test VSCode integration docs
    response = client.get("/docs/vscode-integration")
    assert response.status_code == 200
    assert "VSCode Integration Guide" in response.text

    # Test Cursor AI docs
    response = client.get("/docs/cursor-integration")
    assert response.status_code == 200
    assert "Cursor AI Integration Guide" in response.text

@pytest.mark.asyncio
async def test_all_features():
    """Run all feature tests"""
    print("\nTesting WebSocket Connection...")
    await test_websocket_connection()
    print("✅ WebSocket Connection: OK")

    print("\nTesting Voice Studio...")
    await test_voice_studio()
    print("✅ Voice Studio: OK")

    print("\nTesting Status Monitor...")
    await test_status_monitor()
    print("✅ Status Monitor: OK")

    print("\nTesting Notifications...")
    await test_notifications()
    print("✅ Notifications: OK")

    print("\nTesting Documentation...")
    test_documentation()
    print("✅ Documentation: OK")

if __name__ == "__main__":
    asyncio.run(test_all_features()) 