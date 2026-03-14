<script setup lang="ts">
import { computed } from 'vue'
import { Loader2, Calendar } from 'lucide-vue-next'
import type { MonthSummaryResponse } from '~/stores/summary'
import { useLocale } from "~/composables/useLocale"
import BaseSelect from '~/components/atoms/BaseSelect.vue'
import { formatDecimalHours } from '~/utils/timeFormatter'

const props = defineProps<{
  data: MonthSummaryResponse[]
  availableYears: number[]
  modelValue: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const maxScaleHours = computed(() => {
  if (!props.data || props.data.length === 0) return 1
  const maxWorked = Math.max(...props.data.map(m => m.workedHours))
  const maxExpected = Math.max(...props.data.map(m => m.expectedHours))
  const max = Math.max(maxWorked, maxExpected)
  return max > 0 ? max : 1
})

const yearOptions = computed(() => {
  return props.availableYears.map(year => ({
    value: year,
    label: String(year),
    icon: Calendar
  }))
})

const { t } = useLocale()
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col h-72">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{{ t.chart.evolution.year }}</h3>

      <div v-if="props.availableYears.length > 0" class="w-32">
        <BaseSelect
            :model-value="props.modelValue"
            :options="yearOptions"
            @update:model-value="val => emit('update:modelValue', Number(val))"
        />
      </div>
    </div>

    <div class="flex-1 flex gap-2" v-if="props.data.length > 0">
      <div v-for="month in props.data" :key="month.month" class="flex-1 flex flex-col items-center gap-2 group cursor-default relative">
        <div class="w-full flex-1 relative bg-gray-100 dark:bg-gray-800 rounded-t-md">

          <div
              v-if="month.expectedHours > 0"
              class="absolute bottom-0 left-0 w-full bg-gray-200 dark:bg-gray-700 rounded-t-md z-0"
              :style="{ height: `${(month.expectedHours / maxScaleHours) * 100}%` }"
          ></div>

          <div
              class="absolute bottom-0 left-0 w-full rounded-t-md transition-all duration-500 ease-out z-10"
              :class="month.workedHours >= month.expectedHours ? 'bg-emerald-500 dark:bg-emerald-600 group-hover:bg-emerald-400' : 'bg-indigo-500 dark:bg-indigo-600 group-hover:bg-indigo-400'"
              :style="{ height: `${(month.workedHours / maxScaleHours) * 100}%` }"
          ></div>

          <div
              v-if="month.expectedHours > 0"
              class="absolute bottom-0 left-0 w-full border-t-2 border-dashed border-gray-400 dark:border-gray-500 z-20 pointer-events-none"
              :style="{ height: `${(month.expectedHours / maxScaleHours) * 100}%` }"
          ></div>

          <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-2 py-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap flex flex-col items-center">
            <span>{{ formatDecimalHours(month.workedHours) }} / {{ formatDecimalHours(month.expectedHours) }}</span>
          </div>
        </div>
        <span class="text-[10px] font-bold text-gray-500 uppercase">{{ month.monthName }}</span>
      </div>
    </div>
    <div v-else class="flex-1 flex items-center justify-center opacity-50">
      <Loader2 class="animate-spin text-indigo-500" />
    </div>
  </div>
</template>