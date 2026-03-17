<script setup lang="ts">
import SearchInput from '~/components/atoms/SearchInput.vue'
import BaseSelect from '~/components/atoms/BaseSelect.vue'
import DateFilterInput from '~/components/atoms/DateFilterInput.vue'
import {useLocale} from "~/composables/useLocale";

const props = defineProps<{
  searchPlaceholder?: string
  searchValue: string
  showRoleFilter?: boolean
  roleValue?: string
  roleOptions?: any[]
  showDateFilter?: boolean
  dateValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:searchValue', value: string): void
  (e: 'update:roleValue', value: string): void
  (e: 'update:dateValue', value: string): void
  (e: 'search'): void
}>()

const { t } = useLocale()
</script>

<template>
  <div class="p-4 border-b border-gray-100 dark:border-gray-800 rounded-t-3xl flex flex-wrap gap-4 items-center bg-gray-50/30 dark:bg-gray-900/30 relative z-20">
    <div class="flex-1 min-w-200px">
      <SearchInput
          :model-value="props.searchValue"
          @update:model-value="emit('update:searchValue', $event)"
          :placeholder="props.searchPlaceholder"
          @search="emit('search')"
      />
    </div>

    <div class="flex items-center gap-3 w-full sm:w-auto">
      <div v-if="props.showRoleFilter" class="w-full sm:w-40 relative z-30 shrink-0">
        <BaseSelect
            :model-value="props.roleValue || ''"
            @update:model-value="emit('update:roleValue', $event); emit('search')"
            :options="props.roleOptions || []"
            placeholder="Filtrar Cargo"
        />
      </div>

      <DateFilterInput
          v-if="props.showDateFilter"
          :model-value="props.dateValue || ''"
          @update:model-value="emit('update:dateValue', $event)"
          @search="emit('search')"
      />

      <button v-if="props.roleValue || props.dateValue" @click="emit('update:roleValue', ''); emit('update:dateValue', ''); emit('search')" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 cursor-pointer shrink-0">
        {{ t.filter.clean }}
      </button>
    </div>
  </div>
</template>