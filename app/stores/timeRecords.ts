import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from "~/stores/auth";

export interface TimeRecord {
    id: string
    timestamp: string
    type: 'IN' | 'OUT'
    source: string
}

export const useTimeRecordsStore = defineStore('timeRecords', () => {
    const dailyRecords = ref<TimeRecord[]>([])
    const isLoading = ref<boolean>(false)
    const isPunching = ref<boolean>(false)
    const authStore = useAuthStore()

    async function fetchDailyRecords(userId: string, date: string): Promise<void> {
        isLoading.value = true
        try {
            dailyRecords.value = await api<TimeRecord[]>(`/api/v1/records/daily?userId=${userId}&date=${date}`,{
                headers: {
                    'X-Workspace-Id': authStore.activeWorkspaceId
                }
            })
        } catch (error: unknown) {
            dailyRecords.value = []
        } finally {
            isLoading.value = false
        }
    }

    async function registerPunch(): Promise<void> {
        isPunching.value = true
        try {
            const newRecord = await api<TimeRecord>('/api/v1/records', {
                headers: {
                    'X-Workspace-Id': authStore.activeWorkspaceId
                },
                method: 'POST',
                body: { source: 'WEB' }
            })
            dailyRecords.value.push(newRecord)
        } catch (error: unknown) {
            throw error
        } finally {
            isPunching.value = false
        }
    }

    return {
        dailyRecords,
        isLoading,
        isPunching,
        fetchDailyRecords,
        registerPunch
    }
})