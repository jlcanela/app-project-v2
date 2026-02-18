import { Atom, Result } from '@effect-atom/atom-react';
// import * as Otlp from "@effect/opentelemetry/Otlp"
import { layer as webSdkLayer, type Configuration } from '@effect/opentelemetry/WebSdk';
import * as FetchHttpClient from '@effect/platform/FetchHttpClient';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { Effect, Layer, Option } from 'effect';
import { executeGraphQL, GraphQLClientService } from '@/graphql/execute';
import { graphql } from '@/graphql/gql';
import { type CreatePostMutationVariables } from '@/graphql/graphql';

const GetUsersQuery = graphql(`
  query GetUsers {
    users(orderBy: { name: { direction: asc, priority: 1 } }) {
      id
      ...UserItem
      ...SelectedUserItem
      ...AuthorUserItem
    }
  }
`);

const GetPostsQuery = graphql(`
  query GetPosts($where: PostsFilters) {
    posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {
      id
      authorId
      ...PostItem
    }
  }
`);

const CreateUserMutation = graphql(`
  mutation CreateUser($name: String!) {
    insertIntoUsersSingle(values: { name: $name }) {
      id
      name
    }
  }
`);

const CreatePostMutation = graphql(`
  mutation CreatePost($content: String!, $authorId: Int!) {
    insertIntoPostsSingle(values: { content: $content, authorId: $authorId }) {
      id
      content
      authorId
    }
  }
`);

const DeletePostMutation = graphql(`
  mutation DeletePost($id: Int!) {
    deleteFromPosts(where: { id: { eq: $id } }) {
      id
      content
      authorId
    }
  }
`);

const baseUrl = 'http://localhost:5173/v1/traces';

const SpansExporterLive = webSdkLayer((): Configuration => {
  return {
    resource: {
      serviceName: 'rule-studio-frontend',
    },
    spanProcessor: new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: baseUrl,
      })
    ),
  };
});

const runtime = Atom.runtime(
  GraphQLClientService.Default.pipe(
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(SpansExporterLive)
  )
);

export const selectedUserIdAtom = Atom.make<number | null>(null);

export const usersAtom = runtime
  .atom(executeGraphQL(GetUsersQuery).pipe(Effect.map((result) => result.data?.users ?? [])))
  .pipe(Atom.withReactivity({ users: ['*'] }));

export const postsAtom = runtime
  .atom(
    executeGraphQL(GetPostsQuery, { where: null }).pipe(
      Effect.map((result) => result.data?.posts ?? [])
    )
  )
  .pipe(Atom.withReactivity({ posts: ['*'] }));

export const selectedUserAtom = Atom.make((get) => {
  const usersResult = get(usersAtom);
  const selectedId = get(selectedUserIdAtom);
  return Result.map(usersResult, (users) =>
    Option.fromNullable(users.find((u) => u.id === selectedId))
  );
});

export const selectedPostsAtom = Atom.make((get) => {
  const postsResult = get(postsAtom);
  const selectedId = get(selectedUserIdAtom);

  if (selectedId === null) {
    return postsResult;
  }

  return Result.map(postsResult, (posts) => posts.filter((p) => p.authorId === selectedId));
});

export const createUser = Effect.fn(function* (name: string) {
  return yield* executeGraphQL(CreateUserMutation, { name });
});

export const createUserAtom = runtime.fn(createUser, { reactivityKeys: { users: ['*'] } });

export const createPost = Effect.fn(function* (variables: CreatePostMutationVariables) {
  return yield* executeGraphQL(CreatePostMutation, variables);
});

export const createPostAtom = runtime.fn(createPost, { reactivityKeys: { posts: ['*'] } });

export const deletePost = Effect.fn(function* (postId: number) {
  return yield* executeGraphQL(DeletePostMutation, { id: postId });
});

export const deletePostAtom = runtime.fn(deletePost, { reactivityKeys: { posts: ['*'] } });
