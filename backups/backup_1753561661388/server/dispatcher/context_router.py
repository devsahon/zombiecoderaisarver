from dispatcher.project_loader import get_project, get_project_agents, get_project_characters

def route_agent(project_id, intent=None):
    project = get_project(project_id)
    agents = get_project_agents(project_id)
    characters = get_project_characters(project_id)
    # Minimal: pick default agent, first character
    agent = next((a for a in agents if a['id'] == project.get('default_agent_id')), agents[0] if agents else None)
    character = characters[0] if characters else None
    return {
        'project': project,
        'agent': agent,
        'character': character
    } 