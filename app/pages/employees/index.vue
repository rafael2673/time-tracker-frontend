<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEmployeesStore, type AddMemberRequest, type UpdateMemberRequest } from '~/stores/employees'
import { usePoliciesStore } from '~/stores/policies'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useAuthStore } from '~/stores/auth'
import { useLocale } from '~/composables/useLocale'
import { Plus, Loader2, Users } from 'lucide-vue-next'
import EmployeesTable from '~/components/organisms/EmployeesTable.vue'
import EmployeeModal from '~/components/organisms/EmployeeModal.vue'
import SearchInput from '~/components/atoms/SearchInput.vue'
import PaginationControls from '~/components/molecules/PaginationControls.vue'
import EmployeeLeaveModal from "~/components/organisms/EmployeeLeaveModal.vue";

const employeesStore = useEmployeesStore()
const policiesStore = usePoliciesStore()
const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()
const router = useRouter()
const { t } = useLocale()

const searchQuery = ref('')
const isModalOpen = ref<boolean>(false)
const isLeaveModalOpen = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string>('')
const successMessage = ref<string>('')
const editingId = ref<string | null>(null)
const selectedEmployeeForLeave = ref<any>(null)

const formData = ref<AddMemberRequest | UpdateMemberRequest>({
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
    employeesStore.currentPage = 0
    searchQuery.value = ''
    await loadData()
  }
})

async function loadData(page: number = 0) {
  await Promise.all([
    employeesStore.fetchMembers(page, searchQuery.value),
    policiesStore.fetchPolicies()
  ])
}

function openModal(employee: any = null): void {
  errorMessage.value = ''
  successMessage.value = ''

  if (employee) {
    editingId.value = employee.id
    formData.value = {
      fullName: employee.fullName,
      role: employee.role,
      workPolicyId: employee.workPolicyId,
      email: employee.email
    } as UpdateMemberRequest
  } else {
    editingId.value = null
    formData.value = { email: '', fullName: '', role: 'EMPLOYEE', workPolicyId: '' } as AddMemberRequest
  }

  isModalOpen.value = true
}

function openLeaveModal(employee: any) {
  selectedEmployeeForLeave.value = employee
  isLeaveModalOpen.value = true
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
    if (editingId.value) {
      await employeesStore.updateMember(editingId.value, formData.value as UpdateMemberRequest)
      successMessage.value = t.value.employees.successEdit
    } else {
      await employeesStore.addMember(formData.value as AddMemberRequest)
      successMessage.value = t.value.employees.successAdd
    }

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

function navigateToDashboard(id: string) {
  router.push({ path: '/', query: { employeeId: id } })
}
</script>

<template>
  <div class="flex flex-col gap-6 max-w-6xl">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{{ t.employees.title }}</h1>
      <button @click="openModal()" class="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95">
        <Plus :size="18" />
        {{ t.employees.newEmployee }}
      </button>
    </div>

    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col relative z-0">
      <div class="p-4 border-b border-gray-100 dark:border-gray-800 rounded-t-3xl">
        <SearchInput
            v-model="searchQuery"
            :placeholder="t.employees.searchPlaceholder"
            @search="loadData(0)"
        />
      </div>

      <div v-if="employeesStore.isLoading" class="flex justify-center p-12">
        <Loader2 :size="32" class="animate-spin text-indigo-600" />
      </div>

      <div v-else-if="employeesStore.members.length === 0" class="flex flex-col items-center justify-center p-16 opacity-60">
        <Users :size="48" class="text-gray-400 mb-4" />
        <p class="text-sm font-bold text-gray-500">{{ t.employees.empty }}</p>
      </div>

      <div v-else class="w-full">
        <EmployeesTable
            :members="employeesStore.members"
            @edit="openModal"
            @view-dashboard="navigateToDashboard"
            @manage-leaves="openLeaveModal"
        />
      </div>

      <div class="rounded-b-3xl overflow-hidden">
          <PaginationControls
              v-if="employeesStore.members.length > 0"
              :current-page="employeesStore.currentPage"
              :total-pages="employeesStore.totalPages"
              @page-change="loadData"
          />
      </div>
    </div>

    <EmployeeModal
        :is-open="isModalOpen"
        :is-editing="!!editingId"
        :is-submitting="isSubmitting"
        :form-data="formData"
        :available-roles="availableRoles"
        :policies="policiesStore.policies"
        :success-message="successMessage"
        :error-message="errorMessage"
        :on-close="closeModal"
        :on-submit="handleSubmit"
    />
    <EmployeeLeaveModal
        :is-open="isLeaveModalOpen"
        :employee-id="selectedEmployeeForLeave?.id || null"
        :employee-name="selectedEmployeeForLeave?.fullName || ''"
        @close="isLeaveModalOpen = false"
    />
  </div>
</template>