<template>
  <div>
    <h3>Timer Tracker</h3>
    <div>
      <button @click="startTimer" :disabled="running">Start</button>
      <button @click="stopTimer" :disabled="!running">Stop</button>
      <span>Elapsed: {{ elapsed }}s</span>
      <span v-if="idle">(Idle!)</span>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return { running: false, elapsed: 0, idle: false, timer: null };
  },
  methods: {
    startTimer() {
      this.running = true;
      this.idle = false;
      this.timer = setInterval(() => { this.elapsed++; }, 1000);
      // TODO: Add idle detection logic
    },
    stopTimer() {
      this.running = false;
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
</script> 