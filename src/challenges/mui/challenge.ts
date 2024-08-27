import dayjs from "dayjs";
import { z } from "zod";
import { ChallengeContext, ScoreKeeper } from "../../challenge-framework";

export type Position = [number, number];
const ctx = new ChallengeContext<{
  completed: string[];
  value: string;
  error: string;
}>();

export const expectedDates = [
  "2010-03-25 01:25",
  "2010-09-25 01:50",
  "2019-06-08 18:45",
  "1986-10-17 03:15",
  "1983-09-17 22:20",
  "2006-08-23 18:30",
  "2008-05-16 04:05",
  "1980-01-18 04:25",
  "1992-07-02 01:40",
  "2000-09-22 01:00",
  "1986-01-04 20:20",
  "1993-07-18 06:10",
  "1985-09-01 11:05",
  "1980-12-29 07:15",
  "1993-07-24 02:35",
  "2029-09-18 21:58",
  "2028-01-20 14:50",
  "1995-07-09 10:33",
  "2013-06-01 16:15",
  "2009-02-25 05:37",
];

export function serializeDayjs(date: dayjs.Dayjs) {
  return [
    date.year(),
    "-",
    (1 + date.month()).toString().padStart(2, "0"),
    "-",
    date.date().toString().padStart(2, "0"),
    " ",
    date.hour().toString().padStart(2, "0"),
    ":",
    date.minute().toString().padStart(2, "0"),
  ].join("");
}

const challengeDefinition = ctx.createChallengeDefinition({
  getInitialState: ({ startTime }) => {
    return {
      completed: [],
      value: serializeDayjs(dayjs(startTime)),
      error: "",
    };
  },
  actionHandlers: {
    s: ctx.createActionHandler(z.string(), (state, payload) => {
      state.value = payload;
    }),
    a: ctx.createActionHandler(z.number(), (state) => {
      if (state.completed.includes(state.value)) {
        state.error = "You already completed this date.";
        return;
      }
      if (!expectedDates.includes(state.value)) {
        state.error = "This date is not part of the challenge.";
        return;
      }
      state.completed.push(state.value);
    }),
  },
  isChallengeCompleted: (state) => {
    return state.completed.length >= expectedDates.length;
  },
  getFailureReason: (state) => {
    return state.error || undefined;
  },
  getScore: (state) => {
    const score = new ScoreKeeper();
    score.add(100, state.completed.length / expectedDates.length);
    return score.getFinalScore();
  },
});

export const challenge = ctx.createChallenge(challengeDefinition);
export const actions = ctx.createActionCreators(challengeDefinition);
