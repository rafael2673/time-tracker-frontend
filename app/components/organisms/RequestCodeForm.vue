<script setup lang="ts">
import { User, Loader2 } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
    email: string
    isLoading: boolean
    errorMessage: string
    onUpdateEmail: (val: string) => void
    onSubmit: () => void
}>()

const { t } = useLocale()
</script>

<template>
    <div class="px-8 pt-12 pb-6 text-center animate-in fade-in slide-in-from-right-8 duration-300">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
            {{ t.login.requestCodeTitle }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {{ t.login.requestCodeSubtitle }}
        </p>
    </div>

    <form @submit.prevent="props.onSubmit" class="px-8 pb-10 space-y-6 animate-in fade-in slide-in-from-right-8 duration-300 delay-75">
        <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
                {{ t.login.emailLabel }}
            </label>
            <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <User :size="18" />
                </div>
                <input
                        :value="props.email"
                        @input="props.onUpdateEmail(($event.target as HTMLInputElement).value)"
                        type="email"
                        required
                        class="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        :placeholder="t.login.emailPlaceholder"
                />
            </div>
        </div>

        <div v-if="props.errorMessage" class="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800/50">
            <span class="font-bold">!</span> {{ props.errorMessage }}
        </div>

        <button
                type="submit"
                :disabled="props.isLoading"
                class="w-full py-3.5 px-4 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer mt-4"
        >
            <Loader2 v-if="props.isLoading" :size="20" class="animate-spin" />
            <span v-else>{{ t.login.requestCodeButton }}</span>
        </button>
    </form>
</template>