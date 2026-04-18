<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useLocale } from '~/composables/useLocale'
import { Loader2, Calendar as CalendarIcon, FileText, Percent, Info } from 'lucide-vue-next'
import BaseSelect from '~/components/atoms/BaseSelect.vue'

const TYPE_COMPENSATORY = 'COMPENSATORY_COLLECTIVE'

const props = defineProps<{
  isOpen: boolean
  isSubmitting: boolean
  editingDate: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: any, id: string | null): void
}>()

const { t } = useLocale()

const formData = ref({
  date: '',
  description: '',
  workloadMultiplier: 0,
  isRecurring: false,
  type: 'CUSTOM' as string
})

const onlyEligible = ref(true)

const isCompensatoryCollective = computed(() => formData.value.type === TYPE_COMPENSATORY)

const typeOptions = computed(() => [
  { value: 'CUSTOM', label: 'Data Personalizada' },
  { value: 'NATIONAL', label: 'Feriado Nacional' },
  { value: 'STATE', label: 'Feriado Estadual' },
  { value: 'MUNICIPAL', label: 'Feriado Municipal' },
  { value: 'FACULTATIVE', label: 'Ponto Facultativo' },
  { value: TYPE_COMPENSATORY, label: 'Folga Compensatória Coletiva' }
])

const multiplierOptions = computed(() => [
  { value: 0, label: t.value.calendar.multiplierFull, icon: Percent },
  { value: 0.5, label: t.value.calendar.multiplierHalf, icon: Percent }
])

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    onlyEligible.value = true
    if (props.editingDate) {
      formData.value = {
        date: props.editingDate.date,
        description: props.editingDate.description,
        workloadMultiplier: props.editingDate.workloadMultiplier,
        isRecurring: props.editingDate.isRecurring,
        type: props.editingDate.type || 'CUSTOM'
      }
    } else {
      formData.value = {
        date: new Date().toISOString().split('T')[0] || '',
        description: '',
        workloadMultiplier: 0,
        isRecurring: false,
        type: 'CUSTOM'
      }
    }
  }
})

function handleSubmit() {
  const payload = isCompensatoryCollective.value
    ? { ...formData.value, type: TYPE_COMPENSATORY, onlyEligible: onlyEligible.value, isCompensatoryCollective: true }
    : formData.value
  emit('save', payload, props.editingDate?.id || null)
}
</script>

<template>
  <div v-if="props.isOpen" class="fixed inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center z-100 p-4">
    <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
      <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          {{ props.editingDate ? t.calendar.editDate : t.calendar.newDate }}
        </h2>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
        <div class="space-y-1.5">
          <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
            {{ t.calendar.date }}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <CalendarIcon :size="16" />
            </div>
            <input
                v-model="formData.date"
                type="date"
                required
                class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
            {{ t.calendar.description }}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FileText :size="16" />
            </div>
            <input
                v-model="formData.description"
                type="text"
                required
                :placeholder="t.calendar.descriptionPlaceholder"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            />
          </div>
        </div>

        <div class="space-y-1.5 relative z-50">
          <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
            Tipo
          </label>
          <BaseSelect v-model="formData.type" :options="typeOptions" />
        </div>

        <div v-if="isCompensatoryCollective" class="flex flex-col gap-2 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-700/40 rounded-xl">
          <p class="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide">Aplicar para</p>

          <label
            class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
            :class="onlyEligible ? 'border-indigo-400 bg-white dark:bg-gray-800' : 'border-transparent hover:border-gray-200'"
            @click="onlyEligible = true"
          >
            <span class="mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0" :class="onlyEligible ? 'border-indigo-500' : 'border-gray-400'">
              <span v-if="onlyEligible" class="w-2 h-2 rounded-full bg-indigo-500" />
            </span>
            <span class="flex flex-col">
              <span class="text-sm font-bold text-gray-900 dark:text-white">Apenas elegíveis (≥ 8h de saldo)</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">Somente quem tem banco de horas suficiente no trimestre</span>
            </span>
          </label>

          <label
            class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
            :class="!onlyEligible ? 'border-indigo-400 bg-white dark:bg-gray-800' : 'border-transparent hover:border-gray-200'"
            @click="onlyEligible = false"
          >
            <span class="mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0" :class="!onlyEligible ? 'border-indigo-500' : 'border-gray-400'">
              <span v-if="!onlyEligible" class="w-2 h-2 rounded-full bg-indigo-500" />
            </span>
            <span class="flex flex-col">
              <span class="text-sm font-bold text-gray-900 dark:text-white">Todos os colaboradores ativos</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">Quem não tiver saldo ficará com banco negativo</span>
            </span>
          </label>

          <div class="flex items-start gap-2 mt-1">
            <Info :size="13" class="text-orange-500 shrink-0 mt-0.5" />
            <p class="text-xs text-orange-600 dark:text-orange-400">A folga será descontada do banco de horas de cada colaborador.</p>
          </div>
        </div>

        <div v-if="!isCompensatoryCollective" class="space-y-1.5 relative z-40">
          <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
            {{ t.calendar.multiplier }}
          </label>
          <BaseSelect v-model="formData.workloadMultiplier" :options="multiplierOptions" />
        </div>

        <label v-if="!isCompensatoryCollective" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <span class="relative flex items-center justify-center w-5 h-5">
            <input type="checkbox" v-model="formData.isRecurring" class="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer" />
            <svg class="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t.calendar.recurring }}</span>
        </label>

        <div class="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
              type="button"
              @click="emit('close')"
              :disabled="props.isSubmitting"
              class="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {{ t.calendar.cancel }}
          </button>
          <button
              type="submit"
              :disabled="props.isSubmitting"
              class="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:bg-indigo-700 transition-all cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Loader2 v-if="props.isSubmitting" :size="18" class="animate-spin" />
            <span v-else>{{ isCompensatoryCollective ? 'Aplicar Folga' : t.calendar.save }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>