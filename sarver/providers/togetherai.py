import os
import requests

def run(request):
    prompt = request.get('prompt', '')
    api_key = os.getenv('TOGETHER_API_KEY')
    model = os.getenv('TOGETHER_MODEL', 'mistralai/Mixtral-8x7B-Instruct-v0.1')
    base_url = os.getenv('TOGETHER_BASE_URL', 'https://api.together.xyz/v1')
    if not api_key:
        return {'error': 'TOGETHER_API_KEY not set'}
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    data = {
        'model': model,
        'messages': [
            {'role': 'user', 'content': prompt}
        ]
    }
    url = f'{base_url}/chat/completions'
    try:
        response = requests.post(url, headers=headers, json=data, timeout=10)
        if response.status_code == 404:
            return {'error': 'HTTP 404: Check TogetherAI endpoint or API key'}
        response.raise_for_status()
        decoded = response.content.decode('utf-8', errors='replace')
        result = response.json() if decoded else {}
        return {'provider': 'togetherai', 'response': result}
    except Exception as e:
        return {'error': str(e)} 