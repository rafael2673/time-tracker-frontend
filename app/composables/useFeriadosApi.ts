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
    const config = useRuntimeConfig()
    const token = config.public.feriadosApiToken
    const baseUrl = 'https://feriadosapi.com/api/v1'

    async function fetchEstados(): Promise<Estado[]> {
        if (!token) return []
        
        try {
            const response = await fetch(`${baseUrl}/estados`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                console.error('Failed to fetch states:', response.statusText)
                return []
            }
            const data = await response.json()
            return data.estados || []
        } catch (e) {
            console.error('Error fetching states:', e)
            return []
        }
    }

    async function fetchMunicipios(uf: string): Promise<Municipio[]> {
        if (!token || !uf) return []
        
        try {
            const response = await fetch(`${baseUrl}/municipios`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                console.error('Failed to fetch municipalities:', response.statusText)
                return []
            }
            const data = await response.json()
            
            const allMunicipios: Municipio[] = data.municipios || []
            return allMunicipios.filter(m => m.uf === uf)
        } catch (e) {
            console.error('Error fetching municipalities:', e)
            return []
        }
    }

    return {
        fetchEstados,
        fetchMunicipios
    }
}