<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useLocale } from '~/composables/useLocale'
import { useTheme } from '~/composables/useTheme'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  Moon,
  Sun,
  Globe
} from 'lucide-vue-next'

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const router = useRouter()
const { t, toggleLocale } = useLocale()
const { isDark, toggleTheme } = useTheme()

const isMobileMenuOpen = ref(false)
const isMounted = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Colaboradores', href: '/employees', icon: Users },
  { name: 'Políticas', href: '/policies', icon: Briefcase },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

const currentRole = computed(() => {
  const ws = workspaceStore.workspaces.find(w => w.id === authStore.activeWorkspaceId)
  return ws?.role || 'EMPLOYEE'
})

const visibleNavigation = computed(() => {
  if (!isMounted.value) {
    return [navigation[0]]
  }
  return navigation.filter(item => {
    if (currentRole.value === 'EMPLOYEE') {
      return item.name === 'Dashboard'
    }
    return true
  })
})

onMounted(async () => {
  isMounted.value = true
  if (authStore.isAuthenticated) {
    await workspaceStore.fetchMyWorkspaces()
  }
})

function handleLogout() {
  authStore.logout()
}

function toggleMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function handleWorkspaceChange() {
  window.location.reload()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">

    <aside class="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed h-full z-10 transition-colors">
      <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400">AP101 Tracker</span>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NuxtLink
            v-for="item in visibleNavigation"
            :key="item.name"
            :to="item.href"
            class="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            active-class="bg-indigo-50 dark:bg-indigo-900/30 !text-indigo-700 dark:!text-indigo-400 ring-1 ring-indigo-100 dark:ring-indigo-800/50"
        >
          <component :is="item.icon" :size="18" />
          {{ item.name }}
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <button @click="handleLogout" class="flex items-center gap-3 px-4 py-3 w-full text-sm font-bold text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
          <LogOut :size="18" />
          Sair
        </button>
      </div>
    </aside>

    <div class="md:hidden fixed top-0 w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-20">
      <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400">AP101</span>
      <button @click="toggleMenu" class="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
        <Menu :size="24" />
      </button>
    </div>

    <main class="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">

      <header class="hidden md:flex h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 items-center justify-between px-8 sticky top-0 z-10 transition-colors">

        <div class="flex items-center min-w-[250px]">
          <select
              v-if="isMounted && workspaceStore.workspaces.length > 0"
              v-model="authStore.activeWorkspaceId"
              @change="handleWorkspaceChange"
              class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-64 p-2.5 cursor-pointer outline-none transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <option v-for="ws in workspaceStore.workspaces" :key="ws.id" :value="ws.id">
              {{ ws.name }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-4">
          <button v-if="isMounted" @click="toggleLocale" class="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            <Globe :size="16" />
            {{ t.login.language }}
          </button>

          <div class="w-px h-5 bg-gray-200 dark:bg-gray-700"></div>

          <button v-if="isMounted" @click="toggleTheme" class="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Sun v-if="isDark" :size="20" />
            <Moon v-else :size="20" />
          </button>
        </div>
      </header>

      <div class="flex-1 p-4 md:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>