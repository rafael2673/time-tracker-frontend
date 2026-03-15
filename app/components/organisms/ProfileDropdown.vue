<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut, Settings } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useLocale } from '~/composables/useLocale'

const authStore = useAuthStore()
const router = useRouter()
const { t } = useLocale()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    const firstChar = parts[0]?.[0] || ''
    const lastChar = parts[parts.length - 1]?.[0] || ''
    return (firstChar + lastChar).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

function navigateToSettings() {
  isOpen.value = false
  router.push('/settings')
}

async function handleLogout() {
  isOpen.value = false
  await authStore.logout()
}
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <button
        @click="toggleDropdown"
        class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center ring-2 ring-transparent hover:ring-indigo-100 dark:hover:ring-indigo-800/50 transition-all cursor-pointer shadow-sm"
    >
      {{ getInitials(authStore.user?.fullName || '') }}
    </button>

    <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="transform scale-95 opacity-0 translate-y-2"
        enter-to-class="transform scale-100 opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="transform scale-100 opacity-100 translate-y-0"
        leave-to-class="transform scale-95 opacity-0 translate-y-2"
    >
      <div v-if="isOpen" class="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden z-40">
        <div class="p-4 border-b border-gray-100 dark:border-gray-800">
          <p class="font-bold text-gray-900 dark:text-white truncate" :title="authStore.user?.fullName">
            {{ authStore.user?.fullName }}
          </p>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate" :title="authStore.user?.email">
            {{ authStore.user?.email }}
          </p>
        </div>

        <div class="p-2 space-y-1">
          <button
              @click="navigateToSettings"
              class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
          >
            <Settings :size="16" class="text-gray-400" />
            {{ t.navigation.settings }}
          </button>
        </div>

        <div class="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut :size="16" />
            {{ t.navigation.logout }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>