# Project Env Manager

A Chrome extension that generates Dev/Staging/Prod links for multiple projects. Configure projects in the Options page, then use the popup to quickly open the same path in another environment.

## Tech Stack

- **Vue 3** - Frontend framework with Composition API
- **TypeScript** - Type-safe development
- **Reka UI** - Headless UI components
- **Tailwind CSS v4** - Utility-first styling
- **Vite** - Build tool

## Development

### Prerequisites

- Node.js 18+
- npm

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

This starts a local dev server. Note that Chrome extension APIs won't work in dev mode.

### Type Checking

```bash
npm run typecheck
```

### Build for Production

```bash
npm run build
```

The built extension will be in the `dist/` directory.

### Load Extension in Chrome

1. Run `npm run build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/` folder

### Linting

```bash
npm run lint        # Check formatting
npm run lint:fix    # Fix formatting
```

## Project Structure

```
src/
├── types/           # TypeScript type definitions
│   └── index.ts     # Project, Environment, Config types
├── utils/           # Shared utilities
│   └── storage.ts   # Chrome storage helpers
├── assets/          # Static assets
│   └── icon.png
├── popup/           # Extension popup
│   ├── main.ts
│   └── App.vue
├── options/         # Options page
│   ├── main.ts
│   ├── App.vue
│   ├── upsun.ts     # Upsun API integration
│   └── components/
│       ├── ProjectCard.vue
│       ├── EnvironmentEntry.vue
│       ├── NotificationToast.vue
│       └── LoadingOverlay.vue
├── style.css        # Global Tailwind styles
└── env.d.ts         # TypeScript declarations
```

## Features

- **Multi-project support** - Configure multiple projects with their environments
- **Auto-detection** - Automatically selects the correct project based on the current URL
- **Path preservation** - When switching environments, the current path, query params, and hash are preserved
- **Login redirect** - Quick access to login pages with configurable paths and redirect parameters
- **Upsun integration** - Import projects directly from your Upsun account
- **Import/Export** - Backup and restore your configuration as JSON
- **Drag & drop reordering** - Easily reorder environments
