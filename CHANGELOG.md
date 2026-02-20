# Changelog
## [0.5.7] - 2026-02-20

### Changes

- Merge Upsun imports and persist projects
- docs: update CHANGELOG.md for v0.5.6

## [0.5.6] - 2026-02-20

### Changes

- Include paused environments from Upsun API

## [0.5.5] - 2026-02-19

### Changes

- Fix moveEnvironment argument order
- Upgrade vue-tsc to 3.2.4 and refresh lockfile
- Use webRequest to import projects from Upsun
- docs: update CHANGELOG.md for v0.5.4

## [0.5.4] - 2026-01-22

### Changes

- Fix Upsun import logic and reset bearer token

## [0.5.3] - 2026-01-15

### Changes

- Update app icon, fix release action


## [0.5.1] - 2026-01-09

### Changes

- Refactor code style for consistency across the project (@Marius Küng)
  All notable changes to Project ENV Manager will be documented in this file.

## [0.5.0] - 2026-01-09

### Changed

- **Complete rewrite using Vue 3** - Migrated from vanilla JavaScript to Vue 3 with Composition API
- **TypeScript support** - Full TypeScript integration with custom type definitions
- **Reka UI components** - Headless UI components for better accessibility
- **Tailwind CSS v4** - Replaced Bulma with Tailwind CSS for styling
- **Vite build system** - Modern build tooling with hot reload support
- **System theme support** - Automatically follows system light/dark mode preference
- **Custom brand colors** - Configurable accent colors

### Added

- Floating toast notifications for save/import/export feedback
- Watch mode for development (`npm run dev`)

### Fixed

- Environment reactivity issues when adding new environments
- Save functionality reliability improvements

## [0.4.0] - 2025-12-18

### Added

- **Dynamic login URL configuration** - Configure custom login paths per project
- **Destination parameter configuration** - Customize the redirect query parameter name
- Validation to ensure login URL paths start with forward slash

### Changed

- Updated options UI structure for login URL and destination parameter settings

## [0.3.0] - 2025-12-18

### Added

- **Upsun integration** - Import projects directly from your Upsun account
- **Active environment indicator** - Current environment is underlined in the popup
- Prettier for code formatting

### Changed

- Separated Upsun import code into its own module
- Filter out inactive environments when importing from Upsun
- Reduced extension permissions

## [0.2.0] - 2025-10-14

### Added

- **Export/Import configuration** - Backup and restore project configurations as JSON
- **Notification system** - Visual feedback for save, import, and export actions
- New icon design

### Changed

- Integrated Bulma CSS framework for improved styling
- Enhanced button interactions and environment handling
- Removed default example project

## [0.1.0] - 2025-10-08

### Added

- Initial release
- Multi-project support with environment switching
- Auto-detection of current project based on URL
- Path preservation when switching environments
- Quick access to login pages
- Options page for project configuration
