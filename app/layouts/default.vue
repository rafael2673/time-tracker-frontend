<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
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
  Globe,
  Building2,
  ChevronDown
} from 'lucide-vue-next'

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const router = useRouter()
const { t, toggleLocale } = useLocale()
const { isDark, toggleTheme } = useTheme()

const isMobileMenuOpen = ref(false)
const isMounted = ref(false)
const isWorkspaceMenuOpen = ref(false)

const navigation = computed(() => [
  { name: t.value.navigation.dashboard, href: '/', icon: LayoutDashboard },
  { name: t.value.navigation.employees, href: '/employees', icon: Users },
  { name: t.value.navigation.policies, href: '/policies', icon: Briefcase },
  { name: t.value.navigation.settings, href: '/settings', icon: Settings },
])

const currentRole = computed(() => {
  const ws = workspaceStore.workspaces.find(w => w.id === authStore.activeWorkspaceId)
  return ws?.role || 'EMPLOYEE'
})

const activeWorkspaceName = computed(() => {
  const ws = workspaceStore.workspaces.find(w => w.id === authStore.activeWorkspaceId)
  return ws?.name || t.value.workspaces.selectorPlaceholder
})

const visibleNavigation = computed(() => {
  if (!isMounted.value) {
    return [navigation.value[0]]
  }
  return navigation.value.filter(item => {
    if (currentRole.value === 'EMPLOYEE') {
      return item.name === t.value.navigation.dashboard
    }
    return true
  })
})

onMounted(async () => {
  isMounted.value = true
  if (authStore.isAuthenticated) {
    await workspaceStore.fetchMyWorkspaces()
  }
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

function handleLogout() {
  authStore.logout()
}

function toggleMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">

    <aside class="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed h-full z-10 transition-colors">
      <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">AP101 Tracker</span>
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
          {{ t.navigation.logout }}
        </button>
      </div>
    </aside>

    <div class="md:hidden fixed top-0 w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-20">
      <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">AP101</span>
      <button @click="toggleMenu" class="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
        <Menu :size="24" />
      </button>
    </div>

    <main class="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">

      <header class="hidden md:flex h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 items-center justify-between px-8 sticky top-0 z-10 transition-colors">

        <div class="relative workspace-selector min-w-[240px]">
          <button
              v-if="isMounted && workspaceStore.workspaces.length > 0"
              @click="isWorkspaceMenuOpen = !isWorkspaceMenuOpen"
              class="flex items-center justify-between w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-2 overflow-hidden">
              <Building2 :size="16" class="text-indigo-500 shrink-0" />
              <span class="font-bold text-sm text-gray-900 dark:text-white truncate">{{ activeWorkspaceName }}</span>
            </div>
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
            <div v-if="isWorkspaceMenuOpen" class="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
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

        <div class="flex items-center gap-4">
          <button v-if="isMounted" @click="toggleLocale" class="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <Globe :size="16" />
            {{ t.login.language }}
          </button>

          <div class="w-px h-5 bg-gray-200 dark:bg-gray-700"></div>

          <button v-if="isMounted" @click="toggleTheme" class="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800">
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