<template>
  <div class="doc-player">
    <h2>Doc Player</h2>
    <select v-model="selectedDoc">
      <option v-for="doc in docs" :key="doc" :value="doc">{{ doc }}</option>
    </select>
    <div class="controls">
      <button @click="play">Play</button>
      <button @click="pause">Pause</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const docs = ref(['README.md', 'status_and_next_steps.md', 'demo_script.md']);
const selectedDoc = ref(docs.value[0]);
function play() {
  // Placeholder for play logic
}
function pause() {
  // Placeholder for pause logic
}
</script>

<style scoped>
.doc-player {
  max-width: 400px;
  margin: 1rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.controls {
  margin-top: 1rem;
}
</style> 