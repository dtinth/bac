import { z } from "zod";
import { ChallengeContext } from "../challenge-framework";

interface State {
  seed: string;
  page: number;
  challengeA: string;
  challengeB: boolean;
  challengeC: number;
}

const ctx = new ChallengeContext<State>();

const challengeDefinition = ctx.createChallengeDefinition({
  initializer: ctx.createInitializer(
    z.object({ seed: z.string() }),
    (params) => {
      return {
        seed: params.seed,
        page: 0,
        challengeA: "",
        challengeB: false,
        challengeC: 0,
      };
    }
  ),
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
  },
});

export const challenge = ctx.createChallenge(challengeDefinition);
export const actions = ctx.createActionCreators(challengeDefinition);
