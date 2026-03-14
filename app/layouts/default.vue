<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useLocale } from '~/composables/useLocale'
import { LayoutDashboard, Users, Briefcase, Menu, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import MainSidebarNavigation from '~/components/molecules/MainSidebarNavigation.vue'
import TopHeader from '~/components/organisms/TopHeader.vue'

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const { t } = useLocale()

const isMobileMenuOpen = ref(false)
const isMounted = ref(false)
const isSidebarCollapsed = ref(false)

const navigation = computed(() => [
  { name: t.value.navigation.dashboard, href: '/', icon: LayoutDashboard },
  { name: t.value.navigation.employees, href: '/employees', icon: Users },
  { name: t.value.navigation.policies, href: '/policies', icon: Briefcase }
])

const currentRole = computed(() => {
  const ws = workspaceStore.workspaces.find(w => w.id === authStore.activeWorkspaceId)
  return ws?.role || 'EMPLOYEE'
})

const visibleNavigation = computed(() => {
  if (!isMounted.value) {
    return [navigation.value[0]]
  }
  return navigation.value.filter(item => {
    if (!item) return false
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

  const savedSidebarState = localStorage.getItem('tt_sidebar_collapsed')
  if (savedSidebarState) {
    isSidebarCollapsed.value = savedSidebarState === 'true'
  }
})

function toggleMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('tt_sidebar_collapsed', isSidebarCollapsed.value.toString())
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">

    <aside
        class="hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed h-full z-40 transition-all duration-300"
        :class="isSidebarCollapsed ? 'w-24' : 'w-64'"
    >
      <div class="h-16 flex items-center border-b border-gray-200 dark:border-gray-800 relative" :class="isSidebarCollapsed ? 'justify-center px-0' : 'px-6'">
        <span v-if="!isSidebarCollapsed" class="text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-tight truncate pr-8">AP101 Tracker</span>
        <span v-else class="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tight">AP</span>

        <button
            @click="toggleSidebar"
            class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer shadow-sm z-50"
        >
          <ChevronRight v-if="isSidebarCollapsed" :size="14" />
          <ChevronLeft v-else :size="14" />
        </button>
      </div>

      <MainSidebarNavigation
          :is-sidebar-collapsed="isSidebarCollapsed"
          :visible-navigation="visibleNavigation"
      />
    </aside>

    <div class="md:hidden fixed top-0 w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-40">
      <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">AP101</span>
      <button @click="toggleMenu" class="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
        <Menu :size="24" />
      </button>
    </div>

    <main
        class="flex-1 pt-16 md:pt-0 min-h-screen flex flex-col transition-all duration-300"
        :class="isSidebarCollapsed ? 'md:ml-24' : 'md:ml-64'"
    >
      <TopHeader :is-mounted="isMounted" />

      <div class="flex-1 p-4 md:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>