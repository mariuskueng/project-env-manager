const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const defaultProjects = [
  {
    id: "zuerich",
    environments: {
      dev: "https://zuerich.ddev.site/",
      staging: "https://staging.zuerich.com/de",
      prod: "https://www.zuerich.com/de",
    },
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

function projectNode(
  p = { id: "", environments: { dev: "", staging: "", prod: "" } }
) {
  const tpl = $("#projectTmpl");
  const node = tpl.content.cloneNode(true);
  const root = node.querySelector(".project");
  $(".p-id", root).value = p.id || "";
  $(".p-dev", root).value = p.environments?.dev || "";
  $(".p-staging", root).value = p.environments?.staging || "";
  $(".p-prod", root).value = p.environments?.prod || "";
  $(".remove", root).addEventListener("click", () => root.remove());
  return node;
}

function readProjects() {
  const projects = [];
  $$("#projectsContainer .project").forEach((root) => {
    const id = $(".p-id", root).value.trim();
    const dev = $(".p-dev", root).value.trim();
    const staging = $(".p-staging", root).value.trim();
    const prod = $(".p-prod", root).value.trim();
    if (!id) return; // skip incomplete rows
    projects.push({ id, environments: { dev, staging, prod } });
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
