<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { CalendarClock, Save, Loader2, Info } from 'lucide-vue-next'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useAuthStore } from '~/stores/auth'
import BaseSelect from '~/components/atoms/BaseSelect.vue'
import { useLocale } from '~/composables/useLocale'

const workspacesStore = useWorkspaceStore()
const authStore = useAuthStore()
const { t } = useLocale()

const isSaving = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const autoClosureEnabled = ref(false)
const closureTargetDay = ref<number | null>(5)
const closureCountType = ref('BUSINESS_DAYS')
const closureShiftRule = ref('SHIFT_FORWARD')
const closurePendingStrategy = ref('BLOCKING')

const countTypeOptions = computed(() => [
  { value: 'CALENDAR_DAYS', label: t.value.settings.autoClosure.countTypeOptions.calendarDays },
  { value: 'BUSINESS_DAYS', label: t.value.settings.autoClosure.countTypeOptions.businessDays }
])

const shiftRuleOptions = computed(() => [
  { value: 'SHIFT_BACKWARD', label: t.value.settings.autoClosure.shiftRuleOptions.shiftBackward },
  { value: 'SHIFT_FORWARD', label: t.value.settings.autoClosure.shiftRuleOptions.shiftForward }
])

const pendingStrategyOptions = computed(() => [
  { value: 'BLOCKING', label: t.value.settings.autoClosure.pendingStrategyOptions.blocking },
  { value: 'FORCE_CLOSE', label: t.value.settings.autoClosure.pendingStrategyOptions.forceClose }
])

onMounted(() => loadCurrentSettings())

watch(() => authStore.activeWorkspaceId, loadCurrentSettings)

function loadCurrentSettings() {
  const activeWorkspace = workspacesStore.workspaces.find(w => w.id === authStore.activeWorkspaceId)
  if (activeWorkspace) {
    autoClosureEnabled.value = activeWorkspace.autoClosureEnabled || false
    closureTargetDay.value = activeWorkspace.closureTargetDay || 5
    closureCountType.value = activeWorkspace.closureCountType || 'BUSINESS_DAYS'
    closureShiftRule.value = activeWorkspace.closureShiftRule || 'SHIFT_FORWARD'
    closurePendingStrategy.value = activeWorkspace.closurePendingStrategy || 'BLOCKING'
  }
}

function showMessage(msg: string, type: 'success' | 'error') {
  message.value = msg
  messageType.value = type
  setTimeout(() => message.value = '', 3000)
}

async function handleSave() {
  if (!authStore.activeWorkspaceId || isSaving.value) return

  isSaving.value = true
  const payload = {
    autoClosureEnabled: autoClosureEnabled.value,
    closureTargetDay: closureTargetDay.value,
    closureCountType: closureCountType.value,
    closureShiftRule: closureShiftRule.value,
    closurePendingStrategy: closurePendingStrategy.value
  }

  const success = await workspacesStore.updateAutoClosureSettings(authStore.activeWorkspaceId, payload)

  if (success) {
    showMessage(t.value.settings.autoClosure.successUpdate, 'success')
  } else {
    showMessage(workspacesStore.error || t.value.settings.autoClosure.errorSave, 'error')
  }

  isSaving.value = false
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm flex flex-col w-full relative">
    <div class="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <CalendarClock :size="20" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white leading-tight">{{ t.settings?.autoClosure?.title }}</h2>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{{ t.settings?.autoClosure?.subtitle }}</p>
        </div>
      </div>

      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" v-model="autoClosureEnabled" class="sr-only peer">
        <span class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></span>
      </label>
    </div>

    <div class="p-6" :class="{ 'opacity-50 pointer-events-none': !autoClosureEnabled }">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div class="space-y-1.5">
          <label class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ t.settings?.autoClosure?.targetDayLabel }}</label>
          <input
              type="number"
              min="1"
              max="31"
              v-model="closureTargetDay"
              class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ t.settings?.autoClosure?.countTypeLabel }}</label>
          <BaseSelect v-model="closureCountType" :options="countTypeOptions" />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ t.settings?.autoClosure?.shiftRuleLabel }}</label>
          <BaseSelect v-model="closureShiftRule" :options="shiftRuleOptions" />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ t.settings?.autoClosure?.pendingStrategyLabel }}</label>
          <BaseSelect v-model="closurePendingStrategy" :options="pendingStrategyOptions" />
        </div>

      </div>

      <div class="mt-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-500 rounded-xl border border-amber-200/50 dark:border-amber-800/30 text-sm font-medium">
        <Info :size="18" class="shrink-0 mt-0.5" />
        <p v-html="t.settings?.autoClosure?.infoText"></p>
      </div>

      <div class="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <span
                    class="text-sm font-bold transition-opacity"
                    :class="messageType === 'success' ? 'text-emerald-500' : 'text-red-500'"
                    :style="{ opacity: message ? 1 : 0 }"
                >
                    {{ message }}
                </span>

        <button
            @click="handleSave"
            :disabled="isSaving"
            class="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Loader2 v-if="isSaving" :size="16" class="animate-spin" />
          <Save v-else :size="16" />
          {{ t.settings?.autoClosure?.saveRules }}
        </button>
      </div>
    </div>
  </div>
</template>