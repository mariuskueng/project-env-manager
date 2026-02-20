<script setup lang="ts">
import { ref, onMounted, provide, nextTick } from "vue"
import type { Project, Notification, NotificationType } from "@/types"
import {
  getConfig,
  saveProjects as saveProjectsToStorage,
} from "@/utils/storage"
import ProjectCard from "./components/ProjectCard.vue"
import NotificationToast from "./components/NotificationToast.vue"
import LoadingOverlay from "./components/LoadingOverlay.vue"
import { importFromUpsun } from "./upsun"

const projects = ref<Project[]>([])
const notifications = ref<Notification[]>([])
const isLoading = ref(false)
const isDark = ref(false)
const projectCards = ref<(InstanceType<typeof ProjectCard> | null)[]>([])

// Provide dark mode state to child components
provide("isDark", isDark)

function showNotification(
  message: string,
  type: NotificationType = "info",
): void {
  const id = Date.now()
  notifications.value.push({ id, message, type })
  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }, 5000)
}

function removeNotification(id: number): void {
  notifications.value = notifications.value.filter((n) => n.id !== id)
}

function generateEnvId(): string {
  return `env-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Ensure all environments have IDs (for reactivity)
function ensureEnvironmentIds(projectList: Project[]): Project[] {
  return projectList.map((project) => ({
    ...project,
    environments: project.environments.map((env) =>
      env.id ? env : { ...env, id: generateEnvId() },
    ),
  }))
}

async function addProject(): Promise<void> {
  projects.value.push({
    id: "",
    loginUrl: "",
    destinationParam: "",
    environments: [
      { id: generateEnvId(), name: "dev", url: "" },
      { id: generateEnvId(), name: "staging", url: "" },
      { id: generateEnvId(), name: "prod", url: "" },
    ],
  })

  // Focus on the new project's ID input after DOM updates
  await nextTick()
  const newIndex = projects.value.length - 1
  projectCards.value[newIndex]?.focusId()
}

function removeProject(index: number): void {
  projects.value.splice(index, 1)
}

function updateProject(index: number, project: Project): void {
  projects.value.splice(index, 1, project)
}

async function saveProjects(): Promise<void> {
  try {
    const validProjects = projects.value.filter((p) => p.id?.trim())
    if (validProjects.length === 0) {
      showNotification(
        "No valid projects to save (projects need an ID)",
        "error",
      )
      return
    }
    await saveProjectsToStorage(validProjects)
    showNotification("Configuration saved successfully!", "success")
  } catch (error) {
    console.error("Save error:", error)
    showNotification(`Save failed: ${(error as Error).message}`, "error")
  }
}

function exportConfig(): void {
  const validProjects = projects.value.filter((p) => p.id?.trim())
  const config = {
    projects: validProjects,
    exportDate: new Date().toISOString(),
    version: "1.0",
  }

  const dataStr = JSON.stringify(config, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })

  const link = document.createElement("a")
  link.href = URL.createObjectURL(dataBlob)
  link.download = `project-env-manager-config-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  showNotification("Configuration exported successfully!", "info")
}

function handleImportFile(event: Event): void {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async function (e) {
    try {
      const config = JSON.parse(e.target?.result as string)

      if (!config.projects || !Array.isArray(config.projects)) {
        throw new Error(
          "Invalid configuration format: missing or invalid projects array",
        )
      }

      for (const project of config.projects) {
        if (!project.id || typeof project.id !== "string") {
          throw new Error("Invalid project: missing or invalid ID")
        }
        if (!project.environments || !Array.isArray(project.environments)) {
          throw new Error(
            `Invalid project "${project.id}": missing or invalid environments array`,
          )
        }
        for (const env of project.environments) {
          if (
            !env.name ||
            !env.url ||
            typeof env.name !== "string" ||
            typeof env.url !== "string"
          ) {
            throw new Error(
              `Invalid environment in project "${project.id}": missing name or url`,
            )
          }
        }
      }

      projects.value = ensureEnvironmentIds(config.projects)
      await saveProjectsToStorage(config.projects)
      showNotification(
        `Successfully imported ${config.projects.length} project(s)!`,
        "success",
      )
    } catch (error) {
      showNotification(`Import failed: ${(error as Error).message}`, "error")
    }

    target.value = ""
  }

  reader.readAsText(file)
}

async function handleImportFromUpsun(): Promise<void> {
  isLoading.value = true
  try {
    const upsunProjects = await importFromUpsun()
    if (upsunProjects.length > 0) {
      const merged = [...projects.value]
      for (const upsunProject of upsunProjects) {
        const existingIndex = merged.findIndex((p) => p.id === upsunProject.id)
        if (existingIndex >= 0) {
          merged[existingIndex] = upsunProject
        } else {
          merged.push(upsunProject)
        }
      }
      projects.value = ensureEnvironmentIds(merged)
      await saveProjectsToStorage(merged)
      showNotification(
        `Successfully imported ${upsunProjects.length} projects from Upsun!`,
        "success",
      )
    } else {
      showNotification("No active projects found in Upsun", "info")
    }
  } catch (error) {
    showNotification(
      `Upsun import failed: ${(error as Error).message}`,
      "error",
    )
  } finally {
    isLoading.value = false
  }
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
  projects.value = ensureEnvironmentIds(config.projects)
})
</script>

<template>
  <div
    class="min-h-screen font-sans transition-colors"
    :class="
      isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
    "
  >
    <LoadingOverlay v-if="isLoading" :is-dark="isDark" />

    <!-- Floating Toasts -->
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <TransitionGroup name="notification">
        <NotificationToast
          v-for="notification in notifications"
          :key="notification.id"
          :message="notification.message"
          :type="notification.type"
          :is-dark="isDark"
          @close="removeNotification(notification.id)"
        />
      </TransitionGroup>
    </div>

    <main class="max-w-3xl mx-auto p-6">
      <!-- Header -->
      <header class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold tracking-tight">Projects</h1>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium bg-brand-dark text-white hover:bg-brand-dark-light transition-colors cursor-pointer border-none outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2"
          :class="
            isDark
              ? 'focus:ring-offset-slate-900'
              : 'focus:ring-offset-slate-50'
          "
          @click="addProject"
        >
          Add Project
        </button>
      </header>

      <!-- Projects List -->
      <section class="space-y-4 mb-6">
        <ProjectCard
          v-for="(project, index) in projects"
          :key="index"
          :ref="
            (el: any) => {
              projectCards[index] = el
            }
          "
          :project="project"
          :is-dark="isDark"
          @update="updateProject(index, $event)"
          @remove="removeProject(index)"
        />

        <div
          v-if="projects.length === 0"
          class="border rounded-xl p-8 text-center"
          :class="
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-400'
              : 'bg-white border-slate-200 text-slate-500'
          "
        >
          <p>No projects configured yet.</p>
          <p class="text-sm mt-2">Click "Add Project" to get started.</p>
        </div>
      </section>

      <!-- Footer Actions -->
      <footer class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex gap-2 flex-wrap">
          <button
            class="px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2"
            :class="
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 focus:ring-offset-slate-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-offset-slate-50'
            "
            @click="exportConfig"
          >
            Export Config
          </button>

          <label
            class="px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-brand-dark focus-within:ring-offset-2 inline-flex items-center"
            :class="
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 focus-within:ring-offset-slate-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 focus-within:ring-offset-slate-50'
            "
            for="importFile"
          >
            Import Config
          </label>
          <input
            id="importFile"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleImportFile"
          />

          <button
            class="px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2"
            :class="
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 focus:ring-offset-slate-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-offset-slate-50'
            "
            @click="handleImportFromUpsun"
          >
            Import from Upsun
          </button>
        </div>

        <button
          class="px-4 py-2 rounded-lg text-sm font-medium bg-brand-dark text-white hover:bg-brand-dark-light transition-colors cursor-pointer border-none outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2"
          :class="
            isDark
              ? 'focus:ring-offset-slate-900'
              : 'focus:ring-offset-slate-50'
          "
          @click="saveProjects"
        >
          Save
        </button>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
