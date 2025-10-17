const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const defaultProjects = [];

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

  // Show save confirmation
  showNotification("Configuration saved successfully!", "success");
}

function exportConfig() {
  const projects = readProjects();
  const config = {
    projects,
    exportDate: new Date().toISOString(),
    version: "1.0",
  };

  const dataStr = JSON.stringify(config, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = `project-env-manager-config-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showNotification("Configuration exported successfully!", "info");
}

function importConfig(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const config = JSON.parse(e.target.result);

      // Validate the configuration structure
      if (!config.projects || !Array.isArray(config.projects)) {
        throw new Error(
          "Invalid configuration format: missing or invalid projects array",
        );
      }

      // Validate each project
      for (const project of config.projects) {
        if (!project.id || typeof project.id !== "string") {
          throw new Error("Invalid project: missing or invalid ID");
        }
        if (!project.environments || !Array.isArray(project.environments)) {
          throw new Error(
            `Invalid project "${project.id}": missing or invalid environments array`,
          );
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
            );
          }
        }
      }

      // Clear current projects and load imported ones
      renderProjects(config.projects);
      showNotification(
        `Successfully imported ${config.projects.length} project(s)!`,
        "success",
      );
    } catch (error) {
      showNotification(`Import failed: ${error.message}`, "danger");
    }

    // Reset the file input
    event.target.value = "";
  };

  reader.readAsText(file);
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification is-${type} is-light`;
  notification.innerHTML = `
    <button class="delete"></button>
    ${message}
  `;

  // Add to page
  const container = $("main");
  container.insertBefore(notification, container.firstChild);

  // Wire up close button
  notification.querySelector(".delete").addEventListener("click", () => {
    notification.remove();
  });

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

function wire() {
  $("#addProject").addEventListener("click", () => {
    $("#projectsContainer").appendChild(projectNode());
  });
  $("#save").addEventListener("click", save);
  $("#exportConfig").addEventListener("click", exportConfig);
  $("#importFile").addEventListener("change", importConfig);
}

(async function init() {
  await load();
  wire();
})();
