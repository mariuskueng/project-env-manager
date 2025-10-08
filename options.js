const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const defaultProjects = [
  {
    id: "zuerich",
    environments: [
      { name: "dev", url: "https://zuerich.ddev.site/" },
      { name: "staging", url: "https://staging.zuerich.com/de" },
      { name: "prod", url: "https://www.zuerich.com/de" },
    ],
  },
];

async function load() {
  const res = await chrome.storage.sync.get(["projects", "selectedProjectId"]);
  const projects = res.projects?.length ? res.projects : defaultProjects;
  renderProjects(projects);
}

function renderProjects(projects) {
  const container = $("#projectsContainer");
  container.innerHTML = "";
  for (const p of projects) {
    container.appendChild(projectNode(p));
  }
}

function projectNode(p = { id: "", environments: [] }) {
  const tpl = $("#projectTmpl");
  const node = tpl.content.cloneNode(true);
  const root = node.querySelector(".project");
  $(".p-id", root).value = p.id || "";

  // Handle environments
  const envContainer = $(".environments-container", root);
  if (p.environments && p.environments.length > 0) {
    p.environments.forEach((env) => {
      envContainer.appendChild(environmentNode(env));
    });
  } else {
    // Add default environments if none exist
    envContainer.appendChild(environmentNode({ name: "dev", url: "" }));
    envContainer.appendChild(environmentNode({ name: "staging", url: "" }));
    envContainer.appendChild(environmentNode({ name: "prod", url: "" }));
  }

  // Wire up add environment button
  $(".add-env", root).addEventListener("click", () => {
    envContainer.appendChild(environmentNode());
  });

  $(".remove", root).addEventListener("click", () => root.remove());
  return node;
}

function environmentNode(env = { name: "", url: "" }) {
  const tpl = $("#environmentTmpl");
  const node = tpl.content.cloneNode(true);
  const root = node.querySelector(".environment-entry");
  $(".env-name", root).value = env.name || "";
  $(".env-url", root).value = env.url || "";

  $(".remove-env", root).addEventListener("click", () => root.remove());
  return node;
}

function readProjects() {
  const projects = [];
  $$("#projectsContainer .project").forEach((root) => {
    const id = $(".p-id", root).value.trim();
    if (!id) return; // skip incomplete rows

    const environments = [];
    $$(".environment-entry", root).forEach((envRoot) => {
      const name = $(".env-name", envRoot).value.trim();
      const url = $(".env-url", envRoot).value.trim();
      if (name && url) {
        environments.push({ name, url });
      }
    });

    projects.push({ id, environments });
  });
  return projects;
}

async function save() {
  const projects = readProjects();
  const { selectedProjectId } = await chrome.storage.sync.get([
    "selectedProjectId",
  ]);
  await chrome.storage.sync.set({ projects });
  // Keep selectedProjectId valid if the selected project was removed
  const stillExists = projects.some((p) => p.id === selectedProjectId);
  if (!stillExists) {
    const newSelected = projects[0]?.id || "";
    await chrome.storage.sync.set({ selectedProjectId: newSelected });
  }
}

function wire() {
  $("#addProject").addEventListener("click", () => {
    $("#projectsContainer").appendChild(projectNode());
  });
  $("#save").addEventListener("click", save);
}

(async function init() {
  await load();
  wire();
})();
