<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePoliciesStore, type WorkPolicy, type WorkPolicyRequest } from '~/stores/policies'
import { useLocale } from '~/composables/useLocale'
import { Plus, Loader2 } from 'lucide-vue-next'
import ConfirmModal from '~/components/molecules/ConfirmModal.vue'
import PoliciesList from '~/components/organisms/PoliciesList.vue'
import PolicyModal from '~/components/organisms/PolicyModal.vue'

const policiesStore = usePoliciesStore()
const { t } = useLocale()

const isModalOpen = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string>('')
const pageSuccessMessage = ref<string>('')

const showConfirmModal = ref<boolean>(false)
const policyToDelete = ref<string | null>(null)
const isDeleting = ref<boolean>(false)

const editingId = ref<string | null>(null)
const formData = ref({
    name: '',
    dailyTime: '08:00',
    toleranceMinutes: 10,
    workingDays: [] as string[]
})

const availableDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

onMounted(async () => {
    try {
        await policiesStore.fetchPolicies()
    } catch (error: unknown) {
        errorMessage.value = t.value.policies.errorSave
    }
})

function formatMinutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0')
    const m = (minutes % 60).toString().padStart(2, '0')
    return `${h}:${m}`
}

function parseTimeToMinutes(timeStr: string): number {
    const parts = timeStr.split(':').map(Number)
    const h = parts[0] || 0
    const m = parts[1] || 0
    return (h * 60) + m
}

function openCreateModal(): void {
    editingId.value = null
    formData.value = {
        name: '',
        dailyTime: '08:00',
        toleranceMinutes: 10,
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    }
    errorMessage.value = ''
    isModalOpen.value = true
}

function openEditModal(policy: WorkPolicy): void {
    editingId.value = policy.id
    formData.value = {
        name: policy.name,
        dailyTime: formatMinutesToTime(policy.dailyMinutesLimit),
        toleranceMinutes: policy.toleranceMinutes,
        workingDays: policy.workingDays ? policy.workingDays.split(',') : []
    }
    errorMessage.value = ''
    isModalOpen.value = true
}

function confirmDelete(id: string): void {
    policyToDelete.value = id
    showConfirmModal.value = true
}

function cancelDelete(): void {
    showConfirmModal.value = false
    policyToDelete.value = null
}

async function executeDelete(): Promise<void> {
    if (!policyToDelete.value) return
    isDeleting.value = true

    try {
        await policiesStore.deletePolicy(policyToDelete.value)
        showPageSuccess(t.value.policies.successDelete)
        showConfirmModal.value = false
    } catch (error: unknown) {
        showPageSuccess(t.value.policies.errorSave)
    } finally {
        isDeleting.value = false
        policyToDelete.value = null
    }
}

function closeModal(): void {
    if (!isSubmitting.value) {
        isModalOpen.value = false
    }
}

function toggleDay(day: string): void {
    const index = formData.value.workingDays.indexOf(day)
    if (index === -1) {
        formData.value.workingDays.push(day)
    } else {
        formData.value.workingDays.splice(index, 1)
    }
}

function showPageSuccess(msg: string) {
    pageSuccessMessage.value = msg
    setTimeout(() => {
        pageSuccessMessage.value = ''
    }, 3000)
}

async function handleSubmit(): Promise<void> {
    if (isSubmitting.value) return
    isSubmitting.value = true
    errorMessage.value = ''

    const requestData: WorkPolicyRequest = {
        name: formData.value.name,
        dailyMinutesLimit: parseTimeToMinutes(formData.value.dailyTime),
        toleranceMinutes: Number(formData.value.toleranceMinutes),
        workingDays: formData.value.workingDays.join(',')
    }

    try {
        if (editingId.value) {
            await policiesStore.updatePolicy(editingId.value, requestData)
            showPageSuccess(t.value.policies.successEdit)
        } else {
            await policiesStore.createPolicy(requestData)
            showPageSuccess(t.value.policies.successAdd)
        }
        isSubmitting.value = false
        closeModal()
    } catch (error: unknown) {
        errorMessage.value = t.value.policies.errorSave
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{{ t.policies.title }}</h1>
            <button @click="openCreateModal" class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95">
                <Plus :size="18" />
                {{ t.policies.newPolicy }}
            </button>
        </div>

        <div v-if="pageSuccessMessage" class="p-4 text-sm font-bold text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-800/50 animate-in fade-in duration-300">
            {{ pageSuccessMessage }}
        </div>

        <div v-if="policiesStore.isLoading" class="flex justify-center py-12">
            <Loader2 :size="32" class="animate-spin text-indigo-600" />
        </div>

        <PoliciesList
                v-else
                :policies="policiesStore.policies"
                :on-edit="openEditModal"
                :on-delete="confirmDelete"
        />

        <PolicyModal
                :is-open="isModalOpen"
                :is-submitting="isSubmitting"
                :editing-id="editingId"
                :form-data="formData"
                :available-days="availableDays"
                :error-message="errorMessage"
                :on-close="closeModal"
                :on-submit="handleSubmit"
                :on-toggle-day="toggleDay"
        />

        <ConfirmModal
                :show="showConfirmModal"
                :title="t.modal.deletePolicyTitle"
                :message="t.policies.confirmDelete"
                :is-loading="isDeleting"
                @confirm="executeDelete"
                @cancel="cancelDelete"
        />
    </div>
</template>