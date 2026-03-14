<script setup lang="ts">
import { CheckCircle, AlertCircle } from 'lucide-vue-next'

defineProps<{
  message: string
  type: 'success' | 'error'
}>()
</script>

<template>
  <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-4 opacity-0"
  >
    <div v-if="message" class="fixed bottom-8 right-8 z-100 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm" :class="type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
      <CheckCircle v-if="type === 'success'" :size="20" />
      <AlertCircle v-else :size="20" />
      {{ message }}
    </div>
  </Transition>
</template>