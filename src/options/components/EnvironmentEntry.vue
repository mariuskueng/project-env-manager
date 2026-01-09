<script setup lang="ts">
import { ref } from "vue"
import type { Environment } from "@/types"

const props = defineProps<{
  environment: Environment
  index: number
  total: number
  isDark: boolean
}>()

const emit = defineEmits<{
  update: [env: Environment]
  remove: []
  move: [toIndex: number]
}>()

const isDragging = ref(false)
const isDragOver = ref(false)

function updateField(field: keyof Environment, value: string): void {
  emit("update", { ...props.environment, [field]: value })
}

function handleDragStart(e: DragEvent): void {
  isDragging.value = true
  e.dataTransfer!.effectAllowed = "move"
  e.dataTransfer!.setData("text/plain", props.index.toString())
}

function handleDragEnd(): void {
  isDragging.value = false
}

function handleDragOver(e: DragEvent): void {
  e.preventDefault()
  e.dataTransfer!.dropEffect = "move"
  isDragOver.value = true
}

function handleDragLeave(): void {
  isDragOver.value = false
}

function handleDrop(e: DragEvent): void {
  e.preventDefault()
  isDragOver.value = false
  const fromIndex = parseInt(e.dataTransfer!.getData("text/plain"), 10)
  if (fromIndex !== props.index) {
    emit("move", fromIndex)
  }
}
</script>

<template>
  <div
    class="flex items-center gap-2 p-2 rounded-lg transition-all"
    :class="[
      isDark ? 'bg-slate-900' : 'bg-slate-50',
      isDragging ? 'opacity-50' : '',
      isDragOver ? 'border-t-2 border-brand-dark' : '',
    ]"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- Drag Handle -->
    <span
      class="cursor-grab select-none px-2 text-lg active:cursor-grabbing"
      :class="
        isDark
          ? 'text-slate-500 hover:text-slate-300'
          : 'text-slate-400 hover:text-slate-600'
      "
      title="Drag to reorder"
    >
      ☰
    </span>

    <!-- Environment Name -->
    <input
      type="text"
      class="flex-1 px-3 py-2 border rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
      :class="
        isDark
          ? 'bg-slate-800 border-slate-600 text-slate-100'
          : 'bg-white border-slate-300 text-slate-900'
      "
      placeholder="Environment name (e.g., dev, staging)"
      :value="environment.name"
      @input="updateField('name', ($event.target as HTMLInputElement).value)"
    />

    <!-- Environment URL -->
    <input
      type="text"
      class="flex-[2] px-3 py-2 border rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
      :class="
        isDark
          ? 'bg-slate-800 border-slate-600 text-slate-100'
          : 'bg-white border-slate-300 text-slate-900'
      "
      placeholder="https://example.com"
      :value="environment.url"
      @input="updateField('url', ($event.target as HTMLInputElement).value)"
    />

    <!-- Remove Button -->
    <button
      class="px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border outline-none focus:ring-2 focus:ring-rose-500"
      :class="
        isDark
          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'
          : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
      "
      @click="$emit('remove')"
    >
      Remove
    </button>
  </div>
</template>
