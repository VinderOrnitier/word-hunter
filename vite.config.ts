import { crx } from "@crxjs/vite-plugin";
import preact from "@preact/preset-vite";
import { defineConfig } from "vite";
import manifest from "./manifest.json";
import pkg from "./package.json";

// package.json is the single source of truth for the extension's version
// and description. manifest.json's matching fields are kept in sync for
// IDE / unpacked-load convenience, but the built dist/manifest.json always
// reflects what is in package.json. The description doubles as the
// Chrome Web Store single-purpose statement — see
// docs/release/chrome-web-store.md.
export default defineConfig({
  plugins: [
    preact(),
    crx({
      manifest: {
        ...manifest,
        version: pkg.version,
        description: pkg.description,
      },
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
