<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Loader2, Lock, CalendarDays, FileText, CheckCircle2, FileDown } from 'lucide-vue-next'
import { useClosuresStore } from '~/stores/closures'
import { useAuthStore } from '~/stores/auth'
import { useLocale } from '~/composables/useLocale'
import BaseSelect from '~/components/atoms/BaseSelect.vue'
import ConfirmModal from '~/components/molecules/ConfirmModal.vue'
import { formatDecimalHours } from '~/utils/timeFormatter'

const closuresStore = useClosuresStore()
const authStore = useAuthStore()
const { t } = useLocale()

const currentDate = new Date()
const selectedYear = ref(currentDate.getFullYear())
const selectedMonth = ref(currentDate.getMonth() + 1)

const isConfirmModalOpen = ref(false)
const isProcessing = ref(false)
const downloadingId = ref<string | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const yearOptions = computed(() => {
  const current = new Date().getFullYear()
  return [
    { value: current - 1, label: String(current - 1), icon: CalendarDays },
    { value: current, label: String(current), icon: CalendarDays },
    { value: current + 1, label: String(current + 1), icon: CalendarDays }
  ]
})

const monthOptions = computed(() => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleString(t.value.login.language === 'English' ? 'pt-BR' : 'en-US', { month: 'long' }).toUpperCase()
  }))
})

onMounted(() => { if (authStore.activeWorkspaceId) loadData() })
watch(() => authStore.activeWorkspaceId, () => loadData())
watch([selectedYear, selectedMonth], () => loadData())

function loadData() {
  closuresStore.fetchClosures(selectedYear.value, selectedMonth.value)
}

function showMessage(msg: string, type: 'success' | 'error') {
  message.value = msg
  messageType.value = type
  setTimeout(() => message.value = '', 3000)
}

function formatDateTime(isoString: string) {
  return new Date(isoString).toLocaleString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function handleCloseMonth() {
  if (isProcessing.value) return
  isProcessing.value = true

  const success = await closuresStore.executeClosure(selectedYear.value, selectedMonth.value)
  if (success) {
    showMessage(t.value.closures.successClose, 'success')
  } else {
    showMessage(t.value.closures.error, 'error')
  }

  isProcessing.value = false
  isConfirmModalOpen.value = false
}

async function handleDownload(userId: string, employeeName: string) {
  if (downloadingId.value) return

  downloadingId.value = userId
  try {
    await closuresStore.downloadTimesheet(userId, employeeName, selectedYear.value, selectedMonth.value)
    showMessage(t.value.closures.downloadSuccess, 'success')
  } catch (error) {
    showMessage(t.value.closures.downloadError, 'error')
  } finally {
    downloadingId.value = null
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <div class="flex flex-col lg:flex-row justify-between lg:items-end gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{{ t.closures.title }}</h1>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.closures.subtitle }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <div class="w-32"><BaseSelect v-model="selectedYear" :options="yearOptions" /></div>
        <div class="w-44"><BaseSelect v-model="selectedMonth" :options="monthOptions" /></div>

        <button v-if="!closuresStore.isClosed && !closuresStore.isLoading" @click="isConfirmModalOpen = true" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 h-10.5">
          <Lock :size="16" />
          {{ t.closures.closeMonth }}
        </button>
        <div v-else-if="closuresStore.isClosed" class="px-4 py-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-bold text-sm rounded-xl flex items-center gap-2 h-10.5 border border-emerald-100 dark:border-emerald-800/50">
          <CheckCircle2 :size="16" />
          {{ t.closures.closedBadge }}
        </div>
      </div>
    </div>

    <div v-if="message" class="p-4 text-sm font-bold rounded-xl border animate-in fade-in duration-300" :class="messageType === 'success' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50' : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'">
      {{ message }}
    </div>

    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm flex flex-col w-full">

      <div class="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col sm:flex-row justify-between sm:items-center items-start gap-2">
        <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">
            {{ closuresStore.isClosed ? t.closures.statusFrozen : t.closures.statusDynamic }}
        </span>
        <span v-if="closuresStore.isClosed && closuresStore.closures.length > 0" class="text-xs font-medium text-gray-400">
            {{ t.closures.closedAt }} {{ formatDateTime(closuresStore.closures[0]?.closedAt || '') }}
        </span>
      </div>

      <div v-if="closuresStore.isLoading" class="flex justify-center p-12">
        <Loader2 :size="32" class="animate-spin text-indigo-600" />
      </div>

      <div v-else-if="!closuresStore.isClosed" class="flex flex-col items-center justify-center p-16 opacity-60">
        <Lock :size="48" class="text-gray-400 mb-4" />
        <p class="text-sm font-bold text-gray-500">{{ t.closures.notClosed }}</p>
        <p class="text-xs text-gray-400 mt-2 text-center max-w-sm">{{ t.closures.dynamicNotice }}</p>
      </div>

      <div v-else-if="closuresStore.closures.length === 0" class="flex flex-col items-center justify-center p-16 opacity-60">
        <FileText :size="48" class="text-gray-400 mb-4" />
        <p class="text-sm font-bold text-gray-500">{{ t.closures.empty }}</p>
      </div>

      <div v-else class="w-full">
        <div class="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="c in closuresStore.closures" :key="`mobile-${c.id}`" class="p-4 space-y-3">
            <div class="flex items-start justify-between gap-3">
              <p class="font-bold text-gray-900 dark:text-white leading-tight">{{ c.employeeName }}</p>
              <button
                  @click="handleDownload(c.userId, c.employeeName)"
                  :disabled="downloadingId === c.userId"
                  class="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all disabled:opacity-50"
                  :title="t.closures.exportTimesheet"
              >
                <Loader2 v-if="downloadingId === c.userId" :size="18" class="animate-spin text-indigo-600" />
                <FileDown v-else :size="18" />
              </button>
            </div>

            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <span class="text-gray-500 dark:text-gray-400">{{ t.closures.worked }}</span>
              <span class="text-right font-medium text-gray-700 dark:text-gray-200">{{ formatDecimalHours(c.workedHours) }}</span>

              <span class="text-gray-500 dark:text-gray-400">{{ t.closures.expected }}</span>
              <span class="text-right font-medium text-gray-700 dark:text-gray-200">{{ formatDecimalHours(c.expectedHours) }}</span>

              <span class="text-gray-500 dark:text-gray-400">{{ t.closures.balance }}</span>
              <span class="text-right font-bold" :class="c.rawBalance < 0 ? 'text-red-500' : (c.rawBalance > 0 ? 'text-emerald-500' : 'text-gray-500')">
                {{ c.rawBalance > 0 ? '+' : '' }}{{ formatDecimalHours(c.rawBalance) }}
              </span>

              <span class="text-gray-500 dark:text-gray-400">{{ t.closures.bankedMonth }}</span>
              <span class="text-right font-bold text-indigo-400 dark:text-indigo-500">
                {{ c.bankedHoursDelta > 0 ? '+' : '' }}{{ formatDecimalHours(c.bankedHoursDelta) }}
              </span>

              <span class="text-gray-500 dark:text-gray-400">{{ t.closures.bankedTotal }}</span>
              <span class="text-right font-black text-indigo-600 dark:text-indigo-400">
                {{ c.accumulatedBankHours > 0 ? '+' : '' }}{{ formatDecimalHours(c.accumulatedBankHours) }}
              </span>

              <span class="text-gray-500 dark:text-gray-400">{{ t.closures.overtime }}</span>
              <span class="text-right font-bold text-emerald-600 dark:text-emerald-400">{{ formatDecimalHours(c.paidOvertimeHours) }}</span>
            </div>
          </div>
        </div>

        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-275 w-full text-left border-collapse whitespace-nowrap">
          <thead>
          <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/10">
            <th class="px-3 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-1/4">{{ t.closures.employee }}</th>
            <th class="px-3 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 text-right">{{ t.closures.worked }}</th>
            <th class="px-3 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 text-right">{{ t.closures.expected }}</th>
            <th class="px-3 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 text-right">{{ t.closures.balance }}</th>
            <th class="px-3 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest text-indigo-400 dark:text-indigo-500 text-right">{{ t.closures.bankedMonth }}</th>
            <th class="px-3 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 text-right border-l border-gray-100 dark:border-gray-800 bg-indigo-50/30 dark:bg-indigo-900/10">{{ t.closures.bankedTotal }}</th>
            <th class="px-3 sm:px-6 py-4 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 text-right">{{ t.closures.overtime }}</th>
            <th class="px-3 sm:px-6 py-4 w-16"></th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="c in closuresStore.closures" :key="c.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
            <td class="px-3 sm:px-6 py-4 font-bold text-gray-900 dark:text-white truncate" :title="c.employeeName">{{ c.employeeName }}</td>
            <td class="px-3 sm:px-6 py-4 text-right font-medium text-gray-600 dark:text-gray-300">{{ formatDecimalHours(c.workedHours) }}</td>
            <td class="px-3 sm:px-6 py-4 text-right font-medium text-gray-600 dark:text-gray-300">{{ formatDecimalHours(c.expectedHours) }}</td>
            <td class="px-3 sm:px-6 py-4 text-right font-bold" :class="c.rawBalance < 0 ? 'text-red-500' : (c.rawBalance > 0 ? 'text-emerald-500' : 'text-gray-500')">
              {{ c.rawBalance > 0 ? '+' : '' }}{{ formatDecimalHours(c.rawBalance) }}
            </td>
            <td class="px-3 sm:px-6 py-4 text-right font-bold text-indigo-400 dark:text-indigo-500">
              {{ c.bankedHoursDelta > 0 ? '+' : '' }}{{ formatDecimalHours(c.bankedHoursDelta) }}
            </td>
            <td class="px-3 sm:px-6 py-4 text-right font-black text-indigo-600 dark:text-indigo-400 border-l border-gray-100 dark:border-gray-800 bg-indigo-50/30 dark:bg-indigo-900/10">
              {{ c.accumulatedBankHours > 0 ? '+' : '' }}{{ formatDecimalHours(c.accumulatedBankHours) }}
            </td>
            <td class="px-3 sm:px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{{ formatDecimalHours(c.paidOvertimeHours) }}</td>
            <td class="px-3 sm:px-6 py-4 text-right">
              <button
                  @click="handleDownload(c.userId, c.employeeName)"
                  :disabled="downloadingId === c.userId"
                  class="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  :title="t.closures.exportTimesheet"
              >
                <Loader2 v-if="downloadingId === c.userId" :size="18" class="animate-spin text-indigo-600" />
                <FileDown v-else :size="18" />
              </button>
            </td>
          </tr>
          </tbody>
          </table>
        </div>
      </div>
    </div>

    <ConfirmModal
        :show="isConfirmModalOpen"
        :title="t.closures.closeMonth"
        :message="t.closures.confirmClose"
        :is-loading="isProcessing"
        intent="danger"
        @confirm="handleCloseMonth"
        @cancel="isConfirmModalOpen = false"
    />
  </div>
</template>