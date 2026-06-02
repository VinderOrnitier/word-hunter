import { crx } from "@crxjs/vite-plugin";
import preact from "@preact/preset-vite";
import { defineConfig, type Plugin } from "vite";
import manifest from "./manifest.json";
import pkg from "./package.json";

// Strips the legacy `.woff` fallback from @fontsource @font-face rules before
// Vite scans the CSS for url() assets, so only `.woff2` is emitted. The
// extension is Chrome-only and Chrome has supported woff2 since 2014, making the
// duplicate woff payload (~480 KB) dead weight.
function dropLegacyWoff(): Plugin {
  return {
    name: "drop-legacy-woff",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("@fontsource") || !/\.css(\?|$)/.test(id)) return null;
      const stripped = code.replace(
        /,\s*url\(['"]?[^)'"]+\.woff['"]?\)\s*format\(['"]woff['"]\)/g,
        ""
      );
      return stripped === code ? null : { code: stripped, map: null };
    },
  };
}

// package.json is the single source of truth for the extension's version
// and description. manifest.json's matching fields are kept in sync for
// IDE / unpacked-load convenience, but the built dist/manifest.json always
// reflects what is in package.json. The description doubles as the
// Chrome Web Store single-purpose statement — see
// docs/release/chrome-web-store.md.
export default defineConfig({
  plugins: [
    dropLegacyWoff(),
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
