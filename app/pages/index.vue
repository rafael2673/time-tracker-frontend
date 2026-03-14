<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useEmployeesStore } from '~/stores/employees'
import { usePoliciesStore } from '~/stores/policies'
import { useTimeRecordsStore } from '~/stores/timeRecords'
import { useSummaryStore } from '~/stores/summary'
import { useLocale } from '~/composables/useLocale'
import CompanyDashboard from '~/components/organisms/CompanyDashboard.vue'
import EmployeeDashboard from '~/components/organisms/EmployeeDashboard.vue'
import ToastNotification from '~/components/molecules/ToastNotification.vue'
import { Loader2 } from 'lucide-vue-next'

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const employeesStore = useEmployeesStore()
const policiesStore = usePoliciesStore()
const timeRecordsStore = useTimeRecordsStore()
const summaryStore = useSummaryStore()
const { t } = useLocale()

const viewLevel = ref<'COMPANY' | 'EMPLOYEE'>('COMPANY')
const selectedEmployeeId = ref<string | null>(null)
const isPageLoading = ref<boolean>(true)

const toastMessage = ref<string>('')
const toastType = ref<'success' | 'error'>('success')

const currentRole = computed(() => {
  const ws = workspaceStore.workspaces.find(w => w.id === authStore.activeWorkspaceId)
  return ws?.role || 'EMPLOYEE'
})

const selectedEmployee = computed(() => {
  if (currentRole.value === 'EMPLOYEE') return authStore.user
  return employeesStore.members.find(m => m.id === selectedEmployeeId.value)
})

onMounted(async () => {
  if (workspaceStore.workspaces.length > 0 && authStore.activeWorkspaceId) {
    applyRoleViewRules()
    await loadDashboardData()
    isPageLoading.value = false
  } else if (!authStore.activeWorkspaceId) {
      isPageLoading.value = true
  }
})

watch(() => workspaceStore.workspaces, async (workspaces) => {
    if (workspaces.length > 0 && authStore.activeWorkspaceId) {
        applyRoleViewRules()
        await loadDashboardData()
        isPageLoading.value = false
    }
}, { deep: true })


watch(() => authStore.activeWorkspaceId, async (newId) => {
  if (newId) {
    isPageLoading.value = true
    applyRoleViewRules()
    await loadDashboardData()
    isPageLoading.value = false
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
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12

  if (viewLevel.value === 'COMPANY') {
    await Promise.all([
      employeesStore.fetchMembers(),
      policiesStore.fetchPolicies(),
      summaryStore.fetchMonthlyBalance(currentYear, currentMonth)
    ])
  } else if (viewLevel.value === 'EMPLOYEE' && selectedEmployeeId.value) {
    const today = now.toISOString().split('T')[0]
    if (today) {
      await Promise.all([
        timeRecordsStore.fetchDailyRecords(selectedEmployeeId.value, today),
        summaryStore.fetchEmployeeSummary(selectedEmployeeId.value)
      ])
    }
  }
}

async function selectEmployee(id: string) {
  if (!id) return
  selectedEmployeeId.value = id
  viewLevel.value = 'EMPLOYEE'
  const today = new Date().toISOString().split('T')[0]
  if (today) {
    await Promise.all([
      timeRecordsStore.fetchDailyRecords(id, today),
      summaryStore.fetchEmployeeSummary(id)
    ])
  }
}

function backToCompany() {
  selectedEmployeeId.value = null
  viewLevel.value = 'COMPANY'
}

function showToast(message: string, type: 'success' | 'error') {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

async function handlePunch() {
  try {
    await timeRecordsStore.registerPunch()
    showToast(t.value.policies.successAdd, 'success')
  } catch (error) {
    showToast(t.value.dashboard.punchError, 'error')
  }
}
</script>

<template>
  <div class="flex flex-col gap-8 relative">
    <div v-if="isPageLoading" class="flex items-center justify-center py-24">
      <Loader2 :size="36" class="animate-spin text-indigo-600" />
    </div>

    <CompanyDashboard
        v-else-if="viewLevel === 'COMPANY'"
        :on-select-employee="selectEmployee"
    />

    <EmployeeDashboard
        v-else-if="viewLevel === 'EMPLOYEE'"
        :current-role="currentRole"
        :selected-employee="selectedEmployee"
        :on-back-to-company="backToCompany"
        :on-handle-punch="handlePunch"
    />

    <ToastNotification
        :message="toastMessage"
        :type="toastType"
    />
  </div>
</template>