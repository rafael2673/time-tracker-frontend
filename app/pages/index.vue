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
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">{{ t.dashboard.title }}</h1>

    <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
      <p class="text-gray-500 dark:text-gray-400">{{ t.dashboard.emptyState }}</p>
    </div>
  </div>
</template>