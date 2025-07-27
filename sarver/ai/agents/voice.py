import os
from pathlib import Path
from typing import Dict, Any, Optional
import numpy as np
import soundfile as sf
import torch
import torchaudio
from transformers import AutoProcessor, AutoModel

class BengaliVoiceModel:
    def __init__(self):
        self.model = None
        self.processor = None
        self.voices = {
            "bn-female-1": {
                "name": "Bengali Female 1",
                "gender": "female",
                "style": "natural"
            },
            "bn-male-1": {
                "name": "Bengali Male 1",
                "gender": "male",
                "style": "natural"
            },
            "bn-female-2": {
                "name": "Bengali Female 2",
                "gender": "female",
                "style": "expressive"
            }
        }
        self._load_model()

    def _load_model(self) -> None:
        """Load the TTS model"""
        model_path = self._get_model_path()
        if not model_path.exists():
            raise RuntimeError("Bengali voice model not found")

        try:
            self.processor = AutoProcessor.from_pretrained(str(model_path))
            self.model = AutoModel.from_pretrained(str(model_path))
        except Exception as e:
            raise RuntimeError(f"Failed to load voice model: {e}")

    def _get_model_path(self) -> Path:
        """Get path to voice model"""
        return Path(__file__).parent / "models" / "bengali_tts"

    def _preprocess_text(self, text: str) -> str:
        """Preprocess Bengali text"""
        # Remove special characters and emojis
        # Keep only Bengali text and basic punctuation
        processed_text = "".join(
            char for char in text 
            if '\u0980' <= char <= '\u09FF' or char in ',.?! '
        )
        return processed_text

    def generate_speech(self, text: str, voice_id: str) -> Dict[str, Any]:
        """Generate speech from text"""
        if not self.model or not self.processor:
            raise RuntimeError("Model not loaded")

        if voice_id not in self.voices:
            raise ValueError(f"Voice {voice_id} not found")

        # Preprocess text
        text = self._preprocess_text(text)
        if not text:
            raise ValueError("No valid Bengali text after preprocessing")

        try:
            # Process text
            inputs = self.processor(
                text=text,
                voice_id=voice_id,
                return_tensors="pt"
            )

            # Generate audio
            with torch.no_grad():
                output = self.model.generate(**inputs)

            # Convert to waveform
            waveform = output.cpu().numpy().squeeze()
            sample_rate = self.processor.sample_rate

            return {
                "waveform": waveform,
                "sample_rate": sample_rate,
                "voice": self.voices[voice_id]
            }

        except Exception as e:
            raise RuntimeError(f"Speech generation failed: {e}")

    def save_audio(self, audio_data: Dict[str, Any], file_path: str) -> None:
        """Save audio to file"""
        try:
            waveform = audio_data["waveform"]
            sample_rate = audio_data["sample_rate"]
            sf.write(file_path, waveform, sample_rate)
        except Exception as e:
            raise RuntimeError(f"Failed to save audio: {e}")

    def generate_preview(self, text: str, voice_id: str) -> Dict[str, Any]:
        """Generate a short preview"""
        # Generate speech
        audio_data = self.generate_speech(text, voice_id)

        # Limit preview length
        max_samples = int(5 * audio_data["sample_rate"])  # 5 seconds max
        if len(audio_data["waveform"]) > max_samples:
            audio_data["waveform"] = audio_data["waveform"][:max_samples]

        return {
            "audio": audio_data["waveform"].tolist(),
            "sample_rate": audio_data["sample_rate"],
            "voice": audio_data["voice"]
        }

    def get_available_voices(self) -> Dict[str, Dict[str, str]]:
        """Get list of available voices"""
        return self.voices
