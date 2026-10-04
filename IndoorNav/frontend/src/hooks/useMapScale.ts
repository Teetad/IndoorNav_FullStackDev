import { useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { IMAGE_WIDTH, IMAGE_HEIGHT } from "../Floor_Information";

const num = (v: string) => parseFloat(v) || 0;
const box = (s: CSSStyleDeclaration, a: "Left" | "Top", b: "Right" | "Bottom") =>
  num(s[`padding${a}`]) + num(s[`padding${b}`]) + num(s[`border${a}Width`]) + num(s[`border${b}Width`]);

/**
 * How the map decides its size:
 *  - "viewport":  fit the browser window, no scrolling (standalone page)
 *  - "width":     fit the width of the parent element; height follows (default for embedding)
 *  - "container": fit both width and height of the parent (parent MUST have a fixed height)
 */
export type FitMode = "viewport" | "width" | "container";

/** Scale (0.25 to 1) for the map. Returns the `shellRef` to attach to the map wrapper. */
export function useMapScale(watch: RefObject<HTMLElement | null>[], fit: FitMode = "viewport") {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const parent = shell?.parentElement;
    if (!shell || !parent) return;

    const update = () => {
      const shellStyle = getComputedStyle(shell);
      const parentStyle = getComputedStyle(parent);
      const availW = parent.clientWidth - box(parentStyle, "Left", "Right") - box(shellStyle, "Left", "Right");

      let next = availW / IMAGE_WIDTH;

      if (fit === "viewport") {
        const top = shell.getBoundingClientRect().top + window.scrollY;
        const availH =
          window.innerHeight - top - box(shellStyle, "Top", "Bottom") - num(parentStyle.paddingBottom) - 8;
        next = Math.min(next, availH / IMAGE_HEIGHT);
      } else if (fit === "container") {
        const availH = parent.clientHeight - box(parentStyle, "Top", "Bottom") - box(shellStyle, "Top", "Bottom");
        next = Math.min(next, availH / IMAGE_HEIGHT);
      }

      next = Math.max(0.25, Math.min(1, next));
      setScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
    };

    update();
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    watch.forEach((r) => r.current && observer.observe(r.current));
    // Embedded: follow the container (sidebar collapse, layout changes, etc.)
    if (fit !== "viewport") observer.observe(parent);

    return () => {
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fit]);

  return { scale, shellRef };
}