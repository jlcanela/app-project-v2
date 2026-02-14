
import { Atom, Result } from '@effect-atom/atom-react'
import { executeGraphQL } from '@/graphql/execute'
import { graphql } from '@/graphql/gql'
import { Effect, Layer } from 'effect'
import { type CreatePostMutationVariables } from '@/graphql/graphql'

const GetUsersQuery = graphql(`
  query GetUsers {
    users(orderBy: { name: { direction: asc, priority: 1 } }) {
      id
      ...UserItem
      ...SelectedUserItem
      ...AuthorUserItem
    }
  }
`)

const GetPostsQuery = graphql(`
  query GetPosts($where: PostsFilters) {
    posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {
      id
      authorId
      ...PostItem
    }
  }`)

const CreateUserMutation = graphql(`
mutation CreateUser($name: String!) {
  insertIntoUsersSingle(values: { name: $name }) {
    id
    name
  }
}
`)

const CreatePostMutation = graphql(`
mutation CreatePost($content: String!, $authorId: Int!) {
  insertIntoPostsSingle(values: { content: $content, authorId: $authorId }) {
    id
    content
    authorId
  }
}
`)

const DeletePostMutation = graphql(`

mutation DeletePost($id: Int!) {
  deleteFromPosts(where: { id: { eq: $id } }) {
    id
    content
    authorId
  }
}
`)

const runtime = Atom.runtime(Layer.empty)

export const selectedUserIdAtom = Atom.make<number | null>(null)

export const usersAtom = runtime.atom(executeGraphQL(GetUsersQuery).pipe(
  Effect.map((result) => result.data?.users ?? []),
)).pipe(Atom.withReactivity({ users: ["*"] }))

export const postsAtom = runtime.atom(executeGraphQL(GetPostsQuery, { where: null }).pipe(
  Effect.map((result) => result.data?.posts ?? [])
)).pipe(Atom.withReactivity({ posts: ["*"] }))


export const selectedUserAtom = Atom.make((get) => {
  const usersResult = get(usersAtom);
  const selectedId = get(selectedUserIdAtom);

  if (selectedId === null) {
    return Result.success(undefined)
  }

  return Result.map(usersResult, (users) => users.find((u) => u.id === selectedId))
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
  return yield* executeGraphQL(CreateUserMutation, { name })
})

export const createUserAtom = runtime.fn(createUser,
   { reactivityKeys: { users: ["*"] } }
)

export const createPost = Effect.fn(function* (variables: CreatePostMutationVariables) {
  return yield* executeGraphQL(CreatePostMutation, variables)
})

export const createPostAtom = runtime.fn(createPost,
  { reactivityKeys: { posts: ["*"] } }
)

export const deletePost = Effect.fn(function* (postId: number) {
  return yield* executeGraphQL(DeletePostMutation, {id: postId})
})

export const deletePostAtom = runtime.fn(deletePost,
  { reactivityKeys: { posts: ["*"] } }
)