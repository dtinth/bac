import { Draft, produce } from "immer";
import { z } from "zod";

export interface IChallenge<TState> {
  initialize(params: unknown): TState;
  update(state: TState, action: Action): TState;
}

export interface Action {
  type: string;
  timestamp: number;
  payload: unknown;
}

export class Challenge<TState> implements IChallenge<TState> {
  private _initializer?: (params: unknown) => TState;
  private _actionHandlers = new Map<
    string,
    (state: TState, action: Action) => TState
  >();

  initialize(params: unknown): TState {
    if (!this._initializer) {
      throw new Error("onInitialize not called");
    }
    return this._initializer(params);
  }

  update(state: TState, action: Action): TState {
    const handler = this._actionHandlers.get(action.type);
    if (!handler) {
      throw new Error(`No handler for action type ${action.type}`);
    }
    return handler(state, action);
  }

  onInitialize<TSchema extends z.ZodTypeAny>(
    schema: TSchema,
    getInitialState: (params: z.infer<NoInfer<TSchema>>) => TState
  ) {
    this._initializer = (params: unknown) => {
      const parsed = schema.parse(params);
      return getInitialState(parsed);
    };
  }

  onAction<TActionType extends string, TPayloadSchema extends z.ZodTypeAny>(
    actionType: TActionType,
    payloadSchema: TPayloadSchema,
    handler: (
      state: Draft<TState>,
      payload: z.infer<NoInfer<TPayloadSchema>>
    ) => void
  ) {
    this._actionHandlers.set(actionType, (state, action) => {
      const parsed = payloadSchema.parse(action.payload);
      return produce(state, (draft) => {
        handler(draft, parsed);
      });
    });
    return new ChallengeAction(this, actionType, payloadSchema);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Wildcard = any;

export class ChallengeAction<
  TChallenge extends Challenge<Wildcard>,
  TActionType extends string,
  TPayloadSchema extends z.ZodTypeAny
> {
  constructor(
    public challenge: TChallenge,
    public type: TActionType,
    public payloadSchema: TPayloadSchema
  ) {}

  create(timestamp: number, payload: z.infer<TPayloadSchema>) {
    return {
      type: this.type,
      timestamp,
      payload,
    };
  }
}
