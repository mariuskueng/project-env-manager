import type { Project, StorageConfig } from "@/types"

const defaultConfig: StorageConfig = {
  projects: [
    {
      id: "Example Site",
      environments: [
        { name: "dev", url: "https://dev.example.com/" },
        { name: "staging", url: "https://staging.example.com/" },
        { name: "prod", url: "https://www.example.com/" },
      ],
    },
  ],
}

export async function getConfig(): Promise<StorageConfig> {
  const res = await chrome.storage.sync.get([
    "projects",
    "selectedProjectId",
    "redirectCurrentTab",
  ])
  let { projects, selectedProjectId, redirectCurrentTab } = res as StorageConfig

  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    projects = defaultConfig.projects
    await chrome.storage.sync.set({ projects })
  }

  if (!selectedProjectId && projects.length) {
    selectedProjectId = projects[0].id
  }

  return { projects, selectedProjectId, redirectCurrentTab: redirectCurrentTab ?? false }
}

export async function saveProjects(projects: Project[]): Promise<void> {
  // Strip internal IDs from environments before saving to reduce storage size
  const projectsToSave = projects.map((p) => ({
    ...p,
    environments: p.environments.map(({ id, ...env }) => env),
  }))

  const { selectedProjectId } = (await chrome.storage.sync.get([
    "selectedProjectId",
  ])) as Pick<StorageConfig, "selectedProjectId">
  await chrome.storage.sync.set({ projects: projectsToSave })

  // Keep selectedProjectId valid if the selected project was removed
  const stillExists = projects.some((p) => p.id === selectedProjectId)
  if (!stillExists) {
    const newSelected = projects[0]?.id || ""
    await chrome.storage.sync.set({ selectedProjectId: newSelected })
  }
}

export async function setSelectedProject(projectId: string): Promise<void> {
  await chrome.storage.sync.set({ selectedProjectId: projectId })
}

export async function setRedirectCurrentTab(value: boolean): Promise<void> {
  await chrome.storage.sync.set({ redirectCurrentTab: value })
}

export function normalizeHost(h: string): string {
  return (h || "").replace(/^www\./, "")
}

export function isUrlOnProject(url: string, project: Project): boolean {
  try {
    const srcHost = normalizeHost(new URL(url).host)
    const envHosts = (project.environments || [])
      .map((env) => {
        try {
          return normalizeHost(new URL(env.url).host)
        } catch {
          return ""
        }
      })
      .filter(Boolean)
    return envHosts.some((h) => h === srcHost)
  } catch {
    return false
  }
}

export function buildUrl(base: string, currentUrl: string): string {
  try {
    const src = new URL(currentUrl)
    const tgt = new URL(base)

    // Determine desired path
    const desiredPath = src.pathname

    // Preserve base path (e.g., '/de') if not already present in desiredPath
    const basePath = tgt.pathname === "/" ? "" : tgt.pathname.replace(/\/$/, "")
    let finalPath = desiredPath

    if (
      basePath &&
      !(desiredPath === basePath || desiredPath.startsWith(basePath + "/"))
    ) {
      const join = (a: string, b: string) => `${a}/${b}`.replace(/\/+/g, "/")
      finalPath = join(basePath, desiredPath.replace(/^\//, ""))
      if (!finalPath.startsWith("/")) finalPath = "/" + finalPath
    }

    tgt.pathname = finalPath
    // Always keep params and hash from the source URL
    tgt.search = src.search
    tgt.hash = src.hash

    return tgt.toString()
  } catch {
    return base
  }
}

export function findMatchingProject(
  projects: Project[],
  tabUrl: string | undefined,
): Project | null {
  if (!tabUrl) return null

  try {
    const u = new URL(tabUrl)
    const host = u.host

    // Heuristic: pick project whose any env host appears in current host
    const match = projects.find((p) => {
      const envs = p.environments || []
      return envs.some((env) => {
        try {
          return (
            new URL(env.url).host &&
            host.includes(new URL(env.url).host.replace(/^www\./, ""))
          )
        } catch {
          return false
        }
      })
    })

    if (match) return match

    // Fallback: try matching by pathname prefix
    const pathMatch = projects.find((p) => {
      const envs = p.environments || []
      return envs.some((env) => {
        try {
          const envPath = new URL(env.url).pathname
          return u.pathname.startsWith(envPath)
        } catch {
          return false
        }
      })
    })

    return pathMatch || null
  } catch {
    return null
  }
}
