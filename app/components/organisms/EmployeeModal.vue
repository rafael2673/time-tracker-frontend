<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
    isOpen: boolean
    isSubmitting: boolean
    formData: any
    availableRoles: string[]
    policies: any[]
    successMessage: string
    errorMessage: string
    onClose: () => void
    onSubmit: () => void
}>()

const { t } = useLocale()

function getRoleTranslation(role: string): string {
    const rolesMap = t.value.employees.roles as Record<string, string>
    return rolesMap[role] || role
}
</script>

<template>
    <div v-if="props.isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                    {{ t.employees.newEmployee }}
                </h2>
            </div>

            <form @submit.prevent="props.onSubmit" class="p-6 space-y-5">
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
                        {{ t.employees.name }}
                    </label>
                    <input v-model="props.formData.fullName" type="text" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" />
                </div>

                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
                        {{ t.employees.email }}
                    </label>
                    <input v-model="props.formData.email" type="email" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" />
                </div>

                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
                        {{ t.employees.role }}
                    </label>
                    <select v-model="props.formData.role" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium cursor-pointer appearance-none">
                        <option v-for="r in props.availableRoles" :key="r" :value="r">
                            {{ getRoleTranslation(r) }}
                        </option>
                    </select>
                </div>

                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
                        {{ t.employees.policy }}
                    </label>
                    <select v-model="props.formData.workPolicyId" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium cursor-pointer appearance-none">
                        <option v-for="policy in props.policies" :key="policy.id" :value="policy.id">
                            {{ policy.name }}
                        </option>
                    </select>
                </div>

                <div v-if="props.successMessage" class="p-3 text-xs font-bold text-green-700 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/50">
                    {{ props.successMessage }}
                </div>

                <div v-if="props.errorMessage" class="p-3 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50">
                    {{ props.errorMessage }}
                </div>

                <div class="flex items-center gap-3 pt-4 mt-2">
                    <button type="button" @click="props.onClose" :disabled="props.isSubmitting" class="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50">
                        {{ t.employees.cancel }}
                    </button>
                    <button type="submit" :disabled="props.isSubmitting" class="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-700 transition-all cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                        <Loader2 v-if="props.isSubmitting" :size="18" class="animate-spin" />
                        <span v-else>{{ t.employees.save }}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>