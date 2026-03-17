<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { MoreVertical, Pencil, KeyRound, CheckCircle2, Copy, Loader2, LayoutDashboard, UserX, UserCheck, CalendarOff } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import { useEmployeesStore } from '~/stores/employees'
import ConfirmModal from '~/components/molecules/ConfirmModal.vue'

const props = defineProps<{
  employeeId: string
  isActive?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'view-dashboard'): void
  (e: 'manage-leaves'): void
}>()

const { t } = useLocale()
const employeesStore = useEmployeesStore()

const isOpen = ref(false)
const generatedCode = ref<string | null>(null)
const isGenerating = ref(false)
const isCopied = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const isConfirmModalOpen = ref(false)
const isStatusChanging = ref(false)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => { document.addEventListener('click', closeMenu) })
onUnmounted(() => { document.removeEventListener('click', closeMenu) })

function triggerEdit() {
  isOpen.value = false
  emit('edit')
}

function triggerViewDashboard() {
  isOpen.value = false
  emit('view-dashboard')
}

function triggerManageLeaves() {
  isOpen.value = false
  emit('manage-leaves')
}

function triggerStatusChange() {
  isOpen.value = false
  isConfirmModalOpen.value = true
}

async function executeStatusChange() {
  if (isStatusChanging.value) return
  isStatusChanging.value = true

  if (props.isActive !== undefined && typeof employeesStore.changeStatus === 'function') {
    await employeesStore.changeStatus(props.employeeId, !props.isActive)
  }

  isStatusChanging.value = false
  isConfirmModalOpen.value = false
}

async function handleGenerateCode() {
  if (isGenerating.value) return
  isGenerating.value = true
  const response = await employeesStore.generateAccessCode(props.employeeId)
  if (response) generatedCode.value = response.code
  isGenerating.value = false
}

function copyToClipboard() {
  if (!generatedCode.value) return
  navigator.clipboard.writeText(generatedCode.value)
  isCopied.value = true
  setTimeout(() => isCopied.value = false, 2000)
}
</script>

<template>
  <div class="relative" ref="menuRef">
    <button @click.stop="toggleMenu" class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors cursor-pointer outline-none relative z-10">
      <MoreVertical :size="18" />
    </button>

    <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="isOpen" class="absolute right-0 top-10 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden text-left origin-top-right" @click.stop>
        <div class="p-2 space-y-1">
          <button @click="triggerViewDashboard" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors cursor-pointer">
            <LayoutDashboard :size="16" />
            {{ t.employees.viewDashboard }}
          </button>

          <button @click="triggerEdit" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer">
            <Pencil :size="16" class="text-gray-400" />
            {{ t.employees.editEmployee }}
          </button>

          <button @click="triggerManageLeaves" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer">
            <CalendarOff :size="16" class="text-gray-400" />
            {{ t.employees.manageLeaves }}
          </button>

          <div class="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>

          <button v-if="props.isActive !== undefined" @click="triggerStatusChange" :disabled="isStatusChanging" class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50" :class="props.isActive ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20' : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'">
            <UserX v-if="props.isActive" :size="16" />
            <UserCheck v-else :size="16" />
            {{ props.isActive ? (t.employees.deactivate || 'Desativar Colaborador') : (t.employees.reactivate || 'Reativar Colaborador') }}
          </button>

          <div class="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>

          <div v-if="!generatedCode" class="px-1 py-1">
            <button @click="handleGenerateCode" :disabled="isGenerating" class="w-full flex justify-center items-center gap-2 px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
              <KeyRound v-if="!isGenerating" :size="14" />
              <Loader2 v-else :size="14" class="animate-spin" />
              {{ t.employees.generateCode }}
            </button>
          </div>

          <div v-else class="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/30 flex flex-col gap-2">
            <span class="text-[10px] font-bold text-green-700 dark:text-green-500 uppercase tracking-widest text-center">{{ t.employees.codeGenerated }}</span>
            <div class="flex items-center justify-between bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800/50">
              <span class="font-mono font-bold tracking-widest text-gray-900 dark:text-white">{{ generatedCode }}</span>
              <button @click="copyToClipboard" class="text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer" :title="t.employees.copyCode">
                <CheckCircle2 v-if="isCopied" :size="16" class="text-emerald-500" />
                <Copy v-else :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <ConfirmModal
        :show="isConfirmModalOpen"
        :title="props.isActive ? t.employees.deactivateTitle : t.employees.reactivateTitle"
        :message="props.isActive ? t.employees.confirmDeactivate : t.employees.confirmReactivate"
        :is-loading="isStatusChanging"
        @confirm="executeStatusChange"
        @cancel="isConfirmModalOpen = false"
    />
  </div>
</template>