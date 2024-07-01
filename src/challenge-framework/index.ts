import { Draft, produce } from "immer";
import { useCallback, useReducer, useState } from "react";
import { z } from "zod";

export interface Challenge<TState> {
  initialize(params: unknown): TState;
  update(state: TState, action: Action): TState;
}

export interface Action {
  type: string;
  timestamp: number;
  payload: unknown;
}

export interface ChallengeDefinition<
  TState = Wildcard,
  TParamsSchema extends z.ZodTypeAny = Wildcard,
  TActions extends ActionHandlers<TState> = ActionHandlers<TState>
> {
  initializer: Initializer<TState, TParamsSchema>;
  actionHandlers: TActions;
}

export type ActionMetadata = {
  timestamp: number;
};
type ActionHandlers<TState> = Record<string, ActionHandler<TState>>;
type ActionHandler<TState, TPayloadType extends z.ZodTypeAny = Wildcard> = {
  payloadSchema: TPayloadType;
  updater: (
    state: Draft<TState>,
    payload: z.infer<TPayloadType>,
    metadata: ActionMetadata
  ) => void;
};
type Initializer<TState, TParamsSchema extends z.ZodTypeAny> = {
  paramsSchema: TParamsSchema;
  getInitialState: (params: z.infer<TParamsSchema>) => TState;
};

export class ChallengeContext<TState> {
  createChallengeDefinition<
    TParamsSchema extends z.ZodTypeAny,
    TActions extends ActionHandlers<TState>
  >(def: ChallengeDefinition<TState, TParamsSchema, TActions>) {
    return def;
  }

  createActionHandler<TPayloadSchema extends z.ZodTypeAny>(
    payloadSchema: TPayloadSchema,
    updater: ActionHandler<TState, TPayloadSchema>["updater"]
  ): ActionHandler<TState, TPayloadSchema> {
    return {
      payloadSchema,
      updater,
    };
  }

  createInitializer<TParamsSchema extends z.ZodTypeAny>(
    paramsSchema: TParamsSchema,
    getInitialState: Initializer<TState, TParamsSchema>["getInitialState"]
  ): Initializer<TState, TParamsSchema> {
    return {
      paramsSchema,
      getInitialState,
    };
  }

  createChallenge<TDefinition extends ChallengeDefinition>(
    definition: TDefinition
  ): Challenge<TState> {
    const { actionHandlers, initializer } = definition;
    return {
      initialize: (params) => {
        const paramsSchema = initializer.paramsSchema as z.ZodTypeAny;
        const parsedParams = paramsSchema.parse(params);
        return initializer.getInitialState(parsedParams);
      },
      update: (state, action) => {
        const found = Object.hasOwnProperty.call(actionHandlers, action.type);
        if (!found) {
          throw new Error(
            `Action handler not found for action type: ${action.type}`
          );
        }
        const handler = actionHandlers[action.type];
        const payloadSchema = handler.payloadSchema as z.ZodTypeAny;
        const parsedPayload = payloadSchema.parse(action.payload);
        return produce(state, (draft) => {
          handler.updater(draft, parsedPayload, {
            timestamp: action.timestamp,
          });
        });
      },
    };
  }

  createActionCreators<TDefinition extends ChallengeDefinition>(
    definition: TDefinition
  ) {
    const { actionHandlers } = definition;
    return Object.fromEntries(
      Object.entries(actionHandlers).map(([type, handler]) => {
        return [type, new ChallengeAction(type, handler.payloadSchema)];
      })
    ) as {
      [K in keyof TDefinition["actionHandlers"] & string]: ChallengeAction<
        this,
        TDefinition["actionHandlers"][K]["payloadSchema"]
      >;
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Wildcard = any;

export class ChallengeAction<
  TContext extends ChallengeContext<Wildcard>,
  TPayloadSchema extends z.ZodTypeAny = Wildcard
> {
  _context!: TContext;
  _payload!: z.infer<TPayloadSchema>;

  constructor(public type: string, public payloadSchema: TPayloadSchema) {}

  create(payload: z.infer<TPayloadSchema>, metadata: ActionMetadata) {
    return {
      type: this.type,
      timestamp: metadata.timestamp,
      payload,
    };
  }
}

export function useChallenge<TState>(
  challenge: Challenge<TState>,
  initialParams: unknown
) {
  const [startTime] = useState(() => performance.now());
  type RuntimeState = {
    state: TState;
    params: unknown;
    actionLog: unknown[][];
    size: number;
  };
  const [state, dispatch] = useReducer(
    (runtimeState: RuntimeState, action: Action): RuntimeState => {
      const newState = challenge.update(runtimeState.state, action);
      const item = [action.type, action.timestamp, action.payload];
      return {
        ...runtimeState,
        state: newState,
        actionLog: [...runtimeState.actionLog, item],
        size:
          runtimeState.size +
          new TextEncoder().encode(JSON.stringify(item)).length +
          1,
      };
    },
    initialParams,
    (params): RuntimeState => {
      const state = challenge.initialize(params);
      return {
        state,
        params,
        actionLog: [],
        size: 2,
      };
    }
  );
  const dispatchAction = useCallback(
    function getPayload<T extends ChallengeAction<ChallengeContext<TState>>>(
      action: T,
      payload: NoInfer<T["_payload"]>
    ) {
      const timestamp = Math.round(performance.now() - startTime);
      dispatch(action.create(payload, { timestamp }));
    },
    [dispatch, startTime]
  );
  return [state, dispatchAction] as const;
}
