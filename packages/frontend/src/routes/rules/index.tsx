import { Result, useAtom, useAtomSet, useAtomValue } from '@effect-atom/atom-react';
import { createFileRoute } from '@tanstack/react-router';
import { Option } from 'effect';
import { Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Sidebar } from '@/components/Sidebar';
import { graphql } from '@/graphql';
import { RuleItemFragment } from '@/graphql/graphql';
import { AddRuleModal } from './(components)/AddRuleModal';
import {
  createRuleAtom,
  rulesAtom,
  selectedRuleAtom,
  selectedRuleIdAtom,
} from './(components)/atoms';
import { RuleDetail } from './(components)/RuleDetail';

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
    description
  }
`);

function RouteComponent() {
  // const [selectedUserId, setSelectedUserId] = useAtom(selectedUserIdAtom)
  // const selectedUser = useAtomValue(selectedUserAtom) as unknown as Result.Result<Option.Option<SelectedUserItemFragment>>
  // const selectedPosts = useAtomValue(selectedPostsAtom) as unknown as Result.Result<PostItemFragment[], string>
  const [selectedRuleId, setSelectedRuleId] = useAtom(selectedRuleIdAtom);
  const selectedRule = useAtomValue(selectedRuleAtom) as unknown as Result.Result<
    Option.Option<RuleItemFragment>
  >;

  // // Modals
  const [openedRuleModal, { open: openRuleModal, close: closeRuleModal }] = useDisclosure(false);
  // const [openedPostModal, { open: openPostModal, close: closePostModal }] =
  //   useDisclosure(false)

  const ruleTypes = [
    { ruleTypeId: 1, name: 'Rule1', schemaIn: '[]', schemaOut: '[]' },
    { ruleTypeId: 2, name: 'Rule2', schemaIn: '[]', schemaOut: '[]' },
  ];

  //   const onCreateUser = useAtomSet(createUserAtom)
  //   const onCreatePost = useAtomSet(createPostAtom)
  //   const onDeletePost = useAtomSet(deletePostAtom)

  //   const users = useAtomValue(usersAtom) as unknown as Result.Result<UserItemFragment[], string>

  //  const setSelectedRuleTypeId = () => { };
  const onCreateRule = useAtomSet(createRuleAtom);

  // const openRuleModal = () => {};
  const rules = useAtomValue(rulesAtom) as unknown as Result.Result<RuleItemFragment[], string>;

  return (
    <Box style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Sidebar<RuleItemFragment, number>
        title="Rules"
        allLabel="All Rules"
        selectedId={selectedRuleId}
        onSelect={setSelectedRuleId}
        onAdd={openRuleModal}
        items={rules}
        getKey={(u: RuleItemFragment) => u.ruleId}
        getLabel={(u: RuleItemFragment) => u.name as string}
      />
      <AddRuleModal
        opened={openedRuleModal}
        onClose={closeRuleModal}
        onCreateRule={onCreateRule}
        ruleTypes={ruleTypes}
      />
      {Result.match(selectedRule, {
        onInitial: () => '',
        onFailure: () => '',
        onSuccess: (success) =>
          Option.match(success.value, {
            onNone: () => '',
            onSome: () => <RuleDetail /*rule={value}*/ />,
          }),
      })}
      {/* 
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
