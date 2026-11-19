import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Builds into ../lab so GitHub Pages serves it at /Portafolio/lab/
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "../lab", emptyOutDir: true },
});
