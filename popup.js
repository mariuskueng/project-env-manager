// Popup script for generating environment links

const $ = (sel) => document.querySelector(sel)

const defaultConfig = {
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

async function getConfig() {
  const res = await chrome.storage.sync.get(["projects", "selectedProjectId"])
  let { projects, selectedProjectId } = res
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    projects = defaultConfig.projects
    await chrome.storage.sync.set({ projects })
  }
  if (!selectedProjectId && projects.length) selectedProjectId = projects[0].id
  return { projects, selectedProjectId }
}

function populateProjects(projects, selectedProjectId) {
  const select = $("#projectSelect")
  select.innerHTML = ""
  for (const p of projects) {
    const opt = document.createElement("option")
    opt.value = p.id
    opt.textContent = p.id
    if (p.id === selectedProjectId) opt.selected = true
    select.appendChild(opt)
  }
}

function normalizeHost(h) {
  return (h || "").replace(/^www\./, "")
}

function isUrlOnProject(url, project) {
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

function buildUrl(base, currentUrl) {
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
      const join = (a, b) => `${a}/${b}`.replace(/\/+/g, "/")
      finalPath = join(basePath, desiredPath.replace(/^\//, ""))
      if (!finalPath.startsWith("/")) finalPath = "/" + finalPath
    }

    tgt.pathname = finalPath
    // Always keep params and hash from the source URL
    tgt.search = src.search
    tgt.hash = src.hash

    return tgt.toString()
  } catch (e) {
    return base
  }
}

async function openEnv(envName) {
  const { projects } = await getConfig()
  const selectedProjectId = $("#projectSelect").value
  const project = projects.find((p) => p.id === selectedProjectId)
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

function renderEnvironmentButtons(project, currentUrl) {
  const container = $(".environment-buttons")
  container.innerHTML = ""

  if (!project?.environments?.length) {
    container.innerHTML =
      '<p class="has-text-grey is-size-7">No environments configured</p>'
    return
  }

  project.environments.forEach((env) => {
    const button = document.createElement("button")
    button.className = "button is-light is-small"

    if (currentUrl?.startsWith(env?.url)) {
      button.className += " underline"
    }

    button.textContent = env.name.charAt(0).toUpperCase() + env.name.slice(1)
    button.title = `Open in ${env.name}`
    button.addEventListener("click", () => openEnv(env.name))
    container.appendChild(button)
  })
}

function createEnvironmentButtonsContainer() {
  const existing = $(".row")
  const container = document.createElement("div")
  container.className = "row environment-buttons"
  existing.parentNode.replaceChild(container, existing)
  return container
}

function wireEvents() {
  $("#toLogin").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })
    if (!tab?.url || !tab?.id) return
    try {
      const { projects } = await getConfig()
      const selectedProjectId = $("#projectSelect").value
      const project = projects.find((p) => p.id === selectedProjectId)
      const u = new URL(tab.url)
      const onProject = project ? isUrlOnProject(tab.url, project) : false
      const destination = encodeURIComponent(u.pathname + u.search + u.hash)
      
      // Use configured login URL or default to /user/login
      let loginPath = project?.loginUrl || "/user/login"
      // Ensure loginPath starts with '/'
      if (loginPath && !loginPath.startsWith("/")) {
        loginPath = "/" + loginPath
      }
      
      // Use configured destination parameter name or default to 'destination'
      const destinationParam = project?.destinationParam || "destination"
      
      const targetUrl = onProject
        ? `${u.origin}${loginPath}?${destinationParam}=${destination}`
        : `${u.origin}${loginPath}`
      await chrome.tabs.update(tab.id, { url: targetUrl })
    } catch (e) {
      // ignore
    }
  })

  $("#projectSelect").addEventListener("change", async (e) => {
    await chrome.storage.sync.set({ selectedProjectId: e.target.value })
    const { projects } = await getConfig()
    const project = projects.find((p) => p.id === e.target.value)
    renderEnvironmentButtons(project)
  })

  $("#openOptions").addEventListener("click", (e) => {
    e.preventDefault()
    chrome.runtime.openOptionsPage()
  })
}

;(async function init() {
  const { projects, selectedProjectId } = await getConfig()
  let autoSelect = selectedProjectId

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  })

  if (tab?.url) {
    const u = new URL(tab.url)
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
    if (match) {
      autoSelect = match.id
    } else {
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
      if (pathMatch) autoSelect = pathMatch.id
    }
  }

  populateProjects(projects, autoSelect)
  if (autoSelect !== selectedProjectId) {
    await chrome.storage.sync.set({ selectedProjectId: autoSelect })
  }

  // Render buttons for the selected project
  const selectedProject = projects.find((p) => p.id === autoSelect)
  renderEnvironmentButtons(selectedProject, tab?.url)

  // Set version from manifest
  const manifest = chrome.runtime.getManifest()
  $("#version").textContent = `v${manifest.version}`

  wireEvents()
})()
