<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Building2, ChevronDown } from 'lucide-vue-next'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useAuthStore } from '~/stores/auth'

const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()

const isWorkspaceMenuOpen = ref(false)

const activeWorkspaceName = computed(() => {
  const ws = workspaceStore.workspaces.find(w => w.id === authStore.activeWorkspaceId)
  return ws?.name || 'Selecione a Empresa'
})

onMounted(() => {
  document.addEventListener('click', closeWorkspaceMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeWorkspaceMenu)
})

function closeWorkspaceMenu(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.workspace-selector')) {
    isWorkspaceMenuOpen.value = false
  }
}

function selectWorkspace(id: string) {
  authStore.setActiveWorkspace(id)
  isWorkspaceMenuOpen.value = false
  window.location.reload()
}
</script>

<template>
  <div class="relative workspace-selector min-w-60">
    <button
        @click="isWorkspaceMenuOpen = !isWorkspaceMenuOpen"
        class="flex items-center justify-between w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all cursor-pointer group"
    >
            <span class="flex items-center gap-2 overflow-hidden">
                <Building2 :size="16" class="text-indigo-500 shrink-0" />
                <span class="font-bold text-sm text-gray-900 dark:text-white truncate">{{ activeWorkspaceName }}</span>
            </span>
      <ChevronDown :size="16" class="text-gray-400 transition-transform duration-200" :class="{'rotate-180': isWorkspaceMenuOpen}" />
    </button>

    <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="isWorkspaceMenuOpen" class="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-60">
        <div class="p-2 space-y-1">
          <button
              v-for="ws in workspaceStore.workspaces"
              :key="ws.id"
              @click="selectWorkspace(ws.id)"
              class="flex items-center w-full px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              :class="ws.id === authStore.activeWorkspaceId ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'"
          >
            <Building2 :size="16" class="mr-2 opacity-50" />
            <span class="truncate">{{ ws.name }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>