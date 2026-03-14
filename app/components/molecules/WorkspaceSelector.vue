<script setup lang="ts">
import { computed } from 'vue'
import { Building2 } from 'lucide-vue-next'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useAuthStore } from '~/stores/auth'
import BaseSelect from '~/components/atoms/BaseSelect.vue'

const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()

const workspaceOptions = computed(() => {
  return workspaceStore.workspaces.map(ws => ({
    value: ws.id,
    label: ws.name,
    icon: Building2
  }))
})

function handleWorkspaceChange(id: string | number) {
  authStore.setActiveWorkspace(id as string)
  window.location.reload()
}
</script>

<template>
  <div class="min-w-60">
    <BaseSelect
        :model-value="authStore.activeWorkspaceId"
        :options="workspaceOptions"
        placeholder="Selecione a Empresa"
        @update:model-value="handleWorkspaceChange"
    />
  </div>
</template>