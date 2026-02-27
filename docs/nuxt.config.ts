// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "@nuxt/content"],

  app: {
    baseURL: "/project-env-manager/",
  },

  ssr: true,

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  mdc: {
    highlight: {
      noApiRoute: false,
    },
  },

  compatibilityDate: "2025-01-15",

  nitro: {
    preset: "github-pages",
    prerender: {
      routes: ["/", "/privacy"],
    },
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },
})
