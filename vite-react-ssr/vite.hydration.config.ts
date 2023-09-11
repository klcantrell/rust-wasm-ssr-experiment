import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      formats: ["es"],
      entry: resolve(__dirname, "src/hydration.tsx"),
      name: "hydration-react",
      fileName: "hydration",
    },
    outDir: "dist-hydration",
  },
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [react()],
});
