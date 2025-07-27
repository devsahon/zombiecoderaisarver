import requests

LARAVEL_API_BASE = 'http://localhost:8000/api'

def get_project(project_id):
    r = requests.get(f'{LARAVEL_API_BASE}/projects/{project_id}')
    return r.json() if r.ok else None

def get_project_agents(project_id):
    r = requests.get(f'{LARAVEL_API_BASE}/project/{project_id}/agents')
    return r.json() if r.ok else []

def get_project_characters(project_id):
    r = requests.get(f'{LARAVEL_API_BASE}/project/{project_id}/characters')
    return r.json() if r.ok else [] 