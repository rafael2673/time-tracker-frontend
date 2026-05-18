<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '~/composables/useLocale'

interface DailyActivity {
  label: string
  hours: number
  expected: number
  date: string
}

const props = defineProps<{
  activity: DailyActivity[]
}>()

const { t } = useLocale()

const chartHeight = 160
const chartWidth = 400
const padding = { top: 20, right: 20, bottom: 30, left: 10 }

const maxHours = computed(() => {
  const allValues = props.activity.flatMap(a => [a.hours, a.expected])
  return Math.max(10, ...allValues) + 2
})

const barWidth = 24
const gap = (chartWidth - padding.left - padding.right) / 7

function getY(value: number) {
  return chartHeight - padding.bottom - (value / maxHours.value) * (chartHeight - padding.top - padding.bottom)
}

function getDayLabel(label: string) {
  const map: Record<string, string> = {
    'MONDAY': t.value.policies.days.MONDAY,
    'TUESDAY': t.value.policies.days.TUESDAY,
    'WEDNESDAY': t.value.policies.days.WEDNESDAY,
    'THURSDAY': t.value.policies.days.THURSDAY,
    'FRIDAY': t.value.policies.days.FRIDAY,
    'SATURDAY': t.value.policies.days.SATURDAY,
    'SUNDAY': t.value.policies.days.SUNDAY
  }
  return map[label] || label
}

const bars = computed(() => {
  return props.activity.map((day, i) => {
    const x = padding.left + i * gap + gap / 2
    return {
      x,
      workedY: getY(day.hours),
      workedHeight: Math.max(2, (day.hours / maxHours.value) * (chartHeight - padding.top - padding.bottom)),
      expectedY: getY(day.expected),
      label: getDayLabel(day.label),
      raw: day
    }
  })
})

const expectedLinePoints = computed(() => {
  return bars.value.map(b => `${b.x},${b.expectedY}`).join(' ')
})
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{{ t.chart.current.week }}</h3>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/20"></div>
          <span class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">{{ t.chart.current.worked }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-0.5 bg-amber-400 rounded-full"></div>
          <span class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">{{ t.chart.current.expected }}</span>
        </div>
      </div>
    </div>

    <div class="flex-1 min-h-0 relative">
      <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="w-full h-full overflow-visible">
        <!-- Grid Lines -->
        <line v-for="i in 5" :key="i"
              :x1="padding.left" :y1="getY((maxHours / 4) * (i-1))"
              :x2="chartWidth - padding.right" :y2="getY((maxHours / 4) * (i-1))"
              class="stroke-gray-100 dark:stroke-gray-800" stroke-width="1" />

        <!-- Bars -->
        <g v-for="(bar, i) in bars" :key="i">
          <rect
              :x="bar.x - barWidth / 2"
              :y="bar.workedY"
              :width="barWidth"
              :height="bar.workedHeight"
              class="fill-indigo-500/90 dark:fill-indigo-500/80 rx-[6px]"
              rx="6"
          />
          <text
              :x="bar.x"
              :y="chartHeight - 10"
              text-anchor="middle"
              class="fill-gray-400 dark:fill-gray-500 text-[10px] font-bold uppercase tracking-tighter"
          >
            {{ bar.label }}
          </text>

          <!-- Tooltip Trigger Area -->
          <rect
              :x="bar.x - gap/2"
              y="0"
              :width="gap"
              :height="chartHeight"
              fill="transparent"
              class="cursor-default group"
          >
            <title>{{ bar.label }}: {{ bar.raw.hours.toFixed(1) }}h / {{ bar.raw.expected.toFixed(1) }}h</title>
          </rect>
        </g>

        <!-- Expected Line -->
        <polyline
            fill="none"
            class="stroke-amber-400"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :points="expectedLinePoints"
        />
        <circle v-for="(bar, i) in bars" :key="`c-${i}`"
                :cx="bar.x" :cy="bar.expectedY" r="3"
                class="fill-white dark:fill-gray-900 stroke-amber-400" stroke-width="1.5" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.rx-\[6px\] {
  rx: 6px;
}
</style>