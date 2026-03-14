import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from './auth'

export interface SpecialDateResponse {
    id: string
    date: string
    description: string
    workloadMultiplier: number
    isRecurring: boolean
}

export interface SpecialDateRequest {
    date: string
    description: string
    workloadMultiplier: number
    isRecurring: boolean
}

export interface PageResponse<T> {
    content: T[]
    totalPages: number
    totalElements: number
    number: number
}

export const useSpecialDatesStore = defineStore('specialDates', () => {
    const authStore = useAuthStore()
    const specialDates = ref<SpecialDateResponse[]>([])
    const currentPage = ref(0)
    const totalPages = ref(0)
    const totalElements = ref(0)
    const isLoading = ref(false)

    async function fetchByYear(year: number, page: number = 0, search: string = '') {
        if (!authStore.activeWorkspaceId) return
        isLoading.value = true
        try {
            const query = new URLSearchParams({
                year: String(year),
                page: String(page),
                size: '10'
            })
            if (search) query.append('search', search)

            const response = await api<PageResponse<SpecialDateResponse>>(`/api/v1/special-dates?${query.toString()}`, {
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })

            specialDates.value = response.content
            currentPage.value = response.number
            totalPages.value = response.totalPages
            totalElements.value = response.totalElements
        } catch (error) {
            specialDates.value = []
        } finally {
            isLoading.value = false
        }
    }

    async function create(request: SpecialDateRequest): Promise<boolean> {
        if (!authStore.activeWorkspaceId) return false
        try {
            await api<SpecialDateResponse>('/api/v1/special-dates', {
                method: 'POST',
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId },
                body: request
            })
            return true
        } catch (error) {
            return false
        }
    }

    async function update(id: string, request: SpecialDateRequest): Promise<boolean> {
        if (!authStore.activeWorkspaceId) return false
        try {
            await api<SpecialDateResponse>(`/api/v1/special-dates/${id}`, {
                method: 'PUT',
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId },
                body: request
            })
            return true
        } catch (error) {
            return false
        }
    }

    async function remove(id: string): Promise<boolean> {
        if (!authStore.activeWorkspaceId) return false
        try {
            await api(`/api/v1/special-dates/${id}`, {
                method: 'DELETE',
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })
            return true
        } catch (error) {
            return false
        }
    }

    async function importNationalHolidays(year: number): Promise<boolean> {
        if (!authStore.activeWorkspaceId) return false
        try {
            await api(`/api/v1/special-dates/import-national?year=${year}`, {
                method: 'POST',
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })
            return true
        } catch (error) {
            return false
        }
    }

    return {
        specialDates,
        currentPage,
        totalPages,
        totalElements,
        isLoading,
        fetchByYear,
        create,
        update,
        remove,
        importNationalHolidays
    }
})