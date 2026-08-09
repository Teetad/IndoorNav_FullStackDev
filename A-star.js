export function createNode(x, y, isWall = false) {
    return { x, y, isWall, g: 0, h: 0, f: 0, parent: null };
}
// Manhattan Distance heuristic (ideal for 4-directional grid movement)
function heuristic(nodeA, nodeB) {
    return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
}
export function findPath(grid, start, goal) {
    const openSet = [];
    const closedSet = new Set();
    openSet.push(start);
    while (openSet.length > 0) {
        // Find node with the lowest f cost
        let lowestIndex = 0;
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIndex].f) {
                lowestIndex = i;
            }
        }
        const current = openSet[lowestIndex];
        // Destination reached: reconstruct and return path
        if (current === goal) {
            const path = [];
            let temp = current;
            while (temp) {
                path.push(temp);
                temp = temp.parent;
            }
            return path.reverse();
        }
        // Move current node from open to closed set
        openSet.splice(lowestIndex, 1);
        closedSet.add(current);
        const neighbors = getNeighbors(grid, current);
        for (const neighbor of neighbors) {
            if (closedSet.has(neighbor) || neighbor.isWall) {
                continue;
            }
            const tentativeG = current.g + 1; // Distance between adjacent nodes is 1
            let newPath = false;
            if (openSet.includes(neighbor)) {
                if (tentativeG < neighbor.g) {
                    neighbor.g = tentativeG;
                    newPath = true;
                }
            }
            else {
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
    // No path found
    return [];
}
function getNeighbors(grid, node) {
    const neighbors = [];
    const { x, y } = node;
    const rows = grid.length;
    const cols = grid[0].length;
    // 4-directional orthogonal neighbors (Up, Down, Left, Right)
    if (y > 0)
        neighbors.push(grid[y - 1][x]); // Up
    if (y < rows - 1)
        neighbors.push(grid[y + 1][x]); // Down
    if (x > 0)
        neighbors.push(grid[y][x - 1]); // Left
    if (x < cols - 1)
        neighbors.push(grid[y][x + 1]); // Right
    return neighbors;
}
