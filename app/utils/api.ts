export const api = async <T>(url: string, options: any = {}): Promise<T> => {
    const authStore = useAuthStore()

    const headers: Record<string, string> = {
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
        const statusCode = error.status || error.response?.status

        if (statusCode === 401 || statusCode === 403) {
            await authStore.logout()
        }
        throw error
    }
}
