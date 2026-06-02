import { render } from "preact";
// Fonts subset to latin + latin-ext (en/de); cyrillic kept only for the
// families that ship it (uk). Legacy .woff is dropped at build time (woff2-only,
// Chrome-only extension) by the dropLegacyWoff plugin in vite.config.ts.
import "@fontsource/space-grotesk/latin-400.css";
import "@fontsource/space-grotesk/latin-ext-400.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-ext-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-ext-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/space-grotesk/latin-ext-700.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-ext-400.css";
import "@fontsource/jetbrains-mono/cyrillic-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-ext-500.css";
import "@fontsource/jetbrains-mono/cyrillic-500.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "@fontsource/jetbrains-mono/latin-ext-700.css";
import "@fontsource/jetbrains-mono/cyrillic-700.css";
import "@fontsource/fraunces/latin-400-italic.css";
import "@fontsource/fraunces/latin-ext-400-italic.css";
import "@fontsource/fraunces/latin-600-italic.css";
import "@fontsource/fraunces/latin-ext-600-italic.css";
import "@fontsource/press-start-2p/latin-400.css";
import "@fontsource/press-start-2p/latin-ext-400.css";
import "@fontsource/press-start-2p/cyrillic-400.css";
import "@fontsource/vt323/latin-400.css";
import "@fontsource/vt323/latin-ext-400.css";
import "../shared/styles/tokens.css";
import "../shared/styles/theme-pokedex.css";
import "./styles/popup.css";
import "./styles/popup.pdx.css";
import { LocaleProvider } from "../i18n";
import { App } from "./App";

const root = document.getElementById("app");
if (root)
  render(
    <LocaleProvider>
      <App />
    </LocaleProvider>,
    root
  );
