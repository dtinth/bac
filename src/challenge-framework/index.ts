import { z } from "zod";
import { produce, Draft } from "immer";

export function createChallengeBuilder<
  TParamSchema extends z.ZodTypeAny,
  TState
>(options: {
  params: TParamSchema;
  initializer: (params: z.infer<NoInfer<TParamSchema>>) => TState;
}): ChallengeBuilder<z.infer<TParamSchema>, TState> {
  const handlers: Map<string, CommandHandler<TState>> = new Map();
  return {
    command(name, argSchemas, handler) {
      handlers.set(name, (state, ...args) => {
        const parsedArgs = args.map((v, k) => (argSchemas[k] as z.ZodTypeAny).parse(v));
        return handler(state, ...(parsedArgs as any));
      });
      return this;
    },
    buildChallenge() {
      return {
        initialize(params) {
          return options.initializer(options.params.parse(params));
        },
        update(state, [command, ...args]) {
          const handler = handlers.get(command);
          if (!handler) {
            throw new Error(`Unknown command: ${command}`);
          }
          const nextState = produce(state, (draft) => {
            handler(draft, ...args);
          });
          return nextState;
        },
      };
    },
    buildCommander() {
      return (command, ...args) => [command, ...args];
    },
  };
}

export type CommandHandler<TState> = (
  state: Draft<TState>,
  ...args: unknown[]
) => void;
export type CommandMap = { [command: string]: unknown[] };

type ZodArguments<T extends unknown[]> = {
  [K in keyof T]: T[K] extends z.ZodTypeAny ? z.infer<T[K]> : never;
};

export interface ChallengeBuilder<
  TParams,
  TState,
  TCommands extends CommandMap = {}
> {
  command<TName extends string, TArgumentSchemas extends unknown[]>(
    name: TName,
    [...argSchemas]: TArgumentSchemas,
    handler: (
      state: Draft<TState>,
      ...args: NoInfer<ZodArguments<TArgumentSchemas>>
    ) => void
  ): ChallengeBuilder<
    TParams,
    TState,
    TCommands & { [K in TName]: NoInfer<ZodArguments<TArgumentSchemas>> }
  >;
  buildChallenge(): Challenge<TState>;
  buildCommander(): Commander<TCommands>;
}

export interface Challenge<TState> {
  initialize(params: unknown): TState;
  update(state: TState, command: Command): TState;
}

export interface Commander<TCommands extends CommandMap> {
  <K extends keyof TCommands>(command: K, ...args: TCommands[K]): Command;
}

export type Command = [string, ...args: unknown[]];
