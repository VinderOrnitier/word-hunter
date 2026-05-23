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
import "../shared/styles/tokens.css";
import "./styles/popup.css";
import { App } from "./App";
import { LocaleProvider } from "../i18n";

const root = document.getElementById("app");
if (root)
  render(
    <LocaleProvider>
      <App />
    </LocaleProvider>,
    root
  );
