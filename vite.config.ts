import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import preact from "@preact/preset-vite";
import manifest from "./manifest.json";
import pkg from "./package.json";

// package.json is the single source of truth for the version.
// manifest.json's version field is kept in sync for IDE / unpacked-load
// convenience, but the built dist/manifest.json always reflects pkg.version.
export default defineConfig({
  plugins: [preact(), crx({ manifest: { ...manifest, version: pkg.version } })],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
