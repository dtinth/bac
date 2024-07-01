import { z } from "zod";
import { createChallengeBuilder } from "../challenge-framework";

const challenge = createChallengeBuilder({
  params: z.object({
    seed: z.string(),
  }),
  initializer: (params) => {
    return {
      seed: params.seed,
      challengeA: true,
      challengeB: "",
      challengeC: 0,
    };
  },
}).command("a", [z.boolean()] as const, (state, value) => {
  state.challengeA = value
}).command("b", [z.string()] as const, (state, value) => {
  state.challengeB = value
}).command("c", [] as const, (state) => {
  state.challengeC++
});
