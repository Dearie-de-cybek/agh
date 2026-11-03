import "@fontsource-variable/bricolage-grotesque/wdth.css";
import "@fontsource-variable/dm-sans";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/danfo";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/home.css";
import "./styles/chat.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./pages/Home";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
