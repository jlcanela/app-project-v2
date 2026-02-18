import { Result, useAtom, useAtomSet, useAtomValue } from '@effect-atom/atom-react';
import { createFileRoute } from '@tanstack/react-router';
import { Option } from 'effect';
import { Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Sidebar } from '@/components/Sidebar';
import { graphql } from '@/graphql';
import {
  AuthorUserItemFragment,
  PostItemFragment,
  SelectedUserItemFragment,
  UserItemFragment,
} from '@/graphql/graphql';
import { AddPostModal } from './(components)/AddPostModal';
import { AddUserModal } from './(components)/AddUserModal';
import {
  createPostAtom,
  createUserAtom,
  deletePostAtom,
  selectedPostsAtom,
  selectedUserAtom,
  selectedUserIdAtom,
  usersAtom,
} from './(components)/atoms';
import { PostsMain } from './(components)/PostsMain';

export const UserItem = graphql(/* GraphQL */ `
  fragment UserItem on UsersSelectItem {
    id
    name
  }
`);

const RouteComponent = () => {
  const [selectedUserId, setSelectedUserId] = useAtom(selectedUserIdAtom);
  const selectedUser = useAtomValue(selectedUserAtom) as unknown as Result.Result<
    Option.Option<SelectedUserItemFragment>
  >;
  const selectedPosts = useAtomValue(selectedPostsAtom) as unknown as Result.Result<
    PostItemFragment[],
    string
  >;

  // Modals
  const [openedUserModal, { open: openUserModal, close: closeUserModal }] = useDisclosure(false);
  const [openedPostModal, { open: openPostModal, close: closePostModal }] = useDisclosure(false);

  const onCreateUser = useAtomSet(createUserAtom);
  const onCreatePost = useAtomSet(createPostAtom);
  const onDeletePost = useAtomSet(deletePostAtom);

  const users = useAtomValue(usersAtom) as unknown as Result.Result<UserItemFragment[], string>;

  return (
    <Box style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <AddUserModal opened={openedUserModal} onClose={closeUserModal} onCreateUser={onCreateUser} />
      <Sidebar<UserItemFragment, number>
        title="Users"
        allLabel="All Users"
        selectedId={selectedUserId}
        onSelect={setSelectedUserId}
        onAdd={openUserModal}
        items={users}
        getKey={(u: UserItemFragment) => u.id}
        getLabel={(u: UserItemFragment) => u.name}
      />
      <PostsMain
        selectedPosts={selectedPosts}
        selectedUser={selectedUser}
        onCreatePost={openPostModal}
        onDeletePost={onDeletePost}
      />
      <AddPostModal
        users={Result.getOrElse(users, () => []) as unknown as AuthorUserItemFragment[]}
        opened={openedPostModal}
        onClose={closePostModal}
        onCreatePost={onCreatePost}
        defaultAuthorId={selectedUserId}
      />
    </Box>
  );
};

export const Route = createFileRoute('/posts-and-users/')({
  component: RouteComponent,
});
