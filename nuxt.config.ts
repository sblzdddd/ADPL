import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: [
    '@nuxt/eslint',
    'shadcn-nuxt',
    'nuxt-auth-utils',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
  ],

  colorMode: {
    classSuffix: '',
  },

  
  imports: {
    dirs: [
      'composables/**',
      'components/ui/'
    ],
    presets: [
      {
        from: 'nitropack',
        imports: [{name: 'InternalApi', type: true}]
      }
    ]
  },
})