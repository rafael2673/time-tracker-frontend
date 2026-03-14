<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useTheme } from '~/composables/useTheme'
import { useLocale } from '~/composables/useLocale'
import { Moon, Sun, Globe, ArrowLeft } from 'lucide-vue-next'
import LoginForm from '~/components/organisms/LoginForm.vue'
import RequestCodeForm from '~/components/organisms/RequestCodeForm.vue'
import SetPasswordForm from '~/components/organisms/SetPasswordForm.vue'

definePageMeta({
    layout: false
})

const viewState = ref<'LOGIN' | 'REQUEST_CODE' | 'SET_PASSWORD'>('LOGIN')

const email = ref<string>('')
const password = ref<string>('')
const code = ref<string>('')
const newPassword = ref<string>('')

const showPassword = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const errorMessage = ref<string>('')

const authStore = useAuthStore()
const router = useRouter()
const { isDark, toggleTheme } = useTheme()
const { t, toggleLocale } = useLocale()

onMounted(() => {
    if (authStore.isAuthenticated) {
        router.push('/')
    }
})

function setViewState(state: 'LOGIN' | 'REQUEST_CODE' | 'SET_PASSWORD'): void {
    viewState.value = state
    errorMessage.value = ''
    isLoading.value = false
}

async function handleLogin(): Promise<void> {
    isLoading.value = true
    errorMessage.value = ''

    const success = await authStore.login(email.value, password.value)

    if (success) {
        await router.push('/')
    } else {
        errorMessage.value = t.value.login.invalidCredentials
    }

    isLoading.value = false
}

async function handleRequestCode(): Promise<void> {
    isLoading.value = true
    errorMessage.value = ''

    const generatedCode = await authStore.requestFirstAccess(email.value)

    if (generatedCode) {
        alert(`[Aviso Dev] Seu código gerado é: ${generatedCode}`)
        setViewState('SET_PASSWORD')
    } else {
        errorMessage.value = t.value.login.codeSentError
    }

    isLoading.value = false
}

async function handleSetPassword(): Promise<void> {
    isLoading.value = true
    errorMessage.value = ''

    const success = await authStore.setFirstPassword(code.value, newPassword.value)

    if (success) {
        await router.push('/')
    } else {
        errorMessage.value = t.value.login.setPasswordError
    }

    isLoading.value = false
}

function togglePasswordVisibility(): void {
    showPassword.value = !showPassword.value
}
</script>

<template>
    <div class="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 transition-colors duration-300">
        <div class="relative w-full max-w-md">

            <div class="absolute -top-14 right-0 flex gap-3">
                <button
                        @click="toggleLocale"
                        class="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md hover:scale-105 transition-all cursor-pointer text-xs font-bold"
                >
                    <Globe :size="16" />
                    {{ t.login.language }}
                </button>

                <button
                        @click="toggleTheme"
                        class="p-2.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                    <Sun v-if="isDark" :size="20" />
                    <Moon v-else :size="20" />
                </button>
            </div>

            <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative min-h-112.5">

                <div v-if="viewState !== 'LOGIN'" class="absolute top-4 left-4">
                    <button @click="setViewState('LOGIN')" class="p-2 text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <ArrowLeft :size="20" />
                    </button>
                </div>

                <LoginForm
                        v-if="viewState === 'LOGIN'"
                        :email="email"
                        :password="password"
                        :show-password="showPassword"
                        :is-loading="isLoading"
                        :error-message="errorMessage"
                        :on-update-email="val => email = val"
                        :on-update-password="val => password = val"
                        :on-toggle-password="togglePasswordVisibility"
                        :on-submit="handleLogin"
                        :on-request-code="() => setViewState('REQUEST_CODE')"
                />

                <RequestCodeForm
                        v-else-if="viewState === 'REQUEST_CODE'"
                        :email="email"
                        :is-loading="isLoading"
                        :error-message="errorMessage"
                        :on-update-email="val => email = val"
                        :on-submit="handleRequestCode"
                />

                <SetPasswordForm
                        v-else-if="viewState === 'SET_PASSWORD'"
                        :code="code"
                        :new-password="newPassword"
                        :show-password="showPassword"
                        :is-loading="isLoading"
                        :error-message="errorMessage"
                        :on-update-code="val => code = val"
                        :on-update-password="val => newPassword = val"
                        :on-toggle-password="togglePasswordVisibility"
                        :on-submit="handleSetPassword"
                />
            </div>
        </div>
    </div>
</template>