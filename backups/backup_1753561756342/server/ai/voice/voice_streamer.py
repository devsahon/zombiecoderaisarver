import os
from typing import Generator
from .voice_handler import voice_handler

CHUNK_SIZE = 1024 * 16  # 16KB chunks

def stream_speech(text: str, voice_id: str = None) -> Generator[bytes, None, None]:
    """Stream audio in chunks for progressive playback"""
    try:
        # Generate full audio
        audio_data = voice_handler.generate_speech(text, voice_id)
        
        # Stream in chunks
        total_size = len(audio_data)
        for i in range(0, total_size, CHUNK_SIZE):
            chunk = audio_data[i:i + CHUNK_SIZE]
            yield chunk
            
    except Exception as e:
        # Log error and yield empty chunk to end stream
        print(f"Error streaming speech: {e}")
        yield b'' 