<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { Loader2, Calendar } from 'lucide-vue-next'
import type { MonthSummaryResponse } from '~/stores/summary'
import { useLocale } from "~/composables/useLocale"
import BaseSelect from '~/components/atoms/BaseSelect.vue'
import { formatDecimalHours } from '~/utils/timeFormatter'

const props = defineProps<{
  data: (MonthSummaryResponse | any)[]
  availableYears: number[]
  modelValue: number
  selectedMonth?: number
  title?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'selectMonth', month: number): void
}>()

const { t } = useLocale()

const chartContainer = ref<HTMLElement | null>(null)
const width = ref(800)
const height = 240
const padding = { top: 30, right: 40, bottom: 30, left: 40 }

const hoveredIndex = ref<number | null>(null)

function updateWidth() {
  if (chartContainer.value) {
    width.value = chartContainer.value.clientWidth
  }
}

onMounted(() => {
  updateWidth()
  window.addEventListener('resize', updateWidth)
})

watch(() => props.data, () => {
  setTimeout(updateWidth, 100)
}, { deep: true })

const maxHours = computed(() => {
  if (!props.data || props.data.length === 0) return 1
  const max = Math.max(...props.data.map(d => Math.max(d.workedHours || d.hours || 0, d.expectedHours || 0)))
  return max > 0 ? Math.ceil(max / 50) * 50 : 200
})

const yearOptions = computed(() => {
  return props.availableYears.map(year => ({
    value: year,
    label: String(year),
    icon: Calendar
  }))
})

function getX(index: number) {
  const innerWidth = width.value - padding.left - padding.right
  return padding.left + (index * (innerWidth / (props.data.length - 1 || 1)))
}

function getY(value: number) {
  const innerHeight = height - padding.top - padding.bottom
  return height - padding.bottom - ((value / maxHours.value) * innerHeight)
}

const workedPath = computed(() => {
  if (props.data.length === 0) return ''
  return props.data.reduce((path, point, i) => {
    const command = i === 0 ? 'M' : 'L'
    return `${path} ${command} ${getX(i)},${getY(point.workedHours || point.hours || 0)}`
  }, '')
})

const expectedPath = computed(() => {
  if (props.data.length === 0) return ''
  return props.data.reduce((path, point, i) => {
    const command = i === 0 ? 'M' : 'L'
    return `${path} ${command} ${getX(i)},${getY(point.expectedHours || 0)}`
  }, '')
})

const tooltipStyle = computed(() => {
  if (hoveredIndex.value === null || !props.data[hoveredIndex.value]) {
    return {}
  }

  const idx = hoveredIndex.value
  const point = props.data[idx]
  if (!point) {
    return {}
  }
  const pointY = Math.min(getY(point.workedHours || point.hours || 0), getY(point.expectedHours || 0))

  const tooltipHeight = 44
  const gap = 10
  const topAbove = pointY - tooltipHeight - gap
  const safeTop = topAbove < 8 ? Math.min(pointY + gap, height - tooltipHeight - 4) : topAbove

  return {
    left: `${getX(idx)}px`,
    top: `${safeTop}px`
  }
})

function isSelected(index: number) {
  return props.selectedMonth === (index + 1)
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm w-full">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
        <template v-if="title">{{ title }}</template>
        <slot name="title"></slot>
      </h3>
      <div class="flex items-center gap-3">
        <slot name="actions"></slot>
        <div v-if="availableYears.length > 0" class="w-32">
          <BaseSelect
              :model-value="modelValue"
              :options="yearOptions"
              @update:model-value="val => emit('update:modelValue', Number(val))"
          />
        </div>
      </div>
    </div>

    <div v-if="data && data.length > 0" class="relative w-full" :style="{ height: `${height}px` }" ref="chartContainer">

      <div v-if="hoveredIndex !== null && data[hoveredIndex]"
           class="absolute z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold px-2 py-1.5 rounded shadow-lg pointer-events-none transform -translate-x-1/2 whitespace-nowrap flex flex-col items-center"
           :style="tooltipStyle">
        <span class="text-indigo-400 dark:text-indigo-600">Trab: {{ formatDecimalHours(data[hoveredIndex]?.workedHours || data[hoveredIndex]?.hours || 0) }}</span>
        <span class="text-gray-400 dark:text-gray-500">Esp: {{ formatDecimalHours(data[hoveredIndex]?.expectedHours || 0) }}</span>
      </div>

      <svg :width="width" :height="height" class="absolute top-0 left-0 overflow-visible">
        <g class="grid-lines">
          <line v-for="i in 5" :key="`grid-${i}`"
                :x1="padding.left" :y1="getY((i-1) * (maxHours / 4))"
                :x2="width - padding.right" :y2="getY((i-1) * (maxHours / 4))"
                stroke="currentColor" class="text-gray-100 dark:text-gray-800" stroke-width="1" />
        </g>

        <g class="x-axis-highlights">
          <rect v-for="i in data.length" :key="`highlight-${i - 1}`"
                :x="getX(i - 1) - 15"
                :y="padding.top - 10"
                width="30"
                :height="height - padding.top - padding.bottom + 20"
                rx="8"
                class="transition-colors duration-300 pointer-events-none"
                :class="isSelected(i - 1) ? 'fill-indigo-500/10' : (hoveredIndex === i - 1 ? 'fill-gray-500/5' : 'fill-transparent')"
          />
        </g>

        <g class="y-axis-labels text-[10px] fill-gray-400 font-medium">
          <text v-for="i in 5" :key="`label-y-${i}`"
                :x="padding.left - 10" :y="getY((i-1) * (maxHours / 4)) + 3"
                text-anchor="end">
            {{ (i-1) * (maxHours / 4) }}h
          </text>
        </g>

        <g class="x-axis-labels text-[10px] fill-gray-400 font-bold uppercase">
          <text v-for="(point, i) in data" :key="`label-x-${i}`"
                :x="getX(i)" :y="height - 5"
                text-anchor="middle"
                class="transition-colors duration-300"
                :class="isSelected(i) ? 'fill-indigo-600' : ''">
            {{ point.monthName ? point.monthName.substring(0, 3) : point.day }}
          </text>
        </g>

        <path :d="expectedPath" fill="none" stroke="currentColor" class="text-gray-300 dark:text-gray-700" stroke-width="2" stroke-dasharray="4 4" />

        <path :d="workedPath" fill="none" stroke="currentColor" class="text-indigo-500" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

        <g class="points">
          <circle v-for="(point, i) in data" :key="`point-${i}`"
                  :cx="getX(i)" :cy="getY(point.workedHours || point.hours || 0)" r="4"
                  class="fill-white dark:fill-gray-900 stroke-indigo-500 transition-all"
                  :class="[hoveredIndex === i ? 'stroke-[4px]' : 'stroke-2', isSelected(i) ? 'r-6' : '']" />
        </g>

        <g class="interactions">
          <rect v-for="i in data.length" :key="`interaction-${i - 1}`"
                :x="getX(i - 1) - ((width - padding.left - padding.right) / (data.length - 1 || 1)) / 2"
                y="0"
                :width="(width - padding.left - padding.right) / (data.length - 1 || 1)"
                :height="height"
                fill="transparent"
                class="cursor-pointer outline-none"
                @mouseenter="hoveredIndex = i - 1"
                @mouseleave="hoveredIndex = null"
                @click="emit('selectMonth', i - 1)"
          />
        </g>
      </svg>

    </div>
    <div v-if="data && data.length > 0" class="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-indigo-500"></div>
        <span class="text-xs font-bold text-gray-600 dark:text-gray-300">{{ t.dashboard.workedHours }}</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-0.5 border-b-2 border-dashed border-gray-400"></div>
        <span class="text-xs font-bold text-gray-600 dark:text-gray-300">{{ t.closures.expected }}</span>
      </div>
    </div>
    <div v-else class="flex-1 flex items-center justify-center opacity-50" :style="{ height: `${height}px` }">
      <Loader2 class="animate-spin text-indigo-500" />
    </div>
  </div>
</template>
