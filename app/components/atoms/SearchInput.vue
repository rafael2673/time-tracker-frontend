<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search'): void
}>()

const localValue = ref(props.modelValue)
let timeout: any

watch(localValue, (newVal) => {
  emit('update:modelValue', newVal)
  clearTimeout(timeout)
  timeout = setTimeout(() => emit('search'), 500)
})
</script>

<template>
  <div class="relative w-full sm:max-w-xs">
    <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
        v-model="localValue"
        type="text"
        :placeholder="props.placeholder"
        class="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium transition-all"
    />
  </div>
</template>