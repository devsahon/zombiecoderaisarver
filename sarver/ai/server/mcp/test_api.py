import requests
import json

def test_query():
    url = "http://localhost:5000/query"
    data = {
        "query": "How to implement a binary search tree in Python?",
        "agent": "procoder"
    }
    response = requests.post(url, json=data)
    print("Query Test:", response.json())

def test_tts():
    url = "http://localhost:5000/tts"
    data = {
        "text": "Welcome to ZombieCoder AI system",
        "lang": "en"
    }
    response = requests.post(url, json=data)
    if response.status_code == 200:
        # Save audio file
        with open("test_audio.mp3", "wb") as f:
            f.write(response.content)
        print("TTS Test: Audio file saved as test_audio.mp3")
    else:
        print("TTS Test Error:", response.json())

def test_status():
    url = "http://localhost:5000/status"
    response = requests.get(url)
    print("Status Test:", response.json())

if __name__ == "__main__":
    print("Testing MCP Dispatcher API...")
    test_status()
    test_query()
    test_tts()
