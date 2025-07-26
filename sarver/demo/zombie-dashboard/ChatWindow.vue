<template>
  <div class="chat-window">
    <h2>Chat</h2>
    <div class="messages">
      <div v-for="msg in messages" :key="msg.id" class="message">
        <span>{{ msg.sender }}:</span> {{ msg.text }}
      </div>
    </div>
    <input v-model="input" placeholder="Type a message..." @keyup.enter="send" />
    <button @click="send">Send</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const messages = ref([
  { id: 1, sender: 'Agent', text: 'Hello! How can I help you?' }
]);
const input = ref('');
function send() {
  if (input.value.trim()) {
    messages.value.push({ id: Date.now(), sender: 'You', text: input.value });
    input.value = '';
  }
}
</script>

<style scoped>
.chat-window {
  max-width: 400px;
  margin: 1rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.messages {
  min-height: 100px;
  margin-bottom: 1rem;
}
.message {
  margin-bottom: 0.5rem;
}
</style> 