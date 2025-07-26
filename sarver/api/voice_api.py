from flask import Blueprint, request, jsonify, send_file, Response, stream_with_context
import io
from ai.voice.voice_handler import voice_handler
from ai.voice.voice_streamer import stream_speech
from ai.voice.coqui_local import local_tts

voice_bp = Blueprint('voice', __name__)

@voice_bp.route('/generate', methods=['POST'])
def generate_speech():
    """Generate speech from text"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
            
        text = data['text']
        voice_id = data.get('voice', 'google_tts')
        speed = float(data.get('speed', 1.0))
        pitch = float(data.get('pitch', 1.0))
        
        # Use local Coqui TTS if selected
        if voice_id.startswith('coqui_'):
            audio_data = local_tts.generate_speech(text, voice_id.replace('coqui_', ''))
        else:
            audio_data = voice_handler.generate_speech(text, voice_id)
            
        return send_file(
            io.BytesIO(audio_data),
            mimetype='audio/mp3',
            as_attachment=True,
            download_name='generated_speech.mp3'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@voice_bp.route('/stream', methods=['POST'])
def stream_speech_endpoint():
    """Stream speech generation"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
            
        text = data['text']
        voice_id = data.get('voice', 'google_tts')
        
        def generate():
            for chunk in stream_speech(text, voice_id):
                yield chunk
                
        return Response(
            stream_with_context(generate()),
            mimetype='audio/mp3'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@voice_bp.route('/voices', methods=['GET'])
def list_voices():
    """List available voices"""
    voices = {
        'local': [
            {'id': 'coqui_bn_female', 'name': 'Bangla Female (Local)', 'type': 'local'},
            {'id': 'coqui_bn_male', 'name': 'Bangla Male (Local)', 'type': 'local'}
        ],
        'cloud': [
            {'id': 'google_tts', 'name': 'Google TTS', 'type': 'cloud'},
            {'id': 'eleven_bn_female', 'name': 'ElevenLabs Female', 'type': 'cloud'},
            {'id': 'eleven_bn_male', 'name': 'ElevenLabs Male', 'type': 'cloud'}
        ]
    }
    return jsonify(voices) 