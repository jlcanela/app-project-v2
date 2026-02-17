import { createFileRoute } from '@tanstack/react-router'
import { Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { AddPostModal } from './(components)/AddPostModal'
import { AddUserModal } from './(components)/AddUserModal'
import { PostsMain } from './(components)/PostsMain'
import { UsersSidebar } from './(components)/UsersSidebar'
import { Result, useAtom, useAtomSet, useAtomValue } from '@effect-atom/atom-react'
import { createPostAtom, createUserAtom, deletePostAtom, selectedPostsAtom, selectedUserAtom, selectedUserIdAtom, usersAtom } from './(components)/store'
import { AuthorUserItemFragment, PostItemFragment, SelectedUserItemFragment, UserItemFragment } from '@/graphql/graphql'
import { Option } from 'effect'

export const Route = createFileRoute('/posts-and-users/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedUserId, setSelectedUserId] = useAtom(selectedUserIdAtom)
  const selectedUser = useAtomValue(selectedUserAtom) as unknown as Result.Result<Option.Option<SelectedUserItemFragment>>
  const selectedPosts = useAtomValue(selectedPostsAtom) as unknown as Result.Result<PostItemFragment[], string>

  // Modals
  const [openedUserModal, { open: openUserModal, close: closeUserModal }] =
    useDisclosure(false)
  const [openedPostModal, { open: openPostModal, close: closePostModal }] =
    useDisclosure(false)
    
    const onCreateUser = useAtomSet(createUserAtom)
    const onCreatePost = useAtomSet(createPostAtom)
    const onDeletePost = useAtomSet(deletePostAtom)

    const users = useAtomValue(usersAtom) as unknown as Result.Result<UserItemFragment[], string>

    return (
      <Box style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
        <AddUserModal opened={openedUserModal} onClose={closeUserModal} onCreateUser={onCreateUser} />
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
        />
    </Box>
  )
}
