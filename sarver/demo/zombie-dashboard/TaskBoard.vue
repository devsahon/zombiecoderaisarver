<template>
  <div class="task-board">
    <h2>Task Board</h2>
    <ul>
      <li v-for="task in tasks" :key="task.id" draggable="true">
        {{ task.title }}
      </li>
    </ul>
    <input v-model="newTask" placeholder="Add new task" />
    <button @click="addTask">Add</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const tasks = ref([
  { id: 1, title: 'Sample Task 1' },
  { id: 2, title: 'Sample Task 2' }
]);
const newTask = ref('');
function addTask() {
  if (newTask.value.trim()) {
    tasks.value.push({ id: Date.now(), title: newTask.value });
    newTask.value = '';
  }
}
</script>

<style scoped>
.task-board {
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style> 