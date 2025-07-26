from ai.agents.base_agent import BaseAgent
import os

class InstructAgent(BaseAgent):
    def __init__(self):
        config_path = os.path.join(os.path.dirname(__file__), 'config.yaml')
        personality_path = os.path.join(os.path.dirname(__file__), 'personality.yaml')
        super().__init__('instruct', 'instruct', config_path=config_path, personality_path=personality_path)
    def process(self, input_text: str, **kwargs):
        # Minimal instruct logic for now
        return {
            'result': f"আপনার প্রশ্নের উত্তর: {input_text} (instruct এজেন্ট থেকে)",
            'agent': 'instruct'
        } 