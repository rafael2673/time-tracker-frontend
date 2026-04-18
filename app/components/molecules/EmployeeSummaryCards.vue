<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDays, Clock, AlertCircle, TreePalm, CircleX } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import type { EmployeeDashboardSummary } from '~/stores/summary'
import { formatDecimalHours } from '~/utils/timeFormatter'

const props = defineProps<{
  isLoading: boolean
  summary: EmployeeDashboardSummary | null
  mode?: 'default' | 'compact'
  primaryCard?: 'worked' | 'balance'
}>()

const { t } = useLocale()

const balanceClass = computed(() => {
  if (props.summary?.balance === undefined || props.summary?.balance === null) return 'text-gray-900 dark:text-white'
  return props.summary.balance < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-emerald-600 dark:text-emerald-400'
})

const monthlyBalanceClass = computed(() => {
  if (props.summary?.monthlyBalance === undefined || props.summary?.monthlyBalance === null) return 'text-gray-900 dark:text-white'
  return props.summary.monthlyBalance < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-emerald-600 dark:text-emerald-400'
})

const progressPercentage = computed(() => {
  if (!props.summary?.expectedHours || props.summary.expectedHours <= 0) return 0
  const percentage = (props.summary.workedHours / props.summary.expectedHours) * 100
  return Math.min(Math.round(percentage), 100)
})

const isCompact = computed(() => props.mode === 'compact')
const showBalanceAsPrimary = computed(() => props.primaryCard === 'balance')
</script>

<template>
  <div class="grid grid-cols-1 gap-6" :class="isCompact ? 'md:grid-cols-3' : ''">
    <!-- Primary Card: Worked Hours or Quarter Balance -->
    <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all relative overflow-hidden group" :class="[props.isLoading ? 'opacity-60' : '', isCompact ? 'h-full' : '']">
      <div class="absolute -right-4 -top-4 w-32 h-32 rounded-full blur-2xl transition-colors pointer-events-none"
           :class="showBalanceAsPrimary ? 'bg-emerald-50 dark:bg-emerald-900/10 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/20' : 'bg-blue-50 dark:bg-blue-900/10 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20'">
      </div>

      <div v-if="!showBalanceAsPrimary" class="flex items-start justify-between mb-4 relative z-10">
        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl w-fit">
          <CalendarDays :size="24" />
        </div>
        <div v-if="props.summary" class="text-right">
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ t.dashboard.progress }}</span>
          <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ progressPercentage }}%</p>
        </div>
      </div>

      <div v-else class="flex items-start justify-between mb-4 relative z-10">
        <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit">
          <Clock :size="24" />
        </div>
      </div>

      <div class="relative z-10">
        <template v-if="!showBalanceAsPrimary">
          <div class="flex items-baseline gap-2">
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
              {{ props.summary !== null ? formatDecimalHours(props.summary.workedHours) : '--' }}
            </h3>
            <span class="text-gray-400 font-medium text-xs">/ {{ props.summary !== null ? formatDecimalHours(props.summary.expectedHours) : '--' }}</span>
          </div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">{{ t.dashboard.workedHoursQuarter }}</p>

          <div class="mt-4 w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div
              class="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-1000 ease-out"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </template>

        <template v-else>
          <h3 class="text-3xl font-bold tabular-nums" :class="balanceClass">
            {{ props.summary !== null ? formatDecimalHours(props.summary.balance) : '--' }}
          </h3>
          <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">{{ t.dashboard.balanceQuarter }}</p>
          <div v-if="props.summary" class="mt-2 flex items-center gap-1">
            <span class="text-[10px] font-bold uppercase text-gray-400">{{ t.dashboard.monthly }}:</span>
            <span class="text-[10px] font-bold tabular-nums" :class="monthlyBalanceClass">{{ formatDecimalHours(props.summary.monthlyBalance) }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Absences Card -->
    <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all relative overflow-hidden group" :class="[props.isLoading ? 'opacity-60' : '', isCompact ? 'h-full' : '']">
      <div class="absolute -right-4 -top-4 w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full blur-2xl group-hover:bg-red-100 dark:group-hover:bg-red-900/20 transition-colors pointer-events-none"></div>
      <div class="flex items-start justify-between mb-4 relative z-10">
        <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl w-fit">
          <CircleX :size="24" />
        </div>
      </div>
      <div class="relative z-10">
        <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
          {{ props.summary !== null ? props.summary.unjustifiedAbsences : '--' }}
        </h3>
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">{{ t.dashboard.unjustifiedAbsences }}</p>
        <div v-if="(props.summary?.pendingJustifications || 0) > 0" class="mt-2 flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <AlertCircle :size="12" />
          <span class="text-[10px] font-bold">{{ props.summary?.pendingJustifications }} {{ t.dashboard.pending }}</span>
        </div>
      </div>
    </div>

    <!-- Vacation Card -->
    <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all relative overflow-hidden group" :class="[props.isLoading ? 'opacity-60' : '', isCompact ? 'h-full' : '']">
      <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 dark:bg-amber-900/10 rounded-full blur-2xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/20 transition-colors pointer-events-none"></div>
      <div class="flex items-start justify-between mb-4 relative z-10">
        <div class="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl w-fit">
          <TreePalm :size="24" />
        </div>
      </div>
      <div class="relative z-10">
        <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
          {{ props.summary !== null ? props.summary.vacationDays : '--' }}
        </h3>
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">{{ t.dashboard.vacationDays }}</p>
      </div>
    </div>

    <!-- Balance Card (Only in default mode) -->
    <div v-if="!isCompact && !showBalanceAsPrimary" class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all relative overflow-hidden group" :class="props.isLoading ? 'opacity-60' : ''">
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
        <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">{{ t.dashboard.balanceQuarter }}</p>
        <div v-if="props.summary" class="mt-2 flex items-center gap-1">
          <span class="text-[10px] font-bold uppercase text-gray-400">{{ t.dashboard.monthly }}:</span>
          <span class="text-[10px] font-bold tabular-nums" :class="monthlyBalanceClass">{{ formatDecimalHours(props.summary.monthlyBalance) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>