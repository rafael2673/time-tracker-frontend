<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDays, Clock, AlertCircle } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import type { EmployeeDashboardSummary } from '~/stores/summary'
import { formatDecimalHours } from '~/utils/timeFormatter'

const props = defineProps<{
  isLoading: boolean
  summary: EmployeeDashboardSummary | null
}>()

const { t } = useLocale()

const balanceClass = computed(() => {
  if (props.summary?.balance === undefined || props.summary?.balance === null) return 'text-gray-900 dark:text-white'
  return props.summary.balance < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-emerald-600 dark:text-emerald-400'
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all relative overflow-hidden group" :class="props.isLoading ? 'opacity-60' : ''">
      <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-2xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors pointer-events-none"></div>
      <div class="flex items-start justify-between mb-4 relative z-10">
        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl w-fit">
          <CalendarDays :size="24" />
        </div>
      </div>
      <div class="relative z-10">
        <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
          {{ props.summary !== null ? formatDecimalHours(props.summary.workedHours) : '--' }}
        </h3>
        <p class="text-sm font-bold uppercase tracking-wider text-gray-400 mt-1">Horas Trab. (Trimestre)</p>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all relative overflow-hidden group" :class="props.isLoading ? 'opacity-60' : ''">
      <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-2xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/20 transition-colors pointer-events-none"></div>
      <div class="flex items-start justify-between mb-4 relative z-10">
        <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit">
          <Clock :size="24" />
        </div>
      </div>
      <div class="relative z-10">
        <h3 class="text-3xl font-bold tabular-nums" :class="balanceClass">
          {{ props.summary !== null ? formatDecimalHours(props.summary.balance) : '--' }}
        </h3>
        <p class="text-sm font-bold uppercase tracking-wider text-gray-400 mt-1">Saldo (Trimestre)</p>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all relative overflow-hidden group" :class="props.isLoading ? 'opacity-60' : ''">
      <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 dark:bg-amber-900/10 rounded-full blur-2xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/20 transition-colors pointer-events-none"></div>
      <div class="flex items-start justify-between mb-4 relative z-10">
        <div class="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl w-fit">
          <AlertCircle :size="24" />
        </div>
      </div>
      <div class="relative z-10">
        <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
          {{ props.summary !== null ? props.summary.pendingJustifications : '--' }}
        </h3>
        <p class="text-sm font-bold uppercase tracking-wider text-gray-400 mt-1">{{ t.dashboard.pendingJustifications }}</p>
      </div>
    </div>
  </div>
</template>