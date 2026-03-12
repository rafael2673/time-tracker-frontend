<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useLocale } from '~/composables/useLocale'

const authStore = useAuthStore()
const router = useRouter()
const { t } = useLocale()

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})

function handleLogout(): void {
  authStore.logout()
}
</script>

<template>
  <div v-if="authStore.isAuthenticated" class="min-h-screen p-8 bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t.dashboard.title }}</h1>
      <button @click="handleLogout" class="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors cursor-pointer">
        {{ t.dashboard.logout }}
      </button>
    </div>

    <div class="max-w-7xl mx-auto mt-8">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <p class="text-gray-500 dark:text-gray-400">{{ t.dashboard.emptyState }}</p>
      </div>
    </div>
  </div>
</template>