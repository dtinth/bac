import md5 from "md5";

const directionList: number[][] = [
  [0, 1, 2, 3],
  [0, 1, 3, 2],
  [0, 2, 1, 3],
  [0, 2, 3, 1],
  [0, 3, 1, 2],
  [0, 3, 2, 1],
  [1, 0, 2, 3],
  [1, 0, 3, 2],
  [1, 2, 0, 3],
  [1, 2, 3, 0],
  [1, 3, 0, 2],
  [1, 3, 2, 0],
  [2, 0, 1, 3],
  [2, 0, 3, 1],
  [2, 1, 0, 3],
  [2, 1, 3, 0],
  [2, 3, 0, 1],
  [2, 3, 1, 0],
  [3, 0, 1, 2],
  [3, 0, 2, 1],
  [3, 1, 0, 2],
  [3, 1, 2, 0],
  [3, 2, 0, 1],
  [3, 2, 1, 0],
];

export function generateMaze(w: number, h: number, seed: string) {
  let hash = md5(seed);
  let hashIndex = 0;
  const rand = () => {
    if (hashIndex >= hash.length) {
      hash = md5(hash);
      hashIndex = 0;
    }
    const value = parseInt(hash.slice(hashIndex, hashIndex + 2), 16);
    hashIndex += 2;
    return value;
  };

  const cells = Array.from({ length: h + h + 1 }, () =>
    Array.from({ length: w + w + 1 }, () => 1)
  );
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      cells[i * 2 + 1][j * 2 + 1] = 0;
    }
  }
  type StackItem = {
    cell: [number, number];
    directionList: number[];
    directionIndex: number;
  };
  const randomizeDirectionList = () => {
    return directionList[rand() % directionList.length];
  };

  const visited = new Set<string>();
  const isVisited = (cell: [number, number]) => {
    return visited.has(cell.join(","));
  };
  const visit = (cell: [number, number]) => {
    visited.add(cell.join(","));
  };
  const nextCell = (
    cell: [number, number],
    direction: number
  ): [number, number] => {
    switch (direction) {
      case 0:
        return [cell[0], cell[1] + 2];
      case 1:
        return [cell[0] + 2, cell[1]];
      case 2:
        return [cell[0], cell[1] - 2];
      case 3:
        return [cell[0] - 2, cell[1]];
    }
    throw new Error("Invalid direction");
  };

  const stack: StackItem[] = [
    {
      cell: [1, 1],
      directionList: randomizeDirectionList(),
      directionIndex: 0,
    },
  ];
  visit([1, 1]);
  while (stack.length > 0) {
    const top = stack[stack.length - 1];
    if (top.directionIndex >= top.directionList.length) {
      stack.pop();
      continue;
    }
    const direction = top.directionList[top.directionIndex];
    const targetCell = nextCell(top.cell, direction);
    top.directionIndex++;
    const [cx, cy] = top.cell;
    const [tx, ty] = targetCell;
    if (tx < 0 || tx >= cells[0].length || ty < 0 || ty >= cells.length) {
      continue;
    }
    if (isVisited(targetCell)) {
      continue;
    }
    visit(targetCell);
    const mx = (cx + tx) / 2;
    const my = (cy + ty) / 2;
    cells[my][mx] = 0;
    stack.push({
      cell: targetCell,
      directionList: randomizeDirectionList(),
      directionIndex: 0,
    });
  }
  cells[0][1] = 0;
  cells[cells.length - 1][cells[0].length - 2] = 0;

  return cells;
}

export function generateDistanceMap(maze: number[][]): DistanceMap {
  const queue: [number, number, number][] = [];
  queue.push([maze.length - 1, maze[0].length - 2, 0]);
  const visited = new Map<string, number>();
  while (queue.length > 0) {
    const [row, column, distance] = queue.shift()!;
    if (row < 0 || row >= maze.length) continue;
    if (column < 0 || column >= maze[0].length) continue;
    if (maze[row][column]) continue;
    const key = `${row},${column}`;
    if (visited.has(key)) continue;
    visited.set(key, distance);
    queue.push([row + 1, column, distance + 1]);
    queue.push([row - 1, column, distance + 1]);
    queue.push([row, column + 1, distance + 1]);
    queue.push([row, column - 1, distance + 1]);
  }
  return {
    getDistance: ([row, column]: [number, number]) => {
      const key = `${row},${column}`;
      return visited.get(key) ?? null;
    },
  };
}

export interface DistanceMap {
  getDistance(cell: [number, number]): number | null;
}
