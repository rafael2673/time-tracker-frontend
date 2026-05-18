import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'

export interface WorkspaceSummaryResponse {
    id: string
    name: string
    memberCount: number
    active: boolean
}

export interface SaasMetricsResponse {
    totalWorkspaces: number
    totalActiveUsers: number
    totalRecordsLast24h: number
}

export const useSystemAdminStore = defineStore('systemAdmin', () => {
    const workspaces = ref<WorkspaceSummaryResponse[]>([])
    const metrics = ref<SaasMetricsResponse | null>(null)
    const isLoading = ref(false)

    async function fetchAllWorkspaces() {
        isLoading.value = true
        try {
            workspaces.value = await api<WorkspaceSummaryResponse[]>('/api/v1/system-admin/workspaces')
        } catch (error) {
            workspaces.value = []
        } finally {
            isLoading.value = false
        }
    }

    async function fetchMetrics() {
        try {
            metrics.value = await api<SaasMetricsResponse>('/api/v1/system-admin/metrics')
        } catch (error) {
            metrics.value = null
        }
    }

    async function toggleWorkspaceStatus(id: string, active: boolean): Promise<boolean> {
        try {
            await api(`/api/v1/system-admin/workspaces/${id}/status?active=${active}`, {
                method: 'PATCH'
            })
            const index = workspaces.value.findIndex(w => w.id === id)
            if (index !== -1) {
                workspaces.value[index].active = active
            }
            return true
        } catch (error) {
            return false
        }
    }

    return {
        workspaces,
        metrics,
        isLoading,
        fetchAllWorkspaces,
        fetchMetrics,
        toggleWorkspaceStatus
    }
})