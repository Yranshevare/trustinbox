import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { copyFileSync, mkdirSync, existsSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function copyManifestPlugin() {
  return {
    name: "copy-manifest",
    closeBundle() {
      const manifestSrc = path.resolve(__dirname, "manifest.json");
      const manifestDest = path.resolve(__dirname, "dist/manifest.json");
      copyFileSync(manifestSrc, manifestDest);

      const backgroundSrc = path.resolve(__dirname, "dist/background.js");
      const backgroundDest = path.resolve(__dirname, "dist/background.js");
      if (existsSync(backgroundSrc)) {
        copyFileSync(backgroundSrc, backgroundDest);
      }

      const contentSrc = path.resolve(__dirname, "dist/content.js");
      const contentDest = path.resolve(__dirname, "dist/content.js");
      if (existsSync(contentSrc)) {
        copyFileSync(contentSrc, contentDest);
      }

      const iconsDir = path.resolve(__dirname, "dist/icons");
      if (!existsSync(iconsDir)) {
        mkdirSync(iconsDir, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyManifestPlugin()],
  root: "src",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "src/popup.html"),
        options: path.resolve(__dirname, "src/options.html"),
      },
    },
  },
});
