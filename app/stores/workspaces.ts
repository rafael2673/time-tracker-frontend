import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from './auth'
import { useLocale } from '~/composables/useLocale'

export interface Workspace {
    id: string
    name: string
    role: string
    autoClosureEnabled?: boolean
    closureTargetDay?: number
    closureCountType?: string
    closureShiftRule?: string
    closurePendingStrategy?: string
}

export const useWorkspaceStore = defineStore('workspaces', () => {
    const workspaces = ref<Workspace[]>([])
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const authStore = useAuthStore()
    const { t } = useLocale()

    async function fetchMyWorkspaces(): Promise<void> {
        isLoading.value = true
        try {
            workspaces.value = await api<Workspace[]>('/api/v1/workspaces/my')

            if (workspaces.value.length > 0 && !authStore.activeWorkspaceId) {
                const firstId = workspaces.value[0]?.id
                if (firstId) {
                    authStore.setActiveWorkspace(firstId)
                }
            }
        } catch (e: unknown) {
            error.value = (e as Error).message
            workspaces.value = []
        } finally {
            isLoading.value = false
        }
    }

    async function updateAutoClosureSettings(workspaceId: string, payload: any): Promise<boolean> {
        isLoading.value = true
        error.value = null
        try {
            const updatedWorkspace = await api<Workspace>(`/api/v1/workspaces/${workspaceId}/auto-closure`, {
                method: 'PUT',
                body: payload
            })

            const index = workspaces.value.findIndex(w => w.id === workspaceId)
            if (index !== -1) {
                workspaces.value[index] = { ...workspaces.value[index], ...updatedWorkspace }
            }

            return true
        } catch (e: any) {
            error.value = e.data?.message || t.value.settings.error
            return false
        } finally {
            isLoading.value = false
        }
    }

    return {
        workspaces,
        isLoading,
        error,
        fetchMyWorkspaces,
        updateAutoClosureSettings,
    }
})