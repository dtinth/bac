import { ChallengeConfiguration } from "../challenge-runner";
export const configMap = new Map<
  string,
  Promise<{ config: ChallengeConfiguration }>
>();

if (import.meta.env.VITE_CHALLENGE === "demo") {
  configMap.set("demo", import("./demo"));
} else if (import.meta.env.VITE_CHALLENGE === "buttons") {
  configMap.set("buttons", import("./buttons"));
} else if (import.meta.env.VITE_CHALLENGE === "hunting") {
  configMap.set("buttons", import("./hunting"));
} else if (import.meta.env.VITE_CHALLENGE === "mui") {
  configMap.set("mui", import("./mui"));
} else if (import.meta.env.VITE_CHALLENGE === "robot") {
  configMap.set("robot", import("./robot"));
} else if (import.meta.env.VITE_CHALLENGE === "towers") {
  configMap.set("towers", import("./towers"));
} else {
  if (location.hostname !== "localhost") {
    throw new Error("Invalid challenge");
  }
  configMap.set("demo", import("./demo"));
  configMap.set("buttons", import("./buttons"));
  configMap.set("hunting", import("./hunting"));
  configMap.set("robot", import("./robot"));
  configMap.set("towers", import("./towers"));
  configMap.set("mui", import("./mui"));
}
