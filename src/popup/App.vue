<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from "reka-ui"
import type { Project } from "@/types"
import {
  getConfig,
  setSelectedProject,
  isUrlOnProject,
  buildUrl,
  findMatchingProject,
} from "@/utils/storage"
import iconUrl from "@/assets/icon.png"

const projects = ref<Project[]>([])
const selectedProjectId = ref("")
const currentTabUrl = ref("")
const version = ref("")
const isDark = ref(false)

const selectedProject = computed<Project | null>(() => {
  return projects.value.find((p) => p.id === selectedProjectId.value) || null
})

const environments = computed(() => {
  return selectedProject.value?.environments || []
})

function isCurrentEnv(envUrl: string): boolean {
  if (!currentTabUrl.value || !envUrl) return false
  return currentTabUrl.value.startsWith(envUrl)
}

async function openEnv(envName: string): Promise<void> {
  const project = selectedProject.value
  if (!project) return

  const env = project.environments?.find((e) => e.name === envName)
  if (!env?.url) return

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.url) return

  const onProject = isUrlOnProject(tab.url, project)
  const url = onProject
    ? buildUrl(env.url, tab.url)
    : new URL(env.url).toString()
  await chrome.tabs.create({ url })
}

async function goToLogin(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.url || !tab?.id) return

  try {
    const project = selectedProject.value
    const u = new URL(tab.url)
    const onProject = project ? isUrlOnProject(tab.url, project) : false
    const destination = encodeURIComponent(u.pathname + u.search + u.hash)

    let loginPath = project?.loginUrl || "/user/login"
    if (loginPath && !loginPath.startsWith("/")) {
      loginPath = "/" + loginPath
    }

    const destinationParam = project?.destinationParam || "destination"

    const targetUrl = onProject
      ? `${u.origin}${loginPath}?${destinationParam}=${destination}`
      : `${u.origin}${loginPath}`

    await chrome.tabs.update(tab.id, { url: targetUrl })
  } catch {
    // ignore
  }
}

function openOptions(): void {
  chrome.runtime.openOptionsPage()
}

async function onProjectChange(newValue: string): Promise<void> {
  selectedProjectId.value = newValue
  await setSelectedProject(newValue)
}

onMounted(async () => {
  // Check system dark mode preference
  isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      isDark.value = e.matches
    })

  const config = await getConfig()
  projects.value = config.projects

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  currentTabUrl.value = tab?.url || ""

  let autoSelect = config.selectedProjectId || ""
  const match = findMatchingProject(config.projects, tab?.url)
  if (match) {
    autoSelect = match.id
  }

  selectedProjectId.value = autoSelect
  if (autoSelect !== config.selectedProjectId) {
    await setSelectedProject(autoSelect)
  }

  const manifest = chrome.runtime.getManifest()
  version.value = `v${manifest.version}`
})
</script>

<template>
  <main
    class="w-80 font-sans p-4 transition-colors"
    :class="isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'"
  >
    <!-- Header -->
    <header class="flex items-center gap-2 mb-4">
      <img :src="iconUrl" alt="icon" class="w-6 h-6" />
      <h1 class="text-base font-semibold tracking-tight">
        Project Env Manager
      </h1>
    </header>

    <!-- Project Selector -->
    <section class="mb-4">
      <label
        class="block text-xs font-medium mb-1.5"
        :class="isDark ? 'text-slate-400' : 'text-slate-500'"
      >
        Select Project
      </label>
      <SelectRoot
        :model-value="selectedProjectId"
        @update:model-value="onProjectChange"
      >
        <SelectTrigger
          class="w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2"
          :class="
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-100 hover:border-slate-600 focus:ring-offset-slate-900'
              : 'bg-slate-50 border-slate-300 text-slate-900 hover:border-slate-400 focus:ring-offset-white'
          "
          aria-label="Select project"
        >
          <SelectValue placeholder="Select a project..." />
          <svg
            class="w-4 h-4"
            :class="isDark ? 'text-slate-400' : 'text-slate-500'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </SelectTrigger>

        <SelectPortal>
          <SelectContent
            class="overflow-hidden border rounded-lg shadow-xl z-50"
            :class="
              isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            "
            :side-offset="4"
            position="popper"
            :avoid-collisions="true"
            :collision-padding="8"
          >
            <SelectViewport class="p-1 max-h-40 overflow-y-auto">
              <SelectItem
                v-for="project in projects"
                :key="project.id"
                :value="project.id"
                class="flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer outline-none transition-colors"
                :class="
                  isDark
                    ? 'text-slate-100 data-[highlighted]:bg-slate-700'
                    : 'text-slate-900 data-[highlighted]:bg-slate-100'
                "
              >
                <SelectItemIndicator class="w-4">
                  <svg
                    class="w-4 h-4 text-brand-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </SelectItemIndicator>
                <SelectItemText>{{ project.id }}</SelectItemText>
              </SelectItem>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </SelectRoot>
    </section>

    <!-- Environment Buttons -->
    <section class="mb-4">
      <div
        v-if="environments.length === 0"
        class="text-sm"
        :class="isDark ? 'text-slate-400' : 'text-slate-500'"
      >
        No environments configured
      </div>
      <div v-else class="flex flex-wrap gap-2 mb-3">
        <button
          v-for="env in environments"
          :key="env.name"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer border-none outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2"
          :class="
            isCurrentEnv(env.url)
              ? 'bg-brand-dark text-white'
              : isDark
                ? 'bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-offset-slate-900'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-offset-white'
          "
          :title="`Open in ${env.name}`"
          @click="openEnv(env.name)"
        >
          {{ env.name.charAt(0).toUpperCase() + env.name.slice(1) }}
        </button>
      </div>

      <button
        class="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-dark text-white hover:bg-brand-dark-light transition-colors cursor-pointer border-none outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2"
        :class="
          isDark ? 'focus:ring-offset-slate-900' : 'focus:ring-offset-white'
        "
        @click="goToLogin"
      >
        Login
      </button>
    </section>

    <!-- Footer -->
    <footer class="flex items-baseline justify-between">
      <a
        href="#"
        class="text-xs hover:underline transition-colors"
        :class="
          isDark
            ? 'text-brand-dark-light hover:text-brand-dark'
            : 'text-brand-dark-dark hover:text-brand-dark'
        "
        @click.prevent="openOptions"
      >
        Manage projects
      </a>
      <span
        class="text-xs"
        :class="isDark ? 'text-slate-400' : 'text-slate-500'"
        >{{ version }}</span
      >
    </footer>
  </main>
</template>
