<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import TimerWidget from '~/components/TimerWidget.vue'
import '../assets/css/main.css'

const authStore = useAuthStore()

onMounted(() => {
  const hostToken = (window as any).AP101_TOKEN
  if (hostToken) authStore.setToken(hostToken)
})

function devSimulateLogin() {
  authStore.setToken("dev-token-simulado-ap101")
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

    <Transition
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="authStore.isAuthenticated" key="widget">
        <TimerWidget />
      </div>

      <div v-else key="simulation" class="text-center">
        <div class="p-8 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <h2 class="text-gray-500 dark:text-gray-400 font-medium mb-6 font-mono text-sm uppercase tracking-widest">
            Ambiente Host (Simulação)
          </h2>

          <button
              @click="devSimulateLogin"
              class="group relative px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            Injetar Token de Acesso
          </button>

          <p class="mt-4 text-xs text-gray-400 max-w-[200px] mx-auto">
            Ao clicar, simulamos que o sistema legado enviou o token para o widget.
          </p>
        </div>
      </div>
    </Transition>

  </div>
</template>