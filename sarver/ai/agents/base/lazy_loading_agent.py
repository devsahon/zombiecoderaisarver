from typing import Dict, Any, Optional
from datetime import datetime
from ..store.provider_store import ProviderStore
from ..memory_system import MemorySystem

class LazyLoadingBaseAgent:
    def __init__(self, name: str, provider_id: str):
        self.name = name
        self.provider_id = provider_id
        self.store = ProviderStore()
        self.memory_system = MemorySystem(name)
        self._cache = {}
        self._last_loaded = None
        
    def _get_store_data(self) -> Dict:
        """Get provider store data with lazy loading"""
        current_time = datetime.now()
        
        # Check if cache is valid (5 minutes TTL)
        if self._last_loaded and (current_time - self._last_loaded).seconds < 300:
            return self._cache
            
        # Load from provider store
        data = self.store.get_provider_store(self.provider_id)
        self._cache = data
        self._last_loaded = current_time
        return data
        
    def _update_store(self, data: Dict) -> None:
        """Update provider store"""
        self.store.update_provider_store(self.provider_id, data)
        self._cache = data
        self._last_loaded = datetime.now()
        
    def process(self, input_text: str, **kwargs) -> Dict:
        """Process input with lazy loading"""
        # Check memory system first
        memory_response = self._check_memory(input_text, kwargs)
        if memory_response:
            return memory_response
            
        # Get store data
        store_data = self._get_store_data()
        
        # Check if we have cached response
        cached_response = self._check_cache(input_text, store_data, kwargs)
        if cached_response:
            return cached_response
            
        # Generate new response
        response = self._generate_response(input_text, store_data, kwargs)
        
        # Save to memory and store
        self._save_response(input_text, response, kwargs)
        
        return response
        
    def _check_memory(self, input_text: str, context: Dict) -> Optional[Dict]:
        """Check if we have a similar query in memory"""
        recent = self.memory_system.get_recent_conversations(5)
        for conv in recent:
            if self._is_similar_query(input_text, conv["user_input"]):
                return conv["agent_response"]
        return None
        
    def _check_cache(self, input_text: str, store_data: Dict, context: Dict) -> Optional[Dict]:
        """Check if we have cached response for similar input"""
        cache = store_data.get("response_cache", {})
        for cached_input, response in cache.items():
            if self._is_similar_query(input_text, cached_input):
                return response
        return None
        
    def _generate_response(self, input_text: str, store_data: Dict, context: Dict) -> Dict:
        """Generate new response - to be implemented by specific agents"""
        raise NotImplementedError
        
    def _save_response(self, input_text: str, response: Dict, context: Dict) -> None:
        """Save response to memory and store"""
        # Save to memory system
        self.memory_system.add_conversation(
            user_input=input_text,
            agent_response=response,
            context=context
        )
        
        # Update store cache
        store_data = self._get_store_data()
        if "response_cache" not in store_data:
            store_data["response_cache"] = {}
            
        store_data["response_cache"][input_text] = response
        
        # Limit cache size to 100 entries
        if len(store_data["response_cache"]) > 100:
            # Remove oldest entries
            cache = store_data["response_cache"]
            oldest_keys = sorted(cache.keys())[:len(cache)-100]
            for key in oldest_keys:
                del cache[key]
                
        self._update_store(store_data)
        
    def _is_similar_query(self, query1: str, query2: str) -> bool:
        """Check if two queries are similar - can be enhanced with better similarity logic"""
        # Simple similarity check - can be improved with more sophisticated methods
        return (
            query1.lower().strip() == query2.lower().strip() or
            self._calculate_similarity(query1, query2) > 0.8
        )
        
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts"""
        # Simple word overlap similarity - can be improved
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        if not union:
            return 0.0
            
        return len(intersection) / len(union)
