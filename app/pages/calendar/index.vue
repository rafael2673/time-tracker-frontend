<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, CalendarDays, Repeat, Pencil, Download } from 'lucide-vue-next'
import { useSpecialDatesStore } from '~/stores/specialDates'
import { useLocale } from '~/composables/useLocale'
import BaseSelect from '~/components/atoms/BaseSelect.vue'
import SearchInput from '~/components/atoms/SearchInput.vue'
import PaginationControls from '~/components/molecules/PaginationControls.vue'
import SpecialDateModal from '~/components/organisms/SpecialDateModal.vue'

const specialDatesStore = useSpecialDatesStore()
const { t } = useLocale()

const selectedYear = ref(new Date().getFullYear())
const searchQuery = ref('')
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const isImporting = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const editingDate = ref<any>(null)

const yearOptions = computed(() => {
  const current = new Date().getFullYear()
  return [
    { value: current - 1, label: String(current - 1), icon: CalendarDays },
    { value: current, label: String(current), icon: CalendarDays },
    { value: current + 1, label: String(current + 1), icon: CalendarDays }
  ]
})

onMounted(() => {
  fetchData()
})

watch(selectedYear, () => {
  specialDatesStore.currentPage = 0
  fetchData()
})

function fetchData(page: number = 0) {
  specialDatesStore.fetchByYear(selectedYear.value, page, searchQuery.value)
}

function showMessage(msg: string, type: 'success' | 'error') {
  message.value = msg
  messageType.value = type
  setTimeout(() => message.value = '', 3000)
}

function openModal(dateToEdit: any = null) {
  editingDate.value = dateToEdit
  isModalOpen.value = true
}

async function handleSave(payload: any, id: string | null) {
  if (isSubmitting.value) return
  isSubmitting.value = true

  let success
  if (id) {
    success = await specialDatesStore.update(id, payload)
  } else {
    success = await specialDatesStore.create(payload)
  }

  if (success) {
    showMessage(id ? t.value.calendar.successEdit : t.value.calendar.successAdd, 'success')
    isModalOpen.value = false
    fetchData(specialDatesStore.currentPage)
  } else {
    showMessage(t.value.calendar.error, 'error')
  }
  isSubmitting.value = false
}

async function handleImport() {
  if (isImporting.value) return
  isImporting.value = true

  const success = await specialDatesStore.importNationalHolidays(selectedYear.value)

  if (success) {
    showMessage(t.value.calendar.successImport, 'success')
    fetchData(0)
  } else {
    showMessage(t.value.calendar.error, 'error')
  }
  isImporting.value = false
}

async function handleDelete(id: string) {
  if (confirm(t.value.modal.confirm)) {
    const success = await specialDatesStore.remove(id)
    if (success) {
      showMessage(t.value.calendar.successDelete, 'success')
      fetchData(specialDatesStore.currentPage)
    } else {
      showMessage(t.value.calendar.error, 'error')
    }
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 max-w-5xl">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{{ t.calendar.title }}</h1>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.calendar.subtitle }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <div class="w-32 relative z-50">
          <BaseSelect v-model="selectedYear" :options="yearOptions" />
        </div>

        <button @click="handleImport" :disabled="isImporting" class="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer h-10 disabled:opacity-50">
          <Loader2 v-if="isImporting" :size="16" class="animate-spin" />
          <Download v-else :size="16" />
          <span class="hidden sm:inline">{{ t.calendar.importNational }}</span>
        </button>

        <button @click="openModal()" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer h-10">
          <Plus :size="16" />
          <span class="hidden sm:inline">{{ t.calendar.newDate }}</span>
        </button>
      </div>
    </div>

    <div v-if="message" class="p-4 text-sm font-bold rounded-xl border" :class="messageType === 'success' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50' : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'">
      {{ message }}
    </div>

    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col relative z-0">
      <div class="p-4 border-b border-gray-100 dark:border-gray-800 rounded-t-3xl">
        <SearchInput
            v-model="searchQuery"
            :placeholder="t.calendar.searchPlaceholder"
            @search="fetchData(0)"
        />
      </div>

      <div v-if="specialDatesStore.isLoading" class="flex justify-center p-12">
        <Loader2 class="animate-spin text-indigo-500" :size="32" />
      </div>

      <div v-else-if="specialDatesStore.specialDates.length === 0" class="flex flex-col items-center justify-center p-16 opacity-60">
        <CalendarIcon :size="48" class="text-gray-400 mb-4" />
        <p class="text-sm font-bold text-gray-500">{{ t.calendar.empty }}</p>
      </div>

      <div v-else class="divide-y divide-gray-100 dark:divide-gray-800 w-full">
        <div v-for="sd in specialDatesStore.specialDates" :key="sd.id" class="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div class="flex items-center gap-6">
            <div class="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex flex-col items-center justify-center font-bold ring-1 ring-indigo-100 dark:ring-indigo-800/50">
              <span class="text-xl">{{ sd.date.split('-')[2] }}</span>
              <span class="text-[10px] uppercase opacity-80">{{ sd.date.split('-')[1] }}</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-gray-900 dark:text-white text-lg">{{ sd.description }}</h3>
                <Repeat v-if="sd.isRecurring" :size="14" class="text-indigo-500" :title="t.calendar.recurring" />
              </div>
              <p class="text-xs font-medium text-gray-500 mt-1">
                                <span class="px-2 py-0.5 rounded-md" :class="sd.workloadMultiplier === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'">
                                    {{ sd.workloadMultiplier === 0 ? t.calendar.multiplierFull : t.calendar.multiplierHalf }}
                                </span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 relative z-10">
            <button @click="openModal(sd)" class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors cursor-pointer">
              <Pencil :size="18" />
            </button>
            <button @click="handleDelete(sd.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer">
              <Trash2 :size="18" />
            </button>
          </div>
        </div>
      </div>

      <div class="rounded-b-3xl overflow-hidden">
          <PaginationControls
              :current-page="specialDatesStore.currentPage"
              :total-pages="specialDatesStore.totalPages"
              @page-change="fetchData"
          />
      </div>
    </div>

    <SpecialDateModal
        :is-open="isModalOpen"
        :is-submitting="isSubmitting"
        :editing-date="editingDate"
        @close="isModalOpen = false"
        @save="handleSave"
    />
  </div>
</template>