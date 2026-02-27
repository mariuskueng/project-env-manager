<script setup lang="ts">
useSeoMeta({
  title: "Privacy Policy - Project Env Manager",
  ogTitle: "Privacy Policy - Project Env Manager",
  description: "Privacy policy for the Project Env Manager Chrome extension.",
  ogDescription: "Privacy policy for the Project Env Manager Chrome extension.",
})
</script>

<template>
  <UContainer class="py-16 sm:py-24">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p class="text-sm text-muted mb-12">Last updated: January 22, 2026</p>

      <div class="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 class="text-2xl font-semibold mb-4">Overview</h2>
          <p class="text-muted leading-relaxed">
            Project Env Manager is a Chrome extension that helps web developers
            switch between environment URLs for their projects. We are committed
            to protecting your privacy. This extension does not collect, store,
            or transmit any personal data.
          </p>
        </section>

        <USeparator />

        <section>
          <h2 class="text-2xl font-semibold mb-4">Data Collection</h2>
          <p class="text-muted leading-relaxed mb-4">
            <strong class="text-default">We do not collect any data.</strong>
            Specifically:
          </p>
          <ul class="space-y-3 text-muted">
            <li class="flex gap-3 items-start">
              <UIcon
                name="i-lucide-shield-check"
                class="text-primary shrink-0 mt-0.5 size-5"
              />
              <span>No personal information is collected</span>
            </li>
            <li class="flex gap-3 items-start">
              <UIcon
                name="i-lucide-shield-check"
                class="text-primary shrink-0 mt-0.5 size-5"
              />
              <span>No browsing history is tracked or recorded</span>
            </li>
            <li class="flex gap-3 items-start">
              <UIcon
                name="i-lucide-shield-check"
                class="text-primary shrink-0 mt-0.5 size-5"
              />
              <span>No analytics or telemetry data is sent anywhere</span>
            </li>
            <li class="flex gap-3 items-start">
              <UIcon
                name="i-lucide-shield-check"
                class="text-primary shrink-0 mt-0.5 size-5"
              />
              <span>No cookies are set by the extension</span>
            </li>
            <li class="flex gap-3 items-start">
              <UIcon
                name="i-lucide-shield-check"
                class="text-primary shrink-0 mt-0.5 size-5"
              />
              <span>No third-party tracking scripts are included</span>
            </li>
          </ul>
        </section>

        <USeparator />

        <section>
          <h2 class="text-2xl font-semibold mb-4">Data Storage</h2>
          <p class="text-muted leading-relaxed">
            Your project configurations (project names, environment URLs, and
            preferences) are stored locally using Chrome's built-in
            <code class="text-default bg-accented px-1.5 py-0.5 rounded text-sm"
              >chrome.storage.sync</code
            >
            API. This data is synced across your Chrome browsers if you are
            signed into Chrome, but it is never accessible to us or any third
            party. Only you can see and manage this data.
          </p>
        </section>

        <USeparator />

        <section>
          <h2 class="text-2xl font-semibold mb-4">Upsun Integration</h2>
          <p class="text-muted leading-relaxed">
            The extension includes an optional feature to import projects from
            Upsun (Platform.sh). When you explicitly use this feature, the
            extension opens the Upsun console in a browser tab for you to
            authenticate. After authentication, the extension reads your project
            and environment data from the Upsun API (<code
              class="text-default bg-accented px-1.5 py-0.5 rounded text-sm"
              >api.upsun.com</code
            >) using your session token. This data is only used to populate your
            local project configuration and is never sent anywhere else.
          </p>
          <p class="text-muted leading-relaxed mt-3">
            No connection to Upsun is made unless you explicitly click the
            "Import from Upsun" button.
          </p>
        </section>

        <USeparator />

        <section>
          <h2 class="text-2xl font-semibold mb-4">Permissions</h2>
          <p class="text-muted leading-relaxed mb-4">
            The extension requests the following browser permissions, each for a
            specific purpose:
          </p>
          <ul class="space-y-3 text-muted">
            <li class="flex gap-3 items-start">
              <UIcon
                name="i-lucide-key"
                class="text-muted shrink-0 mt-0.5 size-5"
              />
              <span
                ><strong class="text-default">storage</strong> - To save your
                project configurations and preferences locally</span
              >
            </li>
            <li class="flex gap-3 items-start">
              <UIcon
                name="i-lucide-key"
                class="text-muted shrink-0 mt-0.5 size-5"
              />
              <span
                ><strong class="text-default">tabs</strong> - To detect the
                current tab URL and open or redirect to environment URLs</span
              >
            </li>
            <li class="flex gap-3 items-start">
              <UIcon
                name="i-lucide-key"
                class="text-muted shrink-0 mt-0.5 size-5"
              />
              <span
                ><strong class="text-default">activeTab</strong> - To read the
                current tab's URL for project and environment detection</span
              >
            </li>
            <li class="flex gap-3 items-start">
              <UIcon
                name="i-lucide-key"
                class="text-muted shrink-0 mt-0.5 size-5"
              />
              <span
                ><strong class="text-default">webRequest</strong> - To capture
                the authentication token during the optional Upsun import</span
              >
            </li>
            <li class="flex gap-3 items-start">
              <UIcon
                name="i-lucide-key"
                class="text-muted shrink-0 mt-0.5 size-5"
              />
              <span
                ><strong class="text-default"
                  >host_permissions (*.upsun.com)</strong
                >
                - Required only for the optional Upsun import feature</span
              >
            </li>
          </ul>
        </section>

        <USeparator />

        <section>
          <h2 class="text-2xl font-semibold mb-4">Open Source</h2>
          <p class="text-muted leading-relaxed">
            Project Env Manager is open source. You can review the complete
            source code on
            <NuxtLink
              to="https://github.com/mariuskueng/project-env-manager"
              target="_blank"
              class="text-primary hover:underline"
            >
              GitHub
            </NuxtLink>
            to verify these privacy claims.
          </p>
        </section>

        <USeparator />

        <section>
          <h2 class="text-2xl font-semibold mb-4">Changes to This Policy</h2>
          <p class="text-muted leading-relaxed">
            If we make any changes to this privacy policy, we will update this
            page with the new date. Since we do not collect any data, changes
            are unlikely.
          </p>
        </section>

        <USeparator />

        <section>
          <h2 class="text-2xl font-semibold mb-4">Contact</h2>
          <p class="text-muted leading-relaxed">
            If you have questions about this privacy policy, please open an
            issue on our
            <NuxtLink
              to="https://github.com/mariuskueng/project-env-manager/issues"
              target="_blank"
              class="text-primary hover:underline"
            >
              GitHub repository </NuxtLink
            >.
          </p>
        </section>
      </div>
    </div>
  </UContainer>
</template>
