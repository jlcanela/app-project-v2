import { useEffect } from 'react'
import { Atom, Result, useAtom, useAtomSet, useAtomValue } from '@effect-atom/atom-react'
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core'
import { createPostAtom, usersAtom } from './store'
import { graphql } from '@/graphql'
import { AuthorUserItemFragment } from '@/graphql/graphql'

interface AddPostModalProps {
  opened: boolean
  onClose: () => void
  defaultAuthorId: number | null
}

export const AuthorUserItem = graphql(`
  fragment AuthorUserItem on UsersSelectItem {
    id
    name
  }
`)

const postContentAtom = Atom.make('')
const newPostAuthorIdAtom = Atom.make<string | null>(null)

export function AddPostModal({
  opened,
  onClose,
  defaultAuthorId,
}: AddPostModalProps) {
    const createPost = useAtomSet(createPostAtom)
  const users = useAtomValue(usersAtom) as Result.Result<AuthorUserItemFragment[]>

  const [newPostContent, setNewPostContent] = useAtom(postContentAtom)
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
    createPost({
      content: newPostContent,
      authorId: parseInt(newPostAuthorId, 10),
    })
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Create Post">
      <Stack>
        {
          Result.builder(users).onSuccess((users) => <Select
          label="Author"
          placeholder="Select author"
          data={users.map((u) => ({
            value: u.id.toString(),
            label: u.name,
          }))}
          value={newPostAuthorId}
          onChange={setNewPostAuthorId}
        />).render()
        }
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