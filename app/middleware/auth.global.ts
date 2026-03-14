import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.client) {
        const authStore = useAuthStore()

        if (!authStore.isAuthenticated) {
            authStore.initAuth()
        }

        if (to.path !== '/login' && !authStore.isAuthenticated) {
            return navigateTo('/login')
        }

        if (to.path === '/login' && authStore.isAuthenticated) {
            return navigateTo('/')
        }
    }
})