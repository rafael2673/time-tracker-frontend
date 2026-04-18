import { api } from '~/utils/api'
import { useAuthStore } from '~/stores/auth'

export interface Estado {
    uf: string
    nome: string
}

export interface Municipio {
    ibge: string
    nome: string
    uf: string
}

export function useFeriadosApi() {
    const authStore = useAuthStore()

    async function fetchEstados(): Promise<Estado[]> {
        if (!authStore.activeWorkspaceId) return []
        try {
            return await api<Estado[]>('/api/v1/locations/states', {
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })
        } catch (e) {
            return []
        }
    }

    async function fetchMunicipios(uf: string): Promise<Municipio[]> {
        if (!authStore.activeWorkspaceId || !uf) return []
        try {
            return await api<Municipio[]>(`/api/v1/locations/states/${uf}/municipalities`, {
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })
        } catch (e) {
            return []
        }
    }

    return {
        fetchEstados,
        fetchMunicipios
    }
}