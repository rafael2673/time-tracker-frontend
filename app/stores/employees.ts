import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '~/utils/api'
import { useAuthStore } from './auth'

export interface Member {
    id: string
    fullName: string
    email: string
    role: string
    workPolicyName: string
}

export interface AddMemberRequest {
    email: string
    fullName: string
    role: string
    workPolicyId: string
}

export const useEmployeesStore = defineStore('employees', () => {
    const members = ref<Member[]>([])
    const isLoading = ref<boolean>(false)
    const authStore = useAuthStore()

    async function fetchMembers(): Promise<void> {
        if (!authStore.activeWorkspaceId) return

        isLoading.value = true
        try {
            members.value = await api<Member[]>(`/api/v1/workspaces/${authStore.activeWorkspaceId}/members`)
        } catch (error: unknown) {
            members.value = []
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function addMember(data: AddMemberRequest): Promise<void> {
        if (!authStore.activeWorkspaceId) return

        try {
            const newMember = await api<Member>(`/api/v1/workspaces/${authStore.activeWorkspaceId}/members`, {
                method: 'POST',
                body: data
            })
            members.value.push(newMember)
        } catch (error: unknown) {
            throw error
        }
    }

    return {
        members,
        isLoading,
        fetchMembers,
        addMember
    }
})