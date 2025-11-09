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

/*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
function oauthSignIn() {
  // Google's OAuth 2.0 endpoint for requesting an access token
  var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  var form = document.createElement('form');
  form.setAttribute('method', 'GET'); // Send as a GET request.
  form.setAttribute('action', oauth2Endpoint);

  // Parameters to pass to OAuth 2.0 endpoint.
  var params = {'client_id': 'YOUR_CLIENT_ID',
                'redirect_uri': 'YOUR_REDIRECT_URI',
                'response_type': 'token',
                'scope': 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/calendar.readonly',
                'include_granted_scopes': 'true',
                'state': 'pass-through value'};

  // Add form parameters as hidden input values.
  for (var p in params) {
    var input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', p);
    input.setAttribute('value', params[p]);
    form.appendChild(input);
  }

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form);
  form.submit();
}

function oauthSignInUpsun() {
  var oauth2Endpoint = 'https://auth.upsun.com';

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  var form = document.createElement('form');
  form.setAttribute('method', 'GET'); // Send as a GET request.
  form.setAttribute('action', oauth2Endpoint);

  // Parameters to pass to OAuth 2.0 endpoint.
  var params = {'client_id': 'upsun-cli',
                'redirect_uri': 'google.com',
                'response_type': 'token',
                'scope': 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/calendar.readonly',
                'include_granted_scopes': 'true',
                'state': 'pass-through value'};

  // Add form parameters as hidden input values.
  for (var p in params) {
    var input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', p);
    input.setAttribute('value', params[p]);
    form.appendChild(input);
  }

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form);
  form.submit();
}

async function hackyUpsunLogin() {
  let token = "aaa"

  chrome.webRequest.onResponseStarted.addListener((r) => {
    console.log("load organizarions")
    console.log(r.url)
    chrome.scripting.executeScript({
      target: {
        tabId: r.tabId
      },
      func: async () => {
        const r = await fetch(r.url)
        const j = await r.json()
        console.log("the result in json")
        console.log(j)
        return j
      }
    }).then(async injectionResults => {
      for (const {frameId, result} of injectionResults) {
        console.log(`Frame ${frameId} result:`, await result);
      }
    })
  }, {
    urls: ['https://api.upsun.com/*/organizations*']
  }, [])

  chrome.windows.create({
    type: "popup",
    url: 'https://auth.upsun.com'
  }).then((w) => {

    console.log("window is open")
    console.log(w.tabs.at(0).url)

    chrome.scripting.executeScript({
      target: {
        tabId: w.tabs.at(0).id
      },
      func: () => {
        console.log("66")
        return "bb"
      }
    }).then(injectionResults => {
      for (const {frameId, result} of injectionResults) {
        console.log(`Frame ${frameId} result:`, result);
      }
    });
  })


  // var theWindow = window.open( 'https://milanbombsch.ch'/*'https://console.upsun.com/orisch-enterprise'*/ /*'https://auth.upsun.com'*/, "", "width=600,height=700")
  
  // console.log(theWindow.document.)

  // chrome.scripting.executeScript({
  //   target:{

  //   }
  // })

  // const theDoc = theWindow.document
  // window.onload = () => {console.log("something 5")}
  // console.log("popup inner html")
  // console.log(theDoc.body.innerHTML)

  // // const theScript = document.createElement('script')

  // // function injectThis() {
  // //     // The code you want to inject goes here
  // //     console.log("yes, inject worked 1")
  // // }
  // // theScript.innerHTML = 'window.onload = ' + injectThis.toString() + ';';

  // theWindow.console.log("hey here 3")

  // window.onload = () => {console.log("something 5")}
  // theWindow.onload = () => {console.log("something 4")}
}

function importUpsun() {
  console.log("importUpsun")
  hackyUpsunLogin()
}

function wire() {
  $("#addProject").addEventListener("click", () => {
    $("#projectsContainer").appendChild(projectNode());
  });
  $("#save").addEventListener("click", save);
  $("#exportConfig").addEventListener("click", exportConfig);
  $("#importFile").addEventListener("change", importConfig);
  $('#importUpsun').addEventListener("click", importUpsun);
}

(async function init() {
  await load();
  wire();
})();
