<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Loader2, Clock } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import BaseSelect from '~/components/atoms/BaseSelect.vue'
import type { SpecialDateRequest, SpecialDateResponse } from '~/stores/specialDates'

const props = defineProps<{
  isOpen: boolean
  isSubmitting: boolean
  editingDate: SpecialDateResponse | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: SpecialDateRequest, id: string | null): void
}>()

const { t } = useLocale()

const formData = ref<SpecialDateRequest>({
  date: '',
  description: '',
  workloadMultiplier: 0,
  isRecurring: false
})

const multiplierOptions = computed(() => [
  { value: 0, label: t.value.calendar.multiplierFull, icon: Clock },
  { value: 0.5, label: t.value.calendar.multiplierHalf, icon: Clock }
])

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.editingDate) {
    formData.value = {
      date: props.editingDate.date,
      description: props.editingDate.description,
      workloadMultiplier: props.editingDate.workloadMultiplier,
      isRecurring: props.editingDate.isRecurring
    }
  } else if (newVal) {
    formData.value = { date: '', description: '', workloadMultiplier: 0, isRecurring: false }
  }
})

function handleSubmit() {
  emit('save', { ...formData.value, workloadMultiplier: Number(formData.value.workloadMultiplier) }, props.editingDate?.id || null)
}
</script>

<template>
  <div v-if="props.isOpen" class="fixed inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
    <div class="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {{ props.editingDate ? t.calendar.editDate : t.calendar.newDate }}
      </h3>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">{{ t.calendar.date }}</label>
          <input v-model="formData.date" type="date" required class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium" />
        </div>

        <div class="space-y-1.5">
          <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">{{ t.calendar.description }}</label>
          <input v-model="formData.description" type="text" :placeholder="t.calendar.descriptionPlaceholder" required class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium" />
        </div>

        <div class="space-y-1.5 relative z-[60]">
          <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">{{ t.calendar.multiplier }}</label>
          <BaseSelect
              v-model="formData.workloadMultiplier"
              :options="multiplierOptions"
          />
        </div>

        <div class="flex items-center gap-2 mt-2 ml-1">
          <input type="checkbox" id="isRecurring" v-model="formData.isRecurring" class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 bg-white dark:bg-gray-800 dark:border-gray-600">
          <label for="isRecurring" class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">{{ t.calendar.recurring }}</label>
        </div>

        <div class="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6 relative z-10">
          <button type="button" @click="emit('close')" class="flex-1 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer">
            {{ t.calendar.cancel }}
          </button>
          <button type="submit" :disabled="props.isSubmitting" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50">
            <Loader2 v-if="props.isSubmitting" :size="16" class="animate-spin" />
            {{ t.calendar.save }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>