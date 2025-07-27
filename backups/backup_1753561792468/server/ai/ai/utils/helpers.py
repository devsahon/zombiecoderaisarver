import yaml
import os

def load_yaml_config(agent_key):
    path = f"config/providers/{agent_key}.yaml"
    with open(path, "r") as f:
        return yaml.safe_load(f) 