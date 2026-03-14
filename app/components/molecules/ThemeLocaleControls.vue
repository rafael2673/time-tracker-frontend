<script setup lang="ts">
import { Globe, Sun, Moon } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import { useTheme } from '~/composables/useTheme'

const { t, toggleLocale } = useLocale()
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <div class="flex items-center gap-4">
    <button @click="toggleLocale" class="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
      <Globe :size="16" />
      {{ t.login.language }}
    </button>

    <div class="w-px h-5 bg-gray-200 dark:bg-gray-700"></div>

    <button @click="toggleTheme" class="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800">
      <Sun v-if="isDark" :size="20" />
      <Moon v-else :size="20" />
    </button>
  </div>
</template>