import { atom, computed, ReadableAtom } from "nanostores";
import { ofetch } from "ofetch";
import { useCallback, useEffect, useReducer, useState } from "react";
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

export interface ChallengeSubmitter {
  handleState: (
    state: { state: unknown; metadata: RuntimeMetadata },
    extra: { progress: number | undefined; completed: boolean }
  ) => void;
  activate: () => void;
  deactivate: () => void;
  $status: ReadableAtom<SubmitterStatus>;
}

export type SubmitterStatus =
  | "offline"
  | "connecting"
  | "connected"
  | "disconnected"
  | "submitting"
  | "submitted"
  | "submissionFailed";

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
    $status: atom("offline"),
  };
}

function createRealChallengeSubmitter(options: {
  submitUrl: string;
  reportUrl: string;
  token: string;
}): ChallengeSubmitter {
  let _ws: WebSocket | undefined;
  let _challengeMetadata: ChallengeMetadata | undefined;
  let _actionLogSize = 0;
  let _lastState: unknown = undefined;
  let _completed = false;
  const $wsStatus = atom<SubmitterStatus>("connecting");
  const $submissionStatus = atom<
    "submitting" | "submitted" | "submissionFailed" | undefined
  >(undefined);
  const $status = computed(
    [$wsStatus, $submissionStatus],
    (wsStatus, submissionStatus): SubmitterStatus =>
      submissionStatus ?? wsStatus
  );
  const submit = async (data: {
    state: unknown;
    actionLog: unknown[];
    challengeMetadata: ChallengeMetadata;
  }) => {
    $submissionStatus.set("submitting");
    try {
      await ofetch(options.submitUrl, {
        method: "POST",
        body: data,
        headers: { "x-submission-token": options.token },
      });
      $submissionStatus.set("submitted");
    } catch (error) {
      console.error(error);
      $submissionStatus.set("submissionFailed");
    }
  };

  const token = options.token;
  let queue: string[] | undefined = [];
  const send = (x: unknown) => {
    if (queue) {
      queue.push(JSON.stringify(x));
      return;
    }
    try {
      _ws!.send(JSON.stringify(x));
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
        submit({ state, actionLog, challengeMetadata });
      }
    },
    activate: () => {
      if (!_ws) {
        const ws = (_ws = new WebSocket(options.reportUrl));
        ws.onopen = () => {
          $wsStatus.set("connected");
          try {
            if (queue) {
              queue.forEach((x) => ws.send(x));
              queue = undefined;
            }
          } catch (error) {
            console.error("[ws]", error);
          }
        };
        ws.onclose = () => {
          $wsStatus.set("disconnected");
        };
        ws.onerror = (error) => {
          $wsStatus.set("disconnected");
          console.error("[ws]", error);
        };
      }
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = undefined;
      }
    },
    deactivate: () => {
      closeTimeout = setTimeout(() => {
        _ws?.close();
      }, 1000);
    },
    $status,
  };
}

export function useChallenge<TState>(
  challenge: Challenge<TState>,
  challengeMetadata: ChallengeMetadata
) {
  const [submitter] = useState<ChallengeSubmitter>(() =>
    createChallengeSubmitter()
  );
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
    submitter.activate();
    return () => {
      submitter.deactivate();
    };
  }, [submitter]);
  useEffect(() => {
    submitter.handleState(state, {
      progress: challenge.getScore(state.state),
      completed: challenge.isChallengeCompleted(state.state),
    });
  }, [submitter, state, challenge]);
  const dispatchAction: RuntimeDispatchFn<TState> = useCallback(
    (action, payload) => {
      const timestamp = Math.round(performance.now() - startTime);
      const actionObject = action.create(payload, { timestamp });
      dispatch(actionObject);
    },
    [dispatch, startTime]
  );
  return [
    state.state,
    dispatchAction,
    state.metadata,
    startTime,
    submitter,
  ] as const;
}
