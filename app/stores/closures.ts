import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from './auth'
import {useLocale} from "~/composables/useLocale";

export interface MonthlyClosureResponse {
    id: string
    userId: string
    employeeName: string
    year: number
    month: number
    workedHours: number
    expectedHours: number
    rawBalance: number
    paidOvertimeHours: number
    bankedHoursDelta: number
    accumulatedBankHours: number
    closedAt: string
}

export const useClosuresStore = defineStore('closures', () => {
    const authStore = useAuthStore()
    const closures = ref<MonthlyClosureResponse[]>([])
    const isLoading = ref(false)
    const isClosed = ref(false)
    const { locale } = useLocale()

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

    async function downloadTimesheet(userId: string, employeeName: string, year: number, month: number): Promise<void> {
        if (!authStore.token || !authStore.activeWorkspaceId) {
            throw new Error('Missing authentication or workspace context')
        }

        const query = new URLSearchParams({
            userId,
            year: String(year),
            month: String(month)
        })

        const response = await fetch(`/api/v1/reports/timesheet?${query.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authStore.token}`,
                'X-Workspace-Id': authStore.activeWorkspaceId,
                'Accept-Language': locale.value,
            }
        })

        if (!response.ok) {
            throw new Error('Failed to download timesheet')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url

        const formattedMonth = String(month).padStart(2, '0')
        const safeEmployeeName = employeeName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        a.download = `${safeEmployeeName}_${formattedMonth}-${year}.xlsx`

        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
    }

    return { closures, isLoading, isClosed, downloadTimesheet, fetchClosures, executeClosure }
})