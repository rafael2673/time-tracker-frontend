<script setup lang="ts">
const props = defineProps<{
  isSidebarCollapsed: boolean
  visibleNavigation: any[]
}>()
</script>

<template>
  <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
    <NuxtLink
        v-for="item in props.visibleNavigation"
        :key="item?.name"
        :to="item?.href"
        class="flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white relative group"
        :class="[isSidebarCollapsed ? 'justify-center' : 'gap-3']"
        active-class="bg-indigo-50 dark:bg-indigo-900/30 !text-indigo-700 dark:!text-indigo-400 ring-1 ring-indigo-100 dark:ring-indigo-800/50"
    >
      <component v-if="item?.icon" :is="item.icon" :size="18" class="shrink-0" />

      <span v-if="!isSidebarCollapsed" class="truncate">{{ item?.name }}</span>

      <div v-if="isSidebarCollapsed" class="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-100 shadow-xl">
        {{ item?.name }}
      </div>
    </NuxtLink>
  </nav>
</template>