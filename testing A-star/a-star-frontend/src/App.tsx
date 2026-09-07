import { useState, useEffect } from "react";

const WIDTH = 10;
const HEIGHT = 10;
const walls: [number, number][] = [
  [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [6, 0], [6, 1],
  [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7]
];

export default function App() {
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Send grid settings to Express backend
    fetch("http://localhost:3001/api/find-path", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        width: WIDTH,
        height: HEIGHT,
        start: { x: 0, y: 0 },
        goal: { x: 9, y: 0 },
        walls: walls,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPath(data.path);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Backend fetch error:", err);
        setLoading(false);
      });
  }, []);

  const pathSet = new Set(path.map((p) => `${p.x}-${p.y}`));

  return (
    <div id="app">
      <h1>A* Pathfinding Visualizer (Backend Powered)</h1>
      <p className="status">
        {loading
          ? "Calculating path on backend..."
          : path.length > 0
          ? `Path found! Length: ${path.length} steps.`
          : "No path found."}
      </p>

      <div
        className="grid-container"
        style={{ gridTemplateColumns: `repeat(${WIDTH}, 40px)` }}
      >
        {Array.from({ length: HEIGHT }).map((_, y) =>
          Array.from({ length: WIDTH }).map((_, x) => {
            let cellClass = "cell";
            let cellText = "";

            const isStart = x === 0 && y === 0;
            const isGoal = x === 9 && y === 0;
            const isWall = walls.some(([wx, wy]) => wx === x && wy === y);
            const isPath = pathSet.has(`${x}-${y}`);

            if (isStart) {
              cellClass += " start";
              cellText = "S";
            } else if (isGoal) {
              cellClass += " goal";
              cellText = "G";
            } else if (isWall) {
              cellClass += " wall";
            } else if (isPath) {
              cellClass += " path";
              cellText = "•";
            }

            return (
              <div key={`${x}-${y}`} className={cellClass}>
                {cellText}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}