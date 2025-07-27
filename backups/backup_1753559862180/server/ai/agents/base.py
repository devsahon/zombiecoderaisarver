from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod
import json
import os
from pathlib import Path

class BaseAgent(ABC):
    def __init__(self, agent_id: str, name: str, agent_type: str):
        self.id = agent_id
        self.name = name
        self.type = agent_type
        self.status = "inactive"
        self.is_active = False
        self.supported_languages = ["bn", "en"]
        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        """Load agent configuration from file"""
        config_path = Path(__file__).parent / "configs" / f"{self.id}.json"
        if config_path.exists():
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def _save_config(self) -> None:
        """Save agent configuration to file"""
        config_path = Path(__file__).parent / "configs"
        config_path.mkdir(exist_ok=True)
        
        with open(config_path / f"{self.id}.json", "w", encoding="utf-8") as f:
            json.dump(self.config, f, ensure_ascii=False, indent=2)

    def configure(self, config: Dict[str, Any]) -> None:
        """Update agent configuration"""
        self.config.update(config)
        self._save_config()

    @abstractmethod
    def process(self, input_text: str, **kwargs) -> Dict[str, Any]:
        """Process input and return response"""
        pass

    def activate(self) -> None:
        """Activate the agent"""
        self.is_active = True
        self.status = "active"

    def deactivate(self) -> None:
        """Deactivate the agent"""
        self.is_active = False
        self.status = "inactive"

class AgentManager:
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self._load_agents()

    def _load_agents(self) -> None:
        """Load all available agents"""
        # This would normally scan a directory and load all agent classes
        pass

    def get_agent(self, agent_id: str) -> Optional[BaseAgent]:
        """Get an agent by ID"""
        return self.agents.get(agent_id)

    def get_all_agents(self) -> List[BaseAgent]:
        """Get all registered agents"""
        return list(self.agents.values())

    def register_agent(self, agent: BaseAgent) -> None:
        """Register a new agent"""
        self.agents[agent.id] = agent

    def configure_agent(self, agent_id: str, config: Dict[str, Any]) -> None:
        """Configure an agent"""
        agent = self.get_agent(agent_id)
        if agent:
            agent.configure(config)
        else:
            raise ValueError(f"Agent {agent_id} not found")

    def activate_agent(self, agent_id: str) -> None:
        """Activate an agent"""
        agent = self.get_agent(agent_id)
        if agent:
            agent.activate()
        else:
            raise ValueError(f"Agent {agent_id} not found")

    def deactivate_agent(self, agent_id: str) -> None:
        """Deactivate an agent"""
        agent = self.get_agent(agent_id)
        if agent:
            agent.deactivate()
        else:
            raise ValueError(f"Agent {agent_id} not found")
