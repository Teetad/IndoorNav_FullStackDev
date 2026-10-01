import { useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { IMAGE_WIDTH, IMAGE_HEIGHT } from "../../Floor_Information";

const num = (v: string) => parseFloat(v) || 0;

/**
 * Shrinks the map so the whole floor plan fits on screen without scrolling.
 * On a big enough display the scale stays at 1.
 * `watched` are elements whose height changes move the map (header, tools, search).
 */
export function useMapScale(watched: RefObject<HTMLElement | null>[]) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const parent = shell?.parentElement;
    if (!shell || !parent) return;

    const update = () => {
      const s = getComputedStyle(shell);
      const p = getComputedStyle(parent);

      const shellX =
        num(s.paddingLeft) + num(s.paddingRight) + num(s.borderLeftWidth) + num(s.borderRightWidth);
      const shellY =
        num(s.paddingTop) + num(s.paddingBottom) + num(s.borderTopWidth) + num(s.borderBottomWidth);
      const parentX = num(p.paddingLeft) + num(p.paddingRight);

      const top = shell.getBoundingClientRect().top + window.scrollY;
      const availableWidth = parent.clientWidth - parentX - shellX;
      const availableHeight = window.innerHeight - top - shellY - num(p.paddingBottom) - 8;

      const next = Math.max(
        0.25,
        Math.min(1, availableWidth / IMAGE_WIDTH, availableHeight / IMAGE_HEIGHT)
      );
      setScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
    };

    update();
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    watched.forEach((ref) => ref.current && observer.observe(ref.current));

    return () => {
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { scale, shellRef };
}