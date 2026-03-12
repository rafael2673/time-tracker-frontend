// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt'
  ],

  vite: {
    plugins: [
      tailwindcss() as any,
    ],
  },

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:8081/api',
        changeOrigin: true,
        prependPath: true
      }
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