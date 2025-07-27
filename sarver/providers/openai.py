import requests

def run(request):
    prompt = request.get('prompt', '')
    api_key = os.getenv('OPENAI_API_KEY')
    model = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
    base_url = os.getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1')
    if not api_key:
        return {'error': 'OPENAI_API_KEY not set'}
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
    try:
        response = requests.post(f'{base_url}/chat/completions', headers=headers, json=data, timeout=10)
        response.raise_for_status()
        # Decode response safely for Windows
        decoded = response.content.decode('utf-8', errors='replace')
        result = response.json() if decoded else {}
        return {'provider': 'openai', 'response': result}
    except Exception as e:
        return {'error': str(e)} 