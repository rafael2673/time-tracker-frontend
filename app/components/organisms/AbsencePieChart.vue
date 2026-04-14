<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
  totalExpectedDays: number
  totalAbsences: number
  percentage: number
  title: string
}>()

const { t } = useLocale()
const radius = 60
const circumference = 2 * Math.PI * radius
const dashoffset = computed(() => circumference - (props.percentage / 100) * circumference)
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm w-full flex flex-col items-center justify-center relative">
    <h3 class="text-sm font-bold text-gray-900 dark:text-white w-full text-left absolute top-6 left-6">{{ title }}</h3>

    <div class="relative w-40 h-40 mt-8 flex items-center justify-center">
      <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
        <circle cx="70" cy="70" :r="radius" class="text-gray-100 dark:text-gray-800 stroke-currentColor" stroke-width="12" fill="none" />

        <circle cx="70" cy="70" :r="radius" class="text-red-500 stroke-currentColor transition-all duration-1000 ease-out"
                stroke-width="12" fill="none" stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="dashoffset" />
      </svg>

      <div class="absolute flex flex-col items-center justify-center text-center">
                <span class="text-2xl font-black" :class="percentage > 10 ? 'text-red-500' : 'text-gray-900 dark:text-white'">
                    {{ percentage.toFixed(1) }}%
                </span>
        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{{ t.dashboard.absenceRate }}</span>
      </div>
    </div>

    <div class="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 w-full justify-center">
      <div class="flex flex-col items-center text-center">
        <span class="text-lg font-bold text-gray-900 dark:text-white leading-none">{{ totalExpectedDays }}</span>
        <span class="text-xs font-medium text-gray-500 mt-1">{{ t.dashboard.expectedDays }}</span>
      </div>
      <div class="w-px h-8 bg-gray-100 dark:bg-gray-800"></div>
      <div class="flex flex-col items-center text-center">
        <span class="text-lg font-bold text-red-500 leading-none">{{ totalAbsences }}</span>
        <span class="text-xs font-medium text-gray-500 mt-1">{{ t.dashboard.unjustifiedAbsences }}</span>
      </div>
    </div>
  </div>
</template>