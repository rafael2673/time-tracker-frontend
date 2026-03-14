<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string | number | null
  options: { value: string | number, label: string, icon?: any }[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

const selectedLabel = computed(() => {
  return selectedOption.value ? selectedOption.value.label : props.placeholder || ''
})

const selectedIcon = computed(() => {
  return selectedOption.value?.icon
})

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function selectOption(value: string | number) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative w-full" ref="selectRef">
    <button
        type="button"
        @click="toggleMenu"
        class="flex items-center justify-between w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all cursor-pointer group"
    >
            <span class="flex items-center gap-2 overflow-hidden">
                <component v-if="selectedIcon" :is="selectedIcon" :size="16" class="text-indigo-500 shrink-0" />
                <span class="font-bold text-sm text-gray-900 dark:text-white truncate">{{ selectedLabel }}</span>
            </span>
      <ChevronDown :size="16" class="text-gray-400 transition-transform duration-200" :class="{'rotate-180': isOpen}" />
    </button>

    <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="isOpen" class="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-[60]">
        <div class="p-2 space-y-1 max-h-60 overflow-y-auto">
          <button
              v-for="opt in props.options"
              :key="opt.value"
              @click="selectOption(opt.value)"
              type="button"
              class="flex items-center w-full px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              :class="opt.value === props.modelValue ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'"
          >
            <component v-if="opt.icon" :is="opt.icon" :size="16" class="mr-2 opacity-50 shrink-0" />
            <span class="truncate">{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>