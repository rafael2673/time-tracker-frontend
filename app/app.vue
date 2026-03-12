<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useTheme } from '~/composables/useTheme'
import '../assets/css/main.css'

const authStore = useAuthStore()
const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
  authStore.initAuth()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}
</style>