import os
import yaml
import importlib
from typing import Dict, Type
from .base_agent import BaseAgent
from .memory_system import MemoryManager

REGISTRY_YAML = os.path.join(os.path.dirname(__file__), 'registry.yaml')

class AgentRegistry:
    _agents: Dict[str, Type[BaseAgent]] = {}
    _memory = MemoryManager()

    @classmethod
    def load_agents_from_yaml(cls):
        agents_config = cls._load_registry_yaml().get('agents', [])
        for agent in agents_config:
            name = agent['name']
            config_path = agent['config']
            agent_class = cls._dynamic_import_agent(name, config_path)
            if agent_class:
                cls._agents[name] = agent_class

    @staticmethod
    def _load_registry_yaml():
        with open(REGISTRY_YAML, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)

    @staticmethod
    def _dynamic_import_agent(agent_name, config_path):
        parts = config_path.split('/')
        if len(parts) < 3:
            return None
        module_path = f"ai.agents.{parts[2]}"
        try:
            module = importlib.import_module(module_path)
            class_name = ''.join([w.capitalize() for w in agent_name.split('_')]) + 'Agent'
            agent_class = getattr(module, class_name)
            return agent_class
        except Exception:
            return None

    @classmethod
    def get_agent(cls, agent_name: str) -> BaseAgent:
        if not cls._agents:
            cls.load_agents_from_yaml()
        if agent_name not in cls._agents:
            raise ValueError(f"Agent {agent_name} not found")
        return cls._agents[agent_name]()

    @classmethod
    def handle_input(cls, user_input: str) -> str:
        """Route input to the correct agent, using memory and fallback logic."""
        # @him logic for girlfriend_gpt
        if user_input.strip().startswith("@him"):
            agent = cls.get_agent("girlfriend_gpt")
            return agent.process_message(user_input)
        # Try all agents for a match in memory
        for agent_name in cls._agents:
            if cls._memory.has(agent_name, user_input, is_agent=True):
                agent = cls.get_agent(agent_name)
                return agent.process_message(user_input)
        # If not found, try local model (not implemented here)
        # If not found, try fallback providers' memory
        fallback_providers = cls._get_fallback_providers()
        for provider in fallback_providers:
            if cls._memory.has(provider, user_input, is_agent=False):
                return cls._memory.get(provider, user_input, is_agent=False)
        # If still not found, return fallback message
        return "Sorry, I could not find an answer."

    @staticmethod
    def _get_fallback_providers():
        # This should return a list of fallback provider names, e.g. ["openai", "ollama"]
        # For demo, return a static list
        return ["openai", "ollama", "togetherai"]

    @classmethod
    def register_agent(cls, name: str, agent_class: Type[BaseAgent]):
        cls._agents[name] = agent_class

    @classmethod
    def list_agents(cls) -> Dict[str, str]:
        if not cls._agents:
            cls.load_agents_from_yaml()
        return {name: agent().config.get('description', '')
                for name, agent in cls._agents.items()}
