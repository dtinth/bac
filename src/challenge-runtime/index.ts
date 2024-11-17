import { useCallback, useEffect, useReducer, useRef, useState } from "react";
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

interface ChallengeSubmitter {
  handleState: (
    state: { state: unknown; metadata: RuntimeMetadata },
    extra: { progress: number | undefined; completed: boolean }
  ) => void;
  activate: () => void;
  deactivate: () => void;
}

function createChallengeSubmitter(): ChallengeSubmitter {
  const params = new URLSearchParams(window.location.search);
  if (params.has("submitTo") && params.has("reportTo") && params.has("token")) {
    return createRealChallengeSubmitter({
      submitUrl: params.get("submitTo")!,
      reportUrl: params.get("reportTo")!,
      token: params.get("token")!,
    });
  } else {
    return createNullChallengeSubmitter();
  }
}

function createNullChallengeSubmitter(): ChallengeSubmitter {
  return {
    handleState: () => {},
    activate: () => {},
    deactivate: () => {},
  };
}

function createRealChallengeSubmitter(options: {
  submitUrl: string;
  reportUrl: string;
  token: string;
}): ChallengeSubmitter {
  let _challengeMetadata: ChallengeMetadata | undefined;
  let _actionLogSize = 0;
  let _lastState: unknown = undefined;
  let _completed = false;

  const token = options.token;
  const ws = new WebSocket(options.reportUrl);
  let queue: string[] | undefined = [];
  const send = (x: unknown) => {
    if (queue) {
      queue.push(JSON.stringify(x));
      return;
    }
    try {
      ws.send(JSON.stringify(x));
    } catch (error) {
      console.error("[ws]", error);
    }
  };
  ws.onopen = () => {
    try {
      if (queue) {
        queue.forEach((x) => ws.send(x));
        queue = undefined;
      }
    } catch (error) {
      console.error("[ws]", error);
    }
  };

  let closeTimeout: ReturnType<typeof setTimeout> | undefined;

  return {
    handleState: (
      { state, metadata: { actionLog, challengeMetadata } },
      { progress, completed }
    ) => {
      if (_challengeMetadata !== challengeMetadata) {
        _challengeMetadata = challengeMetadata;
        send({ challengeMetadata, token });
      }
      for (; _actionLogSize < actionLog.length; _actionLogSize++) {
        send({ action: actionLog[_actionLogSize] });
      }
      if (_lastState !== state) {
        _lastState = state;
        send({ status: { state, progress, completed } });
      }
      if (!_completed && completed) {
        _completed = true;
      }
    },
    activate: () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = undefined;
      }
    },
    deactivate: () => {
      closeTimeout = setTimeout(() => {
        ws.close();
      }, 1000);
    },
  };
}

export function useChallenge<TState>(
  challenge: Challenge<TState>,
  challengeMetadata: ChallengeMetadata
) {
  const submitter = useRef<ChallengeSubmitter | null>(null);
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
  useEffect(() => {
    if (!submitter.current) {
      submitter.current = createChallengeSubmitter();
    }
    const s = submitter.current;
    s.activate();
    return () => {
      s.deactivate();
    };
  }, []);
  useEffect(() => {
    if (!submitter.current) {
      return;
    }
    submitter.current.handleState(state, {
      progress: challenge.getScore(state.state),
      completed: challenge.isChallengeCompleted(state.state),
    });
  }, [state, challenge]);
  const dispatchAction: RuntimeDispatchFn<TState> = useCallback(
    (action, payload) => {
      const timestamp = Math.round(performance.now() - startTime);
      const actionObject = action.create(payload, { timestamp });
      dispatch(actionObject);
    },
    [dispatch, startTime]
  );
  return [state.state, dispatchAction, state.metadata, startTime] as const;
}
