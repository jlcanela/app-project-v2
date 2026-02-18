import { Result } from '@effect-atom/atom-react';
import { createFileRoute } from '@tanstack/react-router';
import { Box } from '@mantine/core';
import { Sidebar } from '@/components/Sidebar';
import { graphql } from '@/graphql';
import { RuleItemFragment } from '@/graphql/graphql';

//import { useDisclosure } from '@mantine/hooks'
// import { AddPostModal } from './(components)/AddPostModal'
// import { AddUserModal } from './(components)/AddUserModal'
// import { PostsMain } from './(components)/PostsMain'
//import { RulesSidebar } from './(components)/RulesSidebar'
//import { Result, useAtom, useAtomSet, useAtomValue } from '@effect-atom/atom-react'
//import { createPostAtom, createUserAtom, deletePostAtom, selectedPostsAtom, selectedUserAtom, selectedUserIdAtom, usersAtom } from './(components)/atoms'
//import { AuthorUserItemFragment, PostItemFragment, SelectedUserItemFragment, UserItemFragment } from '@/graphql/graphql'
//import { Option } from 'effect'

export const Route = createFileRoute('/rules/')({
  component: RouteComponent,
});

export const RuleItem = graphql(/* GraphQL */ `
  fragment RuleItem on RuleInstancesSelectItem {
    ruleId
    name
  }
`);

function RouteComponent() {
  // const [selectedUserId, setSelectedUserId] = useAtom(selectedUserIdAtom)
  // const selectedUser = useAtomValue(selectedUserAtom) as unknown as Result.Result<Option.Option<SelectedUserItemFragment>>
  // const selectedPosts = useAtomValue(selectedPostsAtom) as unknown as Result.Result<PostItemFragment[], string>

  // // Modals
  // const [openedUserModal, { open: openUserModal, close: closeUserModal }] =
  //   useDisclosure(false)
  // const [openedPostModal, { open: openPostModal, close: closePostModal }] =
  //   useDisclosure(false)

  //   const onCreateUser = useAtomSet(createUserAtom)
  //   const onCreatePost = useAtomSet(createPostAtom)
  //   const onDeletePost = useAtomSet(deletePostAtom)

  //   const users = useAtomValue(usersAtom) as unknown as Result.Result<UserItemFragment[], string>
  const selectedRuleId = null;
  const setSelectedRuleTypeId = () => {};
  const openRuleModal = () => {};
  const rules = Result.success<RuleItemFragment[], string>([]);

  return (
    <Box style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Sidebar<RuleItemFragment, number>
        title="Rules"
        allLabel="All Rules"
        selectedId={selectedRuleId}
        onSelect={setSelectedRuleTypeId}
        onAdd={openRuleModal}
        items={rules}
        getKey={(u: RuleItemFragment) => u.ruleId}
        getLabel={(u: RuleItemFragment) => u.name as string}
      />
      {/*       <AddUserModal opened={openedUserModal} onClose={closeUserModal} onCreateUser={onCreateUser} />
      <UsersSidebar
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        onAddUser={openUserModal}
        users={users}
      />
      <PostsMain selectedPosts={selectedPosts} selectedUser={selectedUser} onCreatePost={openPostModal} onDeletePost={onDeletePost} />
        <AddPostModal
          users={Result.getOrElse(users, () => []) as unknown as AuthorUserItemFragment[]}
          opened={openedPostModal}
          onClose={closePostModal}
          onCreatePost={onCreatePost}
          defaultAuthorId={selectedUserId}
        /> */}
    </Box>
  );
}
