import { expect, test } from "vitest";
import { z } from "zod";
import { Challenge } from ".";

const challenge = new Challenge<{
  seed: string;
  challengeA: string;
  challengeB: boolean;
  challengeC: number;
}>();

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

const actions = {
  setText: challenge.onAction("a", z.string(), (state, payload) => {
    state.challengeA = payload;
  }),
  check: challenge.onAction("b", z.boolean(), (state, payload) => {
    state.challengeB = payload;
  }),
  increment: challenge.onAction("c", z.unknown(), (state) => {
    state.challengeC++;
  }),
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
  expect(actions.setText.create(0, "hello")).toMatchInlineSnapshot(`
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
  state = challenge.update(state, actions.setText.create(1, "hello"));
  state = challenge.update(state, actions.check.create(2, true));
  state = challenge.update(state, actions.increment.create(3, []));

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
