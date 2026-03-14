<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useLocale } from '~/composables/useLocale'
import { User, Mail, ShieldAlert, Loader2, Save } from 'lucide-vue-next'

const authStore = useAuthStore()
const { t } = useLocale()

const fullName = ref('')
const recoveryEmail = ref('')
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

onMounted(() => {
  if (authStore.user) {
    fullName.value = authStore.user.fullName || ''
    recoveryEmail.value = authStore.user.email || ''
  }
})

async function handleSubmit() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const success = await authStore.updateProfile(fullName.value, recoveryEmail.value)

  if (success) {
    successMessage.value = t.value.settings.success
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } else {
    errorMessage.value = t.value.settings.error
  }
  isSubmitting.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6 max-w-3xl">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{{ t.settings.title }}</h1>

    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <User :size="20" class="text-indigo-500" />
        {{ t.settings.profile }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-1.5">
          <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
            {{ t.settings.nameLabel }}
          </label>
          <input v-model="fullName" type="text" required class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" />
        </div>

        <div class="space-y-1.5 opacity-60">
          <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">
            {{ t.settings.emailLabel }}
          </label>
          <div class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 font-medium flex items-center gap-3">
            <Mail :size="16" />
            {{ authStore.user?.email || 'Nenhum e-mail vinculado' }}
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1 flex items-center gap-1.5">
            {{ t.settings.recoveryEmailLabel }}
            <ShieldAlert :size="12" class="text-amber-500" />
          </label>
          <input v-model="recoveryEmail" type="email" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium" />
        </div>

        <div v-if="successMessage" class="p-4 text-sm font-bold text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-800/50">
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="p-4 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800/50">
          {{ errorMessage }}
        </div>

        <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
          <button type="submit" :disabled="isSubmitting" class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-700 transition-all cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
            <Loader2 v-if="isSubmitting" :size="18" class="animate-spin" />
            <Save v-else :size="18" />
            <span>{{ t.settings.save }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>