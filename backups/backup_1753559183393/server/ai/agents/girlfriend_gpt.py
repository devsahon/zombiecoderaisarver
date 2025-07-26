from ai.agents.base_agent import BaseAgent

class GirlfriendGPTAgent(BaseAgent):
    def __init__(self):
        super().__init__('girlfriend_gpt', 'relationship')
    def process(self, input_text: str, **kwargs):
        # If local logic can answer, use it; else fallback
        if 'ভালোবাসি' in input_text or 'miss' in input_text:
            return {'result': 'আমি তো সবসময় তোমার পাশে আছি! 😊', 'agent': 'girlfriend_gpt'}
        # fallback: generic friendly answer
        return {'result': f'তুমি যা বলো, সবকিছুই আমার কাছে স্পেশাল! {input_text}', 'agent': 'girlfriend_gpt'} 