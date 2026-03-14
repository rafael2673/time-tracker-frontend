<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useEmployeesStore } from '~/stores/employees'
import { usePoliciesStore } from '~/stores/policies'
import { useTimeRecordsStore } from '~/stores/timeRecords'
import { useLocale } from '~/composables/useLocale'
import CompanyDashboard from '~/components/organisms/CompanyDashboard.vue'
import EmployeeDashboard from '~/components/organisms/EmployeeDashboard.vue'

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const employeesStore = useEmployeesStore()
const policiesStore = usePoliciesStore()
const timeRecordsStore = useTimeRecordsStore()
const { t } = useLocale()

const isMounted = ref(false)
const viewLevel = ref<'COMPANY' | 'EMPLOYEE'>('COMPANY')
const selectedEmployeeId = ref<string | null>(null)

const currentRole = computed(() => {
  const ws = workspaceStore.workspaces.find(w => w.id === authStore.activeWorkspaceId)
  return ws?.role || 'EMPLOYEE'
})

onMounted(async () => {
  isMounted.value = true

  if (authStore.activeWorkspaceId) {
    applyRoleViewRules()
    await loadDashboardData()
  }
})

watch(() => authStore.activeWorkspaceId, async (newVal) => {
  if (newVal && isMounted.value) {
    applyRoleViewRules()
    await loadDashboardData()
  }
})

function applyRoleViewRules() {
  if (currentRole.value === 'EMPLOYEE') {
    viewLevel.value = 'EMPLOYEE'
    selectedEmployeeId.value = authStore.user?.id || null
  } else {
    viewLevel.value = 'COMPANY'
    selectedEmployeeId.value = null
  }
}

async function loadDashboardData() {
  if (currentRole.value !== 'EMPLOYEE') {
    await Promise.all([
      employeesStore.fetchMembers(),
      policiesStore.fetchPolicies()
    ])
  } else {
    const employeeId = selectedEmployeeId.value
    if (employeeId) {
      const today = new Date().toISOString().split('T')[0]
      if (today) {
          await timeRecordsStore.fetchDailyRecords(employeeId, today)
      }
    }
  }
}

async function selectEmployee(id: string) {
  if (!id) return;
  selectedEmployeeId.value = id
  viewLevel.value = 'EMPLOYEE'
  const today = new Date().toISOString().split('T')[0]
  if (today) {
      await timeRecordsStore.fetchDailyRecords(id, today)
  }
}

function backToCompany() {
  selectedEmployeeId.value = null
  viewLevel.value = 'COMPANY'
}

async function handlePunch() {
  try {
    await timeRecordsStore.registerPunch()
  } catch (error) {
    alert(t.value.dashboard.punchError)
  }
}

const selectedEmployee = computed(() => {
  if (currentRole.value === 'EMPLOYEE') return authStore.user
  return employeesStore.members.find(m => m.id === selectedEmployeeId.value)
})
</script>

<template>
  <div class="flex flex-col gap-8">
    <CompanyDashboard
        v-if="viewLevel === 'COMPANY'"
        :on-select-employee="selectEmployee"
    />

    <EmployeeDashboard
        v-else-if="viewLevel === 'EMPLOYEE'"
        :current-role="currentRole"
        :selected-employee="selectedEmployee"
        :on-back-to-company="backToCompany"
        :on-handle-punch="handlePunch"
    />
  </div>
</template>