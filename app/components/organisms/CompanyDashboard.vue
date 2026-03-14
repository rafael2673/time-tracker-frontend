<script setup lang="ts">
import { computed } from 'vue'
import { Users, Briefcase, Clock, Activity, Building2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useEmployeesStore } from '~/stores/employees'
import { usePoliciesStore } from '~/stores/policies'
import { useSummaryStore } from '~/stores/summary'
import { useLocale } from '~/composables/useLocale'
import { formatDecimalHours } from '~/utils/timeFormatter'

const props = defineProps<{
  onSelectEmployee: (id: string) => void
}>()

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const employeesStore = useEmployeesStore()
const policiesStore = usePoliciesStore()
const summaryStore = useSummaryStore()
const { t } = useLocale()

const activeWorkspaceName = computed(() => {
  const ws = workspaceStore.workspaces.find(w => w.id === authStore.activeWorkspaceId)
  return ws?.name || '...'
})

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

function getRoleTranslation(role: string): string {
  const rolesMap = t.value.employees.roles as Record<string, string>
  return rolesMap[role] || role
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 rounded-3xl shadow-lg text-white mb-8 relative overflow-hidden">
      <div class="max-w-2xl relative z-10">
        <h1 class="text-3xl font-bold tracking-tight mb-2">{{ t.dashboard.hello }}, {{ authStore.user?.fullName?.split(' ')[0] || t.dashboard.manager }}! 👋</h1>
        <p class="text-indigo-100 font-medium text-lg">{{ t.dashboard.overview }} <span class="font-bold text-white">{{ activeWorkspaceName }}</span>.</p>
      </div>
      <Building2 class="absolute -right-8 -bottom-8 w-64 h-64 text-white/10 rotate-12 z-0 pointer-events-none" />
      <div class="hidden md:flex w-20 h-20 bg-white/20 rounded-full items-center justify-center backdrop-blur-md border border-white/30 text-2xl font-bold uppercase tracking-widest shadow-inner relative z-10">
        {{ getInitials(authStore.user?.fullName || '') }}
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl w-fit">
            <Users :size="24" />
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{{ employeesStore.members.length }}</h3>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.dashboard.employees }}</p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl w-fit">
            <Briefcase :size="24" />
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{{ policiesStore.policies.length }}</h3>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.dashboard.policies }}</p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md" :class="summaryStore.isLoadingSummary ? 'opacity-60' : ''">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit">
            <Clock :size="24" />
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-bold tabular-nums" :class="summaryStore.monthlyBalance?.balance && summaryStore.monthlyBalance.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'">
            {{ summaryStore.monthlyBalance ? formatDecimalHours(summaryStore.monthlyBalance.balance) : '--h' }}
          </h3>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.dashboard.hourBalance }}</p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between opacity-60">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl w-fit">
            <Activity :size="24" />
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">--</h3>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.dashboard.pending }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{{ t.dashboard.employees }}</h2>
      </div>

      <div v-if="employeesStore.members.length === 0" class="text-center py-12">
        <p class="text-gray-500 font-medium">{{ t.dashboard.noEmployees }}</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="member in employeesStore.members" :key="member.id" @click="props.onSelectEmployee(member.id)" class="p-5 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full overflow-hidden">
          <div class="flex items-start justify-between mb-4 gap-3">
            <div class="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm text-base shrink-0">
              {{ getInitials(member.fullName) }}
            </div>
            <div class="flex-1 min-w-0 flex justify-end">
              <span class="px-2 py-1 bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-[10px] font-bold rounded-lg uppercase tracking-widest truncate max-w-full" :title="getRoleTranslation(member.role)">
                {{ getRoleTranslation(member.role) }}
              </span>
            </div>
          </div>
          <div class="space-y-1 mt-auto">
            <p class="font-bold text-gray-900 dark:text-white truncate w-full block" :title="member.fullName">{{ member.fullName }}</p>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 truncate w-full block" :title="member.workPolicyName">{{ member.workPolicyName }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>