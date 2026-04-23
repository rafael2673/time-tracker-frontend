<script setup lang="ts">
import { ref } from 'vue'
import { TrendingDown, X, Clock } from 'lucide-vue-next'
import type { LaborRiskRankingResponse } from '~/stores/summary'
import { useEmployeesStore } from '~/stores/employees'
import { useSpecialDatesStore } from '~/stores/specialDates'
import { formatDecimalHours } from '~/utils/timeFormatter'
import { useLocale } from '~/composables/useLocale'
import BaseDatePicker from '~/components/atoms/BaseDatePicker.vue'
import ToastNotification from '~/components/molecules/ToastNotification.vue'

defineProps<{
  ranking: LaborRiskRankingResponse
}>()

const { t } = useLocale()
const employeesStore = useEmployeesStore()
const specialDatesStore = useSpecialDatesStore()

const showLeaveForm = ref(false)
const leaveDate = ref('')
const isSubmitting = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

function showToast(msg: string, type: 'success' | 'error') {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => toastMessage.value = '', 3000)
}

async function submitCollectiveLeave() {
  if (!leaveDate.value) return
  isSubmitting.value = true
  
  try {
    await specialDatesStore.create({
      date: leaveDate.value,
      description: t.value.dashboard.collectiveLeaveReason,
      workloadMultiplier: 0,
      isRecurring: false,
      type: 'COMPENSATORY_COLLECTIVE'
    })

    await employeesStore.createCollectiveCompensatoryLeave({
      date: leaveDate.value,
      reason: t.value.dashboard.collectiveLeaveReason,
      onlyEligible: true
    })
    
    showToast(t.value.dashboard.collectiveLeaveSuccess, 'success')
    showLeaveForm.value = false
    leaveDate.value = ''
  } catch (e) {
    showToast('Erro ao aplicar folga', 'error')
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
          <Clock :size="24" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t.dashboard.laborRiskTitle }}</h3>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t.dashboard.laborRiskSubtitle }}</p>
        </div>
      </div>
      
      <div class="space-y-4 flex-1">
        <div v-if="!ranking.topPositive.length" class="text-center py-6 text-gray-500 font-medium text-sm">
          {{ t.dashboard.noPositiveBank }}
        </div>
        <div v-for="(emp, index) in ranking.topPositive" :key="emp.employeeId" class="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors gap-3">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center font-bold text-emerald-600 shadow-sm shrink-0 border border-emerald-100 dark:border-emerald-900">
              {{ index + 1 }}º
            </div>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-sm font-bold text-gray-900 dark:text-white truncate block" :title="emp.fullName">{{ emp.fullName }}</span>
            </div>
          </div>
          <span class="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg shrink-0">
            +{{ formatDecimalHours(emp.balance) }}
          </span>
        </div>
      </div>
      
      <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800" v-if="ranking.topPositive.length > 0">
        <button v-if="!showLeaveForm" @click="showLeaveForm = true" class="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
          {{ t.dashboard.abateWithCollectiveLeave }}
        </button>
        <div v-else class="flex flex-col gap-3">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="w-full sm:flex-1 min-w-0">
              <BaseDatePicker v-model="leaveDate" />
            </div>
            <div class="flex gap-2 w-full sm:w-auto shrink-0">
              <button 
                @click="submitCollectiveLeave" 
                class="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all text-sm shrink-0 disabled:opacity-50 shadow-sm active:scale-95" 
                :disabled="!leaveDate || isSubmitting"
              >
                {{ isSubmitting ? '...' : t.dashboard.confirm }}
              </button>
              <button 
                @click="showLeaveForm = false" 
                class="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-800"
                :title="t.dashboard.cancel"
              >
                <X :size="20" />
              </button>
            </div>
          </div>
          <p class="text-[10px] text-gray-500 font-medium leading-tight px-1 italic">
            {{ t.dashboard.collectiveLeaveNote }}
          </p>
        </div>
      </div>
    </div>
    
    <ToastNotification :message="toastMessage" :type="toastType" />

    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl">
          <TrendingDown :size="24" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t.dashboard.debtorsTitle }}</h3>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t.dashboard.debtorsSubtitle }}</p>
        </div>
      </div>
      
      <div class="space-y-4 flex-1">
        <div v-if="!ranking.topNegative.length" class="text-center py-6 text-gray-500 font-medium text-sm">
          {{ t.dashboard.noNegativeBank }}
        </div>
        <div v-for="(emp, index) in ranking.topNegative" :key="emp.employeeId" class="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-900 transition-colors gap-3">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center font-bold text-amber-600 shadow-sm shrink-0 border border-amber-100 dark:border-amber-900">
              {{ index + 1 }}º
            </div>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-sm font-bold text-gray-900 dark:text-white truncate block" :title="emp.fullName">{{ emp.fullName }}</span>
            </div>
          </div>
          <span class="text-amber-600 dark:text-amber-400 font-bold tabular-nums bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-lg shrink-0">
            {{ formatDecimalHours(emp.balance) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>