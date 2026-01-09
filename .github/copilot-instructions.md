# Copilot Instructions for Project ENV Manager

## Project Overview

This is a Chrome browser extension (Manifest V3) that helps users quickly switch between different environments (Dev, Staging, Production) for multiple projects. The extension maintains configuration in Chrome's sync storage and provides a popup UI for environment switching.

## Technology Stack

- **Browser Extension**: Chrome Manifest V3
- **Languages**: Vanilla JavaScript (ES6+), HTML, CSS
- **APIs**: Chrome Extension APIs (storage, tabs, activeTab, scripting)
- **Build Tools**: npm, Prettier
- **No Framework**: Pure vanilla JavaScript, no React/Vue/Angular

## Code Style and Conventions

### JavaScript Style

- **No semicolons** at the end of statements (except the leading semicolon in IIFE patterns)
- Use **leading semicolons** for IIFEs to ensure they run even if previous code crashes: `;(function() { ... })()`
- **No TypeScript**: Use vanilla JavaScript only
- Use **arrow functions** for callbacks and short functions
- Use **const** by default, **let** only when reassignment is needed, avoid **var**
- Use **async/await** for asynchronous code instead of Promise chains
- Use **template literals** for string interpolation
- Prefer **optional chaining** (`?.`) and **nullish coalescing** (`??`) operators

### Naming Conventions

- **camelCase** for variables and functions: `selectedProjectId`, `buildUrl`
- **PascalCase** for class names (if needed)
- Short helper function names: `$()` for `querySelector`, `$$()` for `querySelectorAll`
- Descriptive names for main functions: `populateProjects`, `renderEnvironmentButtons`

### Code Organization

- Use **immediately invoked function expressions (IIFE)** for initialization: `;(async function init() { ... })()`
- Group related functionality into functions
- Keep functions small and focused on a single responsibility
- Use **try/catch** blocks for error handling, but often silently ignore errors with `catch { }` or `catch (e) { // ignore }`

### DOM Manipulation

- Use helper functions for DOM selection: `const $ = (sel) => document.querySelector(sel)`
- Use vanilla DOM APIs: `createElement`, `appendChild`, `querySelector`, etc.
- No jQuery or other DOM libraries

### Chrome Extension Patterns

- Use `chrome.storage.sync` for storing user preferences and configuration
- Use `chrome.tabs` API for tab management
- Always check for null/undefined when accessing tab properties: `tab?.url`
- Use `chrome.runtime.getManifest()` to access manifest data

## Build and Test Commands

- **Lint**: `npm run lint` (runs Prettier check)
- **Fix formatting**: `npm run lint:fix` or `npm run prettier:fix`
- **No build step**: The extension runs directly from source
- **No automated tests**: Manual testing via loading the extension in Chrome

## Project Structure

```
/
├── .github/              # GitHub configuration
├── options_ui/           # Options page (settings UI)
│   ├── options_ui.html   # Settings page HTML
│   ├── options_ui.js     # Settings page logic
│   ├── options_ui.css    # Settings page styles
│   └── import_from_upsun.js  # Upsun import functionality
├── index.html            # Popup HTML
├── popup.js              # Popup logic (main extension code)
├── popup.css             # Popup styles
├── manifest.json         # Chrome extension manifest
├── icon.png / icon.svg   # Extension icons
├── tailwind.css          # Tailwind CSS (pre-built)
└── package.json          # npm configuration
```

## Key Features to Understand

1. **Environment Switching**: Users configure projects with multiple environments (dev, staging, prod)
2. **Smart URL Building**: The extension preserves paths, query params, and hashes when switching environments
3. **Auto-Selection**: The extension auto-selects the appropriate project based on the current tab's URL
4. **Login Shortcuts**: Configurable login URLs with custom destination parameters
5. **Upsun Integration**: Special support for importing projects from Upsun platform

## Important Guidelines

- **Maintain backward compatibility** with existing stored data in `chrome.storage.sync`
- **Always validate URLs** using try/catch when constructing URL objects
- **Preserve user data**: Be careful when modifying storage logic
- **Keep the extension lightweight**: No external dependencies in production code
- **Follow existing patterns**: Match the code style of existing files
- **Test manually**: Load the extension in Chrome and test all functionality

## Common Patterns in This Codebase

```javascript
// Short selector helper
const $ = (sel) => document.querySelector(sel)

// Chrome storage pattern
const res = await chrome.storage.sync.get(["projects", "selectedProjectId"])

// URL validation pattern
try {
  const url = new URL(someString)
  // ... work with url
} catch {
  return false // or default value
}

// Optional chaining for safety
const env = project.environments?.find((e) => e.name === envName)

// IIFE for initialization
;(async function init() {
  // ... initialization code
})()
```

## When Making Changes

1. Always run `npm run lint:fix` before committing
2. Test the extension manually by loading it in Chrome
3. Verify that existing stored data still works after changes
4. Check that URL building logic preserves paths, params, and hashes
5. Ensure the popup and options page work correctly
6. Verify environment switching works for configured projects
