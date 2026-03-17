<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Loader2, FileText, Clock, History } from 'lucide-vue-next'
import { useApprovalsStore } from '~/stores/approvals'
import { useAuthStore } from '~/stores/auth'
import { useLocale } from '~/composables/useLocale'
import PaginationControls from '~/components/molecules/PaginationControls.vue'
import ConfirmModal from '~/components/molecules/ConfirmModal.vue'
import FilterBar from '~/components/molecules/FilterBar.vue'
import ApprovalCard from '~/components/molecules/ApprovalCard.vue'

const approvalsStore = useApprovalsStore()
const authStore = useAuthStore()
const { t } = useLocale()

const activeTab = ref<'pending' | 'history'>('pending')
const searchQuery = ref('')
const filterDate = ref('')

const isConfirmModalOpen = ref(false)
const isProcessing = ref(false)
const selectedRecordId = ref<string | null>(null)
const actionType = ref<'approve' | 'reject'>('approve')
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const currentRecords = computed(() => {
  return activeTab.value === 'pending' ? approvalsStore.pendingRecords : approvalsStore.historyRecords
})

onMounted(() => {
  if (authStore.activeWorkspaceId) loadData(0)
})

watch(() => authStore.activeWorkspaceId, (newVal) => {
  if (newVal) {
    searchQuery.value = ''
    filterDate.value = ''
    loadData(0)
  }
})

watch(activeTab, () => {
  searchQuery.value = ''
  filterDate.value = ''
  loadData(0)
})

function loadData(page: number = 0) {
  if (activeTab.value === 'pending') {
    approvalsStore.fetchPending(page, searchQuery.value)
  } else {
    approvalsStore.fetchHistory(page, searchQuery.value, filterDate.value)
  }
}

function showMessage(msg: string, type: 'success' | 'error') {
  message.value = msg
  messageType.value = type
  setTimeout(() => message.value = '', 3000)
}

function confirmAction(id: string, action: 'approve' | 'reject') {
  selectedRecordId.value = id
  actionType.value = action
  isConfirmModalOpen.value = true
}

async function executeAction() {
  if (!selectedRecordId.value || isProcessing.value) return
  isProcessing.value = true

  let success: boolean
  if (actionType.value === 'approve') {
    success = await approvalsStore.approve(selectedRecordId.value)
  } else {
    success = await approvalsStore.reject(selectedRecordId.value)
  }

  if (success) {
    showMessage(actionType.value === 'approve' ? t.value.approvals.successApprove : t.value.approvals.successReject, 'success')
    loadData(approvalsStore.currentPage)
  } else {
    showMessage(t.value.approvals.error, 'error')
  }

  isProcessing.value = false
  isConfirmModalOpen.value = false
  selectedRecordId.value = null
}
</script>

<template>
  <div class="flex flex-col gap-6 max-w-6xl">
    <div class="flex flex-col md:flex-row justify-between md:items-end gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{{ t.approvals.title }}</h1>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.approvals.subtitle }}</p>
      </div>

      <div class="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        <button @click="activeTab = 'pending'" class="px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer" :class="activeTab === 'pending' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'">
          <Clock :size="16"/> Pendentes
        </button>
        <button @click="activeTab = 'history'" class="px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer" :class="activeTab === 'history' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'">
          <History :size="16"/> Histórico
        </button>
      </div>
    </div>

    <div v-if="message" class="p-4 text-sm font-bold rounded-xl border" :class="messageType === 'success' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50' : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'">
      {{ message }}
    </div>

    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col relative z-0">

      <FilterBar
          v-model:search-value="searchQuery"
          v-model:date-value="filterDate"
          :show-date-filter="activeTab === 'history'"
          :search-placeholder="t.approvals.searchPlaceholder"
          @search="loadData(0)"
      />

      <div v-if="approvalsStore.isLoading" class="flex justify-center p-12">
        <Loader2 :size="32" class="animate-spin text-indigo-600" />
      </div>

      <div v-else-if="currentRecords.length === 0" class="flex flex-col items-center justify-center p-16 opacity-60">
        <FileText :size="48" class="text-gray-400 mb-4" />
        <p class="text-sm font-bold text-gray-500">{{ t.approvals.empty }}</p>
      </div>

      <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
        <ApprovalCard
            v-for="record in currentRecords"
            :key="record.id"
            :record="record"
            :is-history="activeTab === 'history'"
            @approve="confirmAction($event, 'approve')"
            @reject="confirmAction($event, 'reject')"
        />
      </div>

      <div class="rounded-b-3xl overflow-hidden">
        <PaginationControls
            v-if="currentRecords.length > 0"
            :current-page="approvalsStore.currentPage"
            :total-pages="approvalsStore.totalPages"
            @page-change="loadData"
        />
      </div>
    </div>

    <ConfirmModal
        :show="isConfirmModalOpen"
        :title="actionType === 'approve' ? t.approvals.approve : t.approvals.reject"
        :message="actionType === 'approve' ? t.approvals.confirmApprove : t.approvals.confirmReject"
        :is-loading="isProcessing"
        :intent="actionType === 'approve' ? 'success' : 'danger'"
        @confirm="executeAction"
        @cancel="isConfirmModalOpen = false"
    />
  </div>
</template>