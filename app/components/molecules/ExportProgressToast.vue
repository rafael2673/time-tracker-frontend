<script setup lang="ts">
import { Archive, Loader2, CheckCircle2, XCircle } from 'lucide-vue-next'
import { useExportStore } from '~/stores/export'
import { useLocale } from '~/composables/useLocale'

const exportStore = useExportStore()
const { t } = useLocale()
</script>

<template>
  <Transition name="toast">
    <div v-if="exportStore.isExporting" class="fixed bottom-6 right-6 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-5 z-50 overflow-hidden">
      <div class="flex items-center gap-4 mb-3">
        <div class="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Loader2 v-if="exportStore.exportStatus === 'PENDING' || exportStore.exportStatus === 'PROCESSING'" :size="20" class="animate-spin" />
          <CheckCircle2 v-else-if="exportStore.exportStatus === 'COMPLETED'" :size="20" class="text-emerald-500" />
          <XCircle v-else-if="exportStore.exportStatus === 'FAILED'" :size="20" class="text-red-500" />
          <Archive v-else :size="20" />
        </div>

        <div class="flex-1">
          <h4 class="text-sm font-bold text-gray-900 dark:text-white">
            {{ t.closures?.exporting }}
          </h4>
          <p class="text-xs font-medium" :class="{
                        'text-gray-500': exportStore.exportStatus === 'PENDING' || exportStore.exportStatus === 'PROCESSING',
                        'text-emerald-600': exportStore.exportStatus === 'COMPLETED',
                        'text-red-600': exportStore.exportStatus === 'FAILED'
                    }">
            <span v-if="exportStore.exportStatus === 'PENDING'">{{ t.closures?.starting }}</span>
            <span v-else-if="exportStore.exportStatus === 'PROCESSING'">{{ exportStore.exportProgress }}% {{ t.closures?.completed }}</span>
            <span v-else-if="exportStore.exportStatus === 'COMPLETED'">{{ t.closures?.downloading }}</span>
            <span v-else-if="exportStore.exportStatus === 'FAILED'">{{ t.closures?.failed }}</span>
          </p>
        </div>
      </div>

      <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-1 overflow-hidden">
        <div
            class="h-2 rounded-full transition-all duration-500 ease-out"
            :class="{
                        'bg-indigo-500': exportStore.exportStatus === 'PENDING' || exportStore.exportStatus === 'PROCESSING',
                        'bg-emerald-500': exportStore.exportStatus === 'COMPLETED',
                        'bg-red-500': exportStore.exportStatus === 'FAILED'
                    }"
            :style="{ width: `${exportStore.exportProgress}%` }"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>