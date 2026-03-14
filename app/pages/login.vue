<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useTheme } from '~/composables/useTheme'
import { useLocale } from '~/composables/useLocale'
import { User, Lock, Eye, EyeOff, Moon, Sun, Loader2, Globe, KeyRound, ArrowLeft } from 'lucide-vue-next'

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

      <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative min-h-[450px]">

        <div v-if="viewState !== 'LOGIN'" class="absolute top-4 left-4">
          <button @click="setViewState('LOGIN')" class="p-2 text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft :size="20" />
          </button>
        </div>

        <template v-if="viewState === 'LOGIN'">
          <div class="px-8 pt-12 pb-6 text-center animate-in fade-in zoom-in duration-300">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
              {{ t.login.title }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {{ t.login.subtitle }}
            </p>
          </div>

          <form @submit.prevent="handleLogin" class="px-8 pb-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
                {{ t.login.emailLabel }}
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <User :size="18" />
                </div>
                <input
                    v-model="email"
                    type="email"
                    required
                    class="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    :placeholder="t.login.emailPlaceholder"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
                {{ t.login.passwordLabel }}
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock :size="18" />
                </div>
                <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    class="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    :placeholder="t.login.passwordPlaceholder"
                />
                <button
                    type="button"
                    @click="togglePasswordVisibility"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition-colors"
                >
                  <EyeOff v-if="showPassword" :size="18" />
                  <Eye v-else :size="18" />
                </button>
              </div>
            </div>

            <div v-if="errorMessage" class="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800/50">
              <span class="font-bold">!</span> {{ errorMessage }}
            </div>

            <button
                type="submit"
                :disabled="isLoading"
                class="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
            >
              <Loader2 v-if="isLoading" :size="20" class="animate-spin" />
              <span v-else>{{ t.login.submitButton }}</span>
            </button>

            <div class="text-center mt-6">
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ t.login.firstAccessText }}</span>
              <button type="button" @click="setViewState('REQUEST_CODE')" class="ml-1 text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer">
                {{ t.login.firstAccessAction }}
              </button>
            </div>
          </form>
        </template>

        <template v-else-if="viewState === 'REQUEST_CODE'">
          <div class="px-8 pt-12 pb-6 text-center animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
              {{ t.login.requestCodeTitle }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {{ t.login.requestCodeSubtitle }}
            </p>
          </div>

          <form @submit.prevent="handleRequestCode" class="px-8 pb-10 space-y-6 animate-in fade-in slide-in-from-right-8 duration-300 delay-75">
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
                {{ t.login.emailLabel }}
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <User :size="18" />
                </div>
                <input
                    v-model="email"
                    type="email"
                    required
                    class="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    :placeholder="t.login.emailPlaceholder"
                />
              </div>
            </div>

            <div v-if="errorMessage" class="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800/50">
              <span class="font-bold">!</span> {{ errorMessage }}
            </div>

            <button
                type="submit"
                :disabled="isLoading"
                class="w-full py-3.5 px-4 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer mt-4"
            >
              <Loader2 v-if="isLoading" :size="20" class="animate-spin" />
              <span v-else>{{ t.login.requestCodeButton }}</span>
            </button>
          </form>
        </template>

        <template v-else-if="viewState === 'SET_PASSWORD'">
          <div class="px-8 pt-12 pb-6 text-center animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
              {{ t.login.setPasswordTitle }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {{ t.login.setPasswordSubtitle }}
            </p>
          </div>

          <form @submit.prevent="handleSetPassword" class="px-8 pb-10 space-y-6 animate-in fade-in slide-in-from-right-8 duration-300 delay-75">
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
                {{ t.login.codeLabel }}
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <KeyRound :size="18" />
                </div>
                <input
                    v-model="code"
                    type="text"
                    required
                    maxlength="6"
                    class="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all tracking-widest font-mono text-lg"
                    :placeholder="t.login.codePlaceholder"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">
                {{ t.login.newPasswordLabel }}
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock :size="18" />
                </div>
                <input
                    v-model="newPassword"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    class="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    :placeholder="t.login.passwordPlaceholder"
                />
                <button
                    type="button"
                    @click="togglePasswordVisibility"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition-colors"
                >
                  <EyeOff v-if="showPassword" :size="18" />
                  <Eye v-else :size="18" />
                </button>
              </div>
            </div>

            <div v-if="errorMessage" class="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800/50">
              <span class="font-bold">!</span> {{ errorMessage }}
            </div>

            <button
                type="submit"
                :disabled="isLoading"
                class="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer mt-4"
            >
              <Loader2 v-if="isLoading" :size="20" class="animate-spin" />
              <span v-else>{{ t.login.setPasswordButton }}</span>
            </button>
          </form>
        </template>

      </div>
    </div>
  </div>
</template>