<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
    modelValue?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'select', value: string): void
}>()

const { t } = useLocale()

const viewDate = ref(props.modelValue ? new Date(props.modelValue + 'T00:00:00') : new Date())
const currentMonth = computed(() => viewDate.value.getMonth())
const currentYear = computed(() => viewDate.value.getFullYear())

const monthName = computed(() => {
    const m = t.value.months as any
    return m[currentMonth.value + 1] || ''
})

const daysInMonth = computed(() => {
    return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
    return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const days = computed(() => {
    const result = []
    const prevMonthDays = new Date(currentYear.value, currentMonth.value, 0).getDate()
    
    for (let i = firstDayOfMonth.value - 1; i >= 0; i--) {
        result.push({
            day: prevMonthDays - i,
            currentMonth: false,
            date: formatDate(currentYear.value, currentMonth.value - 1, prevMonthDays - i)
        })
    }
    
    for (let i = 1; i <= daysInMonth.value; i++) {
        result.push({
            day: i,
            currentMonth: true,
            date: formatDate(currentYear.value, currentMonth.value, i)
        })
    }
    
    const remaining = 42 - result.length
    for (let i = 1; i <= remaining; i++) {
        result.push({
            day: i,
            currentMonth: false,
            date: formatDate(currentYear.value, currentMonth.value + 1, i)
        })
    }
    
    return result
})

function formatDate(year: number, month: number, day: number) {
    const d = new Date(year, month, day)
    return d.toISOString().split('T')[0] || ''
}

function nextMonth() {
    viewDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

function prevMonth() {
    viewDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

function selectDate(date?: string) {
    if (date) {
        emit('update:modelValue', date)
        emit('select', date)
    }
}

const weekdayLabels = computed(() => {
    const d = t.value.policies?.days as any
    if (!d) return ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
    return [d.SUNDAY, d.MONDAY, d.TUESDAY, d.WEDNESDAY, d.THURSDAY, d.FRIDAY, d.SATURDAY]
})

const today = new Date().toISOString().split('T')[0]
</script>

<template>
    <div class="p-4 bg-white dark:bg-gray-900 rounded-2xl w-72 shadow-sm border border-gray-100 dark:border-gray-800">
        <div class="flex items-center justify-between mb-4">
            <button @click="prevMonth" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-gray-500">
                <ChevronLeft :size="18" />
            </button>
            <div class="text-sm font-bold text-gray-900 dark:text-white">
                {{ monthName }} {{ currentYear }}
            </div>
            <button @click="nextMonth" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-gray-500">
                <ChevronRight :size="18" />
            </button>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="label in weekdayLabels" :key="label" class="text-[10px] font-black text-gray-400 uppercase text-center py-1">
                {{ label.substring(0, 1) }}
            </div>
        </div>

        <div class="grid grid-cols-7 gap-1">
            <button
                v-for="(d, i) in days"
                :key="i"
                @click="selectDate(d.date)"
                class="h-8 w-8 flex items-center justify-center text-xs rounded-lg transition-all cursor-pointer relative"
                :class="[
                    d.currentMonth ? 'text-gray-700 dark:text-gray-300 font-bold' : 'text-gray-300 dark:text-gray-600',
                    d.date === modelValue ? 'bg-indigo-600 text-white! shadow-md scale-110 z-10' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                ]"
            >
                {{ d.day }}
                <span v-if="d.date === today && d.date !== modelValue" class="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full"></span>
            </button>
        </div>
    </div>
</template>