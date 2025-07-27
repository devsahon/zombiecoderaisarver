import sys
import os
sys.path.append(os.path.abspath("ai/agents"))
from utils import load_agent_registry
from rich.console import Console
from rich.table import Table

def main():
    agents = load_agent_registry()
    console = Console()
    table = Table(title="Agent Registry", show_lines=True)
    table.add_column("Name", style="bold")
    table.add_column("Description")
    table.add_column("Voice Enabled")
    table.add_column("Config Path")
    table.add_column("Personality Path")
    for agent in agents:
        table.add_row(
            agent["name"],
            agent.get("description", ""),
            str(agent.get("voice_enabled", False)),
            agent.get("config", ""),
            agent.get("personality", "")
        )
    console.print(table)

if __name__ == "__main__":
    main() 