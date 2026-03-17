<script setup lang="ts">
import { computed } from 'vue'
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'

const props = withDefaults(defineProps<{
  show: boolean
  title: string
  message: string
  isLoading?: boolean
  intent?: 'danger' | 'success' | 'info'
}>(), {
  intent: 'danger'
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const { t } = useLocale()

const theme = computed(() => {
  switch (props.intent) {
    case 'success':
      return {
        bgIcon: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
        btnConfirm: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 text-white',
        icon: CheckCircle2
      }
    case 'info':
      return {
        bgIcon: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        btnConfirm: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 text-white',
        icon: Info
      }
    case 'danger':
    default:
      return {
        bgIcon: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
        btnConfirm: 'bg-red-600 hover:bg-red-700 shadow-red-500/20 text-white',
        icon: AlertCircle
      }
  }
})
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
      <div class="flex items-start gap-4 mb-6">
        <div class="p-3 rounded-2xl shrink-0" :class="theme.bgIcon">
          <component :is="theme.icon" :size="24" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{{ title }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{{ message }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
            @click="emit('cancel')"
            :disabled="isLoading"
            class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          {{ t.modal.cancel }}
        </button>
        <button
            @click="emit('confirm')"
            :disabled="isLoading"
            class="flex-1 px-4 py-2.5 font-bold rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :class="theme.btnConfirm"
        >
          <Loader2 v-if="isLoading" :size="18" class="animate-spin" />
          <span v-else>{{ t.modal.confirm }}</span>
        </button>
      </div>
    </div>
  </div>
</template>