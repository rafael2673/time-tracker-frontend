import { useAuthStore } from '../stores/auth'

export const api = async <T>(url: string, options: any = {}): Promise<T> => {
    const authStore = useAuthStore()

    const headers = {
        ...options.headers,
        ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {})
    }

    if (authStore.activeWorkspaceId) {
        headers['X-Workspace-Id'] = authStore.activeWorkspaceId
    }

    try {
        return await $fetch<T>(url, {
            ...options,
            headers
        })
    } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            authStore.logout()
        }
        throw error
    }
}