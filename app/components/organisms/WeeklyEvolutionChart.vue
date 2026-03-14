<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import type { DailySummaryResponse } from '~/stores/summary'
import { useLocale } from "~/composables/useLocale"
import { formatDecimalHours } from '~/utils/timeFormatter'

const props = defineProps<{
  data: DailySummaryResponse[]
}>()

const maxScaleHours = computed(() => {
  if (!props.data || props.data.length === 0) return 1
  const maxWorked = Math.max(...props.data.map(d => d.hours))
  const maxExpected = Math.max(...props.data.map(d => d.expectedHours))
  const max = Math.max(maxWorked, maxExpected)
  return max > 0 ? max : 1
})

const { t } = useLocale()
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col h-64">
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight">{{ t.chart.current.week }}</h3>

    <div class="flex-1 flex gap-4" v-if="props.data.length > 0">
      <div v-for="day in props.data" :key="day.date" class="flex-1 flex flex-col items-center gap-2 group cursor-default relative">
        <div class="w-full flex-1 relative bg-gray-100 dark:bg-gray-800 rounded-t-md">

          <div
              v-if="day.expectedHours > 0"
              class="absolute bottom-0 left-0 w-full bg-gray-200 dark:bg-gray-700 rounded-t-md z-0"
              :style="{ height: `${(day.expectedHours / maxScaleHours) * 100}%` }"
          ></div>

          <div
              class="absolute bottom-0 left-0 w-full rounded-t-md transition-all duration-500 ease-out z-10"
              :class="day.hours >= day.expectedHours ? 'bg-emerald-500 dark:bg-emerald-600 group-hover:bg-emerald-400' : 'bg-indigo-500 dark:bg-indigo-600 group-hover:bg-indigo-400'"
              :style="{ height: `${(day.hours / maxScaleHours) * 100}%` }"
          ></div>

          <div
              v-if="day.expectedHours > 0"
              class="absolute bottom-0 left-0 w-full border-t-2 border-dashed border-gray-400 dark:border-gray-500 z-20 pointer-events-none"
              :style="{ height: `${(day.expectedHours / maxScaleHours) * 100}%` }"
          ></div>

          <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-2 py-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap flex flex-col items-center">
            <span>{{ formatDecimalHours(day.hours) }} / {{ formatDecimalHours(day.expectedHours) }}</span>
          </div>
        </div>
        <span class="text-[10px] font-bold text-gray-500 uppercase">{{ day.day }}</span>
      </div>
    </div>
    <div v-else class="flex-1 flex items-center justify-center opacity-50">
      <Loader2 class="animate-spin text-emerald-500" />
    </div>
  </div>
</template>