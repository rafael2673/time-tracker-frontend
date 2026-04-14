<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { CalendarClock, AlertCircle } from 'lucide-vue-next'
import { useTimeRecordsStore } from '~/stores/timeRecords'
import { useSummaryStore } from '~/stores/summary'
import { useLocale } from '~/composables/useLocale'

import EmployeeProfileHeader from '~/components/molecules/EmployeeProfileHeader.vue'
import EmployeeSummaryCards from '~/components/molecules/EmployeeSummaryCards.vue'
import YearlyEvolutionChart from '~/components/organisms/YearlyEvolutionChart.vue'
import WeeklyEvolutionChart from '~/components/organisms/WeeklyEvolutionChart.vue'
import DailyRecordsTimeline from '~/components/organisms/DailyRecordsTimeline.vue'

const props = defineProps<{
  currentRole?: string
  selectedEmployee?: any
  onBackToCompany?: () => void
  onHandlePunch?: () => Promise<void>
}>()

const timeRecordsStore = useTimeRecordsStore()
const summaryStore = useSummaryStore()
const { t } = useLocale()

const selectedYear = ref<number>(new Date().getFullYear())

onMounted(async () => {
  if (props.selectedEmployee?.id) {
    await carregarDados(props.selectedEmployee.id)
  }
})

// Adicionamos esse watch para carregar os dados assim que o usuário terminar de ser buscado no backend
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
  await Promise.all([
    summaryStore.fetchAvailableYears(),
    summaryStore.fetchEmployeeSummary(employeeId),
    summaryStore.fetchYearlySummary(selectedYear.value),
    summaryStore.fetchWeeklySummary(new Date().toISOString().split('T')[0] || ''),
    summaryStore.fetchNextHoliday()
  ])
}

function formatDate(isoString: string) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })
}
</script>
<template>
  <div class="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-300">
    <EmployeeProfileHeader
        :current-role="props.currentRole"
        :selected-employee="props.selectedEmployee"
        :is-punching="timeRecordsStore.isPunching"
        @back="props.onBackToCompany"
        @punch="props.onHandlePunch"
    />

    <EmployeeSummaryCards
        :is-loading="summaryStore.isLoadingSummary"
        :summary="summaryStore.employeeSummary"
    />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 flex flex-col gap-6">

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-if="summaryStore.nextHoliday" class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden h-full min-h-[160px]">
            <div class="absolute -right-6 -top-6 text-white/10">
              <CalendarClock :size="120" />
            </div>
            <div>
                    <span class="text-xs font-bold uppercase tracking-widest text-indigo-100 mb-1 block">
                        {{ t.dashboard.nextHoliday }}
                    </span>
              <h3 class="text-xl font-bold leading-tight">{{ summaryStore.nextHoliday.name }}</h3>
            </div>
            <div class="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
              <span class="text-sm font-medium">{{ formatDate(summaryStore.nextHoliday.date) }}</span>
              <span v-if="summaryStore.nextHoliday.multiplier === 0" class="text-xs font-bold bg-white/20 px-2 py-1 rounded-md uppercase">{{ t.dashboard.fullDayOff }}</span>
              <span v-else class="text-xs font-bold bg-white/20 px-2 py-1 rounded-md uppercase">{{ t.dashboard.halfDayOff }}</span>
            </div>
          </div>

          <div v-if="(summaryStore.employeeSummary?.pendingJustifications || 0) > 0" class="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-3xl p-5 shadow-sm text-amber-800 dark:text-amber-500 flex items-start gap-4 h-full min-h-[160px]">
            <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl shrink-0 mt-0.5">
              <AlertCircle :size="20" class="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 class="text-sm font-bold">{{ t.dashboard.pendingAlertTitle }}</h4>
              <p class="text-xs mt-1 font-medium opacity-80">{{ t.dashboard.pendingAlertDesc }}</p>
            </div>
          </div>
        </div>

        <YearlyEvolutionChart
            :data="summaryStore.yearlySummary"
            :available-years="summaryStore.availableYears"
            v-model="selectedYear"
            :title="t.dashboard.yearlyEvolutionBaseline"
        />

        <WeeklyEvolutionChart
            :data="summaryStore.weeklySummary"
        />
      </div>

      <DailyRecordsTimeline
          :is-loading="timeRecordsStore.isLoading"
          :records="timeRecordsStore.dailyRecords"
      />
    </div>

  </div>
</template>