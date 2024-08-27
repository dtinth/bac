import { ChallengeConfiguration } from "../challenge-runner";
export const configMap = new Map<
  string,
  Promise<{ config: ChallengeConfiguration }>
>();

if (import.meta.env.VITE_CHALLENGE === "demo") {
  configMap.set("demo", import("./demo"));
} else {
  if (location.hostname !== "localhost") {
    throw new Error("Invalid challenge");
  }
  configMap.set("demo", import("./demo"));
  configMap.set("buttons", import("./buttons"));
  configMap.set("robot", import("./robot"));
  configMap.set("towers", import("./towers"));
  configMap.set("mui", import("./mui"));
}
