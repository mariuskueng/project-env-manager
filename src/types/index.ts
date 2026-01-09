/** Represents a single environment (dev, staging, prod, etc.) */
export interface Environment {
  /** Unique identifier for the environment (used for Vue reactivity) */
  id?: string
  /** Display name for the environment */
  name: string
  /** Base URL for this environment */
  url: string
}

/** Represents a project with multiple environments */
export interface Project {
  /** Unique identifier/name for the project */
  id: string
  /** Custom login URL path (default: /user/login) */
  loginUrl?: string
  /** Query parameter name for redirect destination (default: destination) */
  destinationParam?: string
  /** List of environments for this project */
  environments: Environment[]
}

/** Configuration stored in Chrome sync storage */
export interface StorageConfig {
  projects: Project[]
  selectedProjectId?: string
}

/** Notification types for toast messages */
export type NotificationType = 'success' | 'error' | 'info'

/** Notification object for displaying toasts */
export interface Notification {
  id: number
  message: string
  type: NotificationType
}

/** Exported configuration file format */
export interface ExportedConfig {
  projects: Project[]
  exportDate: string
  version: string
}
