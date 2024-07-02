import { useCallback, useReducer, useState } from "react";
import {
  Action,
  Challenge,
  ChallengeAction,
  ChallengeContext,
  ChallengeMetadata,
} from "../challenge-framework";

export interface RuntimeMetadata {
  challengeMetadata: ChallengeMetadata;
  actionLog: unknown[][];
  size: number;
}
export interface RuntimeDispatchFn<TState> {
  <T extends ChallengeAction<ChallengeContext<TState>>>(
    action: T,
    payload: NoInfer<T["_payload"]>
  ): void;
}
export function useChallenge<TState>(
  challenge: Challenge<TState>,
  challengeMetadata: ChallengeMetadata
) {
  const [startTime] = useState(() => performance.now());
  type RuntimeState = {
    state: TState;
    metadata: RuntimeMetadata;
  };
  const [state, dispatch] = useReducer(
    (runtimeState: RuntimeState, action: Action): RuntimeState => {
      const { metadata } = runtimeState;
      const newState = challenge.update(runtimeState.state, action);
      const item = [action.type, action.timestamp, action.payload];
      return {
        state: newState,
        metadata: {
          ...metadata,
          actionLog: [...metadata.actionLog, item],
          size:
            metadata.size +
            new TextEncoder().encode(JSON.stringify(item)).length +
            1,
        },
      };
    },
    challengeMetadata,
    (challengeMetadata): RuntimeState => {
      const state = challenge.initialize(challengeMetadata);
      return {
        state,
        metadata: {
          challengeMetadata,
          actionLog: [],
          size: 2,
        },
      };
    }
  );
  const dispatchAction: RuntimeDispatchFn<TState> = useCallback(
    (action, payload) => {
      const timestamp = Math.round(performance.now() - startTime);
      dispatch(action.create(payload, { timestamp }));
    },
    [dispatch, startTime]
  );
  return [state.state, dispatchAction, state.metadata, startTime] as const;
}
