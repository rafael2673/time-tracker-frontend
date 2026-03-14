<script setup lang="ts">
import { User, Mail, ShieldAlert, Loader2, Save } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
    fullName: string
    recoveryEmail: string
    userEmail: string
    isSubmitting: boolean
    successMessage: string
    errorMessage: string
    onUpdateFullName: (val: string) => void
    onUpdateRecoveryEmail: (val: string) => void
    onSubmit: () => void
}>()

const { t } = useLocale()
</script>

<template>
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
        <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <User :size="20" class="text-indigo-500" />
            {{ t.settings.profile }}
        </h2>

        <form @submit.prevent="props.onSubmit" class="space-y-6">
            <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
                    {{ t.settings.nameLabel }}
                </label>
                <input
                        :value="props.fullName"
                        @input="props.onUpdateFullName(($event.target as HTMLInputElement).value)"
                        type="text"
                        required
                        class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                />
            </div>

            <div class="space-y-1.5 opacity-60">
                <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
                    {{ t.settings.emailLabel }}
                </label>
                <div class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 font-medium flex items-center gap-3">
                    <Mail :size="16" />
                    {{ props.userEmail || t.settings.noEmailLinked }}
                </div>
            </div>

            <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1 flex items-center gap-1.5">
                    {{ t.settings.recoveryEmailLabel }}
                    <ShieldAlert :size="12" class="text-amber-500" />
                </label>
                <input
                        :value="props.recoveryEmail"
                        @input="props.onUpdateRecoveryEmail(($event.target as HTMLInputElement).value)"
                        type="email"
                        class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                />
            </div>

            <div v-if="props.successMessage" class="p-4 text-sm font-bold text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-800/50">
                {{ props.successMessage }}
            </div>

            <div v-if="props.errorMessage" class="p-4 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800/50">
                {{ props.errorMessage }}
            </div>

            <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="submit" :disabled="props.isSubmitting" class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-700 transition-all cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                    <Loader2 v-if="props.isSubmitting" :size="18" class="animate-spin" />
                    <Save v-else :size="18" />
                    <span>{{ t.settings.save }}</span>
                </button>
            </div>
        </form>
    </div>
</template>