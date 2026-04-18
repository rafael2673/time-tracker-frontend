<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { AlertCircle, CalendarDays } from 'lucide-vue-next'
import { useTimeRecordsStore } from '~/stores/timeRecords'
import { useSummaryStore } from '~/stores/summary'
import { useLocale } from '~/composables/useLocale'
import { formatDecimalHours } from '~/utils/timeFormatter'

import EmployeeProfileHeader from '~/components/molecules/EmployeeProfileHeader.vue'
import EmployeeSummaryCards from '~/components/molecules/EmployeeSummaryCards.vue'
import YearlyEvolutionChart from '~/components/organisms/YearlyEvolutionChart.vue'
import WeeklyEvolutionChart from '~/components/organisms/WeeklyEvolutionChart.vue'
import DailyRecordsTimeline from '~/components/organisms/DailyRecordsTimeline.vue'
import TimeDistributionPieChart from '~/components/organisms/TimeDistributionPieChart.vue'

const props = defineProps<{
  currentRole?: string
  selectedEmployee?: any
  onBackToCompany?: () => void
  onHandlePunch?: () => Promise<void>
}>()

const timeRecordsStore = useTimeRecordsStore()
const summaryStore = useSummaryStore()
const { t, locale } = useLocale()

const selectedYear = ref<number>(new Date().getFullYear())
const hasHoliday = computed(() => Boolean(summaryStore.nextHoliday))
const pendingJustifications = computed(() => summaryStore.employeeSummary?.pendingJustifications || 0)
const hasPendingJustifications = computed(() => pendingJustifications.value > 0)
const hasTimeDistribution = computed(() => Boolean(summaryStore.employeeTimeDistribution))
const workedProgressPercentage = computed(() => {
  const summary = summaryStore.employeeSummary
  if (!summary?.expectedHours || summary.expectedHours <= 0) return 0
  return Math.min(Math.round((summary.workedHours / summary.expectedHours) * 100), 100)
})

onMounted(async () => {
  if (props.selectedEmployee?.id) {
    await carregarDados(props.selectedEmployee.id)
  }
})

watch(() => props.selectedEmployee, async (newEmployee) => {
  if (newEmployee?.id) {
    await carregarDados(newEmployee.id)
  }
}, { immediate: true })

watch(selectedYear, async (newYear) => {
  if (newYear) {
    await summaryStore.fetchYearlySummary(newYear)
  }
})

async function carregarDados(employeeId: string) {
  const now = new Date()
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  await Promise.all([
    summaryStore.fetchAvailableYears(),
    summaryStore.fetchEmployeeSummary(employeeId),
    summaryStore.fetchYearlySummary(selectedYear.value),
    summaryStore.fetchWeeklySummary(now.toISOString().split('T')[0] || ''),
    summaryStore.fetchNextHoliday(employeeId),
    summaryStore.fetchEmployeeTimeDistribution(employeeId, previousMonthDate.getFullYear(), previousMonthDate.getMonth() + 1)
  ])
}

function formatDate(isoString: string) {
  if (!isoString) return ''

  // LocalDate from backend arrives as YYYY-MM-DD; parse as local date to avoid timezone shift.
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    const [year, month, day] = isoString.split('-').map(Number)
    const date = new Date(year || 0, (month || 1) - 1, day || 1)
    return date.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const date = new Date(isoString)
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })
}

const nextHolidayDateMeta = computed(() => {
  const isoDate = summaryStore.nextHoliday?.date
  if (!isoDate) {
    return null
  }

  let parsedDate: Date
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const [year, month, day] = isoDate.split('-').map(Number)
    parsedDate = new Date(year || 0, (month || 1) - 1, day || 1)
  } else {
    parsedDate = new Date(isoDate)
  }

  const weekdayShortRaw = parsedDate.toLocaleDateString(locale.value || undefined, { weekday: 'short' })
  const weekdayShort = weekdayShortRaw.replace('.', '').slice(0, 3).toUpperCase()

  return {
    weekdayShort,
    dayNumber: String(parsedDate.getDate()).padStart(2, '0'),
    fullDateLabel: parsedDate.toLocaleDateString(locale.value || undefined, {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }
})
</script>

<template>
  <div class="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-300">
    <!-- Top Layout: Profile/Action + Quick Metrics -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Profile & Main Action (8 cols) -->
      <div class="lg:col-span-8">
        <EmployeeProfileHeader
            :current-role="props.currentRole"
            :selected-employee="props.selectedEmployee"
            :is-punching="timeRecordsStore.isPunching"
            @back="props.onBackToCompany"
            @punch="props.onHandlePunch"
            class="h-full"
        />
      </div>
      
      <!-- Next Special Date Highlight (4 cols) -->
      <div class="lg:col-span-4 flex" :class="props.currentRole !== 'EMPLOYEE' ? 'lg:pt-9' : ''">
        <div v-if="hasHoliday" class="bg-linear-to-br from-indigo-600 to-indigo-700 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden group w-full h-full">
          <div class="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors pointer-events-none"></div>
          <div class="relative z-10 h-full flex items-stretch gap-4">
            <div class="w-18 rounded-2xl bg-white/20 border border-white/25 flex flex-col items-center justify-center shrink-0">
              <span class="text-[10px] font-black tracking-widest text-indigo-100">{{ nextHolidayDateMeta?.weekdayShort || '---' }}</span>
              <span class="text-3xl font-black leading-none mt-1">{{ nextHolidayDateMeta?.dayNumber || '--' }}</span>
            </div>

            <div class="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-100 opacity-80 block">{{ t.dashboard.nextHoliday }}</span>
                <h3 class="text-3xl font-black leading-tight mt-1">{{ summaryStore.nextHoliday?.name || '' }}</h3>
              </div>

              <div class="pt-3 border-t border-white/20 flex items-center justify-between gap-3 mt-3">
                <span class="text-sm font-bold">{{ nextHolidayDateMeta?.fullDateLabel || formatDate(summaryStore.nextHoliday?.date || '') }}</span>
                <span v-if="summaryStore.nextHoliday?.multiplier === 0" class="text-[10px] font-black bg-white/20 px-2 py-1 rounded-md uppercase">{{ t.dashboard.fullDayOff }}</span>
                <span v-else class="text-[10px] font-black bg-white/20 px-2 py-1 rounded-md uppercase">{{ t.dashboard.halfDayOff }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center w-full h-full">
          <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">{{ t.dashboard.nextHoliday }}</span>
          <p class="text-base font-bold text-gray-900 dark:text-white mt-2">Sem data especial futura</p>
        </div>
      </div>
    </div>

    <!-- Secondary Summary Cards -->
    <EmployeeSummaryCards
        :is-loading="summaryStore.isLoadingSummary"
        :summary="summaryStore.employeeSummary"
        primary-card="balance"
        mode="compact"
    />

    <!-- Main Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

      <!-- Left Column: Main Charts (Col 1-9) -->
      <div class="col-span-12 xl:col-span-8 2xl:col-span-9 flex flex-col gap-6">

        <!-- Weekly Activity & Insights Row -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-8 h-full">
             <WeeklyEvolutionChart :data="summaryStore.weeklySummary" class="h-full" />
          </div>
          
          <div class="lg:col-span-4 flex flex-col gap-6 h-full">
            <div
              class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden"
              :class="hasPendingJustifications ? 'min-h-52' : 'flex-1'"
            >
              <div class="absolute -right-5 -top-5 text-blue-500/5">
                <CalendarDays :size="110" />
              </div>
              <div class="flex items-start justify-between mb-4 relative z-10">
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl w-fit">
                  <CalendarDays :size="22" />
                </div>
                <div class="text-right">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ t.dashboard.progress }}</span>
                  <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ workedProgressPercentage }}%</p>
                </div>
              </div>
              <div class="relative z-10">
                <div class="flex items-baseline gap-2">
                  <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                    {{ summaryStore.employeeSummary ? formatDecimalHours(summaryStore.employeeSummary.workedHours) : '--' }}
                  </h3>
                  <span class="text-gray-400 font-medium text-xs">/ {{ summaryStore.employeeSummary ? formatDecimalHours(summaryStore.employeeSummary.expectedHours) : '--' }}</span>
                </div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">{{ t.dashboard.workedHoursQuarter }}</p>
                <div class="mt-4 w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-1000 ease-out" :style="{ width: `${workedProgressPercentage}%` }"></div>
                </div>
              </div>
            </div>

            <div
              v-if="hasPendingJustifications"
              class="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-3xl p-6 shadow-sm text-amber-900 dark:text-amber-400 flex items-start gap-4 h-full"
            >
              <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl shrink-0">
                <AlertCircle :size="20" class="text-amber-600" />
              </div>
              <div>
                <h4 class="text-sm font-bold">{{ t.dashboard.pendingAlertTitle }}</h4>
                <p class="text-xs mt-1 font-medium opacity-80">{{ t.dashboard.pendingAlertDesc }}</p>
                <p class="text-xl font-black mt-2">{{ pendingJustifications }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row: Yearly Evolution -->
        <YearlyEvolutionChart
            :data="summaryStore.yearlySummary"
            :available-years="summaryStore.availableYears"
            v-model="selectedYear"
            :title="t.dashboard.yearlyEvolutionBaseline"
        />
      </div>

      <!-- Right Column: Timeline (Col 10-12) -->
      <div class="col-span-12 xl:col-span-4 2xl:col-span-3 flex flex-col gap-6">
        <TimeDistributionPieChart
          v-if="hasTimeDistribution && summaryStore.employeeTimeDistribution"
          :distribution="summaryStore.employeeTimeDistribution"
          compact
        />
        <DailyRecordsTimeline
            :is-loading="timeRecordsStore.isLoading"
            :records="timeRecordsStore.dailyRecords"
        />
      </div>
    </div>
  </div>
</template>