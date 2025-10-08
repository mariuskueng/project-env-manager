// Popup script for generating environment links

const $ = (sel) => document.querySelector(sel);

const defaultConfig = {
  projects: [
    {
      id: "zuerich",
      environments: {
        dev: "https://zuerich.ddev.site/",
        staging: "https://staging.zuerich.com/de",
        prod: "https://www.zuerich.com/de",
      },
    },
  ],
};

async function getConfig() {
  const res = await chrome.storage.sync.get(["projects", "selectedProjectId"]);
  let { projects, selectedProjectId } = res;
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    projects = defaultConfig.projects;
    await chrome.storage.sync.set({ projects });
  }
  if (!selectedProjectId && projects.length) selectedProjectId = projects[0].id;
  return { projects, selectedProjectId };
}

function populateProjects(projects, selectedProjectId) {
  const select = $("#projectSelect");
  select.innerHTML = "";
  for (const p of projects) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.id;
    if (p.id === selectedProjectId) opt.selected = true;
    select.appendChild(opt);
  }
}

function normalizeHost(h) {
  return (h || "").replace(/^www\./, "");
}

function isUrlOnProject(url, project) {
  try {
    const srcHost = normalizeHost(new URL(url).host);
    const envHosts = Object.values(project.environments || {})
      .map((b) => {
        try {
          return normalizeHost(new URL(b).host);
        } catch {
          return "";
        }
      })
      .filter(Boolean);
    return envHosts.some((h) => h === srcHost);
  } catch {
    return false;
  }
}

function buildUrl(base, currentUrl) {
  try {
    const src = new URL(currentUrl);
    const tgt = new URL(base);

    // Determine desired path
    const desiredPath = src.pathname;

    // Preserve base path (e.g., '/de') if not already present in desiredPath
    const basePath =
      tgt.pathname === "/" ? "" : tgt.pathname.replace(/\/$/, "");
    let finalPath = desiredPath;
    if (
      basePath &&
      !(desiredPath === basePath || desiredPath.startsWith(basePath + "/"))
    ) {
      const join = (a, b) => `${a}/${b}`.replace(/\/+/g, "/");
      finalPath = join(basePath, desiredPath.replace(/^\//, ""));
      if (!finalPath.startsWith("/")) finalPath = "/" + finalPath;
    }

    tgt.pathname = finalPath;
    // Always keep params and hash from the source URL
    tgt.search = src.search;
    tgt.hash = src.hash;

    return tgt.toString();
  } catch (e) {
    return base;
  }
}

async function openEnv(envKey) {
  const { projects } = await getConfig();
  const selectedProjectId = $("#projectSelect").value;
  const project = projects.find((p) => p.id === selectedProjectId);
  if (!project) return;
  const base = project.environments?.[envKey];
  if (!base) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  const onProject = isUrlOnProject(tab.url, project);
  const url = onProject ? buildUrl(base, tab.url) : new URL(base).toString();
  await chrome.tabs.create({ url });
}

function wireEvents() {
  $("#toDev").addEventListener("click", () => openEnv("dev"));
  $("#toStaging").addEventListener("click", () => openEnv("staging"));
  $("#toProd").addEventListener("click", () => openEnv("prod"));
  $("#toLogin").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.url || !tab?.id) return;
    try {
      const { projects } = await getConfig();
      const selectedProjectId = $("#projectSelect").value;
      const project = projects.find((p) => p.id === selectedProjectId);
      const u = new URL(tab.url);
      const onProject = project ? isUrlOnProject(tab.url, project) : false;
      const destination = encodeURIComponent(u.pathname + u.search + u.hash);
      const targetUrl = onProject
        ? `${u.origin}/user/login?destination=${destination}`
        : `${u.origin}/user/login`;
      await chrome.tabs.update(tab.id, { url: targetUrl });
    } catch (e) {
      // ignore
    }
  });
  $("#projectSelect").addEventListener("change", async (e) => {
    await chrome.storage.sync.set({ selectedProjectId: e.target.value });
  });
  $("#openOptions").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
}

(async function init() {
  const { projects, selectedProjectId } = await getConfig();
  let autoSelect = selectedProjectId;
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.url) {
      const u = new URL(tab.url);
      const host = u.host;
      // Heuristic: pick project whose any env host appears in current host
      const match = projects.find((p) => {
        const envs = p.environments || {};
        return Object.values(envs).some((b) => {
          try {
            return (
              new URL(b).host &&
              host.includes(new URL(b).host.replace(/^www\./, ""))
            );
          } catch {
            return false;
          }
        });
      });
      if (match) {
        autoSelect = match.id;
      } else {
        // Fallback: try matching by pathname prefix
        const pathMatch = projects.find((p) => {
          const envs = p.environments || {};
          return Object.values(envs).some((b) => {
            try {
              const envPath = new URL(b).pathname;
              return u.pathname.startsWith(envPath);
            } catch {
              return false;
            }
          });
        });
        if (pathMatch) autoSelect = pathMatch.id;
      }
    }
  } catch {}
  populateProjects(projects, autoSelect);
  if (autoSelect !== selectedProjectId) {
    await chrome.storage.sync.set({ selectedProjectId: autoSelect });
  }
  wireEvents();
})();
