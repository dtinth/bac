import md5 from "md5";
import { z } from "zod";
import { ChallengeContext, ScoreKeeper } from "../../challenge-framework";

const ctx = new ChallengeContext<{
  seed: string;
  failed?: string;
  expectedText: string;
  expectedNumber: number;
  page: number;
  challengeA: string;
  challengeB: boolean;
  challengeC: number;
}>();

const challengeDefinition = ctx.createChallengeDefinition({
  getInitialState: ({ seed, attemptId }) => {
    return {
      seed: seed,
      expectedText: md5(seed + attemptId),
      expectedNumber: parseInt(md5(seed + attemptId + "x").slice(0, 1), 16) + 4,
      page: 0,
      challengeA: "",
      challengeB: false,
      challengeC: 0,
    };
  },
  actionHandlers: {
    a: ctx.createActionHandler(z.string(), (state, payload) => {
      state.challengeA = payload;
    }),
    b: ctx.createActionHandler(z.boolean(), (state, payload) => {
      state.challengeB = payload;
    }),
    c: ctx.createActionHandler(z.unknown(), (state) => {
      state.challengeC++;
    }),
    n: ctx.createActionHandler(z.unknown(), (state) => {
      if (state.page === 0) {
        if (state.challengeA === state.expectedText) {
          state.page = 1;
        } else {
          state.failed = "Incorrect text";
        }
      } else if (state.page === 1) {
        if (state.challengeB) {
          state.page = 2;
        } else {
          state.failed = "Checkbox not checked";
        }
      } else if (state.page === 2) {
        if (state.challengeC === state.expectedNumber) {
          state.page = 3;
        } else {
          state.failed = "Incorrect number of clicks";
        }
      }
    }),
    p: ctx.createActionHandler(z.unknown(), (state) => {
      state.failed = "Type the text, not paste it";
    }),
  },
  isChallengeCompleted: (state) => {
    return state.page === 3;
  },
  getFailureReason: (state) => {
    return state.failed;
  },
  getScore: (state) => {
    const score = new ScoreKeeper();
    score.add(10, state.page >= 1 ? 1 : 0);
    score.add(10, state.page >= 2 ? 1 : 0);
    score.add(10, state.page >= 3 ? 1 : 0);
    score.add(30, commonPrefixFraction(state.expectedText, state.challengeA));
    score.add(10, state.challengeB ? 1 : 0);
    score.add(
      30,
      state.challengeC <= state.expectedNumber
        ? state.challengeC / state.expectedNumber
        : 0
    );
    return score.getFinalScore();
  },
});

function commonPrefixFraction(a: string, b: string) {
  let commonPrefix = 0;
  for (let i = 0; i < a.length && i < b.length; i++) {
    if (a[i] === b[i]) {
      commonPrefix++;
    } else {
      break;
    }
  }
  if (commonPrefix === 0) return 0;
  return commonPrefix / Math.max(a.length, b.length);
}

export const challenge = ctx.createChallenge(challengeDefinition);
export const actions = ctx.createActionCreators(challengeDefinition);
