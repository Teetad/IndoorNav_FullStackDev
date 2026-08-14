export interface GridNode {
  x: number;
  y: number;
  isWall: boolean;
  g: number;
  h: number;
  f: number;
  parent: GridNode | null;
}

export function createNode(x: number, y: number, isWall = false): GridNode {
  return { x, y, isWall, g: 0, h: 0, f: 0, parent: null };
}

function heuristic(nodeA: GridNode, nodeB: GridNode): number {
  return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
}

export function findPath(grid: GridNode[][], start: GridNode, goal: GridNode): GridNode[] {
  const openSet: GridNode[] = [];
  const closedSet: Set<GridNode> = new Set();
  openSet.push(start);

  while (openSet.length > 0) {
    let lowestIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f) {
        lowestIndex = i;
      }
    }

    const current = openSet[lowestIndex];

    if (current === goal) {
      const path: GridNode[] = [];
      let temp: GridNode | null = current;
      while (temp) {
        path.push(temp);
        temp = temp.parent;
      }
      return path.reverse();
    }

    openSet.splice(lowestIndex, 1);
    closedSet.add(current);

    const neighbors = getNeighbors(grid, current);

    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor) || neighbor.isWall) {
        continue;
      }

      const tentativeG = current.g + 1;
      let newPath = false;

      if (openSet.includes(neighbor)) {
        if (tentativeG < neighbor.g) {
          neighbor.g = tentativeG;
          newPath = true;
        }
      } else {
        neighbor.g = tentativeG;
        newPath = true;
        openSet.push(neighbor);
      }

      if (newPath) {
        neighbor.h = heuristic(neighbor, goal);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = current;
      }
    }
  }
  return [];
}

function getNeighbors(grid: GridNode[][], node: GridNode): GridNode[] {
  const neighbors: GridNode[] = [];
  const { x, y } = node;
  const rows = grid.length;
  const cols = grid[0].length;

  if (y > 0) neighbors.push(grid[y - 1][x]);
  if (y < rows - 1) neighbors.push(grid[y + 1][x]);
  if (x > 0) neighbors.push(grid[y][x - 1]);
  if (x < cols - 1) neighbors.push(grid[y][x + 1]);

  return neighbors;
}