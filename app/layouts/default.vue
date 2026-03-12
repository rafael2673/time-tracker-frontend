<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
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
const router = useRouter()
const { t, toggleLocale } = useLocale()
const { isDark, toggleTheme } = useTheme()

const isMobileMenuOpen = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Colaboradores', href: '/employees', icon: Users },
  { name: 'Políticas', href: '/policies', icon: Briefcase },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

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
        <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400">AP101 Tracker</span>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <NuxtLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
            active-class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
            class="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <component :is="item.icon" :size="18" />
          {{ item.name }}
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <button @click="handleLogout" class="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
          <LogOut :size="18" />
          Sair
        </button>
      </div>
    </aside>

    <div class="md:hidden fixed top-0 w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-20">
      <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400">AP101</span>
      <button @click="toggleMenu" class="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
        <Menu :size="24" />
      </button>
    </div>

    <main class="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">

      <header class="hidden md:flex h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 items-center justify-end px-8 sticky top-0 z-10 transition-colors">
        <div class="flex items-center gap-4">
          <button @click="toggleLocale" class="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            <Globe :size="16" />
            {{ t.login.language }}
          </button>

          <div class="w-px h-5 bg-gray-200 dark:bg-gray-700"></div>

          <button @click="toggleTheme" class="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
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