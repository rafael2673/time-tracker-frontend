import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'

interface AuthResponse {
    accessToken?: string
    token?: string
}

interface UserProfile {
    id: string
    fullName: string
    email: string
    role: string
    workspaceId: string
    workspaceName: string
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(null)
    const isAuthenticated = ref<boolean>(false)
    const user = ref<UserProfile | null>(null)
    const activeWorkspaceId = ref<string | null>(null)

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

    function setActiveWorkspace(workspaceId: string): void {
        activeWorkspaceId.value = workspaceId
        localStorage.setItem('tt_workspace', workspaceId)
    }

    async function fetchProfile(): Promise<void> {
        try {
            // Em breve criaremos a rota /api/v1/users/me no backend para popular isso
            // user.value = await api<UserProfile>('/api/v1/users/me')
        } catch (error) {
            console.error('Failed to fetch profile', error)
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
                await fetchProfile()
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
                await fetchProfile()
                return true
            }
            return false
        } catch (error: unknown) {
            return false
        }
    }

    function initAuth(): void {
        const savedToken = localStorage.getItem('tt_token')
        const savedWorkspace = localStorage.getItem('tt_workspace')

        if (savedToken) {
            setToken(savedToken)
            if (savedWorkspace) {
                setActiveWorkspace(savedWorkspace)
            }
            fetchProfile()
        }
    }

    function logout(): void {
        setToken(null)
        user.value = null
        activeWorkspaceId.value = null
        localStorage.removeItem('tt_workspace')
        router.push('/login')
    }

    return {
        token,
        isAuthenticated,
        user,
        activeWorkspaceId,
        setToken,
        setActiveWorkspace,
        login,
        requestFirstAccess,
        setFirstPassword,
        logout,
        initAuth
    }
})