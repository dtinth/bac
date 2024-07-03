import { Draft, produce } from "immer";
import { z } from "zod";

export interface Challenge<TState> {
  initialize(metadata: ChallengeMetadata): TState;
  update(state: TState, action: Action): TState;
  isChallengeCompleted: (state: TState) => boolean;
  getFailureReason: (state: TState) => string | undefined;
  getScore: (state: TState) => number | undefined;
}

export interface ChallengeMetadata {
  seed: string;
  startTime: number;
  attemptId: string;
}

export interface Action {
  type: string;
  timestamp: number;
  payload: unknown;
}

export interface ChallengeDefinition<
  TState = Wildcard,
  TActions extends ActionHandlers<TState> = ActionHandlers<TState>
> {
  getInitialState: (metadata: ChallengeMetadata) => TState;
  actionHandlers: TActions;
  isChallengeCompleted: (state: TState) => boolean;
  getFailureReason: (state: TState) => string | undefined;
  getScore?: (state: TState) => number;
}

export interface ActionMetadata {
  timestamp: number;
}

type ActionHandlers<TState> = Record<string, ActionHandler<TState>>;
type ActionHandler<TState, TPayloadType extends z.ZodTypeAny = Wildcard> = {
  payloadSchema: TPayloadType;
  updater: (
    state: Draft<TState>,
    payload: z.infer<TPayloadType>,
    metadata: ActionMetadata
  ) => void;
};

export class ChallengeContext<TState> {
  createChallengeDefinition<TActions extends ActionHandlers<TState>>(
    def: ChallengeDefinition<TState, TActions>
  ) {
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

  createChallenge<TDefinition extends ChallengeDefinition>(
    definition: TDefinition
  ): Challenge<TState> {
    const { actionHandlers, getInitialState } = definition;
    return {
      initialize: getInitialState,
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
      isChallengeCompleted: definition.isChallengeCompleted,
      getFailureReason: definition.getFailureReason,
      getScore: (state) => definition.getScore?.(state),
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

export class ScoreKeeper {
  private score = 0;
  private total = 0;
  add(value: number, fraction = 1) {
    this.score += Math.floor(value * fraction);
    this.total += value;
  }
  getFinalScore() {
    if (this.total !== 100) {
      throw new Error(`Total score is not 100, but ${this.total}`);
    }
    return this.score;
  }
}
