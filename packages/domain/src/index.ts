import { Console, Effect } from "effect"


export const Value = 1

export const program = Console.log("hello", Value)

Effect.runPromise(program)

