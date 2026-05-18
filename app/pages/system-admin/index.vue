<script setup lang="ts">
import { onMounted } from 'vue'
import { useSystemAdminStore } from '~/stores/systemAdmin'
import { Building2, Users, Clock, Loader2 } from 'lucide-vue-next'

const systemAdminStore = useSystemAdminStore()

onMounted(() => {
  systemAdminStore.fetchMetrics()
})
</script>

<template>
  <div class="flex flex-col gap-8 animate-in fade-in duration-300">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">SaaS Dashboard</h1>
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Visão geral da plataforma AP101 Tracker.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl w-fit">
            <Building2 :size="24" />
          </div>
          <div v-if="systemAdminStore.metrics?.workspacesLast30Days" class="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
            +{{ systemAdminStore.metrics.workspacesLast30Days }} (30d)
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
            {{ systemAdminStore.metrics?.totalWorkspaces ?? '--' }}
          </h3>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Total de Empresas</p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit">
            <Users :size="24" />
          </div>
          <div v-if="systemAdminStore.metrics?.usersLast30Days" class="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
            +{{ systemAdminStore.metrics.usersLast30Days }} (30d)
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
            {{ systemAdminStore.metrics?.totalActiveUsers ?? '--' }}
          </h3>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Usuários Ativos</p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit">
            <Clock :size="24" />
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
            {{ systemAdminStore.metrics?.totalRecordsLast24h ?? '--' }}
          </h3>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Registros (24h)</p>
        </div>
      </div>
    </div>
  </div>
</template>