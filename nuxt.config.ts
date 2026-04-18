import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: [
    '@pinia/nuxt'
  ],

  imports: {
    presets: [
      {
        from: 'nitropack/runtime/internal/config',
        imports: ['useAppConfig'],
        priority: -1
      }
    ]
  },

  vite: {
    plugins: [
      tailwindcss() as any,
    ]
  },

  routeRules: {
    '/api/**': {
      proxy: 'http://localhost:8081/api/**'
    }
  },



  app: {
    head: {
      title: 'TimeTracker',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  }
})