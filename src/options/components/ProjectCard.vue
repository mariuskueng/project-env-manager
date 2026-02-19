<script setup lang="ts">
import { ref } from "vue"
import type { Project, Environment } from "@/types"
import EnvironmentEntry from "./EnvironmentEntry.vue"

const props = defineProps<{
  project: Project
  isDark: boolean
}>()

const emit = defineEmits<{
  update: [project: Project]
  remove: []
}>()

const idInput = ref<HTMLInputElement | null>(null)

function focusId(): void {
  idInput.value?.focus()
}

defineExpose({ focusId })

function generateId(): string {
  return `env-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function ensureEnvId(env: Environment): Environment {
  return env.id ? env : { ...env, id: generateId() }
}

function updateField(field: keyof Project, value: string): void {
  emit("update", { ...props.project, [field]: value })
}

function updateEnvironment(index: number, env: Environment): void {
  const newEnvs = [...props.project.environments]
  newEnvs[index] = ensureEnvId(env)
  emit("update", { ...props.project, environments: newEnvs })
}

function addEnvironment(): void {
  emit("update", {
    ...props.project,
    environments: [
      ...props.project.environments,
      { id: generateId(), name: "", url: "" },
    ],
  })
}

function removeEnvironment(index: number): void {
  const newEnvs = props.project.environments.filter((_, i) => i !== index)
  emit("update", { ...props.project, environments: newEnvs })
}

function moveEnvironment(fromIndex: number, toIndex: number): void {
  const newEnvs = [...props.project.environments]
  const [moved] = newEnvs.splice(fromIndex, 1)
  newEnvs.splice(toIndex, 0, moved)
  emit("update", { ...props.project, environments: newEnvs })
}
</script>

<template>
  <div
    class="border rounded-xl p-4"
    :class="
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    "
  >
    <!-- Project ID -->
    <div class="mb-4">
      <label
        class="block text-xs font-medium mb-1.5"
        :class="isDark ? 'text-slate-400' : 'text-slate-500'"
      >
        Project ID
      </label>
      <input
        ref="idInput"
        type="text"
        class="w-full px-3 py-2 border rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
        :class="
          isDark
            ? 'bg-slate-900 border-slate-600 text-slate-100'
            : 'bg-slate-50 border-slate-300 text-slate-900'
        "
        placeholder="unique-id"
        :value="project.id"
        @input="updateField('id', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Login URL Path -->
    <div class="mb-4">
      <label
        class="block text-xs font-medium mb-1.5"
        :class="isDark ? 'text-slate-400' : 'text-slate-500'"
      >
        Login URL Path
      </label>
      <input
        type="text"
        class="w-full px-3 py-2 border rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
        :class="
          isDark
            ? 'bg-slate-900 border-slate-600 text-slate-100'
            : 'bg-slate-50 border-slate-300 text-slate-900'
        "
        placeholder="/user/login"
        :value="project.loginUrl"
        @input="
          updateField('loginUrl', ($event.target as HTMLInputElement).value)
        "
      />
      <p
        class="text-xs mt-1"
        :class="isDark ? 'text-slate-500' : 'text-slate-400'"
      >
        The path for the login page (default: /user/login)
      </p>
    </div>

    <!-- Destination Parameter -->
    <div class="mb-4">
      <label
        class="block text-xs font-medium mb-1.5"
        :class="isDark ? 'text-slate-400' : 'text-slate-500'"
      >
        Destination Parameter Name
      </label>
      <input
        type="text"
        class="w-full px-3 py-2 border rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all"
        :class="
          isDark
            ? 'bg-slate-900 border-slate-600 text-slate-100'
            : 'bg-slate-50 border-slate-300 text-slate-900'
        "
        placeholder="destination"
        :value="project.destinationParam"
        @input="
          updateField(
            'destinationParam',
            ($event.target as HTMLInputElement).value,
          )
        "
      />
      <p
        class="text-xs mt-1"
        :class="isDark ? 'text-slate-500' : 'text-slate-400'"
      >
        The query parameter name for the redirect URL (default: destination)
      </p>
    </div>

    <!-- Environments -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <label
          class="text-xs font-medium"
          :class="isDark ? 'text-slate-400' : 'text-slate-500'"
        >
          Environments
        </label>
        <button
          class="px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border-none outline-none focus:ring-2 focus:ring-brand-dark"
          :class="
            isDark
              ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
          "
          @click="addEnvironment"
        >
          Add Environment
        </button>
      </div>

      <div class="space-y-2">
        <EnvironmentEntry
          v-for="(env, index) in project.environments"
          :key="env.id || `env-${index}`"
          :environment="env"
          :index="index"
          :total="project.environments.length"
          :is-dark="isDark"
          @update="updateEnvironment(index, $event)"
          @remove="removeEnvironment(index)"
          @move="moveEnvironment($event, index)"
        />
      </div>
    </div>

    <!-- Remove Project -->
    <button
      class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border outline-none focus:ring-2 focus:ring-rose-500"
      :class="
        isDark
          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'
          : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
      "
      @click="$emit('remove')"
    >
      Remove Project
    </button>
  </div>
</template>
