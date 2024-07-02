import md5 from "md5";
import { z } from "zod";
import { ChallengeContext } from "../../challenge-framework";

export type Operator = "+" | "-" | "*" | "/";
type Question = [number, Operator, number];

const ctx = new ChallengeContext<{
  rngSeed: string;
  answer: number;
  question: Question;
  completed: number;
  wrong: boolean;
}>();

const challengeDefinition = ctx.createChallengeDefinition({
  getInitialState: ({ seed, attemptId }) => {
    const rngSeed = md5(seed + attemptId);
    const question = generateQuestion(rngSeed, 0);
    return {
      rngSeed,
      question,
      answer: 0,
      completed: 0,
      wrong: false,
    };
  },
  actionHandlers: {
    k: ctx.createActionHandler(z.number(), (state, payload, metadata) => {
      state.answer = state.answer * 10 + payload;
      state.rngSeed = md5(state.rngSeed + payload + metadata.timestamp);
    }),
    a: ctx.createActionHandler(z.unknown(), (state, _payload, metadata) => {
      if (state.answer === evaluateQuestion(state.question)) {
        state.completed += 1;
        state.question = generateQuestion(state.rngSeed, state.completed);
        state.answer = 0;
        state.rngSeed = md5(state.rngSeed + metadata.timestamp);
      } else {
        state.wrong = true;
      }
    }),
  },
  isChallengeCompleted: (state) => state.completed >= 100,
  getFailureReason: (state) =>
    state.wrong ? "Incorrect answer was given" : undefined,
});

function generateQuestion(rngSeed: string, num: number): Question {
  const hash = md5(rngSeed + num);
  const op = ((): Operator => {
    if (num < 20) {
      return "+";
    } else if (num < 40) {
      return "-";
    } else if (num < 60) {
      return "*";
    } else if (num < 80) {
      return "/";
    } else {
      return (["+", "-", "*", "/"] as Operator[])[hash.charCodeAt(0) % 4];
    }
  })();
  const [l, r] = ((): [number, number] => {
    if (op === "+" || op === "-") {
      const len =
        1 +
        (num > 10 ? 1 : 0) +
        (num > 11 ? 1 : 0) +
        (num > 12 ? 1 : 0) +
        (num > 13 ? 1 : 0) +
        (num > 14 ? 1 : 0) +
        (num > 15 ? 1 : 0);
      const [a, b] = [
        parseInt(hash.slice(1, 1 + len), 16) + 1,
        parseInt(hash.slice(10, 10 + len), 16) + 1,
      ];
      return op === "+" ? [a, b] : [Math.max(a, b), Math.min(a, b)];
    } else if (op === "*" || op === "/") {
      const a = parseInt(hash.slice(1, 7), 16) + 1;
      const b = parseInt(hash.slice(10, 17), 16) + 1;
      return op === "*" ? [a, b] : [a * b, a];
    } else {
      throw new Error("Invalid operator");
    }
  })();
  return [l, op, r];
}

function evaluateQuestion(question: Question): number {
  const [l, op, r] = question;
  switch (op) {
    case "+":
      return l + r;
    case "-":
      return l - r;
    case "*":
      return l * r;
    case "/":
      return Math.floor(l / r);
  }
}

export const challenge = ctx.createChallenge(challengeDefinition);
export const actions = ctx.createActionCreators(challengeDefinition);
