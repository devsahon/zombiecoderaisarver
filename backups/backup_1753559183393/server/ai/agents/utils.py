import yaml
import os

def load_agent_config(agent_name):
    path = f"ai/agents/{agent_name}/config.yaml"
    if not os.path.exists(path):
        raise FileNotFoundError(f"Agent config not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def load_agent_registry():
    path = "ai/agents/registry.yaml"
    if not os.path.exists(path):
        raise FileNotFoundError(f"Agent registry not found: {path}")
    import yaml
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)["agents"]

def load_personality(agent_name):
    path = f"ai/agents/{agent_name}/personality.yaml"
    if not os.path.exists(path):
        raise FileNotFoundError(f"Personality file missing: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def generate_prompt(agent_name, user_input, context=""):
    personality = load_personality(agent_name)
    template = personality.get("prompt_template", "")
    prompt = template.format(context=context.strip(), user_input=user_input.strip())
    return prompt
