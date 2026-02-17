import { Result } from '@effect-atom/atom-react'
import { PostsMain, type PostsMainProps } from './PostsMain'
import { Option } from 'effect'
import { PostItemFragment, SelectedUserItemFragment } from '@/graphql/graphql'

export default {
  title: 'PostsAndUsers/PostsMain',
  tags: ['autodocs'],
}

const defaultPosts = Result.success<PostItemFragment[], string>([
  { id: 1, content: 'Hello world!', authorId: 1, author: { name: 'Alice' } },
  { id: 2, content: 'Effect is great', authorId: 2, author: { name: 'Bob' } },
])

const defaultUser = Result.success<Option.Option<SelectedUserItemFragment>>(Option.some({id: 1, name:"Alice"}))
// const noUser = Result.success(Option.none())

const baseProps: PostsMainProps = {
  onCreatePost: () => {},
  onDeletePost: () => {},
  selectedPosts: defaultPosts,
  selectedUser: defaultUser
}

export const AllPosts = () => <PostsMain {...baseProps} />

export const Loading = () => (
  <PostsMain {...baseProps} selectedPosts={Result.initial(true)} />
)

export const WithError = () => (
  <PostsMain {...baseProps} selectedPosts={Result.fail("Failed to load posts")} />
)

export const Empty = () => <PostsMain {...baseProps} selectedPosts={Result.success([])} />
