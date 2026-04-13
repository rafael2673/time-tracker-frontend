import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from './auth'
import type { PageResponse } from './employees'

export interface PendingRecordResponse {
    id: string
    employeeName: string
    recordType: string
    registeredAt: string
    justification: string
    rejected: boolean
}

export const useApprovalsStore = defineStore('approvals', () => {
    const authStore = useAuthStore()
    const pendingRecords = ref<PendingRecordResponse[]>([])
    const historyRecords = ref<PendingRecordResponse[]>([])
    const currentPage = ref(0)
    const totalPages = ref(0)
    const totalElements = ref(0)
    const isLoading = ref(false)

    async function fetchPending(page: number = 0, search: string = '') {
        if (!authStore.activeWorkspaceId) return
        isLoading.value = true
        try {
            const query = new URLSearchParams({ page: String(page), size: '10' })
            if (search) query.append('search', search)

            const response = await api<PageResponse<PendingRecordResponse>>(`/api/v1/records/pending?${query.toString()}`, {
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })

            pendingRecords.value = response.content
            currentPage.value = response.number
            totalPages.value = response.totalPages
            totalElements.value = response.totalElements
        } catch (error) {
            pendingRecords.value = []
        } finally {
            isLoading.value = false
        }
    }

    async function fetchHistory(page: number, search: string = '', date: string = '', status: string = '') {
        if (!authStore.activeWorkspaceId) return
        isLoading.value = true
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: '10'
            })

            if (search) params.append('search', search)
            if (date) params.append('date', date)
            if (status) params.append('status', status)

            const response = await api<PageResponse<PendingRecordResponse>>(`/api/v1/records/history?${params.toString()}`, {
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })

            historyRecords.value = response.content
            totalPages.value = response.totalPages
            currentPage.value = response.number
        } catch (error) {
            historyRecords.value = []
        } finally {
            isLoading.value = false
        }
    }

    async function approve(id: string): Promise<boolean> {
        if (!authStore.activeWorkspaceId) return false
        try {
            await api(`/api/v1/records/${id}/approve`, {
                method: 'PATCH',
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })
            return true
        } catch (error) {
            return false
        }
    }

    async function reject(id: string): Promise<boolean> {
        if (!authStore.activeWorkspaceId) return false
        try {
            await api(`/api/v1/records/${id}/reject`, {
                method: 'PATCH',
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })
            return true
        } catch (error) {
            return false
        }
    }

    return {
        pendingRecords,
        historyRecords,
        currentPage,
        totalPages,
        totalElements,
        isLoading,
        fetchPending,
        fetchHistory,
        approve,
        reject
    }
})