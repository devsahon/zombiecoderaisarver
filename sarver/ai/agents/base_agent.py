import os
import yaml
from typing import Dict, List, Optional
from .memory_system import MemoryManager

class BaseAgent:
    def __init__(self, name: str, category: str, config_path: str = None, personality_path: str = None):
        self.name = name
        self.category = category
        self.config = self._load_config(config_path)
        self.personality = self._load_personality(personality_path)
        self.memory = MemoryManager()
        
    def _load_config(self, config_path: str = None) -> Dict:
        if config_path is not None:
            if os.path.exists(config_path):
                with open(config_path, 'r', encoding='utf-8') as f:
                    return yaml.safe_load(f)
            else:
                return {}
        config_path = os.path.join(
            os.path.dirname(__file__),
            f"config/{self.category}/{self.name}.yaml"
        )
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        return {}
            
    def _load_personality(self, personality_path: str = None) -> Dict:
        if personality_path is not None:
            if os.path.exists(personality_path):
                with open(personality_path, 'r', encoding='utf-8') as f:
                    return yaml.safe_load(f)
            else:
                return {}
        personality_path = os.path.join(
            os.path.dirname(__file__),
            f"personalities/{self.category}/{self.name}.yaml"
        )
        if os.path.exists(personality_path):
            with open(personality_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        return {}
            
    def is_admin_command(self, message: str) -> bool:
        """Check if message starts with admin prefix"""
        master_config = self._load_master_config()
        return message.startswith(master_config['admin_prefix'])
        
    def _load_master_config(self) -> Dict:
        config_path = os.path.join(
            os.path.dirname(__file__),
            "config/master_config.yaml"
        )
        with open(config_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
            
    def process_message(self, message: str, user_role: str = "user") -> str:
        """Process incoming message and return response, using memory and fallback if needed."""
        if self.is_admin_command(message) and user_role not in self._load_master_config()['admin_roles']:
            return "Sorry, this command is only available for administrators."
        # Remove admin prefix if present
        if self.is_admin_command(message):
            message = message[len(self._load_master_config()['admin_prefix']):].strip()
        # Memory check
        memory_answer = self.memory.get(self.name, message, is_agent=True)
        if memory_answer:
            return memory_answer
        # Generate response
        response = self._generate_response(message)
        # Store in memory
        self.memory.set(self.name, message, response, is_agent=True)
        return response

    def get_personality(self) -> Dict:
        """Return the agent's personality dictionary."""
        return self.personality

    def _generate_response(self, message: str) -> str:
        """Override this method in specific agent implementations"""
        raise NotImplementedError
