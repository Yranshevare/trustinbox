import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SettingsPage } from "./SettingsPage";
import "../../globals.css";

export { SettingsPage };

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SettingsPage />
  </StrictMode>,
);
