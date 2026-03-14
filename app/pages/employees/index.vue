<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useEmployeesStore, type AddMemberRequest } from '~/stores/employees'
import { usePoliciesStore } from '~/stores/policies'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useAuthStore } from '~/stores/auth'
import { useLocale } from '~/composables/useLocale'
import { Plus, Loader2 } from 'lucide-vue-next'
import EmployeesTable from '~/components/organisms/EmployeesTable.vue'
import EmployeeModal from '~/components/organisms/EmployeeModal.vue'

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

        <EmployeesTable
                v-else
                :members="employeesStore.members"
        />

        <EmployeeModal
                :is-open="isModalOpen"
                :is-submitting="isSubmitting"
                :form-data="formData"
                :available-roles="availableRoles"
                :policies="policiesStore.policies"
                :success-message="successMessage"
                :error-message="errorMessage"
                :on-close="closeModal"
                :on-submit="handleSubmit"
        />
    </div>
</template>