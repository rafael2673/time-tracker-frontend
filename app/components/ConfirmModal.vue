<script setup lang="ts">
import { AlertTriangle, Loader2 } from 'lucide-vue-next'

defineProps<{
  show: boolean
  title: string
  message: string
  isLoading?: boolean
}>()

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        <div class="p-8 text-center">
          <div class="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertTriangle :size="32" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{{ title }}</h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{{ message }}</p>
        </div>
        <div class="flex p-4 gap-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <button @click="emit('cancel')" :disabled="isLoading" class="flex-1 py-3 px-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50">
            Cancelar
          </button>
          <button @click="emit('confirm')" :disabled="isLoading" class="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50">
            <Loader2 v-if="isLoading" :size="18" class="animate-spin" />
            <span v-else>Confirmar</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>