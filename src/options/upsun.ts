import type { Project, Environment } from "@/types"

interface UpsunUser {
  id: string
}

interface UpsunOrganization {
  id: string
}

interface UpsunProject {
  id: string
  title: string
}

interface UpsunEnvironment {
  id: string
  status: string
  default_domain?: string
  edge_hostname: string
}

interface ItemsResponse<T> {
  items: T[]
}

const API_BASE = "https://api.upsun.com"

let bearerToken: string | null = null

async function upsunApiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  })
  return response.json() as Promise<T>
}

async function loadDataFromUpsunApi(accessToken: string): Promise<Project[]> {
  bearerToken = accessToken

  try {
    const user = await upsunApiFetch<UpsunUser>("/users/me")

    const orgsResponse = await upsunApiFetch<ItemsResponse<UpsunOrganization>>(
      `/users/${user.id}/organizations`,
    )
    const organizations = orgsResponse.items

    const projectsFromUpsun: Project[] = []

    for (const organization of organizations) {
      const projectsResponse = await upsunApiFetch<ItemsResponse<UpsunProject>>(
        `/organizations/${organization.id}/projects`,
      )
      const projects = projectsResponse.items

      for (const project of projects) {
        const environmentsFromUpsun = await upsunApiFetch<UpsunEnvironment[]>(
          `/projects/${project.id}/environments`,
        )

        const environments: Environment[] = environmentsFromUpsun
          .filter(
            (e) =>
              e.status === "active" ||
              e.status === "dirty" ||
              e.status === "paused",
          )
          .map((e) => ({
            name: e.id,
            url: `https://${e.default_domain ?? e.edge_hostname}`,
          }))

        if (environments.length === 0) continue

        projectsFromUpsun.push({ id: project.title, environments })
      }
    }

    return projectsFromUpsun
  } finally {
    bearerToken = null
  }
}

/**
 * Opens the Upsun console in a new window and captures the Bearer token
 * from the Authorization header of any API request via chrome.webRequest.
 * This avoids fragile fetch interception in the auth page.
 */
export function importFromUpsun(): Promise<Project[]> {
  return new Promise((resolve, reject) => {
    let popupTabId: number
    let captured = false

    const onHeaders = (details: chrome.webRequest.WebRequestHeadersDetails) => {
      if (captured) return

      const authHeader = details.requestHeaders?.find(
        (h) => h.name.toLowerCase() === "authorization",
      )
      if (!authHeader?.value?.startsWith("Bearer ")) return

      captured = true
      const token = authHeader.value.slice(7)

      chrome.webRequest.onBeforeSendHeaders.removeListener(onHeaders)
      chrome.tabs.remove(popupTabId)

      loadDataFromUpsunApi(token).then(resolve).catch(reject)
    }

    chrome.webRequest.onBeforeSendHeaders.addListener(
      onHeaders,
      { urls: ["https://api.upsun.com/*"] },
      ["requestHeaders", "extraHeaders"],
    )

    chrome.windows
      .create({
        type: "normal",
        url: "https://console.upsun.com",
      })
      .then((w) => {
        popupTabId = w.tabs!.at(0)!.id!
      })
      .catch((err) => {
        chrome.webRequest.onBeforeSendHeaders.removeListener(onHeaders)
        reject(err)
      })
  })
}
