import { render } from "preact";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/fraunces/400-italic.css";
import "@fontsource/fraunces/600-italic.css";
import "@fontsource/press-start-2p";
import "@fontsource/vt323";
import "../shared/styles/tokens.css";
import "../shared/styles/theme-pokedex.css";
import "./styles/popup.css";
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
