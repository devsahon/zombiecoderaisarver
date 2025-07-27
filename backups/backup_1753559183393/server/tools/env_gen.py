import yaml
import re
import os

YAML_PATH = "ai/config/providers.yaml"
ENV_EXAMPLE = ".env.example"
ENV_FILE = ".env"

def extract_env_keys():
    with open(YAML_PATH, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    env_keys = set()

    for provider in config.get("providers", {}).values():
        for val in provider.values():
            if isinstance(val, str):
                match = re.match(r"\$\{(.+?)\}", val)
                if match:
                    env_keys.add(match.group(1))
    return sorted(env_keys)

def write_env_file(path, keys):
    with open(path, "w", encoding="utf-8") as f:
        for key in keys:
            f.write(f"{key}=\n")
    print(f"✅ Generated: {path}")

if __name__ == "__main__":
    keys = extract_env_keys()
    write_env_file(ENV_EXAMPLE, keys)

    choice = input("Generate empty .env file too? (y/n): ")
    if choice.lower() == 'y':
        write_env_file(ENV_FILE, keys) 