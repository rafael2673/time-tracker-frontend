<script setup lang="ts">
import { computed } from 'vue'
import { Users, Briefcase, Clock, Activity, ArrowRight, Building2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useEmployeesStore } from '~/stores/employees'
import { usePoliciesStore } from '~/stores/policies'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
    onSelectEmployee: (id: string) => void
}>()

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const employeesStore = useEmployeesStore()
const policiesStore = usePoliciesStore()
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
</script>

<template>
    <div>
        <div class="flex items-center justify-between bg-linear-to-r from-indigo-600 to-indigo-800 p-8 rounded-3xl shadow-lg text-white mb-8 relative overflow-hidden">
            <div class="max-w-2xl relative z-10">
                <h1 class="text-3xl font-bold tracking-tight mb-2">{{ t.dashboard.hello }}, {{ authStore.user?.fullName?.split(' ')[0] || t.dashboard.manager }}! 👋</h1>
                <p class="text-indigo-100 font-medium text-lg">{{ t.dashboard.overview }} <span class="font-bold text-white">{{ activeWorkspaceName }}</span>.</p>
            </div>
            <Building2 class="absolute -right-8 -bottom-8 w-64 h-64 text-white/10 rotate-12 z-0 pointer-events-none" />
            <div class="hidden md:flex w-20 h-20 bg-white/20 rounded-full items-center justify-center backdrop-blur-md border border-white/30 text-2xl font-bold uppercase tracking-widest shadow-inner relative z-10">
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
                        <div v-for="member in employeesStore.members.slice(0, 4)" :key="member.id" @click="props.onSelectEmployee(member.id)" class="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors cursor-pointer group">
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
</template>