import os
import json
from typing import Optional, Any

class MemoryManager:
    def __init__(self, base_dir: str = 'storage'):
        self.agent_memory_dir = os.path.join(base_dir, 'agents_memory')
        self.fallback_memory_dir = os.path.join(base_dir, 'fallback_memory')
        os.makedirs(self.agent_memory_dir, exist_ok=True)
        os.makedirs(self.fallback_memory_dir, exist_ok=True)

    def _get_memory_path(self, name: str, is_agent: bool = True) -> str:
        directory = self.agent_memory_dir if is_agent else self.fallback_memory_dir
        return os.path.join(directory, f'{name}_memory.json')

    def get(self, name: str, user_input: str, is_agent: bool = True) -> Optional[Any]:
        """Retrieve answer from memory for a given agent/provider and user input."""
        path = self._get_memory_path(name, is_agent)
        if not os.path.exists(path):
            return None
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data.get(user_input)

    def set(self, name: str, user_input: str, answer: Any, is_agent: bool = True):
        """Store answer in memory for a given agent/provider and user input."""
        path = self._get_memory_path(name, is_agent)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = {}
        data[user_input] = answer
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def has(self, name: str, user_input: str, is_agent: bool = True) -> bool:
        """Check if memory has an answer for a given agent/provider and user input."""
        path = self._get_memory_path(name, is_agent)
        if not os.path.exists(path):
            return False
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return user_input in data

    def get_all(self, name: str, is_agent: bool = True) -> dict:
        """Get all memory for a given agent/provider."""
        path = self._get_memory_path(name, is_agent)
        if not os.path.exists(path):
            return {}
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
