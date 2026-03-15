<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loader2, Trash2 } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import { useEmployeesStore } from '~/stores/employees'

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
const formData = ref({ startDate: '', endDate: '', reason: '' })

watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.employeeId) {
    await employeesStore.fetchLeaves(props.employeeId)
    formData.value = { startDate: '', endDate: '', reason: '' }
  }
})

async function handleAdd() {
  if (!props.employeeId || isSubmitting.value) return
  isSubmitting.value = true
  await employeesStore.addLeave(props.employeeId, formData.value)
  formData.value = { startDate: '', endDate: '', reason: '' }
  isSubmitting.value = false
}

async function handleDelete(id: string) {
  if (confirm(t.value.modal.confirm)) {
    await employeesStore.removeLeave(id)
  }
}
</script>

<template>
  <div v-if="props.isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]">
      <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{{ t.employees.manageLeaves }}</h2>
          <p class="text-sm font-medium text-gray-500">{{ props.employeeName }}</p>
        </div>
      </div>

      <div class="p-6 flex-1 overflow-y-auto space-y-6">
        <form @submit.prevent="handleAdd" class="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
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
              <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50">
                <Loader2 v-if="isSubmitting" :size="16" class="animate-spin" />
                <span v-else>+</span>
              </button>
            </div>
          </div>
        </form>

        <div class="space-y-3">
          <div v-for="leave in employeesStore.employeeLeaves" :key="leave.id" class="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-2xl">
            <div>
              <p class="font-bold text-gray-900 dark:text-white text-sm">{{ leave.reason }}</p>
              <p class="text-xs font-medium text-gray-500">{{ leave.startDate.split('-').reverse().join('/') }} até {{ leave.endDate.split('-').reverse().join('/') }}</p>
            </div>
            <button @click="handleDelete(leave.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer">
              <Trash2 :size="16" />
            </button>
          </div>
          <p v-if="employeesStore.employeeLeaves.length === 0" class="text-center text-sm font-medium text-gray-500 py-4">Nenhuma folga cadastrada.</p>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <button @click="emit('close')" class="w-full py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>