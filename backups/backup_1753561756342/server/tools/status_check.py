import yaml
import requests
import os
from dotenv import load_dotenv
from tabulate import tabulate
from rich.console import Console

load_dotenv()
console = Console()

YAML_PATH = "ai/config/providers.yaml"

def load_config():
    with open(YAML_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def check_provider(name, cfg):
    url = cfg.get("base_url")
    enabled = cfg.get("enabled", True)
    api_key = cfg.get("api_key", None)
    status = "✅"
    reason = "OK"

    if not enabled:
        return ("❌", "Disabled")

    # .env value inject
    if isinstance(api_key, str) and api_key.startswith("${"):
        env_key = api_key[2:-1]
        api_key = os.getenv(env_key)

    try:
        if cfg["type"] == "api":
            headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
            response = requests.get(url, headers=headers, timeout=3)
            if response.status_code >= 400:
                status = "⚠️"
                reason = f"HTTP {response.status_code}"
        elif cfg["type"] == "local":
            response = requests.get(url, timeout=2)
            if response.status_code != 200:
                status = "⚠️"
                reason = "No 200 OK"
    except Exception as e:
        status = "❌"
        reason = str(e)

    return (status, reason)

def main():
    config = load_config()
    rows = []
    fallback = config.get("fallback_priority", [])
    default = config.get("default_provider")

    for name in config["providers"]:
        cfg = config["providers"][name]
        status, reason = check_provider(name, cfg)
        rows.append([name, cfg.get("model", ""), cfg.get("type"), cfg.get("enabled"), status, reason])

    console.print(f"\n[bold green]Fallback Priority:[/bold green] {', '.join(fallback)}")
    console.print(f"[bold cyan]Default Provider:[/bold cyan] {default}\n")
    print(tabulate(rows, headers=["Name", "Model", "Type", "Enabled", "Status", "Note"]))

if __name__ == "__main__":
    main() 