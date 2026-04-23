<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseDatePicker from './BaseDatePicker.vue'

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
  timeout = setTimeout(() => emit('search'), 600)
})

watch(() => props.modelValue, (newVal) => {
  if (newVal !== localValue.value) localValue.value = newVal
})
</script>

<template>
  <div class="w-full sm:w-48 shrink-0">
    <BaseDatePicker
        v-model="localValue"
        :placeholder="props.placeholder"
    />
  </div>
</template>
