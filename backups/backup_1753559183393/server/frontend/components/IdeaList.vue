<template>
  <div>
    <h3>Idea List</h3>
    <ul>
      <li v-for="idea in ideas" :key="idea.id">
        <strong>{{ idea.idea_title }}</strong> ({{ idea.tags }})
        <span v-if="idea.related_project_id">[Project: {{ idea.related_project_id }}]</span>
      </li>
    </ul>
    <input v-model="newIdea" placeholder="New idea..." />
    <button @click="addIdea">Add</button>
  </div>
</template>
<script>
export default {
  data() {
    return { ideas: [], newIdea: '' };
  },
  methods: {
    addIdea() {
      if (this.newIdea) {
        this.ideas.push({ id: Date.now(), idea_title: this.newIdea, tags: '', related_project_id: null });
        this.newIdea = '';
      }
    }
  }
}
</script> 