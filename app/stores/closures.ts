import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from './auth'

export interface MonthlyClosureResponse {
    id: string
    employeeName: string
    year: number
    month: number
    workedHours: number
    expectedHours: number
    rawBalance: number
    paidOvertimeHours: number
    bankedHoursDelta: number
    closedAt: string
}

export const useClosuresStore = defineStore('closures', () => {
    const authStore = useAuthStore()
    const closures = ref<MonthlyClosureResponse[]>([])
    const isLoading = ref(false)
    const isClosed = ref(false)

    async function fetchClosures(year: number, month: number) {
        if (!authStore.activeWorkspaceId) return
        isLoading.value = true
        try {
            const response = await api<MonthlyClosureResponse[]>(`/api/v1/closures/${year}/${month}`, {
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })
            closures.value = response
            isClosed.value = response.length > 0
        } catch (error) {
            closures.value = []
            isClosed.value = false
        } finally {
            isLoading.value = false
        }
    }

    async function executeClosure(year: number, month: number): Promise<boolean> {
        if (!authStore.activeWorkspaceId) return false
        try {
            const response = await api<MonthlyClosureResponse[]>(`/api/v1/closures/${year}/${month}`, {
                method: 'POST',
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })
            closures.value = response
            isClosed.value = true
            return true
        } catch (error) {
            return false
        }
    }

    return { closures, isLoading, isClosed, fetchClosures, executeClosure }
})