import { ChallengeConfiguration } from "../challenge-runner";
import * as buttons from "./buttons";
import * as demo from "./demo";
import * as robot from "./robot";
export const configMap = new Map<string, ChallengeConfiguration>();

if (import.meta.env.VITE_CHALLENGE === "demo") {
  configMap.set("demo", demo.config);
} else {
  configMap.set("demo", demo.config);
  configMap.set("buttons", buttons.config);
  configMap.set("robot", robot.config);
}
