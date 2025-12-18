;(function () {
  let bearerToken
  const upsunApiFetch = async (path) => {
    const data = await fetch(`https://api.upsun.com${path}`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    })

    return await data.json()
  }

  const loadDatafromUpsunApi = async (accessToken) => {
    if (accessToken == undefined) {
      return
    }

    if (bearerToken) {
      return
    }

    bearerToken = accessToken

    const user = await upsunApiFetch("/users/me")

    const organizations = await upsunApiFetch(`/users/${user.id}/organizations`)

    const projectsFromUpsun = []
    for (const organization of organizations.items) {
      const projects = await upsunApiFetch(
        `/organizations/${organization.id}/projects`,
      )

      for (const project of projects.items) {
        const environmentsFromUpsun = await upsunApiFetch(
          `/projects/${project.id}/environments`,
        )

        const environments = environmentsFromUpsun
          .filter((e) => e.status === "active")
          .map((e) => {
            return {
              name: e.id,
              url: `https://${e.default_domain ?? e.edge_hostname}`, // default domain is only present if a custom url is configured in upsun.
            }
          })

        if (environments.length === 0) {
          continue
        }

        projectsFromUpsun.push({ id: project.title, environments })
      }
    }

    const currentProjects = readProjects()
    projectsFromUpsun.forEach((projectFromUpsun) => {
      const currentProject = currentProjects.find(
        (currentProject) => currentProject.id === projectFromUpsun.id,
      )

      if (currentProject) {
        currentProject.environments = projectFromUpsun.environments
      } else {
        currentProjects.push(projectFromUpsun)
      }
    })

    renderProjects(currentProjects)
    // saveProjects()
  }

  let upsunPopupTabId
  const upsunTabListener = (tabId, changeInfo, tab) => {
    if (tabId === upsunPopupTabId) {
      chrome.scripting
        .executeScript({
          target: { tabId: upsunPopupTabId },
          func: () => {
            return new Promise((resolve) => {
              const origFetch = fetch
              fetch = (input, init) => {
                if (input == "https://auth.upsun.com/oauth2/token") {
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
          for (const { frameId, result } of injectionResults) {
            if (typeof result === "string") {
              chrome.tabs.remove(upsunPopupTabId)
              chrome.tabs.onUpdated.removeListener(upsunTabListener)

              await loadDatafromUpsunApi(result)
              hideWholePageSpinner()
            }
          }
        })
    }
  }

  async function importFromUpsun() {
    showWholePageSpinner()

    chrome.windows
      .create({
        type: "normal",
        url: "https://auth.upsun.com",
      })
      .then((w) => {
        upsunPopupTabId = w.tabs.at(0).id

        chrome.tabs.onUpdated.addListener(upsunTabListener)
      })
  }

  // set globales
  window.importFromUpsun = importFromUpsun
})()
