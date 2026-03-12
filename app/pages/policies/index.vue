<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePoliciesStore, type WorkPolicy, type WorkPolicyRequest } from '~/stores/policies'
import { useLocale } from '~/composables/useLocale'
import { Plus, Edit2, Clock, CalendarDays, Loader2, AlertCircle } from 'lucide-vue-next'

const policiesStore = usePoliciesStore()
const { t } = useLocale()

const isModalOpen = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)
const errorMessage = ref<string>('')

const editingId = ref<string | null>(null)
const formData = ref({
  name: '',
  dailyTime: '08:00',
  toleranceMinutes: 10,
  workingDays: [] as string[]
})

const availableDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

onMounted(async () => {
  try {
    await policiesStore.fetchPolicies()
  } catch (error: unknown) {
    errorMessage.value = t.value.policies.errorSave
  }
})

function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return (h * 60) + (m || 0)
}

function openCreateModal(): void {
  editingId.value = null
  formData.value = {
    name: '',
    dailyTime: '08:00',
    toleranceMinutes: 10,
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  }
  errorMessage.value = ''
  isModalOpen.value = true
}

function openEditModal(policy: WorkPolicy): void {
  editingId.value = policy.id
  formData.value = {
    name: policy.name,
    dailyTime: formatMinutesToTime(policy.dailyMinutesLimit),
    toleranceMinutes: policy.toleranceMinutes,
    workingDays: policy.workingDays ? policy.workingDays.split(',') : []
  }
  errorMessage.value = ''
  isModalOpen.value = true
}

function closeModal(): void {
  if (!isSubmitting.value) {
    isModalOpen.value = false
  }
}

function toggleDay(day: string): void {
  const index = formData.value.workingDays.indexOf(day)
  if (index === -1) {
    formData.value.workingDays.push(day)
  } else {
    formData.value.workingDays.splice(index, 1)
  }
}

async function handleSubmit(): Promise<void> {
  isSubmitting.value = true
  errorMessage.value = ''

  const requestData: WorkPolicyRequest = {
    name: formData.value.name,
    dailyMinutesLimit: parseTimeToMinutes(formData.value.dailyTime),
    toleranceMinutes: Number(formData.value.toleranceMinutes),
    workingDays: formData.value.workingDays.join(',')
  }

  try {
    if (editingId.value) {
      await policiesStore.updatePolicy(editingId.value, requestData)
    } else {
      await policiesStore.createPolicy(requestData)
    }
    closeModal()
  } catch (error: unknown) {
    errorMessage.value = t.value.policies.errorSave
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t.policies.title }}</h1>
      <button @click="openCreateModal" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors cursor-pointer">
        <Plus :size="18" />
        {{ t.policies.newPolicy }}
      </button>
    </div>

    <div v-if="policiesStore.isLoading" class="flex justify-center py-12">
      <Loader2 :size="32" class="animate-spin text-indigo-600" />
    </div>

    <div v-else-if="policiesStore.policies.length === 0" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
      <CalendarDays :size="48" class="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
      <p class="text-gray-500 dark:text-gray-400 font-medium">{{ t.policies.empty }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="policy in policiesStore.policies" :key="policy.id" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
        <button @click="openEditModal(policy)" class="absolute top-4 right-4 p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
          <Edit2 :size="16" />
        </button>

        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 pr-10">{{ policy.name }}</h3>

        <div class="space-y-3">
          <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <Clock :size="16" class="text-indigo-500" />
            <span>{{ formatMinutesToTime(policy.dailyMinutesLimit) }}h diárias</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <AlertCircle :size="16" class="text-amber-500" />
            <span>{{ policy.toleranceMinutes }} min de tolerância</span>
          </div>
          <div class="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
            <CalendarDays :size="16" class="text-green-500 shrink-0 mt-0.5" />
            <div class="flex flex-wrap gap-1">
              <span v-for="day in (policy.workingDays ? policy.workingDays.split(',') : [])" :key="day" class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-semibold">
                {{ t.policies.days[day as keyof typeof t.policies.days] }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ editingId ? t.policies.editPolicy : t.policies.newPolicy }}
          </h2>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ml-1">
              {{ t.policies.nameLabel }}
            </label>
            <input v-model="formData.name" type="text" required class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" :placeholder="t.policies.namePlaceholder" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ml-1">
                {{ t.policies.dailyLimitLabel }}
              </label>
              <input v-model="formData.dailyTime" type="time" required class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ml-1">
                {{ t.policies.toleranceLabel }}
              </label>
              <input v-model="formData.toleranceMinutes" type="number" min="0" required class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ml-1">
              {{ t.policies.workingDaysLabel }}
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                  v-for="day in availableDays"
                  :key="day"
                  type="button"
                  @click="toggleDay(day)"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border"
                  :class="formData.workingDays.includes(day) ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'"
              >
                {{ t.policies.days[day as keyof typeof t.policies.days] }}
              </button>
            </div>
          </div>

          <div v-if="errorMessage" class="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {{ errorMessage }}
          </div>

          <div class="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
            <button type="button" @click="closeModal" :disabled="isSubmitting" class="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50">
              {{ t.policies.cancel }}
            </button>
            <button type="submit" :disabled="isSubmitting || formData.workingDays.length === 0" class="flex-1 py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Loader2 v-if="isSubmitting" :size="18" class="animate-spin" />
              <span v-else>{{ t.policies.save }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>