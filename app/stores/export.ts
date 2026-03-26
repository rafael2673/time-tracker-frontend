import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from './auth'

export const useExportStore = defineStore('export', () => {
    const authStore = useAuthStore()

    const isExporting = ref(false)
    const exportProgress = ref(0)
    const exportStatus = ref<'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(null)

    let pollingInterval: ReturnType<typeof setInterval> | null = null

    async function startBulkExport(year: number, month: number, locale: string) {
        if (isExporting.value || !authStore.activeWorkspaceId) return

        isExporting.value = true
        exportProgress.value = 0
        exportStatus.value = 'PENDING'

        try {
            const response = await api<{ id: string, status: any, progress: number }>('/api/v1/reports/export/bulk', {
                method: 'POST',
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId },
                body: { year, month, locale }
            })
            startPolling(response.id)
        } catch (error) {
            isExporting.value = false
            exportStatus.value = 'FAILED'
        }
    }

    function startPolling(jobId: string) {
        pollingInterval = setInterval(async () => {
            if (!authStore.activeWorkspaceId) return stopPolling()

            try {
                const response = await api<{ id: string, status: any, progress: number }>(`/api/v1/reports/export/${jobId}/status`, {
                    headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
                })

                exportProgress.value = response.progress
                exportStatus.value = response.status

                if (response.status === 'COMPLETED') {
                    stopPolling()
                    await downloadExport(jobId)
                    setTimeout(() => resetState(), 3000)
                } else if (response.status === 'FAILED') {
                    stopPolling()
                    setTimeout(() => resetState(), 4000)
                }
            } catch (error) {
                stopPolling()
                exportStatus.value = 'FAILED'
                setTimeout(() => resetState(), 4000)
            }
        }, 2000)
    }

    function stopPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval)
            pollingInterval = null
        }
    }

    function resetState() {
        isExporting.value = false
        exportProgress.value = 0
        exportStatus.value = null
    }

    async function downloadExport(jobId: string) {
        if (!authStore.activeWorkspaceId) return

        try {
            const blob = await api<Blob>(`/api/v1/reports/export/${jobId}/download`, {
                headers: {
                    'X-Workspace-Id': authStore.activeWorkspaceId
                },
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'fechamento_lote.zip'
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            exportStatus.value = 'FAILED'
        }
    }

    return {
        isExporting,
        exportProgress,
        exportStatus,
        startBulkExport
    }
})