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

// package.json is the single source of truth for the extension's version,
// injected into dist/manifest.json at build time so the two cannot drift.
// The name and description are localized instead: manifest.json uses the
// __MSG_name__ / __MSG_description__ placeholders, which Chrome resolves from
// _locales/<locale>/messages.json (en is the canonical copy; de/ja/uk are
// translations). Keep _locales/en/messages.json#description in sync with
// package.json#description and the Chrome Web Store single-purpose statement
// — see docs/release/chrome-web-store.md.
export default defineConfig({
  plugins: [
    dropLegacyWoff(),
    preact(),
    crx({
      manifest: {
        ...manifest,
        version: pkg.version,
      },
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
