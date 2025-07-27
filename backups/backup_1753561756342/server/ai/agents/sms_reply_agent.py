from ai.agents.base_agent import BaseAgent
import os
import yaml

class SMSReplyAgent(BaseAgent):
    def __init__(self):
        config_path = os.path.join(os.path.dirname(__file__), 'config.yaml')
        personality_path = os.path.join(os.path.dirname(__file__), 'personality.yaml')
        super().__init__('sms_reply', 'communication', config_path=config_path, personality_path=personality_path)
    def process(self, input_text: str, **kwargs):
        # Local logic for common SMS replies
        if 'otp' in input_text.lower():
            return {'result': 'Your OTP is 123456. Please do not share it with anyone.', 'agent': 'sms_reply'}
        if 'balance' in input_text.lower():
            return {'result': 'Your current balance is 500 BDT.', 'agent': 'sms_reply'}
        # fallback: generic smart answer
        return {'result': f'SMS reply: {input_text}', 'agent': 'sms_reply'} 