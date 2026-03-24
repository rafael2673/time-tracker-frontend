<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { KeyRound, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useAuthStore } from '~/stores/auth'
import { useLocale } from '~/composables/useLocale'
import ConfirmModal from '~/components/molecules/ConfirmModal.vue'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const { t } = useLocale()

const isCopied = ref(false)
const isConfirmModalOpen = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

onMounted(() => {
    if (authStore.activeWorkspaceId) settingsStore.fetchApiKey()
})

watch(() => authStore.activeWorkspaceId, (newVal) => {
    if (newVal) settingsStore.fetchApiKey()
})

function showMessage(msg: string, type: 'success' | 'error') {
    message.value = msg
    messageType.value = type
    setTimeout(() => message.value = '', 3000)
}

async function copyToClipboard() {
    if (!settingsStore.currentApiKey) return
    try {
        await navigator.clipboard.writeText(settingsStore.currentApiKey)
        isCopied.value = true
        setTimeout(() => isCopied.value = false, 2000)
    } catch (err) {
        console.error('Failed to copy', err)
    }
}

async function handleGenerate() {
    const success = await settingsStore.generateNewApiKey()
    if (success) {
        showMessage(t.value.settings.successGenerate || 'Sucesso', 'success')
    } else {
        showMessage(t.value.settings.errorGenerate || 'Erro', 'error')
    }
    isConfirmModalOpen.value = false
}
</script>

<template>
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
        <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
            <KeyRound :size="20" class="text-indigo-500" />
            {{ t.settings?.integrationTitle || 'Integração do Widget' }}
        </h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            {{ t.settings?.integrationDesc || 'Use esta chave para conectar o tablet ou totem da recepção ao sistema. Nunca compartilhe esta chave publicamente.' }}
        </p>

        <div v-if="message" class="mb-6 p-4 text-sm font-bold rounded-xl border animate-in fade-in duration-300" :class="messageType === 'success' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50' : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'">
            {{ message }}
        </div>

        <div class="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 ml-1">
                {{ t.settings?.apiKeyLabel || 'Chave de Acesso (API Key)' }}
            </label>

            <div class="flex flex-col sm:flex-row gap-3">
                <div class="relative flex-1">
                    <input
                            type="text"
                            readonly
                            :value="settingsStore.currentApiKey || t.settings?.noKey"
                            class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-xl pl-4 pr-12 py-3 font-mono text-sm outline-none"
                            :class="{'text-gray-400 italic': !settingsStore.currentApiKey}"
                    />
                    <button
                            v-if="settingsStore.currentApiKey"
                            @click="copyToClipboard"
                            class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                            :title="t.settings?.copy"
                    >
                        <Check v-if="isCopied" :size="18" class="text-emerald-500" />
                        <Copy v-else :size="18" />
                    </button>
                </div>

                <button
                        @click="isConfirmModalOpen = true"
                        :disabled="settingsStore.isLoading"
                        class="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50 whitespace-nowrap"
                >
                    <RefreshCw :size="16" :class="{'animate-spin': settingsStore.isLoading}" />
                    {{ t.settings?.generateNew || 'Gerar Nova' }}
                </button>
            </div>
        </div>

        <div v-if="settingsStore.currentApiKey" class="mt-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
            <AlertTriangle :size="20" class="text-amber-500 shrink-0 mt-0.5" />
            <div>
                <h4 class="text-sm font-bold text-amber-800 dark:text-amber-500">{{ t.settings?.warningTitle || 'Atenção ao rotacionar a chave' }}</h4>
                <p class="text-[10px] text-amber-700 dark:text-amber-600 mt-1 uppercase font-bold tracking-wide">
                    {{ t.settings?.warningDesc || 'Ao gerar uma nova chave, os widgets antigos serão desconectados.' }}
                </p>
            </div>
        </div>

        <ConfirmModal
                :show="isConfirmModalOpen"
                :title="t.settings?.confirmGenerateTitle || 'Gerar Nova Chave?'"
                :message="t.settings?.confirmGenerateMsg || 'Os dispositivos atuais perderão o acesso.'"
                :is-loading="settingsStore.isLoading"
                intent="danger"
                @confirm="handleGenerate"
                @cancel="isConfirmModalOpen = false"
        />
    </div>
</template>