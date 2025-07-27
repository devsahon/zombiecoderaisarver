<template>
  <select v-model="selected" @change="emitAgent">
    <option v-for="agent in agents" :key="agent" :value="agent">
      {{ agent }}
    </option>
  </select>
</template>

<script>
export default {
  name: 'AgentDropdown',
  data() {
    return {
      agents: ['Zombie'],
      selected: 'Zombie',
    };
  },
  methods: {
    emitAgent() {
      this.$emit('update:agent', this.selected);
    },
  },
  mounted() {
    this.emitAgent();
  },
};
</script> 