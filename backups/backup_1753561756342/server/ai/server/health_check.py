import requests
import yaml
import os
from datetime import datetime

class HealthChecker:
    def __init__(self):
        self.config_path = '../config/providers/config.yaml'
        self.load_config()
        
    def load_config(self):
        with open(self.config_path, 'r') as f:
            self.config = yaml.safe_load(f)
            
    def check_huggingface(self):
        try:
            headers = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY')}"}
            response = requests.get(
                "https://api-inference.huggingface.co/status",
                headers=headers
            )
            return response.status_code == 200
        except:
            return False
            
    def check_openai(self):
        try:
            headers = {"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"}
            response = requests.get(
                "https://api.openai.com/v1/models",
                headers=headers
            )
            return response.status_code == 200
        except:
            return False
            
    def check_together(self):
        try:
            headers = {"Authorization": f"Bearer {os.getenv('TOGETHER_API_KEY')}"}
            response = requests.get(
                "https://api.together.xyz/models",
                headers=headers
            )
            return response.status_code == 200
        except:
            return False
            
    def check_ollama(self):
        try:
            response = requests.get("http://localhost:11434/api/tags")
            return response.status_code == 200
        except:
            return False
            
    def check_lmstudio(self):
        try:
            response = requests.get("http://localhost:1234/v1/models")
            return response.status_code == 200
        except:
            return False
            
    def check_all(self):
        status = {
            "timestamp": datetime.now().isoformat(),
            "providers": {
                "huggingface": {
                    "health": "healthy" if self.check_huggingface() else "unhealthy",
                    "status": self.config["providers"]["huggingface"]["status"]
                },
                "openai": {
                    "health": "healthy" if self.check_openai() else "unhealthy",
                    "status": self.config["providers"]["openai"]["status"]
                },
                "together": {
                    "health": "healthy" if self.check_together() else "unhealthy",
                    "status": self.config["providers"]["together"]["status"]
                },
                "ollama": {
                    "health": "healthy" if self.check_ollama() else "offline",
                    "status": self.config["providers"]["ollama"]["status"]
                },
                "lmstudio": {
                    "health": "healthy" if self.check_lmstudio() else "offline",
                    "status": self.config["providers"]["lmstudio"]["status"]
                }
            }
        }
        return status

# Health checker instance
health_checker = HealthChecker()

if __name__ == "__main__":
    status = health_checker.check_all()
    print(status)
