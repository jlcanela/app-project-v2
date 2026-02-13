
import { Atom, Result } from '@effect-atom/atom-react'
import { executeGraphQL } from '@/graphql/execute'
import { graphql } from '@/graphql/gql'
import { Effect } from 'effect'

const GetUsers = graphql(`
  query GetUsers {
    users(orderBy: { name: { direction: asc, priority: 1 } }) {
      id
      name
    }
  }
`)

const GetPosts = graphql(`
  query GetPosts($where: PostsFilters) {
    posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {
      id
      content
      authorId
      author {
        name
      }
    }
  }`)

export const selectedUserIdAtom = Atom.make<number | null>(null)

export const usersAtom = Atom.make(executeGraphQL(GetUsers).pipe(
  Effect.map((result) => result.data?.users ?? []),
))

export const postsAtom = Atom.make(executeGraphQL(GetPosts, { where: null }).pipe(
  Effect.map((result) => result.data?.posts ?? [])
))


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
