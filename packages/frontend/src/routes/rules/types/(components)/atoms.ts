
import { Atom, Result } from '@effect-atom/atom-react'
import { executeGraphQL, GraphQLClientService } from '@/graphql/execute'
// import * as Otlp from "@effect/opentelemetry/Otlp"
import { type Configuration, layer as webSdkLayer } from "@effect/opentelemetry/WebSdk"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-web"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
 
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { graphql } from '@/graphql/gql'
import { Effect, Layer } from 'effect'
// import { type CreatePostMutationVariables } from '@/graphql/graphql'

const GetRuleTypesQuery = graphql(`
  query RulesType {
    ruleTypes(orderBy: { ruleTypeId: { direction: asc, priority: 1 } }) {
      ruleTypeId
      schemaIn
      schemaOut
      ...RuleTypeItem
      ...RuleTypeGeneralItem
      #...UserItem
      #...SelectedUserItem
      #...AuthorUserItem
    }
  }
`)

// query RulesType {
//   ruleTypes {
//     ruleTypeId
//     description
//     schemaIn
//     schemaOut
//   } 
// }

// const GetPostsQuery = graphql(`
//   query GetPosts($where: PostsFilters) {
//     posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {
//       id
//       authorId
//       ...PostItem
//     }
//   }`)

// const CreateUserMutation = graphql(`
// mutation CreateUser($name: String!) {
//   insertIntoUsersSingle(values: { name: $name }) {
//     id
//     name
//   }
// }
// `)

// const CreatePostMutation = graphql(`
// mutation CreatePost($content: String!, $authorId: Int!) {
//   insertIntoPostsSingle(values: { content: $content, authorId: $authorId }) {
//     id
//     content
//     authorId
//   }
// }
// `)

// const DeletePostMutation = graphql(`

// mutation DeletePost($id: Int!) {
//   deleteFromPosts(where: { id: { eq: $id } }) {
//     id
//     content
//     authorId
//   }
// }
// `)

const baseUrl = "http://localhost:5173/v1/traces";

const SpansExporterLive = webSdkLayer(() : Configuration => {
  return {
    resource: {
      serviceName: "rule-studio-frontend"
    },
    spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter({
      url: baseUrl,
    }))
  }
})

const runtime = Atom.runtime(GraphQLClientService.Default.pipe(Layer.provide(FetchHttpClient.layer), Layer.provide(SpansExporterLive)))

export const selectedRuleTypeIdAtom = Atom.make<number | null>(null)

export const ruleTypesAtom = runtime.atom(executeGraphQL(GetRuleTypesQuery).pipe(
  Effect.map((result) => result.data?.ruleTypes ?? []),
)).pipe(Atom.withReactivity({ users: ["*"] }))

// export const postsAtom = runtime.atom(executeGraphQL(GetPostsQuery, { where: null }).pipe(
//   Effect.map((result) => result.data?.posts ?? [])
// )).pipe(Atom.withReactivity({ posts: ["*"] }))


export const selectedRuleTypeAtom = Atom.make((get) => {
  const ruleTypesResult = get(ruleTypesAtom);
  const selectedId = get(selectedRuleTypeIdAtom);

  if (selectedId === null) {
    return Result.success(undefined)
  }

  return Result.map(ruleTypesResult, (ruleTypes) => ruleTypes.find((r) => r.ruleTypeId === selectedId))
});

// export const selectedPostsAtom = Atom.make((get) => {
//   const postsResult = get(postsAtom);
//   const selectedId = get(selectedUserIdAtom);

//   if (selectedId === null) {
//     return postsResult;
//   }

//   return Result.map(postsResult, (posts) => posts.filter((p) => p.authorId === selectedId));
// });

// export const createRuleType = Effect.fn(function* (name: string) {
//   return yield* executeGraphQL(CreateUserMutation, { name })
// })

// export const createRuleTypeAtom = runtime.fn(createRuleType,
//    { reactivityKeys: { users: ["*"] } }
// )

// export const createPost = Effect.fn(function* (variables: CreatePostMutationVariables) {
//   return yield* executeGraphQL(CreatePostMutation, variables)
// })

// export const createPostAtom = runtime.fn(createPost,
//   { reactivityKeys: { posts: ["*"] } }
// )

// export const deletePost = Effect.fn(function* (postId: number) {
//   return yield* executeGraphQL(DeletePostMutation, {id: postId})
// })

// export const deletePostAtom = runtime.fn(deletePost,
//   { reactivityKeys: { posts: ["*"] } }
// )