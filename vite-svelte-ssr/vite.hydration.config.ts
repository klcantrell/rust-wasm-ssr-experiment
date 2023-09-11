import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      formats: ["es"],
      entry: resolve(__dirname, "src/hydration.ts"),
      name: "hydration-svelte",
      fileName: "hydration",
    },
    outDir: "dist-hydration",
  },
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [svelte()],
})
