import type { Project, Environment } from "@/types"

interface UpsunUser {
  id: string
}

interface UpsunOrganization {
  id: string
}

interface UpsunOrganizationsResponse {
  items: UpsunOrganization[]
}

interface UpsunProject {
  id: string
  title: string
}

interface UpsunProjectsResponse {
  items: UpsunProject[]
}

interface UpsunEnvironment {
  id: string
  status: string
  default_domain?: string
  edge_hostname: string
}

let bearerToken: string | null = null

async function upsunApiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.upsun.com${path}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  })
  return response.json() as Promise<T>
}

async function loadDataFromUpsunApi(
  accessToken: string,
  currentProjects: Project[],
): Promise<Project[] | null> {
  if (!accessToken) {
    return null
  }

  if (bearerToken) {
    return null
  }

  bearerToken = accessToken

  const user = await upsunApiFetch<UpsunUser>("/users/me")
  const organizations = await upsunApiFetch<UpsunOrganizationsResponse>(
    `/users/${user.id}/organizations`,
  )

  const projectsFromUpsun: Project[] = []

  for (const organization of organizations.items) {
    const projects = await upsunApiFetch<UpsunProjectsResponse>(
      `/organizations/${organization.id}/projects`,
    )

    for (const project of projects.items) {
      const environmentsFromUpsun = await upsunApiFetch<UpsunEnvironment[]>(
        `/projects/${project.id}/environments`,
      )

      const environments: Environment[] = environmentsFromUpsun
        .filter((e) => e.status === "active")
        .map((e) => ({
          name: e.id,
          url: `https://${e.default_domain ?? e.edge_hostname}`,
        }))

      if (environments.length === 0) {
        continue
      }

      projectsFromUpsun.push({ id: project.title, environments })
    }
  }

  // Merge with current projects
  const mergedProjects: Project[] = [...currentProjects]

  for (const projectFromUpsun of projectsFromUpsun) {
    const existingIndex = mergedProjects.findIndex(
      (p) => p.id === projectFromUpsun.id,
    )

    if (existingIndex >= 0) {
      mergedProjects[existingIndex].environments = projectFromUpsun.environments
    } else {
      mergedProjects.push(projectFromUpsun)
    }
  }

  // Reset for next import
  bearerToken = null

  return mergedProjects
}

export function importFromUpsun(
  currentProjects: Project[],
): Promise<Project[] | null> {
  return new Promise((resolve, reject) => {
    let upsunPopupTabId: number | null = null

    const upsunTabListener = (
      tabId: number,
      _changeInfo: chrome.tabs.TabChangeInfo,
      _tab: chrome.tabs.Tab,
    ) => {
      if (tabId === upsunPopupTabId) {
        chrome.scripting
          .executeScript({
            target: { tabId: upsunPopupTabId },
            func: () => {
              return new Promise((resolve) => {
                const origFetch = fetch
                // @ts-expect-error - overriding global fetch
                fetch = (input: RequestInfo | URL, init?: RequestInit) => {
                  if (input === "https://auth.upsun.com/oauth2/token") {
                    origFetch(input, init).then(async (data) => {
                      const json = await data.json()
                      resolve(json.access_token)
                    })
                    return Promise.reject()
                  }
                  return origFetch(input, init)
                }
              })
            },
            injectImmediately: true,
            world: "MAIN",
          })
          .then(async (injectionResults) => {
            for (const { result } of injectionResults) {
              if (typeof result === "string") {
                chrome.tabs.remove(upsunPopupTabId!)
                chrome.tabs.onUpdated.removeListener(upsunTabListener)

                try {
                  const mergedProjects = await loadDataFromUpsunApi(
                    result,
                    currentProjects,
                  )
                  resolve(mergedProjects)
                } catch (error) {
                  reject(error)
                }
              }
            }
          })
          .catch(() => {
            // Ignore injection errors during page load
          })
      }
    }

    chrome.windows
      .create({
        type: "normal",
        url: "https://auth.upsun.com",
      })
      .then((w) => {
        upsunPopupTabId = w.tabs!.at(0)!.id!
        chrome.tabs.onUpdated.addListener(upsunTabListener)
      })
      .catch(reject)
  })
}
