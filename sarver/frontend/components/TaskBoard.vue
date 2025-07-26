<template>
  <div class="task-board">
    <h2>Task Board</h2>
    <div class="columns">
      <div class="column">
        <h3>To-Do</h3>
        <!-- To-Do tasks here -->
      </div>
      <div class="column">
        <h3>Doing</h3>
        <!-- Doing tasks here -->
      </div>
      <div class="column">
        <h3>Done</h3>
        <!-- Done tasks here -->
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'TaskBoard',
  data() { return { tasks: [] }; }
}
</script>
<style scoped>
.task-board { display: flex; flex-direction: column; }
.columns { display: flex; gap: 2rem; }
.column { flex: 1; background: #f9f9f9; padding: 1rem; border-radius: 8px; }
</style> 