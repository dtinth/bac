import { ChallengeConfiguration } from "../challenge-runner";
import * as demo from "./demo";
export const configMap = new Map<string, ChallengeConfiguration>();

if (import.meta.env.VITE_CHALLENGE === "demo") {
  configMap.set("demo", demo.config);
} else {
  configMap.set("demo", demo.config);
}
