<script setup lang="ts">
const columns = [
  {
    label: "Extension",
    children: [
      {
        label: "Features",
        to: "/#features",
      },
      {
        label: "Getting Started",
        to: "/#steps",
      },
      {
        label: "Chrome Web Store",
        to: "https://chromewebstore.google.com/detail/project-env-manager/mlngdjipcjkcbfndloaaebfliebllbdh",
        target: "_blank",
      },
    ],
  },
  {
    label: "Project",
    children: [
      {
        label: "GitHub",
        to: "https://github.com/mariuskueng/project-env-manager",
        target: "_blank",
      },
      {
        label: "Issues",
        to: "https://github.com/mariuskueng/project-env-manager/issues",
        target: "_blank",
      },
      {
        label: "Changelog",
        to: "https://github.com/mariuskueng/project-env-manager/blob/main/CHANGELOG.md",
        target: "_blank",
      },
    ],
  },
  {
    label: "Legal",
    children: [
      {
        label: "Privacy Policy",
        to: "/privacy",
      },
    ],
  },
]
</script>

<template>
  <USeparator />

  <UFooter :ui="{ top: 'border-b border-default' }">
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns" />
      </UContainer>
    </template>

    <template #left>
      <p class="text-sm text-muted">
        &copy; {{ new Date().getFullYear() }} Project Env Manager. Open source
        under MIT license.
      </p>
    </template>

    <template #right>
      <UButton
        to="https://github.com/mariuskueng/project-env-manager"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="Project Env Manager on GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
