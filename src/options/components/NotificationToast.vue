<script setup lang="ts">
import type { NotificationType } from '@/types'

defineProps<{
  message: string
  type: NotificationType
  isDark: boolean
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <div
    class="flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm border shadow-lg"
    :class="{
      'bg-emerald-50 border-emerald-200 text-emerald-700': type === 'success' && !isDark,
      'bg-emerald-900/90 border-emerald-700 text-emerald-200': type === 'success' && isDark,
      'bg-rose-50 border-rose-200 text-rose-700': type === 'error' && !isDark,
      'bg-rose-900/90 border-rose-700 text-rose-200': type === 'error' && isDark,
      'bg-sky-50 border-sky-200 text-sky-700': type === 'info' && !isDark,
      'bg-sky-900/90 border-sky-700 text-sky-200': type === 'info' && isDark,
    }"
  >
    <span>{{ message }}</span>
    <button
      class="opacity-60 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none"
      @click="$emit('close')"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
