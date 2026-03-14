<script setup lang="ts">
import { ChevronLeft, Loader2, Clock } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
  currentRole: string
  selectedEmployee: any
  isPunching: boolean
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'punch'): void
}>()

const { t } = useLocale()

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
  <div class="flex flex-col gap-6">
    <button v-if="props.currentRole !== 'EMPLOYEE'" @click="emit('back')" class="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors group w-fit cursor-pointer">
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
            @click="emit('punch')"
            :disabled="props.isPunching"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <Loader2 v-if="props.isPunching" :size="18" class="animate-spin" />
          <Clock v-else :size="18" />
          <span>{{ t.dashboard.registerPunch }}</span>
        </button>
      </div>
    </div>
  </div>
</template>