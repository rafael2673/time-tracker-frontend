<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
}>()

const { t } = useLocale()
</script>

<template>
  <div v-if="props.totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
    <button
        @click="emit('page-change', props.currentPage - 1)"
        :disabled="props.currentPage === 0"
        class="flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronLeft :size="16" />
      {{ t.calendar.previous }}
    </button>

    <span class="text-xs font-bold text-gray-500">
            {{ props.currentPage + 1 }} / {{ props.totalPages }}
        </span>

    <button
        @click="emit('page-change', props.currentPage + 1)"
        :disabled="props.currentPage >= props.totalPages - 1"
        class="flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ t.calendar.next }}
      <ChevronRight :size="16" />
    </button>
  </div>
</template>