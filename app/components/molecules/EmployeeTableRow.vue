<script setup lang="ts">
import { useLocale } from '~/composables/useLocale'
import type { WorkspaceMemberResponse } from '~/stores/employees'
import EmployeeActionMenu from '~/components/molecules/EmployeeActionMenu.vue'

const props = defineProps<{
  member: WorkspaceMemberResponse
}>()

const emit = defineEmits<{
  (e: 'edit', member: WorkspaceMemberResponse): void
  (e: 'view-dashboard', id: string): void
  (e: 'manage-leaves', member: WorkspaceMemberResponse): void
}>()

const { t } = useLocale()

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    const firstChar = parts[0]?.[0] || ''
    const lastChar = parts[parts.length - 1]?.[0] || ''
    return (firstChar + lastChar).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

function getRoleTranslation(role: string): string {
  const rolesMap = t.value.employees.roles as Record<string, string>
  return rolesMap[role] || role
}
</script>

<template>
  <tr @click="emit('view-dashboard', props.member.id)" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group relative cursor-pointer" :class="{'opacity-50 grayscale-[0.5]': !props.member.active}">
    <td class="px-6 py-4">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center ring-1 ring-indigo-100 dark:ring-indigo-800/50 shrink-0">
          {{ getInitials(props.member.fullName) }}
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <p class="font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" :class="{'line-through decoration-gray-400': !props.member.active}">{{ props.member.fullName }}</p>
            <span v-if="!props.member.active" class="px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[8px] font-bold rounded uppercase tracking-widest">{{ t.employees.inactive || 'Inativo' }}</span>
          </div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{{ props.member.email }}</p>
        </div>
      </div>
    </td>
    <td class="px-6 py-4">
            <span class="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-bold rounded-lg border border-gray-200 dark:border-gray-700 uppercase tracking-widest whitespace-nowrap">
                {{ getRoleTranslation(props.member.role) }}
            </span>
    </td>
    <td class="px-6 py-4">
      <span class="text-sm font-bold text-gray-700 dark:text-gray-300 truncate block">{{ props.member.workPolicyName || '--' }}</span>
    </td>
    <td class="px-6 py-4 text-right" @click.stop>
      <EmployeeActionMenu
          :employee-id="props.member.id"
          :is-active="props.member.active"
          @edit="emit('edit', props.member)"
          @view-dashboard="emit('view-dashboard', props.member.id)"
          @manage-leaves="emit('manage-leaves', props.member)"
      />
    </td>
  </tr>
</template>