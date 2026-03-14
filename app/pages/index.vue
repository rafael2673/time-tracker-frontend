<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useEmployeesStore } from '~/stores/employees'
import { usePoliciesStore } from '~/stores/policies'
import { useLocale } from '~/composables/useLocale'
import { Users, Briefcase, Clock, Activity, ArrowRight, ChevronLeft } from 'lucide-vue-next'

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const employeesStore = useEmployeesStore()
const policiesStore = usePoliciesStore()
const { t } = useLocale()

const isMounted = ref(false)
const viewLevel = ref<'COMPANY' | 'EMPLOYEE'>('COMPANY')
const selectedEmployeeId = ref<string | null>(null)

onMounted(async () => {
  isMounted.value = true
  if (authStore.activeWorkspaceId) {
    await loadDashboardData()
  }
})

watch(() => authStore.activeWorkspaceId, async (newVal) => {
  if (newVal && isMounted.value) {
    viewLevel.value = 'COMPANY'
    selectedEmployeeId.value = null
    await loadDashboardData()
  }
})

async function loadDashboardData() {
  await Promise.all([
    employeesStore.fetchMembers(),
    policiesStore.fetchPolicies()
  ])
}

function selectEmployee(id: string) {
  selectedEmployeeId.value = id
  viewLevel.value = 'EMPLOYEE'
}

function backToCompany() {
  selectedEmployeeId.value = null
  viewLevel.value = 'COMPANY'
}

const activeWorkspaceName = computed(() => {
  const ws = workspaceStore.workspaces.find(w => w.id === authStore.activeWorkspaceId)
  return ws?.name || '...'
})

const selectedEmployee = computed(() => {
  return employeesStore.members.find(m => m.id === selectedEmployeeId.value)
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
</script>

<template>
  <div class="flex flex-col gap-8">
    <div v-if="viewLevel === 'COMPANY'">
      <div class="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 rounded-3xl shadow-lg text-white mb-8">
        <div class="max-w-2xl">
          <h1 class="text-3xl font-bold tracking-tight mb-2">{{ t.dashboard.hello }}, {{ authStore.user?.fullName?.split(' ')[0] || t.dashboard.manager }}! 👋</h1>
          <p class="text-indigo-100 font-medium text-lg">{{ t.dashboard.overview }} <span class="font-bold text-white">{{ activeWorkspaceName }}</span>.</p>
        </div>
        <div class="hidden md:flex w-20 h-20 bg-white/20 rounded-full items-center justify-center backdrop-blur-md border border-white/30 text-2xl font-bold uppercase tracking-widest shadow-inner">
          {{ getInitials(authStore.user?.fullName || '') }}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
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
            <div class="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Briefcase :size="24" />
            </div>
          </div>
          <div>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{{ policiesStore.policies.length }}</h3>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.dashboard.policies }}</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between opacity-60">
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Clock :size="24" />
            </div>
          </div>
          <div>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">--</h3>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.dashboard.extraHours }}</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between opacity-60">
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl">
              <Activity :size="24" />
            </div>
          </div>
          <div>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">--</h3>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.dashboard.pending }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{{ t.dashboard.latestEmployees }}</h2>
            <NuxtLink to="/employees" class="text-sm font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors">
              {{ t.dashboard.viewAll }} <ArrowRight :size="16" />
            </NuxtLink>
          </div>
          <div class="flex-1 flex flex-col justify-center">
            <div v-if="employeesStore.members.length === 0" class="text-center py-8">
              <p class="text-gray-500 text-sm font-medium">{{ t.dashboard.noEmployees }}</p>
            </div>
            <div v-else class="space-y-3">
              <div v-for="member in employeesStore.members.slice(0, 4)" :key="member.id" @click="selectEmployee(member.id)" class="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
                <div class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-100 dark:ring-indigo-800/50 shrink-0 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {{ getInitials(member.fullName) }}
                </div>
                <div class="flex flex-col flex-1 min-w-0">
                  <span class="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ member.fullName }}</span>
                  <span class="text-xs font-medium text-gray-500 truncate mt-0.5">{{ member.workPolicyName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="viewLevel === 'EMPLOYEE'" class="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <button @click="backToCompany" class="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors group w-fit cursor-pointer">
        <ChevronLeft :size="18" class="group-hover:-translate-x-1 transition-transform" />
        {{ t.dashboard.backToCompany }}
      </button>

      <div class="flex items-center gap-6 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div class="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[1.25rem] flex items-center justify-center text-2xl font-black ring-1 ring-indigo-100 dark:ring-indigo-800/50">
          {{ getInitials(selectedEmployee?.fullName || '') }}
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedEmployee?.fullName }}</h2>
          <div class="flex items-center gap-2 mt-1">
            <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-md border border-gray-200 dark:border-gray-700">{{ selectedEmployee?.workPolicyName }}</span>
            <span class="text-gray-500 font-medium text-sm">{{ selectedEmployee?.email }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-16 text-center shadow-sm">
        <div class="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-gray-50/50 dark:ring-gray-800/50">
          <Clock :size="32" class="text-gray-400 dark:text-gray-500" />
        </div>
        <p class="text-gray-600 dark:text-gray-400 font-semibold text-lg">{{ t.dashboard.employeeTimeSheetPlaceholder }}</p>
      </div>
    </div>
  </div>
</template>