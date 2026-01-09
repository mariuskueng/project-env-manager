<script setup lang="ts">
defineProps<{
  isDark: boolean
}>()
</script>

<template>
  <div
    class="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50"
    :class="isDark ? 'bg-slate-900/80' : 'bg-white/80'"
  >
    <div
      class="w-12 h-12 border-4 rounded-full animate-spin"
      :class="
        isDark
          ? 'border-slate-700 border-t-brand-dark'
          : 'border-slate-200 border-t-brand-dark'
      "
    ></div>
  </div>
</template>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}
</style>
