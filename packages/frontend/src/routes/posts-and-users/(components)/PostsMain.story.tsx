import { Option } from 'effect';
import { AsyncResult } from 'effect/unstable/reactivity';
import { PostItemFragment, SelectedUserItemFragment } from '@/graphql/graphql';
import { PostsMain, type PostsMainProps } from './PostsMain';

export default {
  title: 'PostsAndUsers/PostsMain',
  tags: ['autodocs'],
};

const defaultPosts = AsyncResult.success<PostItemFragment[], string>([
  { id: 1, content: 'Hello world!', authorId: 1, author: { name: 'Alice' } },
  { id: 2, content: 'Effect is great', authorId: 2, author: { name: 'Bob' } },
]);

const defaultUser = AsyncResult.success<Option.Option<SelectedUserItemFragment>>(
  Option.some({ id: 1, name: 'Alice' })
);

const baseProps: PostsMainProps = {
  onCreatePost: () => {},
  onDeletePost: () => {},
  selectedPosts: defaultPosts,
  selectedUser: AsyncResult.success(Option.none()),
};

export const AllPosts = () => <PostsMain {...baseProps} />;

export const SelectedUserPosts = () => (
  <PostsMain
    {...baseProps}
    selectedUser={defaultUser}
    selectedPosts={AsyncResult.success([
      { id: 1, content: 'Hello world!', authorId: 1, author: { name: 'Alice' } },
    ])}
  />
);

export const Loading = () => <PostsMain {...baseProps} selectedPosts={AsyncResult.initial(true)} />;

export const WithError = () => (
  <PostsMain {...baseProps} selectedPosts={AsyncResult.fail('Failed to load posts')} />
);

export const Empty = () => <PostsMain {...baseProps} selectedPosts={AsyncResult.success([])} />;
