import { useEffect, useState } from 'react'
import { useAtom } from '@effect-atom/atom-react'
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core'
import { postsAtom, usersAtom } from './store'

interface AddPostModalProps {
  opened: boolean
  onClose: () => void
  defaultAuthorId: number | null
}

export function AddPostModal({
  opened,
  onClose,
  defaultAuthorId,
}: AddPostModalProps) {
  const [users] = useAtom(usersAtom)
  const [, setPosts] = useAtom(postsAtom)

  const [newPostContent, setNewPostContent] = useState('')
  const [newPostAuthorId, setNewPostAuthorId] = useState<string | null>(null)

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
    const author = users.find((u) => u.id === parseInt(newPostAuthorId, 10))
    const newPost = {
      id: Date.now(),
      content: newPostContent,
      authorId: parseInt(newPostAuthorId, 10),
      author: { name: author?.name || 'Unknown' },
    }
    setPosts((prev) => [newPost, ...prev])
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