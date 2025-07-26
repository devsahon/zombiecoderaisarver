<template>
  <div>
    <h2>AI Providers & Models</h2>
    <button @click="syncConfig">Sync YAML → DB</button>
    <table>
      <tr>
        <th>Provider</th>
        <th>Enabled</th>
        <th>Fallback Rank</th>
        <th>Models</th>
        <th>Memory</th>
        <th>Actions</th>
      </tr>
      <tr v-for="provider in providers" :key="provider.id">
        <td>{{ provider.name }}</td>
        <td>
          <input type="checkbox" v-model="provider.enabled" @change="updateProvider(provider)" />
        </td>
        <td>
          <input type="number" v-model="provider.fallback_rank" @change="updateProvider(provider)" />
        </td>
        <td>
          <ul>
            <li v-for="model in provider.models" :key="model.id">
              {{ model.name }}
              <input type="checkbox" v-model="model.enabled" @change="updateModel(model)" />
              <input type="number" v-model="model.fallback_rank" @change="updateModel(model)" />
              <input type="number" v-model="model.max_tokens" @change="updateModel(model)" />
            </li>
          </ul>
        </td>
        <td>
          <span v-if="memoryStatus[provider.name]">
            Keys: {{ memoryStatus[provider.name].keys.length }}, Size: {{ memoryStatus[provider.name].size }}
          </span>
          <span v-else>-</span>
        </td>
        <td>
          <button @click="clearMemory(provider.name)">Clear Memory</button>
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const providers = ref([])
const memoryStatus = ref({})

const fetchProviders = async () => {
  const res = await fetch('/api/providers')
  providers.value = await res.json()
  fetchMemoryStatus()
}

const fetchMemoryStatus = async () => {
  const res = await fetch('/api/provider/memory_status')
  memoryStatus.value = await res.json()
}

const updateProvider = async (provider) => {
  await fetch(`/api/providers/${provider.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(provider)
  })
}

const updateModel = async (model) => {
  await fetch(`/api/models/${model.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(model)
  })
}

const clearMemory = async (providerName) => {
  await fetch(`/api/provider/${providerName}/clear_memory`, { method: 'POST' })
  fetchMemoryStatus()
}

const syncConfig = async () => {
  await fetch('/api/sync/providers', { method: 'POST' })
  fetchProviders()
}

onMounted(fetchProviders)
</script> 