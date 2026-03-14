<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useEmployeesStore, type AddMemberRequest } from '~/stores/employees'
import { usePoliciesStore } from '~/stores/policies'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useAuthStore } from '~/stores/auth'
import { useLocale } from '~/composables/useLocale'
import { Plus, Users, Loader2 } from 'lucide-vue-next'

const employeesStore = useEmployeesStore()
const policiesStore = usePoliciesStore()
const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()
const { t } = useLocale()

const isModalOpen = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string>('')
const successMessage = ref<string>('')

const formData = ref<AddMemberRequest>({
  email: '',
  fullName: '',
  role: 'EMPLOYEE',
  workPolicyId: ''
})

const currentRole = computed(() => {
  const ws = workspaceStore.workspaces.find(w => w.id === authStore.activeWorkspaceId)
  return ws?.role || 'EMPLOYEE'
})

const availableRoles = computed(() => {
  if (currentRole.value === 'ADMIN') {
    return ['EMPLOYEE', 'MANAGER', 'ADMIN']
  }
  return ['EMPLOYEE', 'MANAGER']
})

onMounted(async () => {
  if (authStore.activeWorkspaceId) {
    await loadData()
  }
})

watch(() => authStore.activeWorkspaceId, async (newVal) => {
  if (newVal) {
    await loadData()
  }
})

async function loadData() {
  await Promise.all([
    employeesStore.fetchMembers(),
    policiesStore.fetchPolicies()
  ])
}

function openCreateModal(): void {
  formData.value = { email: '', fullName: '', role: 'EMPLOYEE', workPolicyId: '' }
  errorMessage.value = ''
  successMessage.value = ''
  isModalOpen.value = true
}

function closeModal(): void {
  if (!isSubmitting.value) {
    isModalOpen.value = false
  }
}

async function handleSubmit(): Promise<void> {
  if (isSubmitting.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await employeesStore.addMember(formData.value)
    successMessage.value = t.value.employees.successAdd
    setTimeout(() => {
      isSubmitting.value = false
      closeModal()
      successMessage.value = ''
    }, 1500)
  } catch (error: unknown) {
    errorMessage.value = t.value.employees.errorSave
    isSubmitting.value = false
  }
}

function getRoleTranslation(role: string): string {
  const rolesMap = t.value.employees.roles as Record<string, string>
  return rolesMap[role] || role
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
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{{ t.employees.title }}</h1>
      <button @click="openCreateModal" class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95">
        <Plus :size="18" />
        {{ t.employees.newEmployee }}
      </button>
    </div>

    <div v-if="employeesStore.isLoading" class="flex justify-center py-12">
      <Loader2 :size="32" class="animate-spin text-indigo-600" />
    </div>

    <div v-else-if="employeesStore.members.length === 0" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-16 text-center shadow-sm">
      <div class="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-gray-50/50 dark:ring-gray-800/50">
        <Users :size="32" class="text-gray-400 dark:text-gray-500" />
      </div>
      <p class="text-gray-600 dark:text-gray-400 font-semibold text-lg">{{ t.employees.empty }}</p>
    </div>

    <div v-else class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
      <table class="w-full text-sm text-left">
        <thead class="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
        <tr>
          <th scope="col" class="px-6 py-5 font-semibold tracking-wider">{{ t.employees.name }}</th>
          <th scope="col" class="px-6 py-5 font-semibold tracking-wider">{{ t.employees.role }}</th>
          <th scope="col" class="px-6 py-5 font-semibold tracking-wider">{{ t.employees.policy }}</th>
        </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
        <tr v-for="member in employeesStore.members" :key="member.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
          <td class="px-6 py-4">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-100 dark:ring-indigo-800/50 shrink-0 shadow-inner">
                {{ getInitials(member.fullName) }}
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-gray-900 dark:text-white">{{ member.fullName }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ member.email }}</span>
              </div>
            </div>
          </td>
          <td class="px-6 py-4">
              <span class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-bold text-[10px] uppercase tracking-widest border border-gray-200 dark:border-gray-700 shadow-sm">
                {{ getRoleTranslation(member.role) }}
              </span>
          </td>
          <td class="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">
            {{ member.workPolicyName }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {{ t.employees.newEmployee }}
          </h2>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
              {{ t.employees.name }}
            </label>
            <input v-model="formData.fullName" type="text" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
              {{ t.employees.email }}
            </label>
            <input v-model="formData.email" type="email" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
              {{ t.employees.role }}
            </label>
            <select v-model="formData.role" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium cursor-pointer appearance-none">
              <option v-for="r in availableRoles" :key="r" :value="r">
                {{ getRoleTranslation(r) }}
              </option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
              {{ t.employees.policy }}
            </label>
            <select v-model="formData.workPolicyId" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium cursor-pointer appearance-none">
              <option v-for="policy in policiesStore.policies" :key="policy.id" :value="policy.id">
                {{ policy.name }}
              </option>
            </select>
          </div>

          <div v-if="successMessage" class="p-3 text-xs font-bold text-green-700 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/50">
            {{ successMessage }}
          </div>

          <div v-if="errorMessage" class="p-3 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50">
            {{ errorMessage }}
          </div>

          <div class="flex items-center gap-3 pt-4 mt-2">
            <button type="button" @click="closeModal" :disabled="isSubmitting" class="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50">
              {{ t.employees.cancel }}
            </button>
            <button type="submit" :disabled="isSubmitting" class="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-700 transition-all cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
              <Loader2 v-if="isSubmitting" :size="18" class="animate-spin" />
              <span v-else>{{ t.employees.save }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>