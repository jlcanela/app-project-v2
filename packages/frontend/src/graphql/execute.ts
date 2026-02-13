import type { ExecutionResult } from 'graphql'
import { TypedDocumentString } from './graphql'
import { Effect } from 'effect'
 
export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables
) {
  const response = await fetch('/graphql/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/graphql-response+json'
    },
    body: JSON.stringify({
      query,
      variables
    })
  })
 
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
 
  return response.json() as ExecutionResult<TResult>
}

export function executeGraphQL<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables
) {
  return Effect.tryPromise({
    try: () => execute<TResult, TVariables>(query, variables),
    catch: (error) =>
      error instanceof Error ? error : new Error(String(error)),
  }) as Effect.Effect<ExecutionResult<TResult>, Error>;
}