<script setup lang="ts">
import { CheckCircle2, XCircle } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import type { PendingRecordResponse } from '~/stores/approvals'

const props = defineProps<{
  record: PendingRecordResponse
  isHistory: boolean
}>()

const emit = defineEmits<{
  (e: 'approve', id: string): void
  (e: 'reject', id: string): void
}>()

const { t } = useLocale()

function formatDate(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleString(undefined, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function getTypeTranslation(type: string): string {
  const typesMap = t.value.approvals.types as Record<string, string>
  return typesMap[type] || type
}
</script>

<template>
  <div class="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors flex flex-col gap-5">
    <div class="flex flex-wrap items-center gap-3">
      <h3 class="font-bold text-gray-900 dark:text-white text-lg">{{ props.record.employeeName }}</h3>
      <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-100 dark:border-indigo-800/50 uppercase tracking-widest">
                {{ getTypeTranslation(props.record.recordType) }}
            </span>
      <span class="text-sm font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                {{ formatDate(props.record.registeredAt) }}
            </span>
    </div>

    <div class="flex flex-col lg:flex-row items-stretch gap-4">
      <div class="flex-1 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 p-4 rounded-2xl relative mt-2 lg:mt-0">
                <span class="absolute -top-2 left-4 bg-amber-50 dark:bg-gray-900 px-1 text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">
                    {{ t.approvals.justification }}
                </span>
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">{{ props.record.justification }}</p>
      </div>

      <div v-if="!props.isHistory" class="flex items-stretch gap-3 w-full lg:w-auto shrink-0">
        <button @click="emit('reject', props.record.id)" class="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 font-bold rounded-2xl transition-colors cursor-pointer border border-red-100 dark:border-red-900/30 py-3 lg:py-0">
          <XCircle :size="18" />
          <span class="hidden sm:inline">{{ t.approvals.reject }}</span>
        </button>
        <button @click="emit('approve', props.record.id)" class="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 font-bold rounded-2xl transition-all cursor-pointer hover:scale-105 active:scale-95 py-3 lg:py-0">
          <CheckCircle2 :size="18" />
          <span class="hidden sm:inline">{{ t.approvals.approve }}</span>
        </button>
      </div>
    </div>
  </div>
</template>