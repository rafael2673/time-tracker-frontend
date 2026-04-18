<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useLocale } from '~/composables/useLocale'
import SettingsProfileForm from '~/components/organisms/SettingsProfileForm.vue'
import SettingsApiKey from '~/components/organisms/SettingsApiKey.vue'
import SettingsAutoClosure from "~/components/organisms/SettingsAutoClosure.vue";
import WorkspaceLocationForm from "~/components/organisms/WorkspaceLocationForm.vue";

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
        <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{{ t.settings.title }}</h1>
            <p v-if="t.settings.subtitle" class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{{ t.settings.subtitle }}</p>
        </div>

        <SettingsProfileForm
                :full-name="fullName"
                :recovery-email="recoveryEmail"
                :user-email="authStore.user?.email || ''"
                :is-submitting="isSubmitting"
                :success-message="successMessage"
                :error-message="errorMessage"
                :on-update-full-name="val => fullName = val"
                :on-update-recovery-email="val => recoveryEmail = val"
                :on-submit="handleSubmit"
        />

        <WorkspaceLocationForm 
            v-if="authStore.isManager && authStore.activeWorkspaceId" 
            :workspace-id="authStore.activeWorkspaceId" 
        />
        <SettingsApiKey v-if="authStore.isManager"/>
        <SettingsAutoClosure v-if="authStore.isManager" />
    </div>
</template>