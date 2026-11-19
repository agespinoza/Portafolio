import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Browsers block <script type="module"> on file:// pages, so the build emits a
// classic deferred script. The lab then works both on GitHub Pages and when
// lab/index.html is opened directly from disk.
const classicScript = {
  name: "classic-script",
  enforce: "post",
  transformIndexHtml(html) {
    return html
      .replace(/<script type="module" crossorigin src=/g, "<script defer src=")
      .replace(/<link rel="stylesheet" crossorigin href=/g, '<link rel="stylesheet" href=');
  },
};

export default defineConfig({
  plugins: [react(), classicScript],
  base: "./",
  build: {
    outDir: "../lab",
    emptyOutDir: true,
    modulePreload: false,
    rollupOptions: { output: { format: "iife", inlineDynamicImports: true } },
  },
});
