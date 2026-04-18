<script setup lang="ts">
import { computed } from 'vue'
import { Scale, Loader2 } from 'lucide-vue-next'
import type { DailySummaryResponse } from '~/stores/summary'
import { useLocale } from '~/composables/useLocale'
import { formatDecimalHours } from '~/utils/timeFormatter'

const props = defineProps<{
  data: DailySummaryResponse[]
}>()

const { t } = useLocale()

const points = computed(() => {
  return props.data.map((day) => ({
    dayLabel: day.day,
    delta: day.hours - day.expectedHours
  }))
})

const maxAbsDelta = computed(() => {
  if (points.value.length === 0) return 1
  const max = Math.max(...points.value.map((point) => Math.abs(point.delta)))
  return max > 0 ? max : 1
})

function getBarWidth(delta: number) {
  return `${(Math.abs(delta) / maxAbsDelta.value) * 50}%`
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col">
    <div class="flex items-center justify-between gap-3 mb-4">
      <h3 class="text-sm font-bold text-gray-900 dark:text-white tracking-tight">{{ t.dashboard.hourBalance }} · {{ t.chart.current.week }}</h3>
      <div class="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
        <Scale :size="16" />
      </div>
    </div>

    <div v-if="points.length > 0" class="space-y-3">
      <div
        v-for="point in points"
        :key="point.dayLabel"
        class="grid grid-cols-[2.25rem,1fr,4.25rem] items-center gap-3"
      >
        <span class="text-[10px] font-bold text-gray-500 uppercase">{{ point.dayLabel }}</span>

        <div class="relative h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div class="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>

          <div
            v-if="point.delta < 0"
            class="absolute top-0 bottom-0 right-1/2 bg-red-500 dark:bg-red-600 transition-all duration-500"
            :style="{ width: getBarWidth(point.delta) }"
          ></div>

          <div
            v-else-if="point.delta > 0"
            class="absolute top-0 bottom-0 left-1/2 bg-emerald-500 dark:bg-emerald-600 transition-all duration-500"
            :style="{ width: getBarWidth(point.delta) }"
          ></div>

          <div
            v-else
            class="absolute top-0 bottom-0 left-[calc(50%-2px)] w-1 bg-indigo-400/70 dark:bg-indigo-500/70"
          ></div>
        </div>

        <span class="text-[10px] font-bold tabular-nums text-right" :class="point.delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'">
          {{ point.delta >= 0 ? '+' : '' }}{{ formatDecimalHours(point.delta) }}
        </span>
      </div>

      <div class="pt-3 mt-1 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
        <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{{ t.dashboard.extra }}</span>
        <span class="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400">{{ t.dashboard.absences }}</span>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center opacity-50 min-h-32">
      <Loader2 class="animate-spin text-indigo-500" />
    </div>
  </div>
</template>



