<script setup lang="ts">
import { CalendarDays, Clock, AlertCircle, Edit2, Trash2 } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import type { WorkPolicy } from '~/stores/policies'

const props = defineProps<{
    policies: WorkPolicy[]
    onEdit: (policy: WorkPolicy) => void
    onDelete: (id: string) => void
}>()

const { t } = useLocale()

function formatMinutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0')
    const m = (minutes % 60).toString().padStart(2, '0')
    return `${h}:${m}`
}

function getDayTranslation(day: string): string {
    const daysMap = t.value.policies.days as Record<string, string>
    return daysMap[day] || day
}
</script>

<template>
    <div v-if="props.policies.length === 0" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-16 text-center shadow-sm">
        <div class="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-gray-50/50 dark:ring-gray-800/50">
            <CalendarDays :size="32" class="text-gray-400 dark:text-gray-500" />
        </div>
        <p class="text-gray-600 dark:text-gray-400 font-semibold text-lg">{{ t.policies.empty }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="policy in props.policies" :key="policy.id" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
            <div class="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button @click="props.onEdit(policy)" class="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer shadow-sm">
                    <Edit2 :size="16" />
                </button>
                <button @click="props.onDelete(policy.id)" class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer shadow-sm">
                    <Trash2 :size="16" />
                </button>
            </div>

            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-5 pr-20 tracking-tight truncate">{{ policy.name }}</h3>

            <div class="space-y-4">
                <div class="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    <Clock :size="18" class="text-indigo-500" />
                    <span>{{ formatMinutesToTime(policy.dailyMinutesLimit) }}{{ t.policies.dailyHours }}</span>
                </div>
                <div class="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    <AlertCircle :size="18" class="text-amber-500" />
                    <span>{{ policy.toleranceMinutes }} {{ t.policies.toleranceMin }}</span>
                </div>
                <div class="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <CalendarDays :size="18" class="text-emerald-500 shrink-0 mt-0.5" />
                    <div class="flex flex-wrap gap-1.5">
                        <span v-for="day in (policy.workingDays ? policy.workingDays.split(',') : [])" :key="day" class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] uppercase font-bold tracking-widest">
                            {{ getDayTranslation(day) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>