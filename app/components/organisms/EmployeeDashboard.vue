<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useTimeRecordsStore } from '~/stores/timeRecords'
import { useSummaryStore } from '~/stores/summary'

import EmployeeProfileHeader from '~/components/molecules/EmployeeProfileHeader.vue'
import EmployeeSummaryCards from '~/components/molecules/EmployeeSummaryCards.vue'
import YearlyEvolutionChart from '~/components/organisms/YearlyEvolutionChart.vue'
import WeeklyEvolutionChart from '~/components/organisms/WeeklyEvolutionChart.vue'
import DailyRecordsTimeline from '~/components/organisms/DailyRecordsTimeline.vue'
import {useLocale} from "~/composables/useLocale";

const props = defineProps<{
  currentRole: string
  selectedEmployee: any
  onBackToCompany: () => void
  onHandlePunch: () => Promise<void>
}>()

const timeRecordsStore = useTimeRecordsStore()
const summaryStore = useSummaryStore()

const selectedYear = ref<number>(new Date().getFullYear())

onMounted(async () => {
  if (props.selectedEmployee?.id) {
    await Promise.all([
      summaryStore.fetchAvailableYears(),
      summaryStore.fetchEmployeeSummary(props.selectedEmployee.id),
      summaryStore.fetchYearlySummary(selectedYear.value),
      summaryStore.fetchWeeklySummary(new Date().toISOString().split('T')[0] || '')
    ])
  }
})

watch(selectedYear, async (newYear) => {
  if (newYear) {
    await summaryStore.fetchYearlySummary(newYear)
  }
})
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
        <YearlyEvolutionChart
            :data="summaryStore.yearlySummary"
            :available-years="summaryStore.availableYears"
            v-model="selectedYear"
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