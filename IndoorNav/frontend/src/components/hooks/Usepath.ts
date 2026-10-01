import { useEffect, useState } from "react";
import type { FloorId, Point, Wall } from "../../Floor_Information";
import { fetchPath } from "../../utils/Pathing";

/**
 * Refetches the path whenever the floor, walls, start or goal change.
 * Also renders each leg of a searched multi-floor route once you switch to that floor.
 */
export function usePath(floorId: FloorId, walls: Wall[], start?: Point | null, goal?: Point | null) {
  const [path, setPath] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!start || !goal) {
      setPath([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchPath(floorId, walls, start, goal).then((result) => {
      if (cancelled) return;
      setPath(result ?? []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [floorId, walls, start, goal]);

  return { path, loading };
}