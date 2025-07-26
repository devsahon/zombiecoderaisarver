import os
import json

def detect_installed_models():
    models = []
    if os.path.exists("/usr/bin/ollama") or os.path.exists("C:\\Program Files\\Ollama\\ollama.exe"):
        models.append("ollama")
    if os.path.exists("/usr/bin/llama.cpp"):
        models.append("llama.cpp")
    if os.path.exists("/usr/bin/deepseek") or os.path.exists("deepseek/"):
        models.append("deepseek-local")
    return models

if __name__ == "__main__":
    print(json.dumps(detect_installed_models())) 