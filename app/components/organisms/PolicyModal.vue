<script setup lang="ts">
import { computed } from 'vue'
import { Loader2, Info } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import BaseSelect from '~/components/atoms/BaseSelect.vue'

const props = defineProps<{
  isOpen: boolean
  isSubmitting: boolean
  editingId: string | null
  formData: any
  availableDays: string[]
  errorMessage: string
  onClose: () => void
  onSubmit: () => void
  onToggleDay: (day: string) => void
}>()

const { t } = useLocale()

function getDayTranslation(day: string): string {
  const daysMap = t.value.policies.days as Record<string, string>
  return daysMap[day] || day
}

const strategyOptions = computed(() => [
  { value: 'BANK_ONLY', label: t.value.policies.strategyBankOnly },
  { value: 'PAY_ONLY', label: t.value.policies.strategyPayOnly },
  { value: 'MIXED', label: t.value.policies.strategyMixed }
])
</script>

<template>
  <div v-if="props.isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">

    <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200 max-h-[90vh]">

      <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          {{ props.editingId ? t.policies.editPolicy : t.policies.newPolicy }}
        </h2>
      </div>

      <form @submit.prevent="props.onSubmit" class="flex flex-col flex-1 min-h-0">

        <div class="p-6 space-y-5 overflow-y-auto custom-scrollbar">

          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
              {{ t.policies.nameLabel }}
            </label>
            <input v-model="props.formData.name" type="text" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" :placeholder="t.policies.namePlaceholder" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
                {{ t.policies.dailyLimitLabel }}
              </label>
              <input v-model="props.formData.dailyTime" type="time" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
                {{ t.policies.toleranceLabel }}
              </label>
              <input v-model.number="props.formData.toleranceMinutes" type="number" min="0" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
              {{ t.policies.overtimeStrategyLabel }}
            </label>
            <BaseSelect
                v-model="props.formData.overtimeStrategy"
                :options="strategyOptions"
            />
          </div>

          <div class="grid grid-cols-2 gap-4" v-if="props.formData.overtimeStrategy !== 'PAY_ONLY'">
            <div class="space-y-1.5" v-if="props.formData.overtimeStrategy === 'MIXED'">
              <div class="flex items-center h-4 ml-1">
                <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {{ t.policies.maxBankLabel }}
                </label>
              </div>
              <input v-model.number="props.formData.maxBankHoursPerMonth" type="number" min="0" step="0.5" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" />
            </div>

            <div class="space-y-1.5" :class="{'col-span-2': props.formData.overtimeStrategy === 'BANK_ONLY'}">
              <div class="flex items-center gap-1.5 h-4 ml-1">
                <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {{ t.policies.expirationLabel }}
                </label>
                <span
                    :title="t.policies.expirationTooltip"
                    :aria-label="t.policies.expirationTooltip"
                    class="inline-flex"
                >
                  <Info :size="14" class="text-gray-400 cursor-help transition-colors hover:text-indigo-500" />
                </span>

              </div>
              <input v-model.number="props.formData.bankExpirationMonths" type="number" min="0" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
              {{ t.policies.workingDaysLabel }}
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                  v-for="day in props.availableDays"
                  :key="day"
                  type="button"
                  @click="props.onToggleDay(day)"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border"
                  :class="props.formData.workingDays.includes(day) ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50 shadow-inner' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
              >
                {{ getDayTranslation(day) }}
              </button>
            </div>
          </div>

          <div v-if="props.errorMessage" class="p-3 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50">
            {{ props.errorMessage }}
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0 flex items-center gap-3">
          <button type="button" @click="props.onClose" :disabled="props.isSubmitting" class="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50">
            {{ t.policies.cancel }}
          </button>
          <button type="submit" :disabled="props.isSubmitting || props.formData.workingDays.length === 0" class="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-700 transition-all cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
            <Loader2 v-if="props.isSubmitting" :size="18" class="animate-spin" />
            <span v-else>{{ t.policies.save }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>