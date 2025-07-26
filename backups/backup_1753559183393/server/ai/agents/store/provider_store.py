from typing import Dict, Any, Optional
from datetime import datetime
import json
import os
import threading
from pathlib import Path

class ProviderStore:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ProviderStore, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance
            
    def __init__(self):
        if self._initialized:
            return
            
        self._initialized = True
        self.store_path = Path(__file__).parent / "storage" / "providers"
        self.store_path.mkdir(parents=True, exist_ok=True)
        self.providers = {}
        self.cache = {}
        self.ttl = 3600  # 1 hour cache TTL
        
    def get_provider_store(self, provider_id: str) -> Dict:
        """Get provider store with lazy loading"""
        if provider_id in self.cache:
            cached_data = self.cache[provider_id]
            if (datetime.now() - cached_data['timestamp']).seconds < self.ttl:
                return cached_data['data']
                
        store_file = self.store_path / f"{provider_id}.json"
        if store_file.exists():
            with store_file.open('r', encoding='utf-8') as f:
                data = json.load(f)
                self.cache[provider_id] = {
                    'data': data,
                    'timestamp': datetime.now()
                }
                return data
        return {}
        
    def update_provider_store(self, provider_id: str, data: Dict) -> None:
        """Update provider store"""
        store_file = self.store_path / f"{provider_id}.json"
        
        # Merge with existing data if any
        existing_data = {}
        if store_file.exists():
            with store_file.open('r', encoding='utf-8') as f:
                existing_data = json.load(f)
                
        # Deep merge
        updated_data = self._deep_merge(existing_data, data)
        
        # Save to file
        with store_file.open('w', encoding='utf-8') as f:
            json.dump(updated_data, f, indent=2, ensure_ascii=False)
            
        # Update cache
        self.cache[provider_id] = {
            'data': updated_data,
            'timestamp': datetime.now()
        }
        
    def _deep_merge(self, dict1: Dict, dict2: Dict) -> Dict:
        """Recursively merge two dictionaries"""
        result = dict1.copy()
        for key, value in dict2.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._deep_merge(result[key], value)
            else:
                result[key] = value
        return result
        
    def clear_cache(self, provider_id: Optional[str] = None) -> None:
        """Clear cache for specific provider or all providers"""
        if provider_id:
            self.cache.pop(provider_id, None)
        else:
            self.cache.clear()
            
    def get_all_providers(self) -> Dict[str, Dict]:
        """Get all provider stores"""
        providers = {}
        for file in self.store_path.glob("*.json"):
            provider_id = file.stem
            providers[provider_id] = self.get_provider_store(provider_id)
        return providers

    def clear_memory(self, provider_id: str) -> None:
        """Clear both cache and persistent memory for a specific provider"""
        self.clear_cache(provider_id)
        store_file = self.store_path / f"{provider_id}.json"
        if store_file.exists():
            store_file.unlink()

    def clear_all_memory(self) -> None:
        """Clear all providers' memory (cache and files)"""
        self.clear_cache()
        for file in self.store_path.glob("*.json"):
            file.unlink()
