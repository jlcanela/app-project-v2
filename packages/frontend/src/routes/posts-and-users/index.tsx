import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { AddPostModal } from './components/AddPostModal'
import { AddUserModal } from './components/AddUserModal'
import { PostsMain } from './components/PostsMain'
import { UsersSidebar } from './components/UsersSidebar'
import { Atom, useAtom } from '@effect-atom/atom-react'
import { selectedUserIdAtom } from './components/store'

export const Route = createFileRoute('/posts-and-users/')({
  component: RouteComponent,
})



function RouteComponent() {
  const [selectedUserId, setSelectedUserId] = useAtom(selectedUserIdAtom)
  
  // Modals
  const [openedUserModal, { open: openUserModal, close: closeUserModal }] =
    useDisclosure(false)
  const [openedPostModal, { open: openPostModal, close: closePostModal }] =
    useDisclosure(false)
    
    // <AddPostModal
    //   opened={openedPostModal}
    //   onClose={closePostModal}
    //   defaultAuthorId={selectedUserId}
    // />
    //<AddUserModal opened={openedUserModal} onClose={closeUserModal} />
    return (
      <Box style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <UsersSidebar
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        onAddUser={openUserModal}
      />
      <PostsMain selectedUserId={selectedUserId} onCreatePost={openPostModal} />
    </Box>
  )
}
