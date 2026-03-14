import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from './auth'

export interface Workspace {
    id: string
    name: string
    role: string
}

export const useWorkspaceStore = defineStore('workspaces', () => {
    const workspaces = ref<Workspace[]>([])
    const isLoading = ref<boolean>(false)
    const authStore = useAuthStore()

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
        } catch (error: unknown) {
            workspaces.value = []
        } finally {
            isLoading.value = false
        }
    }

    return {
        workspaces,
        isLoading,
        fetchMyWorkspaces
    }
})