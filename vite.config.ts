import { defineConfig, type Plugin } from "vite"
import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import { resolve, dirname } from "path"
import { copyFileSync, existsSync, mkdirSync } from "fs"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Plugin to copy extension files after build
function copyExtensionFiles(): Plugin {
  return {
    name: "copy-extension-files",
    closeBundle() {
      const distDir = resolve(__dirname, "dist")
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true })
      }

      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, "manifest.json"),
        resolve(distDir, "manifest.json"),
      )

      // Copy icon files
      copyFileSync(resolve(__dirname, "icon.png"), resolve(distDir, "icon.png"))

      if (existsSync(resolve(__dirname, "icon.svg"))) {
        copyFileSync(
          resolve(__dirname, "icon.svg"),
          resolve(distDir, "icon.svg"),
        )
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), copyExtensionFiles()],
  base: "./",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        options: resolve(__dirname, "options.html"),
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
})
