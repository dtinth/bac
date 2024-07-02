import md5 from "md5";
import { z } from "zod";
import { ChallengeContext } from "../../challenge-framework";

interface State {
  seed: string;
  failed?: string;
  expectedText: string;
  expectedNumber: number;
  page: number;
  challengeA: string;
  challengeB: boolean;
  challengeC: number;
}

const ctx = new ChallengeContext<State>();

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
});

export const challenge = ctx.createChallenge(challengeDefinition);
export const actions = ctx.createActionCreators(challengeDefinition);
