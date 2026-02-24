import { Effect, Layer, ServiceMap } from 'effect';
import { FetchHttpClient, HttpBody, HttpClient } from 'effect/unstable/http';
import type { ExecutionResult } from 'graphql';
import { TypedDocumentString } from './graphql';

export class GraphQLClientService extends ServiceMap.Service<GraphQLClientService>()(
  'app/GraphQLClientService',
  {
    make: Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      return {
        execute: <TResult, TVariables>(
          query: TypedDocumentString<TResult, TVariables>,
          variables?: TVariables
        ) =>
          Effect.gen(function* () {
            const operationName = query
              .toString()
              .match(/(query|mutation|subscription)\s+(\w+)/)?.[2];
            yield* Effect.annotateCurrentSpan(
              'graphql.operationName',
              operationName ?? 'anonymous'
            );
            const req = yield* client.post('/graphql/', {
              body: yield* HttpBody.json({
                query,
                variables,
              }),
              accept: 'application/graphql-response+json',
            });
            return (yield* req.json) as ExecutionResult<TResult>;
          }).pipe(Effect.withSpan('GraphQLClientService.execute')),
      };
    }),
  }
) {
  static layer = Layer.effect(this, this.make).pipe(Layer.provide(FetchHttpClient.layer));
}

export const executeGraphQL = <TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables
) =>
  Effect.gen(function* () {
    const client = yield* GraphQLClientService;
    return yield* client.execute(query, variables);
  });
