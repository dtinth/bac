import md5 from "md5";
import { z } from "zod";
import { ChallengeContext, ScoreKeeper } from "../../challenge-framework";

export type Position = [number, number];
const ctx = new ChallengeContext<{
  values: number[];
  sourceIndex: number | undefined;
  targetIndex: number | undefined;
  baselineScore: number;
}>();

const challengeDefinition = ctx.createChallengeDefinition({
  getInitialState: ({ seed, attemptId, startTime }) => {
    let randomSeed = md5(`${seed}-${attemptId}-${startTime}`);
    const size = 24;
    const values = Array.from({ length: size }, (_, i) => i + 1);
    const hash = Array.from({ length: size }, (_, i) => md5(randomSeed + i));
    values.sort((a, b) => {
      return hash[a - 1].localeCompare(hash[b - 1]);
    });
    randomSeed = md5(randomSeed);
    let j = 0;
    const rng = (max: number) => {
      const value = parseInt(randomSeed.slice(j, j + 2), 16) % max;
      j += 2;
      if (j >= randomSeed.length) {
        randomSeed = md5(randomSeed);
        j = 0;
      }
      return value;
    };
    let iterations = 0;
    for (let i = 0; i < 1000; i++) {
      const score = calculateSortedness(values);
      if (score < 0.25) break;
      const indexA = rng(size);
      const indexB = rng(size);
      [values[indexA], values[indexB]] = [values[indexB], values[indexA]];
      const newScore = calculateSortedness(values);
      if (newScore > score) {
        [values[indexA], values[indexB]] = [values[indexB], values[indexA]];
      }
      iterations++;
    }
    console.log("iterations", iterations);
    return {
      values,
      sourceIndex: undefined,
      targetIndex: undefined,
      baselineScore: calculateSortedness(values),
    };
  },
  actionHandlers: {
    s: ctx.createActionHandler(z.number(), (state, payload) => {
      state.sourceIndex = payload;
    }),
    o: ctx.createActionHandler(z.number(), (state, payload) => {
      state.targetIndex = payload;
    }),
    d: ctx.createActionHandler(z.number(), (state, payload) => {
      state.targetIndex = payload;
      if (
        state.sourceIndex !== undefined &&
        state.targetIndex !== undefined &&
        state.sourceIndex !== state.targetIndex
      ) {
        const value = state.values[state.sourceIndex];
        state.values.splice(state.sourceIndex, 1);
        state.values.splice(state.targetIndex, 0, value);
      }
      state.sourceIndex = undefined;
      state.targetIndex = undefined;
    }),
    e: ctx.createActionHandler(z.unknown(), (state) => {
      state.sourceIndex = undefined;
      state.targetIndex = undefined;
    }),
  },
  isChallengeCompleted: (state) => {
    return state.values.every((value, index) => value === index + 1);
  },
  getFailureReason: () => {
    return undefined;
  },
  getScore: (state) => {
    const sortedness = calculateSortedness(state.values);
    const score = new ScoreKeeper();
    score.add(
      100,
      (sortedness - state.baselineScore) / (1 - state.baselineScore)
    );
    return score.getFinalScore();
  },
});

export const challenge = ctx.createChallenge(challengeDefinition);
export const actions = ctx.createActionCreators(challengeDefinition);

function calculateSortedness(values: number[]) {
  let sortedness = 0;
  let total = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) {
      sortedness += 1;
    }
    total += 1;
  }
  sortedness /= total;
  return sortedness;
}
