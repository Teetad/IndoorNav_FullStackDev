import { createNode, findPath, Node } from "./A-star.js";

// Helper to initialize a Grid
function createGrid(width: number, height: number, wallCoords: [number, number][]): Node[][] {
  const grid: Node[][] = [];

  for (let y = 0; y < height; y++) {
    const row: Node[] = [];
    for (let x = 0; x < width; x++) {
      const isWall = wallCoords.some(([wx, wy]) => wx === x && wy === y);
      row.push(createNode(x, y, isWall));
    }
    grid.push(row);
  }

  return grid;
}


function printGrid(grid: Node[][], path: Node[], start: Node, goal: Node) {
  const pathSet = new Set(path);

  console.log("\nGrid Map (S: Start, G: Goal, #: Wall, *: Path, .: Empty):");
  for (let y = 0; y < grid.length; y++) {
    let rowStr = "";
    for (let x = 0; x < grid[0].length; x++) {
      const node = grid[y][x];

      if (node === start) rowStr += " S ";
      else if (node === goal) rowStr += " G ";
      else if (node.isWall) rowStr += " # ";
      else if (pathSet.has(node)) rowStr += " * ";
      else rowStr += " . ";
    }
    console.log(rowStr);
  }
}


const WIDTH = 10;
const HEIGHT = 10;

// Define wall coordinates [x, y] blocking direct paths
const walls: [number, number][] = [
  [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [6,0], [6,1],
  [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7]
];

const grid = createGrid(WIDTH, HEIGHT, walls); 

//start and goal nodes
const startNode = grid[0][0];
const goalNode = grid[0][9];

console.log(`Searching path from (${startNode.x}, ${startNode.y}) to (${goalNode.x}, ${goalNode.y})...`);

const path = findPath(grid, startNode, goalNode);

if (path.length > 0) {
  console.log(`Path found! Length: ${path.length} steps.`);
  printGrid(grid, path, startNode, goalNode);
} else {
  console.log("No path could be found to the destination!");
}