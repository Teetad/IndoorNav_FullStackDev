import { createRoot } from "react-dom/client";
import { MapEmbed } from "./components/MapView";
import type { MapViewProps } from "./components/MapView";

/**
 * Mount the map into ANY element, even on a page that isn't React.
 *   const map = mountMap(document.getElementById("map")!, { startRoom: "ENTRANCE", goalRoom: "305" });
 *   map.update({ startRoom: "ENTRANCE", goalRoom: "412" });   // change the destination
 *   map.unmount();
 */
export function mountMap(element: HTMLElement, initial: Omit<MapViewProps, "embedded">) {
  const root = createRoot(element);
  root.render(<MapEmbed {...initial} />);
  return {
    update: (props: Omit<MapViewProps, "embedded">) => root.render(<MapEmbed {...props} />),
    unmount: () => root.unmount(),
  };
}