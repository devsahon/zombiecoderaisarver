"""
MCP (Model Context Protocol) Dispatcher
Intelligent agent routing and fallback system
"""

import json
import logging
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import os
import sys

# Add agents directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agents'))

class MCPDispatcher:
    def __init__(self):
        self.agents = {}
        self.providers = {}
        self.fallback_chain = []
        self.logger = self._setup_logger()
        self.load_agents()
        self.load_providers()
        self.setup_fallback_chain()
        
    def _setup_logger(self):
        """Setup logging for dispatcher"""
        logger = logging.getLogger('mcp_dispatcher')
        logger.setLevel(logging.INFO)
        
        # Create logs directory if not exists
        os.makedirs('logs', exist_ok=True)
        
        handler = logging.FileHandler('logs/mcp_dispatcher.log')
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        return logger
    
    def load_agents(self):
        """Load all available agents"""
        try:
            # Load personal agent
            from personal_agent.logic import PersonalAgent
            self.agents['personal_agent'] = PersonalAgent()
            self.logger.info("✅ Personal Agent loaded")
            
            # Load other agents (placeholder for future agents)
            self.agents['system_diagnoser'] = {
                'name': 'System Diagnoser',
                'capabilities': ['system_diagnose', 'bug_fix', 'performance_analysis'],
                'personality': 'বাগ-সচেতন, প্রফেশনাল, যুক্তিপূর্ণ',
                'status': 'available'
            }
            
            self.agents['code_reviewer'] = {
                'name': 'Code Reviewer',
                'capabilities': ['code_review', 'optimization', 'security_check'],
                'personality': 'senior developer, strict but fair',
                'status': 'available'
            }
            
            self.agents['html_converter'] = {
                'name': 'HTML Converter',
                'capabilities': ['image_to_html', 'ui_design', 'frontend_development'],
                'personality': 'front-end master, নজরকাড়া',
                'status': 'available'
            }
            
            self.logger.info(f"✅ Loaded {len(self.agents)} agents")
            
        except Exception as e:
            self.logger.error(f"❌ Error loading agents: {e}")
    
    def load_providers(self):
        """Load AI providers"""
        try:
            # Local providers
            self.providers['ollama'] = {
                'name': 'Ollama',
                'type': 'local',
                'category': 'llm',
                'status': 'active',
                'models': ['llama2', 'mistral', 'codellama'],
                'fallback': 'openrouter'
            }
            
            # Cloud providers
            self.providers['openrouter'] = {
                'name': 'OpenRouter',
                'type': 'cloud',
                'category': 'llm',
                'status': 'active',
                'models': ['gpt-3.5-turbo', 'claude-3-sonnet'],
                'fallback': 'together_ai'
            }
            
            # Fallback providers
            self.providers['together_ai'] = {
                'name': 'TogetherAI',
                'type': 'fallback',
                'category': 'llm',
                'status': 'active',
                'models': ['llama-2-70b', 'mistral-7b'],
                'fallback': None
            }
            
            self.logger.info(f"✅ Loaded {len(self.providers)} providers")
            
        except Exception as e:
            self.logger.error(f"❌ Error loading providers: {e}")
    
    def setup_fallback_chain(self):
        """Setup fallback chain for providers"""
        self.fallback_chain = [
            'ollama',      # Primary local
            'openrouter',  # Primary cloud
            'together_ai', # Fallback
        ]
    
    def analyze_input(self, user_input: str) -> Dict[str, Any]:
        """Analyze user input to determine intent and requirements"""
        analysis = {
            'intent': 'general_conversation',
            'confidence': 0.5,
            'language': 'bn',
            'complexity': 'medium',
            'required_capabilities': [],
            'suggested_agents': [],
            'suggested_providers': []
        }
        
        # Bengali keywords for intent detection
        bengali_keywords = {
            'system_diagnose': ['সমস্যা', 'বাগ', 'ফিক্স', 'সিস্টেম', 'চেক'],
            'code_review': ['কোড', 'রিভিউ', 'চেক', 'অপটিমাইজ', 'সিকিউরিটি'],
            'image_to_html': ['ছবি', 'এইচটিএমএল', 'ইউআই', 'ডিজাইন', 'কনভার্ট'],
            'project_suggestion': ['প্রজেক্ট', 'পরামর্শ', 'আইডিয়া', 'প্ল্যান'],
            'database_analyze': ['ডাটাবেজ', 'অ্যানালাইসিস', 'কুয়েরি', 'অপটিমাইজ'],
            'provider_manage': ['প্রোভাইডার', 'মডেল', 'সেটিংস', 'কনফিগ']
        }
        
        # Detect language
        if any(char in user_input for char in ['অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ']):
            analysis['language'] = 'bn'
        else:
            analysis['language'] = 'en'
        
        # Detect intent
        for intent, keywords in bengali_keywords.items():
            if any(keyword in user_input for keyword in keywords):
                analysis['intent'] = intent
                analysis['confidence'] = 0.8
                break
        
        # Determine required capabilities
        if analysis['intent'] == 'system_diagnose':
            analysis['required_capabilities'] = ['system_analysis', 'bug_detection']
            analysis['suggested_agents'] = ['system_diagnoser', 'personal_agent']
        elif analysis['intent'] == 'code_review':
            analysis['required_capabilities'] = ['code_analysis', 'optimization']
            analysis['suggested_agents'] = ['code_reviewer', 'personal_agent']
        elif analysis['intent'] == 'image_to_html':
            analysis['required_capabilities'] = ['image_processing', 'html_generation']
            analysis['suggested_agents'] = ['html_converter', 'personal_agent']
        else:
            analysis['suggested_agents'] = ['personal_agent']
        
        # Suggest providers based on capabilities
        for capability in analysis['required_capabilities']:
            if 'image' in capability:
                analysis['suggested_providers'].extend(['stable_diffusion', 'dalle'])
            elif 'code' in capability or 'analysis' in capability:
                analysis['suggested_providers'].extend(['ollama', 'openrouter'])
            else:
                analysis['suggested_providers'].extend(['ollama', 'openrouter'])
        
        return analysis
    
    def select_agent(self, analysis: Dict[str, Any]) -> Optional[str]:
        """Select the best agent for the task"""
        suggested_agents = analysis.get('suggested_agents', [])
        
        for agent_name in suggested_agents:
            if agent_name in self.agents:
                agent = self.agents[agent_name]
                if isinstance(agent, dict):
                    if agent.get('status') == 'available':
                        return agent_name
                else:
                    # Personal agent object
                    return agent_name
        
        # Fallback to personal agent
        if 'personal_agent' in self.agents:
            return 'personal_agent'
        
        return None
    
    def select_provider(self, analysis: Dict[str, Any]) -> Optional[str]:
        """Select the best provider with fallback"""
        suggested_providers = analysis.get('suggested_providers', [])
        
        # Try suggested providers first
        for provider_name in suggested_providers:
            if provider_name in self.providers:
                provider = self.providers[provider_name]
                if provider.get('status') == 'active':
                    return provider_name
        
        # Try fallback chain
        for provider_name in self.fallback_chain:
            if provider_name in self.providers:
                provider = self.providers[provider_name]
                if provider.get('status') == 'active':
                    return provider_name
        
        return None
    
    async def dispatch_request(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Main dispatch method"""
        try:
            # Analyze input
            analysis = self.analyze_input(user_input)
            
            # Select agent and provider
            selected_agent = self.select_agent(analysis)
            selected_provider = self.select_provider(analysis)
            
            if not selected_agent:
                return {
                    'success': False,
                    'error': 'No suitable agent available',
                    'message': 'সব এজেন্ট বর্তমানে অপ্রাপ্য'
                }
            
            # Execute with selected agent
            if selected_agent == 'personal_agent':
                agent = self.agents[selected_agent]
                result = agent.handle_request(user_input)
            else:
                # For other agents, use placeholder response
                result = {
                    'action': analysis['intent'],
                    'message': f'এজেন্ট {selected_agent} দ্বারা প্রক্রিয়াকৃত',
                    'provider': selected_provider,
                    'confidence': analysis['confidence']
                }
            
            # Log dispatch
            self.log_dispatch(user_input, selected_agent, selected_provider, analysis)
            
            return {
                'success': True,
                'data': result,
                'dispatch_info': {
                    'agent': selected_agent,
                    'provider': selected_provider,
                    'analysis': analysis,
                    'timestamp': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            self.logger.error(f"❌ Dispatch error: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'ডিসপ্যাচে সমস্যা হয়েছে'
            }
    
    def log_dispatch(self, user_input: str, agent: str, provider: str, analysis: Dict[str, Any]):
        """Log dispatch information"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'user_input': user_input[:100] + '...' if len(user_input) > 100 else user_input,
            'selected_agent': agent,
            'selected_provider': provider,
            'intent': analysis.get('intent'),
            'confidence': analysis.get('confidence'),
            'language': analysis.get('language')
        }
        
        self.logger.info(f"📤 Dispatch: {json.dumps(log_entry, ensure_ascii=False)}")
    
    def get_status(self) -> Dict[str, Any]:
        """Get dispatcher status"""
        return {
            'agents_loaded': len(self.agents),
            'providers_loaded': len(self.providers),
            'fallback_chain': self.fallback_chain,
            'status': 'active',
            'timestamp': datetime.now().isoformat()
        }

# Global dispatcher instance
dispatcher = MCPDispatcher()

# Export for use in other modules
__all__ = ['MCPDispatcher', 'dispatcher'] 