import md5 from "md5";
import { z } from "zod";
import { ChallengeContext, ScoreKeeper } from "../../challenge-framework";

const ctx = new ChallengeContext<{
  seed: string;
  hoverIndex: number;
  clickedIndices: number[];
}>();

export const getNumber = (seed: string, index: number) => {
  return parseInt(md5(`${seed}-${index}`).slice(0, 4), 16);
};

export const getTargetIndices = (seed: string) => {
  const hash = md5(`target:${seed}`);
  const rawIndices = Array.from(
    hash.match(/../g)!,
    (x) => parseInt(x, 16) % 64
  );
  return [...new Set(rawIndices)].slice(0, 5);
};

export const getTargetNumbers = (seed: string) => {
  return getTargetIndices(seed).map((index) => getNumber(seed, index));
};

export const getChallengeViewModel = (
  seed: string,
  clickedIndices: number[]
) => {
  const target = getTargetNumbers(seed);
  const clicked = new Set<number>();
  let failed = false;
  for (const i of clickedIndices) {
    const n = getNumber(seed, i);
    if (target.includes(n)) {
      clicked.add(n);
    } else {
      failed = true;
    }
  }
  return { failed, clicked, target };
};

const challengeDefinition = ctx.createChallengeDefinition({
  getInitialState: ({ seed, attemptId }) => {
    return {
      seed: md5(seed + attemptId),
      hoverIndex: -1,
      clickedIndices: [],
    };
  },
  actionHandlers: {
    h: ctx.createActionHandler(z.number(), (state, payload) => {
      state.hoverIndex = payload;
    }),
    l: ctx.createActionHandler(z.number(), (state, payload) => {
      if (payload === state.hoverIndex) state.hoverIndex = -1;
    }),
    c: ctx.createActionHandler(z.number(), (state, payload) => {
      if (!state.clickedIndices.includes(payload)) {
        state.clickedIndices.push(payload);
      }
    }),
  },
  isChallengeCompleted: (state) => {
    const { failed, clicked, target } = getChallengeViewModel(
      state.seed,
      state.clickedIndices
    );
    return !failed && clicked.size === target.length;
  },
  getFailureReason: (state) => {
    const { failed } = getChallengeViewModel(state.seed, state.clickedIndices);
    return failed ? "You clicked on the wrong number." : undefined;
  },
  getScore: (state) => {
    const { clicked, target } = getChallengeViewModel(
      state.seed,
      state.clickedIndices
    );
    const score = new ScoreKeeper();
    score.add(100, clicked.size / target.length);
    return score.getFinalScore();
  },
});

export const challenge = ctx.createChallenge(challengeDefinition);
export const actions = ctx.createActionCreators(challengeDefinition);
