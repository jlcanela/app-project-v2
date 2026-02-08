import { faker } from "@faker-js/faker";
import { type FastCheck } from "effect";
import { type LazyArbitrary } from "effect/Arbitrary";

type F<A> = (f: typeof faker) => A;

export function makeArbitrary<A>(f: F<A>): () => LazyArbitrary<A> {
  return () => (fc: typeof FastCheck) => fc.constant(null).map(() => f(faker));
}

