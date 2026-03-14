<script setup lang="ts">
import { AlertCircle, Loader2 } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'

defineProps<{
    show: boolean
    title: string
    message: string
    isLoading?: boolean
}>()

const emit = defineEmits<{
    (e: 'confirm'): void
    (e: 'cancel'): void
}>()

const { t } = useLocale()
</script>

<template>
    <div v-if="show" class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div class="flex items-start gap-4 mb-6">
                <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl shrink-0">
                    <AlertCircle :size="24" />
                </div>
                <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{{ title }}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{{ message }}</p>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button
                        @click="emit('cancel')"
                        :disabled="isLoading"
                        class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                    {{ t.modal.cancel }}
                </button>
                <button
                        @click="emit('confirm')"
                        :disabled="isLoading"
                        class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Loader2 v-if="isLoading" :size="18" class="animate-spin" />
                    <span v-else>{{ t.modal.confirm }}</span>
                </button>
            </div>
        </div>
    </div>
</template>