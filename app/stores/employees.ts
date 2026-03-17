import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from './auth'

export interface WorkspaceMemberResponse {
    id: string
    fullName: string
    email: string
    role: string
    workPolicyName: string
    workPolicyId: string
    joinedAt: string
    active: boolean
}

export interface AddMemberRequest {
    email: string
    fullName: string
    role: string
    workPolicyId: string
}

export interface UpdateMemberRequest {
    fullName: string
    role: string
    workPolicyId: string
}

export interface GenerateLinkCodeResponse {
    code: string
    expiresAt: string
}

export interface EmployeeLeaveResponse {
    id: string
    startDate: string
    endDate: string
    reason: string
}

export interface EmployeeLeaveRequest {
    startDate: string
    endDate: string
    reason: string
}

export interface PageResponse<T> {
    content: T[]
    totalPages: number
    totalElements: number
    number: number
}

export const useEmployeesStore = defineStore('employees', () => {
    const authStore = useAuthStore()
    const members = ref<WorkspaceMemberResponse[]>([])
    const employeeLeaves = ref<EmployeeLeaveResponse[]>([])
    const currentPage = ref(0)
    const totalPages = ref(0)
    const totalElements = ref(0)
    const isLoading = ref(false)

    async function fetchMembers(page: number = 0, search: string = '', role: string = '') {
        if (!authStore.activeWorkspaceId) return
        isLoading.value = true
        try {
            const query = new URLSearchParams({ page: String(page), size: '10' })
            if (search) query.append('search', search)
            if (role) query.append('role', role)

            const response = await api<PageResponse<WorkspaceMemberResponse>>(`/api/v1/workspaces/${authStore.activeWorkspaceId}/members?${query.toString()}`, {
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })

            members.value = response.content
            currentPage.value = response.number
            totalPages.value = response.totalPages
            totalElements.value = response.totalElements
        } catch (error) {
            members.value = []
        } finally {
            isLoading.value = false
        }
    }

    async function addMember(request: AddMemberRequest) {
        if (!authStore.activeWorkspaceId) return
        await api(`/api/v1/workspaces/${authStore.activeWorkspaceId}/members`, {
            method: 'POST',
            body: request
        })
        await fetchMembers(currentPage.value)
    }

    async function updateMember(employeeId: string, request: UpdateMemberRequest) {
        if (!authStore.activeWorkspaceId) return
        await api(`/api/v1/workspaces/${authStore.activeWorkspaceId}/members/${employeeId}`, {
            method: 'PUT',
            body: request
        })
        await fetchMembers(currentPage.value)
    }

    async function changeStatus(employeeId: string, active: boolean) {
        if (!authStore.activeWorkspaceId) return
        await api(`/api/v1/workspaces/${authStore.activeWorkspaceId}/members/${employeeId}/status?active=${active}`, {
            method: 'PATCH'
        })
        await fetchMembers(currentPage.value)
    }

    async function generateAccessCode(employeeId: string): Promise<GenerateLinkCodeResponse | null> {
        if (!authStore.activeWorkspaceId) return null
        try {
            return await api<GenerateLinkCodeResponse>(`/api/v1/users/${employeeId}/generate-access-code`, {
                method: 'POST',
                headers: { 'X-Workspace-Id': authStore.activeWorkspaceId }
            })
        } catch (error) {
            return null
        }
    }

    async function fetchLeaves(employeeId: string) {
        if (!authStore.activeWorkspaceId) return
        try {
            employeeLeaves.value = await api<EmployeeLeaveResponse[]>(`/api/v1/workspaces/${authStore.activeWorkspaceId}/leaves/${employeeId}`)
        } catch (error) {
            employeeLeaves.value = []
        }
    }

    async function addLeave(employeeId: string, request: EmployeeLeaveRequest) {
        if (!authStore.activeWorkspaceId) return
        await api(`/api/v1/workspaces/${authStore.activeWorkspaceId}/leaves/${employeeId}`, {
            method: 'POST',
            body: request
        })
        await fetchLeaves(employeeId)
    }
    async function updateLeave(leaveId: string, request: EmployeeLeaveRequest) {
        if (!authStore.activeWorkspaceId) return
        const updatedLeave = await api<EmployeeLeaveResponse>(`/api/v1/workspaces/${authStore.activeWorkspaceId}/leaves/${leaveId}`, {
            method: 'PUT',
            body: request
        })
        const index = employeeLeaves.value.findIndex(l => l.id === leaveId)
        if (index !== -1) {
            employeeLeaves.value[index] = updatedLeave
        }
    }
    async function removeLeave(leaveId: string) {
        if (!authStore.activeWorkspaceId) return
        await api(`/api/v1/workspaces/${authStore.activeWorkspaceId}/leaves/${leaveId}`, {
            method: 'DELETE'
        })
        employeeLeaves.value = employeeLeaves.value.filter(l => l.id !== leaveId)
    }

    return {
        members,
        employeeLeaves,
        currentPage,
        totalPages,
        totalElements,
        isLoading,
        fetchMembers,
        addMember,
        updateMember,
        changeStatus,
        generateAccessCode,
        fetchLeaves,
        addLeave,
        updateLeave,
        removeLeave
    }
})