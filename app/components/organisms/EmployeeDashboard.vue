<script setup lang="ts">
import { ChevronLeft, Loader2, Clock, CalendarDays, FileText, AlertCircle } from 'lucide-vue-next'
import { useTimeRecordsStore } from '~/stores/timeRecords'
import { useSummaryStore } from '~/stores/summary'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
    currentRole: string
    selectedEmployee: any
    onBackToCompany: () => void
    onHandlePunch: () => Promise<void>
}>()

const timeRecordsStore = useTimeRecordsStore()
const summaryStore = useSummaryStore()
const { t } = useLocale()

function formatRecordTime(timestamp: string): string {
    if (!timestamp) return '--:--'
    const date = new Date(timestamp)
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
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
    <div class="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-300">
        <button v-if="props.currentRole !== 'EMPLOYEE'" @click="props.onBackToCompany" class="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors group w-fit cursor-pointer">
            <ChevronLeft :size="18" class="group-hover:-translate-x-1 transition-transform" />
            {{ t.dashboard.backToCompany }}
        </button>

        <div class="flex items-center gap-6 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div class="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[1.25rem] flex items-center justify-center text-2xl font-black ring-1 ring-indigo-100 dark:ring-indigo-800/50">
                {{ getInitials(props.selectedEmployee?.fullName || '') }}
            </div>
            <div class="flex-1 flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{{ props.selectedEmployee?.fullName }}</h2>
                    <div class="flex items-center gap-3 mt-2">
                        <span v-if="props.selectedEmployee && 'workPolicyName' in props.selectedEmployee" class="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700">
                            {{ props.selectedEmployee.workPolicyName }}
                        </span>
                        <span class="text-gray-500 font-medium text-sm">{{ props.selectedEmployee?.email }}</span>
                    </div>
                </div>

                <button
                        v-if="props.currentRole === 'EMPLOYEE'"
                        @click="props.onHandlePunch"
                        :disabled="timeRecordsStore.isPunching"
                        class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                    <Loader2 v-if="timeRecordsStore.isPunching" :size="18" class="animate-spin" />
                    <Clock v-else :size="18" />
                    <span>{{ t.dashboard.registerPunch }}</span>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between" :class="summaryStore.isLoadingSummary ? 'opacity-60' : ''">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                        <CalendarDays :size="24" />
                    </div>
                </div>
                <div>
                    <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                        {{ summaryStore.employeeSummary ? summaryStore.employeeSummary.workedHours : '--' }}
                    </h3>
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.dashboard.workedHours }}</p>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between" :class="summaryStore.isLoadingSummary ? 'opacity-60' : ''">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                        <Clock :size="24" />
                    </div>
                </div>
                <div>
                    <h3 class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {{ summaryStore.employeeSummary ? summaryStore.employeeSummary.balance : '--' }}
                    </h3>
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.dashboard.hourBalance }}</p>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between" :class="summaryStore.isLoadingSummary ? 'opacity-60' : ''">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl">
                        <AlertCircle :size="24" />
                    </div>
                </div>
                <div>
                    <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                        {{ summaryStore.employeeSummary ? summaryStore.employeeSummary.pendingJustifications : '--' }}
                    </h3>
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.dashboard.pendingJustifications }}</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight">{{ t.dashboard.workloadSummary }}</h3>
                <div class="flex-1 flex flex-col items-center justify-center text-center opacity-60 py-12">
                    <FileText :size="32" class="text-gray-400 mb-3" />
                    <p class="text-sm font-medium text-gray-500">Gráficos de jornada e detalhamentos<br>serão exibidos aqui.</p>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight">{{ t.dashboard.todayRecords }}</h3>

                <div v-if="timeRecordsStore.isLoading" class="flex-1 flex items-center justify-center py-12">
                    <Loader2 class="animate-spin text-indigo-500" :size="24" />
                </div>

                <div v-else-if="timeRecordsStore.dailyRecords.length === 0" class="flex-1 flex flex-col items-center justify-center text-center opacity-60 py-12">
                    <Clock :size="32" class="text-gray-400 mb-3" />
                    <p class="text-sm font-medium text-gray-500">{{ t.dashboard.noRecordsToday }}</p>
                </div>

                <div v-else class="flex-1 space-y-4">
                    <div v-for="(record, index) in timeRecordsStore.dailyRecords" :key="record.id" class="flex items-center gap-4 relative">
                        <div v-if="index !== timeRecordsStore.dailyRecords.length - 1" class="absolute left-4 top-8 -bottom-4 w-0.5 bg-gray-100 dark:bg-gray-800"></div>
                        <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 z-10 ring-4 ring-white dark:ring-gray-900">
                            <span class="text-xs font-bold">{{ index + 1 }}</span>
                        </div>
                        <div class="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <span class="font-bold text-gray-900 dark:text-white text-lg tabular-nums">{{ formatRecordTime(record.timestamp) }}</span>
                            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">{{ record.source }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>