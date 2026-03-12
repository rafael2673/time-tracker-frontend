import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface AuthResponse {
    accessToken?: string
    token?: string
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(null)
    const isAuthenticated = ref<boolean>(false)
    const router = useRouter()

    function setToken(newToken: string | null): void {
        token.value = newToken
        isAuthenticated.value = !!newToken

        if (newToken) {
            localStorage.setItem('tt_token', newToken)
        } else {
            localStorage.removeItem('tt_token')
        }
    }

    async function login(email: string, password: string): Promise<boolean> {
        try {
            const response = await $fetch<AuthResponse>('/api/v1/auth/authenticate', {
                method: 'POST',
                body: { email, password }
            })

            const validToken = response.accessToken || response.token

            if (validToken) {
                setToken(validToken)
                return true
            }

            return false
        } catch (error: unknown) {
            return false
        }
    }

    async function requestFirstAccess(email: string): Promise<string | null> {
        try {
            const response: any = await $fetch('/api/v1/auth/first-access', {
                method: 'POST',
                body: { email }
            })
            return response.code
        } catch (error: unknown) {
            return null
        }
    }

    async function setFirstPassword(code: string, newPassword: string): Promise<boolean> {
        try {
            const response = await $fetch<AuthResponse>('/api/v1/auth/link-account', {
                method: 'POST',
                body: { code, newPassword }
            })

            const validToken = response.accessToken || response.token

            if (validToken) {
                setToken(validToken)
                return true
            }

            return false
        } catch (error: unknown) {
            return false
        }
    }

    function initAuth(): void {
        const savedToken = localStorage.getItem('tt_token')
        if (savedToken) {
            setToken(savedToken)
        }
    }

    function logout(): void {
        setToken(null)
        router.push('/login')
    }

    return {
        token,
        isAuthenticated,
        setToken,
        login,
        requestFirstAccess,
        setFirstPassword,
        logout,
        initAuth
    }
})