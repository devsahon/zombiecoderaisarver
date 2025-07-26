// admin_panel.js

document.addEventListener('DOMContentLoaded', function() {
  fetchAgents();
});

function fetchAgents() {
  fetch('/api/agents')
    .then(res => res.json())
    .then(data => {
      const agentDropdown = document.getElementById('agentDropdown');
      agentDropdown.innerHTML = '';
      data.agents.forEach(agent => {
        const option = document.createElement('option');
        option.value = agent.id;
        option.textContent = agent.name + ' (' + agent.type + ')';
        agentDropdown.appendChild(option);
      });
    });
}

function selectAgentFromDropdown() {
  const agentDropdown = document.getElementById('agentDropdown');
  const agentId = agentDropdown.value;
  fetch('/api/agents/select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent_id: agentId })
  })
    .then(res => res.json())
    .then(data => {
      const statusDiv = document.getElementById('agentStatus');
      if (data.success) {
        statusDiv.textContent = 'Agent selected: ' + data.selected_agent_id;
      } else {
        statusDiv.textContent = 'Error: ' + (data.error || 'Unknown error');
      }
    });
} 