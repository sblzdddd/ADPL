import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  app: {
    pageTransition: {name: 'page', mode: 'out-in'},
    layoutTransition: {name: 'layout', mode: 'out-in'},
    head: {
      title: 'AiD PLace',
      link: [
        { rel: 'icon', sizes: '64x64', href: '/icons/adpl-icon64.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/adpl-icon32.png' },
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/icons/adpl-icon64.png' },
        { rel: 'icon', type: 'image/png', sizes: '128x128', href: '/icons/adpl-icon128.png' },
        { rel: 'icon', type: 'image/png', sizes: '256x256', href: '/icons/adpl-icon256.png' },
      ]
    }
  },

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
    '@sentry/nuxt/module',
  ],

  colorMode: {
    classSuffix: '',
  },

  imports: {
    dirs: [
      'composables/**',
      'components/ui/**',
      'shared/types/**',
      'shared/validators/**',
    ],
    presets: [
      {
        from: 'nitropack',
        imports: [{name: 'InternalApi', type: true}]
      }
    ]
  },

  nitro: {
    imports: {
      dirs: [
        './server/models',
        './shared/types/**',
        './shared/validators/**',
      ]
    },
    experimental: {
      openAPI: true,
      websocket: true,
      tasks: true,
    },
    openAPI: {
      route: "/_hidden/openapi.json",
      meta: {
        title: 'ADPL API',
        description: 'ADPL API is the RESTful API for AiD PLACE.',
        version: '1.0',
      },
      production: "runtime",
      ui: {
        scalar: {
          route: "/_hidden/scalar",
          theme: 'default'
        },
        swagger: {
          route: "/_hidden/swagger",
        }
      }
    },
  },

  sourcemap: {
    client: 'hidden',
  },

  runtimeConfig: {
    oauth: {
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET || '',
      },
    },
    session: {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      password: process.env.NUXT_SESSION_PASSWORD || '',
      name: 'naidesu',
    },
    freeimage: {
      apiKey: process.env.FREEIMAGE_API_KEY || '',
    },
  },
})