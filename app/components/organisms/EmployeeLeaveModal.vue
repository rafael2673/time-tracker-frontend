<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loader2, Trash2, Pencil, X } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import { useEmployeesStore } from '~/stores/employees'
import ConfirmModal from '~/components/molecules/ConfirmModal.vue'

const props = defineProps<{
  isOpen: boolean
  employeeId: string | null
  employeeName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useLocale()
const employeesStore = useEmployeesStore()

const isSubmitting = ref(false)
const editingId = ref<string | null>(null)
const formData = ref({ startDate: '', endDate: '', reason: '' })

const isConfirmModalOpen = ref(false)
const isDeleting = ref(false)
const leaveToDelete = ref<string | null>(null)

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.employeeId) {
    await employeesStore.fetchLeaves(props.employeeId)
    resetForm()
  }
})

function resetForm() {
  editingId.value = null
  formData.value = { startDate: '', endDate: '', reason: '' }
}

function handleEdit(leave: any) {
  editingId.value = leave.id
  formData.value = {
    startDate: leave.startDate,
    endDate: leave.endDate,
    reason: leave.reason
  }
}

async function handleSubmit() {
  if (!props.employeeId || isSubmitting.value) return
  isSubmitting.value = true

  if (editingId.value) {
    await employeesStore.updateLeave(editingId.value, formData.value)
  } else {
    await employeesStore.addLeave(props.employeeId, formData.value)
  }

  resetForm()
  isSubmitting.value = false
}

function confirmDelete(id: string) {
  leaveToDelete.value = id
  isConfirmModalOpen.value = true
}

async function executeDelete() {
  if (!leaveToDelete.value) return
  isDeleting.value = true

  await employeesStore.removeLeave(leaveToDelete.value)
  if (editingId.value === leaveToDelete.value) resetForm()

  isDeleting.value = false
  isConfirmModalOpen.value = false
  leaveToDelete.value = null
}
</script>

<template>
  <div v-if="props.isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh] relative">
      <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{{ t.employees.manageLeaves }}</h2>
          <p class="text-sm font-medium text-gray-500">{{ props.employeeName }}</p>
        </div>
      </div>

      <div class="p-6 flex-1 overflow-y-auto space-y-6">
        <form @submit.prevent="handleSubmit" class="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 relative">

          <button v-if="editingId" @click.prevent="resetForm" type="button" class="absolute -top-3 -right-3 w-8 h-8 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 transition-colors shadow-sm cursor-pointer">
            <X :size="14" />
          </button>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">{{ t.employees.leaveStart }}</label>
              <input v-model="formData.startDate" type="date" required class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">{{ t.employees.leaveEnd }}</label>
              <input v-model="formData.endDate" type="date" required class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/50" />
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">{{ t.employees.leaveReason }}</label>
            <div class="flex gap-2">
              <input v-model="formData.reason" type="text" required class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/50" />
              <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                <Loader2 v-if="isSubmitting" :size="16" class="animate-spin" />
                <Pencil v-else-if="editingId" :size="16" />
                <span v-else>+</span>
              </button>
            </div>
          </div>
        </form>

        <div class="space-y-3">
          <div v-for="leave in employeesStore.employeeLeaves" :key="leave.id" class="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-2xl" :class="{'ring-2 ring-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-900/10': editingId === leave.id}">
            <div class="flex-1 cursor-pointer" @click="handleEdit(leave)">
              <p class="font-bold text-gray-900 dark:text-white text-sm truncate">{{ leave.reason }}</p>
              <p class="text-xs font-medium text-gray-500">{{ leave.startDate.split('-').reverse().join('/') }} até {{ leave.endDate.split('-').reverse().join('/') }}</p>
            </div>
            <button @click="confirmDelete(leave.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer shrink-0">
              <Trash2 :size="16" />
            </button>
          </div>
          <p v-if="employeesStore.employeeLeaves.length === 0" class="text-center text-sm font-medium text-gray-500 py-4">{{ t.employees.emptyLeaves }}</p>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <button @click="emit('close')" class="w-full py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          {{ t.modal.cancel }}
        </button>
      </div>

      <ConfirmModal
          :show="isConfirmModalOpen"
          :title="t.employees.deleteLeaveTitle"
          :message="t.employees.confirmDeleteLeave"
          :is-loading="isDeleting"
          @confirm="executeDelete"
          @cancel="isConfirmModalOpen = false"
      />
    </div>
  </div>
</template>
