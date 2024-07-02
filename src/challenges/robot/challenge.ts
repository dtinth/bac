import md5 from "md5";
import { z } from "zod";
import { ChallengeContext } from "../../challenge-framework";
import { generateMaze } from "./generate";

export type Position = [number, number];
const ctx = new ChallengeContext<{
  seed: string;
  cell: Position;
  direction: number; // 0:right 1:down 2:left 3:up
}>();

const MAZE_SIZE = 16;

let cachedMaze: { maze: number[][]; seed: string } | undefined;
export function getMaze(seed: string) {
  if (cachedMaze?.seed === seed) return cachedMaze.maze;
  const maze = generateMaze(MAZE_SIZE, MAZE_SIZE, seed);
  cachedMaze = { maze, seed };
  return maze;
}

export function travel(cell: Position, direction: number): Position {
  switch (direction) {
    case 0:
      return [cell[0], cell[1] + 1];
    case 1:
      return [cell[0] + 1, cell[1]];
    case 2:
      return [cell[0], cell[1] - 1];
    case 3:
      return [cell[0] - 1, cell[1]];
  }
  throw new Error("Invalid direction");
}
export function turnLeft(direction: number) {
  return (direction + 3) % 4;
}
export function turnRight(direction: number) {
  return (direction + 1) % 4;
}
export function isValidCoordinate(cell: Position, maze: number[][]) {
  return (
    cell[0] >= 0 &&
    cell[0] < maze.length &&
    cell[1] >= 0 &&
    cell[1] < maze[0].length &&
    maze[cell[0]][cell[1]] === 0
  );
}

const challengeDefinition = ctx.createChallengeDefinition({
  getInitialState: ({ seed, attemptId, startTime }) => {
    return {
      seed: md5(`${seed}-${attemptId}-${startTime}`),
      cell: [0, 1],
      direction: 1,
    };
  },
  actionHandlers: {
    r: ctx.createActionHandler(z.unknown(), (state) => {
      state.direction = turnRight(state.direction);
    }),
    l: ctx.createActionHandler(z.unknown(), (state) => {
      state.direction = turnLeft(state.direction);
    }),
    f: ctx.createActionHandler(z.unknown(), (state) => {
      state.cell = travel(state.cell, state.direction);
    }),
  },
  isChallengeCompleted: (state) => {
    const maze = getMaze(state.seed);
    const [row, column] = state.cell;
    return row === maze.length - 1 && column === maze[0].length - 2;
  },
  getFailureReason: (state) => {
    const maze = getMaze(state.seed);
    const [row, column] = state.cell;
    if (
      row < 0 ||
      row >= maze.length ||
      column < 0 ||
      column >= maze[0].length
    ) {
      return "You went out of bounds!";
    }
    if (maze[row][column]) {
      return "You hit a wall!";
    }
  },
});

export const challenge = ctx.createChallenge(challengeDefinition);
export const actions = ctx.createActionCreators(challengeDefinition);