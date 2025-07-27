import os
import torch
from TTS.utils.synthesizer import Synthesizer
from typing import Optional, Dict, Any

class LocalCoquiTTS:
    def __init__(self):
        self.models = {}
        self.synthesizers = {}
        self.model_path = os.path.join(os.path.dirname(__file__), 'models')
        os.makedirs(self.model_path, exist_ok=True)
        
    def load_model(self, model_name: str) -> None:
        """Load a Coqui TTS model"""
        if model_name not in self.models:
            model_path = os.path.join(self.model_path, model_name)
            config_path = os.path.join(model_path, 'config.json')
            
            if not os.path.exists(model_path):
                raise ValueError(f"Model {model_name} not found in {model_path}")
                
            synthesizer = Synthesizer(
                tts_checkpoint=os.path.join(model_path, 'model.pth'),
                tts_config_path=config_path,
                vocoder_checkpoint=os.path.join(model_path, 'vocoder.pth'),
                vocoder_config=os.path.join(model_path, 'vocoder_config.json'),
                use_cuda=torch.cuda.is_available()
            )
            
            self.synthesizers[model_name] = synthesizer
            self.models[model_name] = True
            
    def generate_speech(self, text: str, model_name: str = 'bn_female') -> bytes:
        """Generate speech using local Coqui TTS model"""
        if model_name not in self.models:
            self.load_model(model_name)
            
        synthesizer = self.synthesizers[model_name]
        wavs = synthesizer.tts(text)
        
        # Convert to MP3 bytes
        import io
        import soundfile as sf
        
        wav_io = io.BytesIO()
        sf.write(wav_io, wavs, synthesizer.tts_config.audio.sample_rate, format='WAV')
        wav_io.seek(0)
        
        # Convert WAV to MP3
        from pydub import AudioSegment
        audio = AudioSegment.from_wav(wav_io)
        mp3_io = io.BytesIO()
        audio.export(mp3_io, format='mp3')
        return mp3_io.getvalue()
        
    def download_model(self, model_name: str) -> None:
        """Download a Coqui TTS model (to be implemented)"""
        # TODO: Implement model downloading from Coqui TTS hub
        pass

# Global instance
local_tts = LocalCoquiTTS() 