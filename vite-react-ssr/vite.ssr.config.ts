import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      formats: ["es"],
      entry: resolve(__dirname, "src/ssr.tsx"),
      name: "ssr-react",
      fileName: "ssr",
    },
    outDir: "dist-ssr",
  },
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [react()],
});
