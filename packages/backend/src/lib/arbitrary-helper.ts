import { faker } from "@faker-js/faker";
import { LazyArbitrary } from "effect/Schema";
import { type FastCheck } from "effect/testing";

type F<A> = (f: typeof faker) => A;

export function makeArbitrary<A>(f: F<A>): () => LazyArbitrary<A> {
  return () => (fc: typeof FastCheck) => fc.constant(null).map(() => f(faker));
}

