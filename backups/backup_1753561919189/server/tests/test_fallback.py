import unittest
from core.fallback_router import FallbackRouter, fallback_router
import json

class TestFallbackRouter(unittest.TestCase):
    def setUp(self):
        self.router = FallbackRouter()
        
    def test_provider_priority(self):
        """Test provider priority ordering"""
        current_provider = "openai"
        next_provider = self.router.get_next_provider(current_provider)
        self.assertIsNotNone(next_provider)
        
    def test_provider_status_update(self):
        """Test provider status updates"""
        status = {
            'health': True,
            'latency_ms': 150
        }
        self.router.update_provider_status('openai', status)
        metrics = self.router.get_provider_metrics()
        self.assertIn('openai', metrics)
        self.assertTrue(metrics['openai']['status']['health'])
        
    def test_failure_handling(self):
        """Test failure handling"""
        result = self.router.handle_failure(
            'openai',
            'API timeout'
        )
        self.assertIn('success', result)
        
        if result['success']:
            self.assertIn('next_provider', result)
            self.assertIn('retries_left', result)
        else:
            self.assertIn('error', result)
            
    def test_fallback_history(self):
        """Test fallback history tracking"""
        # Simulate some failures
        self.router.handle_failure('openai', 'API timeout')
        self.router.handle_failure('huggingface', 'Connection error')
        
        history = self.router.get_fallback_history()
        self.assertGreaterEqual(len(history), 2)
        self.assertEqual(history[-1]['provider'], 'huggingface')
        
if __name__ == '__main__':
    unittest.main(verbosity=2)
