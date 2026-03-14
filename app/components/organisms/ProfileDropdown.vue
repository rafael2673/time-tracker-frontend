<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useLocale } from '~/composables/useLocale'
import { LogOut, Settings, User } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const { t } = useLocale()

const isOpen = ref(false)

onMounted(() => {
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})

function closeMenu(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.profile-menu-container')) {
    isOpen.value = false
  }
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    const firstChar = parts[0]?.charAt(0) || ''
    const lastChar = parts[parts.length - 1]?.charAt(0) || ''
    return (firstChar + lastChar).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

function handleNavigation(path: string) {
  isOpen.value = false
  router.push(path)
}

function handleLogout() {
  isOpen.value = false
  authStore.logout()
}
</script>

<template>
  <div class="relative profile-menu-container ml-4">
    <button
        @click="isOpen = !isOpen"
        class="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm ring-2 ring-transparent hover:ring-indigo-100 dark:hover:ring-indigo-800/50 transition-all cursor-pointer shadow-inner"
    >
      {{ getInitials(authStore.user?.fullName || '') }}
    </button>

    <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="isOpen" class="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden z-[60]">
        <div class="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <h3 class="font-bold text-gray-900 dark:text-white truncate" :title="authStore.user?.fullName">
            {{ authStore.user?.fullName }}
          </h3>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 truncate mt-0.5" :title="authStore.user?.email">
            {{ authStore.user?.email }}
          </p>
        </div>

        <div class="p-2 space-y-1">
          <button
              @click="handleNavigation('/settings')"
              class="flex items-center w-full px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Settings :size="16" class="mr-3 opacity-60" />
            <span>{{ t.navigation.settings }}</span>
          </button>

          <button
              @click="handleLogout"
              class="flex items-center w-full px-3 py-2.5 text-sm font-bold rounded-xl transition-colors cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut :size="16" class="mr-3 opacity-80" />
            <span>{{ t.navigation.logout }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>