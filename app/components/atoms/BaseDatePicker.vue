<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import BaseCalendar from './BaseCalendar.vue'

const props = defineProps<{
    modelValue: string
    placeholder?: string
    error?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

function togglePicker() {
    isOpen.value = !isOpen.value
}

function handleSelect(date: string) {
    emit('update:modelValue', date)
    isOpen.value = false
}

const formattedDate = computed(() => {
    if (!props.modelValue) return ''
    const [year, month, day] = props.modelValue.split('-')
    return `${day}/${month}/${year}`
})

function closeOnOutsideClick(event: MouseEvent) {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', closeOnOutsideClick)
})

onUnmounted(() => {
    document.removeEventListener('click', closeOnOutsideClick)
})
</script>

<template>
    <div class="relative w-full" ref="containerRef">
        <div
            @click="togglePicker"
            class="flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl shadow-sm text-sm font-bold transition-all cursor-pointer h-10 group overflow-hidden"
            :class="[
                error
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : isOpen 
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
        >
            <CalendarIcon :size="18" class="shrink-0" :class="error ? 'text-red-500' : (isOpen ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500')" />
            <span class="truncate min-w-0 flex-1" :class="{'text-gray-400 dark:text-gray-600 font-medium': !modelValue}">
                {{ formattedDate || placeholder || 'DD/MM/AAAA' }}
            </span>
        </div>

        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform -translate-y-2 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-2 opacity-0"
        >
            <div v-if="isOpen" class="absolute top-full left-0 mt-2 z-60">
                <BaseCalendar
                    :model-value="modelValue"
                    @select="handleSelect"
                    class="shadow-2xl"
                />
            </div>
        </Transition>
    </div>
</template>
