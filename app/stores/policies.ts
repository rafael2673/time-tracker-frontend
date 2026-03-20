import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'

export interface WorkPolicy {
    id: string
    name: string
    dailyMinutesLimit: number
    toleranceMinutes: number
    workingDays: string
    overtimeStrategy: string
    maxBankHoursPerMonth: number
    bankExpirationMonths: number
}

export interface WorkPolicyRequest {
    name: string
    dailyMinutesLimit: number
    toleranceMinutes: number
    workingDays: string
    overtimeStrategy: string
    maxBankHoursPerMonth: number
    bankExpirationMonths: number
}

export const usePoliciesStore = defineStore('policies', () => {
    const policies = ref<WorkPolicy[]>([])
    const isLoading = ref<boolean>(false)

    async function fetchPolicies(): Promise<void> {
        isLoading.value = true
        try {
            policies.value = await api<WorkPolicy[]>('/api/v1/work-policies')
        } catch (error: unknown) {
            policies.value = []
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function createPolicy(data: WorkPolicyRequest): Promise<void> {
        try {
            const newPolicy = await api<WorkPolicy>('/api/v1/work-policies', {
                method: 'POST',
                body: data
            })
            policies.value.push(newPolicy)
        } catch (error: unknown) {
            throw error
        }
    }

    async function updatePolicy(id: string, data: WorkPolicyRequest): Promise<void> {
        try {
            const updated = await api<WorkPolicy>(`/api/v1/work-policies/${id}`, {
                method: 'PUT',
                body: data
            })
            const index = policies.value.findIndex(p => p.id === id)
            if (index !== -1) {
                policies.value[index] = updated
            }
        } catch (error: unknown) {
            throw error
        }
    }

    async function deletePolicy(id: string): Promise<void> {
        try {
            await api(`/api/v1/work-policies/${id}`, {
                method: 'DELETE'
            })
            policies.value = policies.value.filter(p => p.id !== id)
        } catch (error: unknown) {
            throw error
        }
    }

    return {
        policies,
        isLoading,
        fetchPolicies,
        createPolicy,
        updatePolicy,
        deletePolicy
    }
})