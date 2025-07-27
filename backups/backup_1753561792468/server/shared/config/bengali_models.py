"""
Bengali Language Models Configuration
লোকাল বাংলা ভাষার মডেল কনফিগারেশন
"""

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent.parent
MODELS_DIR = BASE_DIR / "models"
BENGALI_MODELS_DIR = MODELS_DIR / "bengali"

# Create directories if they don't exist
BENGALI_MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Bengali TTS Models (Text-to-Speech)
BENGALI_TTS_MODELS = {
    "coqui_bengali": {
        "name": "Coqui TTS Bengali",
        "model_path": str(BENGALI_MODELS_DIR / "coqui_bengali"),
        "type": "local",
        "description": "High-quality Bengali TTS using Coqui TTS",
        "download_url": "https://huggingface.co/coqui/tts-bengali",
        "size_mb": 150,
        "quality": "high",
        "speed": "medium"
    },
    "espeak_bengali": {
        "name": "eSpeak Bengali",
        "model_path": str(BENGALI_MODELS_DIR / "espeak_bengali"),
        "type": "local",
        "description": "Fast Bengali TTS using eSpeak",
        "download_url": "https://github.com/espeak-ng/espeak-ng",
        "size_mb": 5,
        "quality": "medium",
        "speed": "fast"
    },
    "pyttsx3_bengali": {
        "name": "pyttsx3 Bengali",
        "model_path": str(BENGALI_MODELS_DIR / "pyttsx3_bengali"),
        "type": "local",
        "description": "System Bengali TTS using pyttsx3",
        "download_url": "system",
        "size_mb": 10,
        "quality": "medium",
        "speed": "fast"
    }
}

# Bengali STT Models (Speech-to-Text)
BENGALI_STT_MODELS = {
    "whisper_bengali": {
        "name": "Whisper Bengali",
        "model_path": str(BENGALI_MODELS_DIR / "whisper_bengali"),
        "type": "local",
        "description": "Bengali speech recognition using Whisper",
        "download_url": "https://huggingface.co/openai/whisper-base",
        "size_mb": 244,
        "quality": "high",
        "speed": "medium"
    },
    "vosk_bengali": {
        "name": "Vosk Bengali",
        "model_path": str(BENGALI_MODELS_DIR / "vosk_bengali"),
        "type": "local",
        "description": "Offline Bengali speech recognition",
        "download_url": "https://alphacephei.com/vosk/models",
        "size_mb": 50,
        "quality": "good",
        "speed": "fast"
    }
}

# Bengali LLM Models (Language Models)
BENGALI_LLM_MODELS = {
    "llama2_bengali": {
        "name": "Llama 2 Bengali",
        "model_path": str(BENGALI_MODELS_DIR / "llama2_bengali"),
        "type": "local",
        "description": "Bengali language model based on Llama 2",
        "download_url": "https://huggingface.co/bangla-llama",
        "size_mb": 7000,
        "quality": "high",
        "speed": "slow"
    },
    "mistral_bengali": {
        "name": "Mistral Bengali",
        "model_path": str(BENGALI_MODELS_DIR / "mistral_bengali"),
        "type": "local",
        "description": "Bengali language model based on Mistral",
        "download_url": "https://huggingface.co/bangla-mistral",
        "size_mb": 4000,
        "quality": "high",
        "speed": "medium"
    },
    "phi2_bengali": {
        "name": "Phi-2 Bengali",
        "model_path": str(BENGALI_MODELS_DIR / "phi2_bengali"),
        "type": "local",
        "description": "Lightweight Bengali language model",
        "download_url": "https://huggingface.co/bangla-phi2",
        "size_mb": 1500,
        "quality": "good",
        "speed": "fast"
    }
}

# Model download configurations
MODEL_DOWNLOAD_CONFIG = {
    "use_cache": True,
    "cache_dir": str(BENGALI_MODELS_DIR / "cache"),
    "max_retries": 3,
    "timeout": 300,
    "chunk_size": 8192
}

# Bengali language settings
BENGALI_LANGUAGE_CONFIG = {
    "language_code": "bn",
    "country_code": "BD",
    "locale": "bn_BD",
    "encoding": "utf-8",
    "script": "Bengali",
    "direction": "ltr"
}

# Voice settings for Bengali
BENGALI_VOICE_SETTINGS = {
    "default_voice": "coqui_bengali",
    "fallback_voice": "pyttsx3_bengali",
    "speech_rate": 150,
    "volume": 0.9,
    "pitch": 1.0
}

# STT settings for Bengali
BENGALI_STT_SETTINGS = {
    "default_model": "whisper_bengali",
    "fallback_model": "vosk_bengali",
    "language": "bn",
    "sample_rate": 16000,
    "chunk_size": 1024
}

def get_model_path(model_name: str, model_type: str = "tts") -> str:
    """Get the path for a specific model"""
    if model_type == "tts":
        models = BENGALI_TTS_MODELS
    elif model_type == "stt":
        models = BENGALI_STT_MODELS
    elif model_type == "llm":
        models = BENGALI_LLM_MODELS
    else:
        raise ValueError(f"Unknown model type: {model_type}")
    
    if model_name not in models:
        raise ValueError(f"Model {model_name} not found in {model_type} models")
    
    return models[model_name]["model_path"]

def is_model_downloaded(model_name: str, model_type: str = "tts") -> bool:
    """Check if a model is downloaded"""
    model_path = get_model_path(model_name, model_type)
    return os.path.exists(model_path)

def get_available_models(model_type: str = "tts") -> list:
    """Get list of available models for a type"""
    if model_type == "tts":
        models = BENGALI_TTS_MODELS
    elif model_type == "stt":
        models = BENGALI_STT_MODELS
    elif model_type == "llm":
        models = BENGALI_LLM_MODELS
    else:
        return []
    
    available = []
    for name, config in models.items():
        if is_model_downloaded(name, model_type):
            available.append({
                "name": name,
                "display_name": config["name"],
                "description": config["description"],
                "quality": config["quality"],
                "speed": config["speed"],
                "size_mb": config["size_mb"]
            })
    
    return available

def get_model_info(model_name: str, model_type: str = "tts") -> dict:
    """Get detailed information about a model"""
    if model_type == "tts":
        models = BENGALI_TTS_MODELS
    elif model_type == "stt":
        models = BENGALI_STT_MODELS
    elif model_type == "llm":
        models = BENGALI_LLM_MODELS
    else:
        return {}
    
    if model_name not in models:
        return {}
    
    config = models[model_name].copy()
    config["downloaded"] = is_model_downloaded(model_name, model_type)
    return config 