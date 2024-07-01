import { z } from "zod";
import { Challenge } from "../challenge-framework";

interface State {
  seed: string;
  challengeA: string;
  challengeB: boolean;
  challengeC: number;
}

export const challenge = new Challenge<State>();

challenge.onInitialize(
  z.object({
    seed: z.string(),
  }),
  (params) => {
    return {
      seed: params.seed,
      challengeA: "",
      challengeB: false,
      challengeC: 0,
    };
  }
);

export const actions = {
  setText: challenge.onAction("a", z.string(), (state, payload) => {
    state.challengeA = payload;
  }),
  check: challenge.onAction("b", z.boolean(), (state, payload) => {
    state.challengeB = payload;
  }),
  increment: challenge.onAction("b", z.unknown(), (state) => {
    state.challengeC++;
  }),
};
