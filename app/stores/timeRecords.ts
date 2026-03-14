import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'

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

    async function fetchDailyRecords(userId: string, date: string): Promise<void> {
        isLoading.value = true
        try {
            dailyRecords.value = await api<TimeRecord[]>(`/api/v1/time-records/daily?userId=${userId}&date=${date}`)
        } catch (error: unknown) {
            dailyRecords.value = []
        } finally {
            isLoading.value = false
        }
    }

    async function registerPunch(): Promise<void> {
        isPunching.value = true
        try {
            const newRecord = await api<TimeRecord>('/api/v1/time-records', {
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