import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from './auth'
import { useLocale } from '~/composables/useLocale'

export interface EmployeeDashboardSummary {
    workedHours: number
    balance: number
    pendingJustifications: number
}

export interface MonthlyBalanceResponse {
    workedHours: number
    expectedHours: number
    balance: number
}

export interface MonthSummaryResponse {
    month: number
    monthName: string
    workedHours: number
    expectedHours: number
}

export interface DailySummaryResponse {
    day: string
    hours: number
    expectedHours: number
    date: string
}

export interface NextHolidayResponse {
    name: string
    date: string
    multiplier: number
}

export interface AbsencePieChartResponse {
    totalExpectedDays: number
    totalAbsences: number
    absencePercentage: number
}

export const useSummaryStore = defineStore('summary', () => {
    const authStore = useAuthStore()
    const { locale } = useLocale()

    const employeeSummary = ref<EmployeeDashboardSummary | null>(null)
    const monthlyBalance = ref<MonthlyBalanceResponse | null>(null)
    const yearlySummary = ref<MonthSummaryResponse[]>([])
    const weeklySummary = ref<DailySummaryResponse[]>([])
    const availableYears = ref<number[]>([])

    const isLoadingSummary = ref(false)

    const nextHoliday = ref<NextHolidayResponse | null>(null)
    const companyAbsences = ref<AbsencePieChartResponse | null>(null)
    const companyYearlyAverage = ref<MonthSummaryResponse[]>([])

    async function fetchNextHoliday() {
        if (!authStore.activeWorkspaceId) return
        try {
            nextHoliday.value = await api<NextHolidayResponse>('/api/v1/summary/next-holiday', {
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })
        } catch (error) {
            nextHoliday.value = null
        }
    }

    async function fetchCompanyAbsences(year: number, month: number) {
        if (!authStore.activeWorkspaceId) return
        try {
            companyAbsences.value = await api<AbsencePieChartResponse>(`/api/v1/summary/company/absences?year=${year}&month=${month}`, {
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })
        } catch (error) {
            companyAbsences.value = null
        }
    }

    async function fetchCompanyYearlyAverage(year: number, policyId?: string) {
        if (!authStore.activeWorkspaceId) return
        try {
            const url = policyId
                ? `/api/v1/summary/company/yearly?year=${year}&policyId=${policyId}`
                : `/api/v1/summary/company/yearly?year=${year}`

            companyYearlyAverage.value = await api<MonthSummaryResponse[]>(url, {
                headers: {
                    'X-Workspace-Id': authStore.activeWorkspaceId,
                    'Accept-Language': locale.value
                }
            })
        } catch (error) {
            companyYearlyAverage.value = []
        }
    }

    async function fetchEmployeeSummary(employeeId: string) {
        if (!authStore.activeWorkspaceId) return

        isLoadingSummary.value = true
        try {
            employeeSummary.value = await api<EmployeeDashboardSummary>(`/api/v1/summary/employee/${employeeId}`, {
                headers: {
                    'X-Workspace-Id': authStore.activeWorkspaceId
                }
            })
        } catch (error) {
            console.error('Failed to fetch employee summary:', error)
            employeeSummary.value = null
        } finally {
            isLoadingSummary.value = false
        }
    }

    async function fetchMonthlyBalance(year: number, month: number) {
        try {
            monthlyBalance.value = await api<MonthlyBalanceResponse>(`/api/v1/summary/monthly-balance?year=${year}&month=${month}`)
        } catch (error) {
            console.error('Failed to fetch monthly balance:', error)
            monthlyBalance.value = null
        }
    }

    async function fetchYearlySummary(year: number) {
        try {
            yearlySummary.value = await api<MonthSummaryResponse[]>(`/api/v1/summary/yearly?year=${year}`, {
                headers: { 'Accept-Language': locale.value, 'X-Workspace-Id': authStore.activeWorkspaceId || '' }
            })
        } catch (error) {
            console.error('Failed to fetch yearly summary:', error)
            yearlySummary.value = []
        }
    }

    async function fetchWeeklySummary(date: string) {
        try {
            weeklySummary.value = await api<DailySummaryResponse[]>(`/api/v1/summary/weekly?date=${date}`, {
                headers: { 'Accept-Language': locale.value, 'X-Workspace-Id': authStore.activeWorkspaceId || '' }
            })
        } catch (error) {
            console.error('Failed to fetch weekly summary:', error)
            weeklySummary.value = []
        }
    }

    async function fetchAvailableYears() {
        try {
            availableYears.value = await api<number[]>('/api/v1/summary/years')
        } catch (error) {
            console.error('Failed to fetch available years:', error)
            availableYears.value = []
        }
    }

    watch(locale, () => {
        if (!authStore.activeWorkspaceId) return
        const currentYear = new Date().getFullYear()
        const currentDate = new Date().toISOString().split('T')[0] || ''
        
        Promise.all([
            fetchYearlySummary(currentYear),
            fetchWeeklySummary(currentDate)
        ]).catch(console.error)
    })

    return {
        employeeSummary,
        monthlyBalance,
        yearlySummary,
        weeklySummary,
        companyAbsences,
        companyYearlyAverage,
        availableYears,
        isLoadingSummary,
        nextHoliday,
        fetchEmployeeSummary,
        fetchMonthlyBalance,
        fetchYearlySummary,
        fetchWeeklySummary,
        fetchAvailableYears,
        fetchNextHoliday,
        fetchCompanyAbsences,
        fetchCompanyYearlyAverage
    }
})