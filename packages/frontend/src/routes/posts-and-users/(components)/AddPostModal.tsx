import { useEffect } from 'react'
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core'

import { graphql } from '@/graphql'
import { AuthorUserItemFragment } from '@/graphql/graphql'
import { Atom, useAtom } from '@effect-atom/atom-react'

export const AuthorUserItem = graphql(`
  fragment AuthorUserItem on UsersSelectItem {
    id
    name
  }
`)

export interface AddPostModalProps {
  opened: boolean
  onClose: () => void
  defaultAuthorId: number | null
  users: AuthorUserItemFragment[]
  onCreatePost: (values: { content: string; authorId: number }) => void
}

const newPostContentAtom = Atom.make('')
const newPostAuthorIdAtom = Atom.make<string | null>(null)

export function AddPostModal({
  opened,
  onClose,
  defaultAuthorId,
  users,
  onCreatePost,
}: AddPostModalProps) {
  const [newPostContent, setNewPostContent] = useAtom(newPostContentAtom)
  const [newPostAuthorId, setNewPostAuthorId] = useAtom(newPostAuthorIdAtom)

  useEffect(() => {
    if (opened) {
      setNewPostAuthorId(defaultAuthorId ? defaultAuthorId.toString() : null)
      setNewPostContent('')
    }
  }, [opened, defaultAuthorId])

  const handleAddPost = () => {
    if (!newPostContent.trim() || !newPostAuthorId) {
      return
    }
    onCreatePost({
      content: newPostContent,
      authorId: parseInt(newPostAuthorId, 10),
    })
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Create Post">
      <Stack>
        <Select
          label="Author"
          placeholder="Select author"
          data={users.map((u) => ({
            value: u.id.toString(),
            label: u.name,
          }))}
          value={newPostAuthorId}
          onChange={setNewPostAuthorId}
        />
        <TextInput
          label="Content"
          placeholder="What's on your mind?"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.currentTarget.value)}
          data-autofocus
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddPost}>Post</Button>
        </Group>
      </Stack>
    </Modal>
  )
}