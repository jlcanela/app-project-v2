import { FetchHttpClient, HttpBody, HttpClient } from '@effect/platform';
import { Context, Effect } from 'effect';
import type { ExecutionResult } from 'graphql';
import { TypedDocumentString } from './graphql';

export class GraphQLClient extends Context.Tag('GraphQLClient')<
  GraphQLClient,
  {
    readonly execute: <TResult, TVariables>(
      query: TypedDocumentString<TResult, TVariables>,
      variables?: TVariables
    ) => Effect.Effect<ExecutionResult<TResult>, Error>;
  }
>() {}

export class GraphQLClientService extends Effect.Service<GraphQLClientService>()(
  'app/GraphQLClientService',
  {
    effect: Effect.gen(function* () {
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
    dependencies: [FetchHttpClient.layer],
  }
) {}

export function executeGraphQL<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables
) {
  return Effect.flatMap(GraphQLClientService, (client) => client.execute(query, variables));
}
