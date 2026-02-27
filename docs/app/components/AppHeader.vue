<script setup lang="ts">
const items = computed(() => [
  {
    label: "Features",
    to: "/#features",
  },
  {
    label: "Getting Started",
    to: "/#steps",
  },
  {
    label: "Privacy",
    to: "/privacy",
  },
])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-2">
        <span class="font-bold text-lg">Project Env Manager</span>
      </NuxtLink>
    </template>

    <template #right>
      <UNavigationMenu :items="items" variant="link" class="hidden lg:block" />

      <UButton
        label="Install Extension"
        icon="i-simple-icons-googlechrome"
        variant="subtle"
        class="hidden lg:flex items-center"
        to="https://chromewebstore.google.com/detail/project-env-manager/mlngdjipcjkcbfndloaaebfliebllbdh"
        target="_blank"
      />

      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
      <UButton
        class="mt-4"
        label="Install Extension"
        icon="i-simple-icons-googlechrome"
        variant="subtle"
        to="https://chromewebstore.google.com/detail/project-env-manager/mlngdjipcjkcbfndloaaebfliebllbdh"
        target="_blank"
        block
      />
    </template>
  </UHeader>
</template>
