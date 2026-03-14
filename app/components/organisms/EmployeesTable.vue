<script setup lang="ts">
import { Users } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
    members: any[]
}>()

const { t } = useLocale()

function getRoleTranslation(role: string): string {
    const rolesMap = t.value.employees.roles as Record<string, string>
    return rolesMap[role] || role
}

function getInitials(name: string): string {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
        const firstChar = parts[0]?.charAt(0) || ''
        const lastChar = parts[parts.length - 1]?.charAt(0) || ''
        return (firstChar + lastChar).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
}
</script>

<template>
    <div v-if="props.members.length === 0" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-16 text-center shadow-sm">
        <div class="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-gray-50/50 dark:ring-gray-800/50">
            <Users :size="32" class="text-gray-400 dark:text-gray-500" />
        </div>
        <p class="text-gray-600 dark:text-gray-400 font-semibold text-lg">{{ t.employees.empty }}</p>
    </div>

    <div v-else class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <tr>
                <th scope="col" class="px-6 py-5 font-semibold tracking-wider">{{ t.employees.name }}</th>
                <th scope="col" class="px-6 py-5 font-semibold tracking-wider">{{ t.employees.role }}</th>
                <th scope="col" class="px-6 py-5 font-semibold tracking-wider">{{ t.employees.policy }}</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="member in props.members" :key="member.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-100 dark:ring-indigo-800/50 shrink-0 shadow-inner">
                            {{ getInitials(member.fullName) }}
                        </div>
                        <div class="flex flex-col">
                            <span class="font-bold text-gray-900 dark:text-white">{{ member.fullName }}</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ member.email }}</span>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-bold text-[10px] uppercase tracking-widest border border-gray-200 dark:border-gray-700 shadow-sm">
                        {{ getRoleTranslation(member.role) }}
                    </span>
                </td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">
                    {{ member.workPolicyName }}
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>