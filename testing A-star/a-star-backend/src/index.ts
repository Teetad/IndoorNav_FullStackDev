import express, { Request, Response } from "express";
import cors from "cors";
import { createNode, findPath, type GridNode } from "./A-star.js";

const app = express();
const PORT = 3001;

// Enable CORS so your Vite app (http://localhost:5173) can communicate with backend
app.use(cors());
app.use(express.json());

interface PathRequestBody {
  width: number;
  height: number;
  start: { x: number; y: number };
  goal: { x: number; y: number };
  walls: [number, number][];
}

app.post("/api/find-path", (req: Request<{}, {}, PathRequestBody>, res: Response) => {
  const { width, height, start, goal, walls } = req.body;

  // 1. Build Grid
  const grid: GridNode[][] = [];
  for (let y = 0; y < height; y++) {
    const row: GridNode[] = [];
    for (let x = 0; x < width; x++) {
      const isWall = walls.some(([wx, wy]) => wx === x && wy === y);
      row.push(createNode(x, y, isWall));
    }
    grid.push(row);
  }

  // 2. Select Nodes
  const startNode = grid[start.y][start.x];
  const goalNode = grid[goal.y][goal.x];

  // 3. Compute A*
  const rawPath = findPath(grid, startNode, goalNode);

  // 4. Strip out circular parent references
  const cleanPath = rawPath.map((node) => ({
    x: node.x,
    y: node.y,
  }));

  // 5. Respond
  res.json({
    success: cleanPath.length > 0,
    length: cleanPath.length,
    path: cleanPath,
  });
});

app.listen(PORT, () => {
  console.log(`Backend server listening at http://localhost:${PORT}`);
});