import { MapEmbed } from "./components/MapView";

// ─── Change these to two rooms you tagged ───
const START = "411B";
const GOAL = "411A";
// ────────────────────────────────────────────

/** Minimal test: a header div and the embedded map. Nothing else. */
export default function TestHome() {
  return (
    <div>
      <div style={{ padding: 12, background: "#222", color: "#fff" }}>Header</div>
      <MapEmbed startRoom={START} goalRoom={GOAL} debug />
    </div>
  );
}