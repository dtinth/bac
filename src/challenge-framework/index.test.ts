import { expect, test } from "vitest";
import { z } from "zod";
import { ActionMetadata, ChallengeContext } from ".";

const ctx = new ChallengeContext<{
  seed: string;
  challengeA: string;
  challengeB: boolean;
  challengeC: number;
}>();

const definition = ctx.createChallengeDefinition({
  initializer: ctx.createInitializer(
    z.object({ seed: z.string() }),
    (params) => {
      return {
        seed: params.seed,
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

const challenge = ctx.createChallenge(definition);
const rawActions = ctx.createActionCreators(definition);
const actions = {
  setText: rawActions.a,
  check: rawActions.b,
  increment: rawActions.c,
};

test("initialize creates state", () => {
  const state = challenge.initialize({ seed: "seed" });
  expect(state).toMatchInlineSnapshot(`
    {
      "challengeA": "",
      "challengeB": false,
      "challengeC": 0,
      "seed": "seed",
    }
  `);
});

test("creating action objects", () => {
  expect(actions.setText.create("hello", { timestamp: 0 }))
    .toMatchInlineSnapshot(`
    {
      "payload": "hello",
      "timestamp": 0,
      "type": "a",
    }
  `);
});

test("updating state with actions", () => {
  const initialState = challenge.initialize({ seed: "x" });
  let state = initialState;
  const meta: ActionMetadata = { timestamp: 0 };
  state = challenge.update(state, actions.setText.create("hello", meta));
  state = challenge.update(state, actions.check.create(true, meta));
  state = challenge.update(state, actions.increment.create([], meta));

  expect(initialState).toMatchInlineSnapshot(`
    {
      "challengeA": "",
      "challengeB": false,
      "challengeC": 0,
      "seed": "x",
    }
  `);
  expect(state).toMatchInlineSnapshot(`
    {
      "challengeA": "hello",
      "challengeB": true,
      "challengeC": 1,
      "seed": "x",
    }
  `);
});
