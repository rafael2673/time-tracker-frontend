<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import type { DailySummaryResponse } from '~/stores/summary'

const props = defineProps<{
  data: DailySummaryResponse[]
}>()

const { t } = useLocale()

const maxHours = computed(() => {
  if (!props.data || props.data.length === 0) return 8
  const max = Math.max(...props.data.map(d => Math.max(d.hours, d.expectedHours)))
  return max > 0 ? max : 8
})

const chartHeight = 160
const barWidth = 40
const gap = 24

const viewBoxWidth = computed(() => {
  const count = props.data.length || 7
  return (count * barWidth) + ((count - 1) * gap)
})

function getY(hours: number) {
  return chartHeight - (hours / maxHours.value) * chartHeight
}

function getHeight(hours: number) {
  return (hours / maxHours.value) * chartHeight
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col transition-all">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{{ t.chart.current.week }}</h3>
        <p class="text-xs font-medium text-gray-500 mt-1">{{ t.chart.current.workedVsExpected }}</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ t.chart.current.worked }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ t.chart.current.expected }}</span>
        </div>
      </div>
    </div>

    <div class="flex-1 relative min-h-40" v-if="props.data.length > 0">
      <svg
          :viewBox="`0 0 ${viewBoxWidth} ${chartHeight}`"
          class="w-full h-full overflow-visible"
          preserveAspectRatio="none"
      >
        <g v-for="(day, index) in props.data" :key="day.date" class="group">
          <!-- Expected Bar (Background) -->
          <rect
              :x="index * (barWidth + gap)"
              :y="getY(day.expectedHours)"
              :width="barWidth"
              :height="getHeight(day.expectedHours)"
              rx="6"
              class="fill-gray-100 dark:fill-gray-800 transition-all duration-300"
          />
          
          <!-- Worked Bar -->
          <rect
              :x="index * (barWidth + gap)"
              :y="getY(day.hours)"
              :width="barWidth"
              :height="getHeight(day.hours)"
              rx="6"
              :class="day.hours >= day.expectedHours && day.expectedHours > 0 ? 'fill-emerald-500' : 'fill-indigo-500'"
              class="transition-all duration-500 ease-out"
          />

          <!-- Overtime Indicator -->
          <circle
            v-if="day.hours > day.expectedHours"
            :cx="index * (barWidth + gap) + barWidth / 2"
            :cy="getY(day.hours) - 10"
            r="4"
            class="fill-emerald-500 animate-pulse"
          />
        </g>
      </svg>
      
      <!-- X-Axis Labels -->
      <div class="flex justify-between mt-6">
        <div v-for="day in props.data" :key="day.date" class="flex flex-col items-center flex-1">
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{{ day.day }}</span>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex flex-col items-center justify-center py-12 opacity-40">
      <Loader2 class="animate-spin text-indigo-500 mb-2" />
      <span class="text-xs font-bold text-gray-500">{{ t.chart.current.loading }}</span>
    </div>
  </div>
</template>