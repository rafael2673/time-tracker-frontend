<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSystemAdminStore } from '~/stores/systemAdmin'
import { Building2, Plus, Loader2, Power, PowerOff, ShieldCheck, Mail, User } from 'lucide-vue-next'
import ConfirmModal from '~/components/molecules/ConfirmModal.vue'

const systemAdminStore = useSystemAdminStore()

const isCreateModalOpen = ref(false)
const isConfirmStatusOpen = ref(false)
const selectedWorkspace = ref<any>(null)
const isSubmitting = ref(false)

const newWorkspace = ref({
  workspaceName: '',
  adminName: '',
  adminEmail: ''
})

onMounted(() => {
  systemAdminStore.fetchAllWorkspaces()
})

function openStatusConfirm(ws: any) {
  selectedWorkspace.value = ws
  isConfirmStatusOpen.value = true
}

async function handleToggleStatus() {
  if (!selectedWorkspace.value) return
  isSubmitting.value = true
  await systemAdminStore.toggleWorkspaceStatus(selectedWorkspace.value.id, !selectedWorkspace.value.active)
  isSubmitting.value = false
  isConfirmStatusOpen.value = false
}

async function handleCreateWorkspace() {
  isSubmitting.value = true
  try {
    await $fetch('/api/v1/system-admin/workspaces', {
      method: 'POST',
      body: newWorkspace.value,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('tt_token')}`
      }
    })
    isCreateModalOpen.value = false
    newWorkspace.value = { workspaceName: '', adminName: '', adminEmail: '' }
    await systemAdminStore.fetchAllWorkspaces()
  } catch (error) {
    console.error('Error creating workspace', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 max-w-6xl">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Gestão de Workspaces</h1>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Todas as empresas cadastradas na plataforma.</p>
      </div>
      <button @click="isCreateModalOpen = true" class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95">
        <Plus :size="18" />
        Novo Workspace
      </button>
    </div>

    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
      <div v-if="systemAdminStore.isLoading" class="flex justify-center p-12">
        <Loader2 :size="32" class="animate-spin text-indigo-600" />
      </div>

      <div v-else-if="systemAdminStore.workspaces.length === 0" class="p-16 text-center opacity-60">
        <Building2 :size="48" class="text-gray-400 mx-auto mb-4" />
        <p class="text-sm font-bold text-gray-500">Nenhuma empresa encontrada.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Nome da Empresa</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">Colaboradores</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">Status</th>
              <th class="px-6 py-4 w-20"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="ws in systemAdminStore.workspaces" :key="ws.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    {{ ws.name.substring(0, 2).toUpperCase() }}
                  </div>
                  <span class="font-bold text-gray-900 dark:text-white">{{ ws.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300">
                  {{ ws.memberCount }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <span v-if="ws.active" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold rounded-lg uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">
                  Ativo
                </span>
                <span v-else class="px-2.5 py-1 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold rounded-lg uppercase tracking-widest border border-red-100 dark:border-red-800/50">
                  Bloqueado
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button @click="openStatusConfirm(ws)" class="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer" :class="ws.active ? 'hover:text-red-500' : 'hover:text-emerald-500'">
                  <Power v-if="ws.active" :size="18" />
                  <PowerOff v-else :size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Novo Workspace -->
    <div v-if="isCreateModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800">
        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-3">
          <div class="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
             <Plus :size="20" />
          </div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Criar Novo Workspace</h2>
        </div>

        <form @submit.prevent="handleCreateWorkspace" class="p-6 space-y-5">
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Nome da Empresa</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Building2 :size="16" />
              </div>
              <input v-model="newWorkspace.workspaceName" type="text" required class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none font-medium" placeholder="Ex: Acme Corp" />
            </div>
          </div>

          <div class="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
          <div class="px-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <ShieldCheck :size="12" /> Admin Inicial (Dono)
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Nome Completo</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User :size="16" />
              </div>
              <input v-model="newWorkspace.adminName" type="text" required class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none font-medium" placeholder="Ex: João Silva" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">E-mail Corporativo</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail :size="16" />
              </div>
              <input v-model="newWorkspace.adminEmail" type="email" required class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none font-medium" placeholder="admin@empresa.com" />
            </div>
          </div>

          <div class="flex items-center gap-3 pt-4">
            <button type="button" @click="isCreateModalOpen = false" class="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
            <button type="submit" :disabled="isSubmitting" class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex justify-center items-center gap-2">
              <Loader2 v-if="isSubmitting" :size="18" class="animate-spin" />
              <span v-else>Criar Agora</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      :show="isConfirmStatusOpen"
      :title="selectedWorkspace?.active ? 'Bloquear Workspace?' : 'Ativar Workspace?'"
      :message="selectedWorkspace?.active ? 'Ao bloquear, nenhum usuário desta empresa conseguirá acessar o sistema.' : 'Deseja restaurar o acesso para todos os usuários desta empresa?'"
      :is-loading="isSubmitting"
      @confirm="handleToggleStatus"
      @cancel="isConfirmStatusOpen = false"
    />
  </div>
</template>