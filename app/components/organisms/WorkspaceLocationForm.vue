<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { MapPin, Save, Loader2, AlertCircle } from 'lucide-vue-next'
import { useWorkspaceStore } from '~/stores/workspaces'
import { useFeriadosApi, type Estado, type Municipio } from '~/composables/useFeriadosApi'

const props = defineProps<{
  workspaceId: string
}>()

const workspaceStore = useWorkspaceStore()
const feriadosApi = useFeriadosApi()

const name = ref('')
const stateUf = ref('')
const ibgeCode = ref('')

const estados = ref<Estado[]>([])
const municipios = ref<Municipio[]>([])
const isLoadingLocations = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(async () => {
  const workspace = workspaceStore.workspaces.find(w => w.id === props.workspaceId)
  if (workspace) {
    name.value = workspace.name || ''
    stateUf.value = workspace.stateUf || ''
    ibgeCode.value = workspace.ibgeCode || ''
  }

  isLoadingLocations.value = true
  try {
    estados.value = await feriadosApi.fetchEstados()
    if (stateUf.value) {
      municipios.value = await feriadosApi.fetchMunicipios(stateUf.value)
    }
  } catch (e) {
    errorMessage.value = 'Erro ao carregar localidades. Verifique a configuração da API de Feriados.'
  } finally {
    isLoadingLocations.value = false
  }
})

watch(stateUf, async (newUf) => {
  if (!newUf) {
    municipios.value = []
    ibgeCode.value = ''
    return
  }
  
  // Only fetch and clear if it's a real change (not initial load)
  const workspace = workspaceStore.workspaces.find(w => w.id === props.workspaceId)
  if (workspace && workspace.stateUf === newUf && workspace.ibgeCode === ibgeCode.value) {
    // initial state, do nothing
  } else {
    ibgeCode.value = ''
  }

  isLoadingLocations.value = true
  try {
    municipios.value = await feriadosApi.fetchMunicipios(newUf)
  } catch (e) {
    errorMessage.value = 'Erro ao carregar municípios.'
  } finally {
    isLoadingLocations.value = false
  }
})

async function saveLocation() {
  if (!name.value || !stateUf.value || !ibgeCode.value) {
    errorMessage.value = 'Preencha todos os campos obrigatórios.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const success = await workspaceStore.updateLocation(props.workspaceId, {
    name: name.value,
    stateUf: stateUf.value,
    ibgeCode: ibgeCode.value
  })

  if (success) {
    successMessage.value = 'Localização salva com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
  } else {
    errorMessage.value = workspaceStore.error || 'Erro ao salvar localização.'
  }
  
  isSaving.value = false
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
    <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
          <MapPin class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Localização da Empresa</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Define o calendário de feriados estaduais e municipais automáticos.
          </p>
        </div>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <div v-if="errorMessage" class="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm">
        <AlertCircle class="w-4 h-4" />
        {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center gap-2 text-sm">
        <AlertCircle class="w-4 h-4" />
        {{ successMessage }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Empresa</label>
          <input
            v-model="name"
            type="text"
            class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
            placeholder="Ex: Minha Empresa LTDA"
          >
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado (UF)</label>
            <div class="relative">
              <select
                v-model="stateUf"
                :disabled="isLoadingLocations"
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white disabled:opacity-50 appearance-none"
              >
                <option value="">Selecione um Estado</option>
                <option v-for="estado in estados" :key="estado.uf" :value="estado.uf">
                  {{ estado.nome }}
                </option>
              </select>
              <div v-if="isLoadingLocations && !estados.length" class="absolute right-3 top-2.5">
                <Loader2 class="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Município</label>
            <div class="relative">
              <select
                v-model="ibgeCode"
                :disabled="!stateUf || isLoadingLocations"
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white disabled:opacity-50 appearance-none"
              >
                <option value="">Selecione um Município</option>
                <option v-for="mun in municipios" :key="mun.ibge" :value="mun.ibge">
                  {{ mun.nome }}
                </option>
              </select>
              <div v-if="isLoadingLocations && stateUf" class="absolute right-3 top-2.5">
                <Loader2 class="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-4 flex justify-end">
        <button
          @click="saveLocation"
          :disabled="isSaving || isLoadingLocations"
          class="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          Salvar Localização
        </button>
      </div>
    </div>
  </div>
</template>
