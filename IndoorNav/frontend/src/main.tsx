import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import MapView from "./components/MapView";
import TestHome from "./Testhome";

// ─── Edit these in code ─────────────────────────────────────────────
const SHOW_TEST_HOME = true;          // true = test layout page, false = plain map only
const DEFAULT_START_ROOM = "ENTRANCE"; // used by the plain map when ?from= is missing
// ────────────────────────────────────────────────────────────────────

/**
 *  /?edit          editor (dev server, or build with VITE_ENABLE_EDITOR=true)
 *  /?test          test home page (embed inside a layout)
 *  /?from=401&to=305  plain map with path
 *  /               test home if SHOW_TEST_HOME, otherwise plain map
 */
const params = new URLSearchParams(window.location.search);
const canEdit = import.meta.env.DEV || import.meta.env.VITE_ENABLE_EDITOR === "true";

function Root() {
  if (canEdit && params.has("edit")) return <App />;
  if (params.has("test") || (SHOW_TEST_HOME && !params.has("to"))) return <TestHome />;
  return (
    <MapView
      startRoom={params.get("from") ?? DEFAULT_START_ROOM}
      goalRoom={params.get("to") ?? undefined}
      floor={params.get("floor") ?? undefined}
    />
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);