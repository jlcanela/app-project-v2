
import { Atom, Result } from '@effect-atom/atom-react'
import { executeGraphQL } from '@/graphql/execute'
import { graphql } from '@/graphql/gql'
import { Effect } from 'effect'

// Mock Data
export const usersAtom = Atom.make(executeGraphQL(graphql(`
  query GetUsers {
    users(orderBy: { name: { direction: asc, priority: 1 } }) {
      id
      name
    }
  }
`)).pipe(
  Effect.map((result) => result.data?.users ?? []),
))

export const selectedUserIdAtom = Atom.make<number | null>(null)

export const selectedUserAtom = Atom.make((get) => {
  const usersResult = get(usersAtom);
  const selectedId = get(selectedUserIdAtom);

  if (selectedId === null) {
    return undefined;
  }

   const users = Result.getOrElse(usersResult, () => []);

  return users.find((u) => u.id === selectedId);
});

export const postsAtom = Atom.make(executeGraphQL(graphql(`
  query GetPosts($where: PostsFilters) {
    posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {
      id
      content
      authorId
      author {
        name
      }
    }
  }`), { where: null}).pipe(
   Effect.map((result) => result.data?.posts ?? [])
))

export const selectedPostsAtom = Atom.make((get) => {
  const postsResult = get(postsAtom);
  const selectedId = get(selectedUserIdAtom);
  const posts = Result.getOrElse(postsResult, () => []);
  
  if (selectedId === null) {
    return posts;
  }

  return posts.filter((p) => p.authorId === selectedId);
});
