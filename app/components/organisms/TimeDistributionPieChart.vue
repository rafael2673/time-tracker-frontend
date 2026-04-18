<script setup lang="ts">
import { computed } from 'vue'
import type { TimeDistributionResponse } from '~/stores/summary'
import { formatDecimalHours } from '~/utils/timeFormatter'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
  distribution: TimeDistributionResponse
  compact?: boolean
}>()

const { t } = useLocale()

const total = computed(() => {
  const tValue = props.distribution.regularHours + props.distribution.overtimeHours + props.distribution.absenceHours
  return tValue > 0 ? tValue : 1 // Prevents division by zero
})

const radius = computed(() => (props.compact ? 52 : 60))
const circumference = computed(() => 2 * Math.PI * radius.value)

const rootClass = computed(() => (props.compact ? 'p-5' : 'p-6'))
const chartContainerClass = computed(() => (props.compact ? 'w-34 h-34 mt-6' : 'w-40 h-40 mt-8'))
const legendContainerClass = computed(() => (props.compact ? 'mt-4 pt-4' : 'mt-6 pt-6'))

const segments = computed(() => {
  const regularLength = (props.distribution.regularHours / total.value) * circumference.value
  const overtimeLength = (props.distribution.overtimeHours / total.value) * circumference.value
  const absenceLength = (props.distribution.absenceHours / total.value) * circumference.value

  return {
    regular: {
      dasharray: `${regularLength} ${circumference.value}`,
      dashoffset: 0
    },
    overtime: {
      dasharray: `${overtimeLength} ${circumference.value}`,
      dashoffset: -regularLength
    },
    absence: {
      dasharray: `${absenceLength} ${circumference.value}`,
      dashoffset: -(regularLength + overtimeLength)
    }
  }
})
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm w-full flex flex-col items-center justify-center relative" :class="rootClass">
    <h3 class="text-sm font-bold text-gray-900 dark:text-white w-full text-left absolute top-6 left-6">{{ t.dashboard.timeDistributionTitle }}</h3>

    <div class="relative flex items-center justify-center" :class="chartContainerClass">
      <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
        <!-- Background -->
        <circle cx="70" cy="70" :r="radius" class="text-gray-100 dark:text-gray-800 stroke-currentColor" stroke-width="12" fill="none" />

        <!-- Trabalho Regular (Indigo) -->
        <circle cx="70" cy="70" :r="radius" class="text-indigo-500 stroke-currentColor transition-all duration-1000 ease-out"
                stroke-width="12" fill="none"
                :stroke-dasharray="segments.regular.dasharray"
                :stroke-dashoffset="segments.regular.dashoffset" />

        <!-- Horas Extras (Amber) -->
        <circle cx="70" cy="70" :r="radius" class="text-amber-500 stroke-currentColor transition-all duration-1000 ease-out"
                stroke-width="12" fill="none"
                :stroke-dasharray="segments.overtime.dasharray"
                :stroke-dashoffset="segments.overtime.dashoffset" />

        <!-- Faltas/Atrasos (Red) -->
        <circle cx="70" cy="70" :r="radius" class="text-red-500 stroke-currentColor transition-all duration-1000 ease-out"
                stroke-width="12" fill="none"
                :stroke-dasharray="segments.absence.dasharray"
                :stroke-dashoffset="segments.absence.dashoffset" />
      </svg>

      <div class="absolute flex flex-col items-center justify-center text-center">
        <span class="text-2xl font-black text-gray-900 dark:text-white">
            {{ formatDecimalHours(distribution.totalExpectedHours) }}
        </span>
        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{{ t.dashboard.totalMonth }}</span>
      </div>
    </div>

    <div class="flex items-center justify-between w-full border-t border-gray-100 dark:border-gray-800" :class="legendContainerClass">
      <div class="flex flex-col items-center text-center px-2">
        <div class="w-3 h-3 rounded-full bg-indigo-500 mb-1"></div>
        <span class="text-sm font-bold text-gray-900 dark:text-white">{{ formatDecimalHours(distribution.regularHours) }}</span>
        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{{ t.dashboard.regular }}</span>
      </div>
      <div class="w-px h-8 bg-gray-100 dark:bg-gray-800"></div>
      <div class="flex flex-col items-center text-center px-2">
        <div class="w-3 h-3 rounded-full bg-amber-500 mb-1"></div>
        <span class="text-sm font-bold text-amber-600">{{ formatDecimalHours(distribution.overtimeHours) }}</span>
        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{{ t.dashboard.extra }}</span>
      </div>
      <div class="w-px h-8 bg-gray-100 dark:bg-gray-800"></div>
      <div class="flex flex-col items-center text-center px-2">
        <div class="w-3 h-3 rounded-full bg-red-500 mb-1"></div>
        <span class="text-sm font-bold text-red-600">{{ formatDecimalHours(distribution.absenceHours) }}</span>
        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{{ t.dashboard.absences }}</span>
      </div>
    </div>
  </div>
</template>