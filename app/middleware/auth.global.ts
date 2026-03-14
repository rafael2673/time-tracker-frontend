import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
    if (import.meta.client) {
        const authStore = useAuthStore()

        if (!authStore.isAuthenticated) {
            await authStore.initAuth()
        }

        if (to.path !== '/login' && !authStore.isAuthenticated) {
            return navigateTo('/login')
        }

        if (to.path === '/login' && authStore.isAuthenticated) {
            return navigateTo('/')
        }
    }
})