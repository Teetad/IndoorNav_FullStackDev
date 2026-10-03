import { useEffect, useState } from "react";
import type { FloorId, Point, Wall } from "../Floor_Information";
import { fetchPath } from "../lib/api";

/** Refetches the path for the current floor whenever floor/walls/start/goal change. */
export function usePath(floorId: FloorId, walls: Wall[], start?: Point | null, goal?: Point | null) {
  const [path, setPath] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!start || !goal) {
      setPath([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetchPath(walls, start, goal, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setPath(result ?? []);
      setLoading(false);
    });
    return () => controller.abort();
  }, [floorId, walls, start, goal]);

  return { path, loading };
}