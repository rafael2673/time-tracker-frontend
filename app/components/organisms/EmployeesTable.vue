<script setup lang="ts">
import { useLocale } from '~/composables/useLocale'
import type { WorkspaceMemberResponse } from '~/stores/employees'
import EmployeeTableRow from '~/components/molecules/EmployeeTableRow.vue'

const props = defineProps<{
  members: WorkspaceMemberResponse[]
}>()

const emit = defineEmits<{
  (e: 'edit', member: WorkspaceMemberResponse): void
  (e: 'view-dashboard', id: string): void
  (e: 'manage-leaves', member: WorkspaceMemberResponse): void
}>()

const { t } = useLocale()
</script>

<template>
  <div class="w-full relative z-0">
    <table class="w-full text-left border-collapse">
      <thead>
      <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
        <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-1/3">{{ t.employees.name }}</th>
        <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-1/4">{{ t.employees.role }}</th>
        <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 w-1/4">{{ t.employees.policy }}</th>
        <th class="px-6 py-4 w-12"></th>
      </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
      <EmployeeTableRow
          v-for="member in props.members"
          :key="member.id"
          :member="member"
          @edit="emit('edit', $event)"
          @view-dashboard="emit('view-dashboard', $event)"
          @manage-leaves="emit('manage-leaves', $event)"
      />
      </tbody>
    </table>
  </div>
</template>