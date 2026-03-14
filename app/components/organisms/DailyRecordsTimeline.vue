<script setup lang="ts">
import { Clock, Loader2 } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import type { TimeRecord } from '~/stores/timeRecords'

const props = defineProps<{
  isLoading: boolean
  records: TimeRecord[]
}>()

const { t } = useLocale()

function formatRecordTime(timestamp: string): string {
  if (!timestamp) return '--:--'
  const date = new Date(timestamp)
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col h-full">
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight">{{ t.dashboard.todayRecords }}</h3>

    <div v-if="props.isLoading" class="flex-1 flex items-center justify-center py-12">
      <Loader2 class="animate-spin text-indigo-500" :size="24" />
    </div>

    <div v-else-if="props.records.length === 0" class="flex-1 flex flex-col items-center justify-center text-center opacity-60 py-12">
      <Clock :size="32" class="text-gray-400 mb-3" />
      <p class="text-sm font-medium text-gray-500">{{ t.dashboard.noRecordsToday }}</p>
    </div>

    <div v-else class="flex-1 space-y-4">
      <div v-for="(record, index) in props.records" :key="record.id" class="flex items-center gap-4 relative">
        <div v-if="index !== props.records.length - 1" class="absolute left-4 top-8 -bottom-4 w-0.5 bg-gray-100 dark:bg-gray-800"></div>
        <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 z-10 ring-4 ring-white dark:ring-gray-900">
          <span class="text-xs font-bold">{{ index + 1 }}</span>
        </div>
        <div class="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <span class="font-bold text-gray-900 dark:text-white text-lg tabular-nums">{{ formatRecordTime(record.timestamp) }}</span>
          <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">{{ record.source }}</span>
        </div>
      </div>
    </div>
  </div>
</template>