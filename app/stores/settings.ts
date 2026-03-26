import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from './auth'

export const useSettingsStore = defineStore('settings', () => {
    const authStore = useAuthStore()
    const currentApiKey = ref<string>('')
    const isLoading = ref(false)
    const isKeyNewlyGenerated = ref(false)

    async function fetchApiKey() {
        if (!authStore.activeWorkspaceId) return
        isLoading.value = true
        try {
            const response = await api<{ apiKey: string }>('/api/v1/settings/api-key', {
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })
            currentApiKey.value = response.apiKey
            isKeyNewlyGenerated.value = false
        } catch (error) {
            currentApiKey.value = ''
        } finally {
            isLoading.value = false
        }
    }

    async function generateNewApiKey(): Promise<boolean> {
        if (!authStore.activeWorkspaceId) return false
        isLoading.value = true
        try {
            const response = await api<{ apiKey: string }>('/api/v1/settings/api-key/generate', {
                method: 'POST',
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })
            currentApiKey.value = response.apiKey
            isKeyNewlyGenerated.value = true
            return true
        } catch (error) {
            return false
        } finally {
            isLoading.value = false
        }
    }

    return {
        currentApiKey,
        isLoading,
        isKeyNewlyGenerated,
        fetchApiKey,
        generateNewApiKey
    }
})