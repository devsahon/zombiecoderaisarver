import threading
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Any
from .registry import AgentRegistry

class AgentExecutor:
    def __init__(self, max_workers: int = 5):
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.active_tasks: Dict[str, Any] = {}
        self._lock = threading.Lock()
        
    def run_agent(self, agent_name: str, message: str, user_role: str = "user") -> str:
        """Run an agent in a separate thread"""
        agent = AgentRegistry.get_agent(agent_name)
        future = self.executor.submit(agent.process_message, message, user_role)
        
        with self._lock:
            task_id = str(threading.get_ident())
            self.active_tasks[task_id] = future
            
        try:
            result = future.result(timeout=30)  # 30 second timeout
            return result
        finally:
            with self._lock:
                self.active_tasks.pop(task_id, None)
                
    def run_multiple_agents(self, 
                          tasks: List[Dict[str, str]], 
                          user_role: str = "user") -> Dict[str, str]:
        """Run multiple agents in parallel"""
        futures = {}
        results = {}
        
        for task in tasks:
            agent_name = task['agent']
            message = task['message']
            agent = AgentRegistry.get_agent(agent_name)
            future = self.executor.submit(agent.process_message, message, user_role)
            futures[agent_name] = future
            
        # Wait for all tasks to complete
        for agent_name, future in futures.items():
            try:
                results[agent_name] = future.result(timeout=30)
            except Exception as e:
                results[agent_name] = f"Error: {str(e)}"
                
        return results
        
    def cancel_all_tasks(self):
        """Cancel all running tasks"""
        with self._lock:
            for future in self.active_tasks.values():
                future.cancel()
            self.active_tasks.clear()
