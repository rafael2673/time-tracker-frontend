<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/workspaces'
import WorkspaceSelector from '~/components/molecules/WorkspaceSelector.vue'
import ThemeLocaleControls from '~/components/molecules/ThemeLocaleControls.vue'
import ProfileDropdown from '~/components/organisms/ProfileDropdown.vue'

const workspaceStore = useWorkspaceStore()

defineProps<{
  isMounted: boolean
}>()
</script>

<template>
  <header class="hidden md:flex h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 items-center justify-between px-8 sticky top-0 z-30 transition-colors">
    <WorkspaceSelector v-if="isMounted && workspaceStore.workspaces.length > 0" />
    <div v-else class="min-w-60"></div>

    <div class="flex items-center divide-x divide-gray-200 dark:divide-gray-800">
      <ThemeLocaleControls v-if="isMounted" class="pr-4" />
      <ProfileDropdown v-if="isMounted" />
    </div>
  </header>
</template>