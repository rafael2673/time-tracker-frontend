<script setup lang="ts">
import { ref } from 'vue'
import { AlertTriangle, TrendingDown } from 'lucide-vue-next'
import type { LaborRiskRankingResponse } from '~/stores/summary'
import { useEmployeesStore } from '~/stores/employees'
import { formatDecimalHours } from '~/utils/timeFormatter'

const props = defineProps<{
  ranking: LaborRiskRankingResponse
}>()

const employeesStore = useEmployeesStore()

const showLeaveForm = ref(false)
const leaveDate = ref('')
const isSubmitting = ref(false)
const leaveSuccess = ref(false)

async function submitCollectiveLeave() {
  if (!leaveDate.value) return
  isSubmitting.value = true
  leaveSuccess.value = false
  
  try {
    await employeesStore.createCollectiveCompensatoryLeave({
      date: leaveDate.value,
      reason: 'Folga Compensatória (Abatimento de Banco de Horas)'
    })
    leaveSuccess.value = true
    setTimeout(() => {
      showLeaveForm.value = false
      leaveSuccess.value = false
      leaveDate.value = ''
    }, 3000)
  } catch (e) {
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    const firstChar = parts[0]?.charAt(0) || ''
    const lastChar = parts[parts.length - 1]?.charAt(0) || ''
    return (firstChar + lastChar).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
    <!-- Top Positivos (Risco Trabalhista) -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl">
          <AlertTriangle :size="24" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Risco Trabalhista</h3>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Maior volume de horas extras</p>
        </div>
      </div>
      
      <div class="space-y-4 flex-1">
        <div v-if="!ranking.topPositive.length" class="text-center py-6 text-gray-500 font-medium text-sm">
          Nenhum banco de horas positivo no trimestre.
        </div>
        <div v-for="(emp, index) in ranking.topPositive" :key="emp.employeeId" class="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center font-bold text-red-600 shadow-sm shrink-0 border border-red-100 dark:border-red-900">
              {{ index + 1 }}º
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-[200px]" :title="emp.fullName">{{ emp.fullName }}</span>
            </div>
          </div>
          <span class="text-red-600 dark:text-red-400 font-bold tabular-nums bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">
            +{{ formatDecimalHours(emp.balance) }}
          </span>
        </div>
      </div>
      
      <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800" v-if="ranking.topPositive.length > 0">
        <button v-if="!showLeaveForm" @click="showLeaveForm = true" class="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
          Abater com Folga Coletiva
        </button>
        <div v-else class="flex gap-2 items-center">
          <input type="date" v-model="leaveDate" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-sm dark:bg-gray-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-red-500" />
          <button @click="submitCollectiveLeave" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-sm shrink-0 disabled:opacity-50" :disabled="!leaveDate || isSubmitting">
            Confirmar
          </button>
          <button @click="showLeaveForm = false" class="px-3 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm shrink-0">
            Cancelar
          </button>
        </div>
        <p v-if="leaveSuccess" class="text-emerald-600 text-xs mt-2 font-medium text-center">Folga aplicada com sucesso aos funcionários com saldo > 8h!</p>
      </div>
    </div>

    <!-- Top Negativos (Devedores) -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl">
          <TrendingDown :size="24" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Devedores de Horas</h3>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Maior volume de horas negativas</p>
        </div>
      </div>
      
      <div class="space-y-4 flex-1">
        <div v-if="!ranking.topNegative.length" class="text-center py-6 text-gray-500 font-medium text-sm">
          Nenhum banco de horas negativo no trimestre.
        </div>
        <div v-for="(emp, index) in ranking.topNegative" :key="emp.employeeId" class="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-900 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center font-bold text-amber-600 shadow-sm shrink-0 border border-amber-100 dark:border-amber-900">
              {{ index + 1 }}º
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-[200px]" :title="emp.fullName">{{ emp.fullName }}</span>
            </div>
          </div>
          <span class="text-amber-600 dark:text-amber-400 font-bold tabular-nums bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-lg">
            {{ formatDecimalHours(emp.balance) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
