<template>
  <div style="max-width: 400px; margin: 2rem auto; padding: 2rem; border: 1px solid #eee; border-radius: 8px;">
    <h2>Test Agent</h2>
    <AgentDropdown v-model:agent="agent" />
    <input v-model="prompt" placeholder="Enter prompt..." style="width: 100%; margin: 1rem 0; padding: 0.5rem;" />
    <button @click="runTest" :disabled="loading" style="width: 100%; padding: 0.5rem;">{{ loading ? 'Running...' : 'Run Test' }}</button>
    <div v-if="response" style="margin-top: 1rem; background: #f9f9f9; padding: 1rem; border-radius: 4px;">
      <strong>Response:</strong>
      <pre>{{ response }}</pre>
    </div>
    <div v-if="error" style="color: red; margin-top: 1rem;">{{ error }}</div>
  </div>
</template>

<script>
import AgentDropdown from '../components/AgentDropdown.vue';

export default {
  name: 'TestAgent',
  components: { AgentDropdown },
  data() {
    return {
      agent: 'Zombie',
      prompt: '',
      response: '',
      error: '',
      loading: false,
    };
  },
  methods: {
    async runTest() {
      this.loading = true;
      this.response = '';
      this.error = '';
      try {
        // Minimal: assumes backend API at /api/agent/run
        const res = await fetch('/api/agent/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent: this.agent, prompt: this.prompt }),
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        this.response = JSON.stringify(data, null, 2);
      } catch (e) {
        this.error = e.message || 'Unknown error';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script> 