import os
import json
import yaml
from datetime import datetime
from typing import Dict, List, Optional

class FallbackRouter:
    def __init__(self):
        self.config = self._load_config()
        self.provider_status = {}
        self.fallback_history = []
        self.max_retries = self.config.get('max_retries', 3)
        
    def _load_config(self) -> Dict:
        """Load fallback configuration"""
        config_path = os.path.join(
            os.path.dirname(__file__), 
            '../ai/server/config/providers/config.yaml'
        )
        with open(config_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
            
    def get_next_provider(self, current_provider: str) -> Optional[str]:
        """Get next available provider in fallback chain"""
        providers = self.config['providers']
        priority_list = sorted(
            providers.items(),
            key=lambda x: x[1].get('fallback_priority', 999)
        )
        
        # Find current provider's index
        current_index = -1
        for i, (provider, _) in enumerate(priority_list):
            if provider == current_provider:
                current_index = i
                break
                
        # Try next providers in priority order
        for provider, config in priority_list[current_index + 1:]:
            if config.get('status') == 'active' and self._check_provider_health(provider):
                return provider
                
        return None
        
    def _check_provider_health(self, provider: str) -> bool:
        """Check if a provider is healthy"""
        return self.provider_status.get(provider, {}).get('health', False)
        
    def update_provider_status(self, provider: str, status: Dict):
        """Update provider status"""
        self.provider_status[provider] = {
            'health': status.get('health', False),
            'last_check': datetime.now().isoformat(),
            'latency': status.get('latency_ms')
        }
        
    def handle_failure(self, failed_provider: str, error: str) -> Dict:
        """Handle provider failure and return fallback info"""
        # Log failure
        self.fallback_history.append({
            'timestamp': datetime.now().isoformat(),
            'provider': failed_provider,
            'error': error
        })
        
        # Get next provider
        next_provider = self.get_next_provider(failed_provider)
        if not next_provider:
            return {
                'success': False,
                'error': 'No fallback providers available',
                'retries_left': 0
            }
            
        return {
            'success': True,
            'next_provider': next_provider,
            'retries_left': self.max_retries - 1
        }
        
    def get_fallback_history(self) -> List[Dict]:
        """Get fallback history"""
        return self.fallback_history
        
    def get_provider_metrics(self) -> Dict:
        """Get provider performance metrics"""
        return {
            provider: {
                'status': self.provider_status.get(provider, {}),
                'fallbacks': len([
                    f for f in self.fallback_history 
                    if f['provider'] == provider
                ])
            }
            for provider in self.config['providers']
        }

# Global fallback router instance
fallback_router = FallbackRouter()

def get_fallback_model(config: Dict) -> str:
    """Get fallback model based on config"""
    return config.get('fallback_model', 'gpt-3.5-turbo')