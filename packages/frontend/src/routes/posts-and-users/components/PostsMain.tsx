import { useAtomValue } from '@effect-atom/atom-react'
import {
  Avatar,
  Box,
  Button,
  Card,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core'

import { graphql } from '@/graphql'
import {  selectedPostsAtom, selectedUserAtom } from './store'

export const GetPosts = graphql(`
  query GetPosts($where: PostsFilters) {
  posts(where: $where, orderBy: { id: { direction: desc, priority: 1 } }) {
    id
    content
    authorId
    author {
      name
    }
  }
}`)

interface PostsMainProps {
  selectedUserId: number | null
  onCreatePost: () => void
}

export function PostsMain({ selectedUserId, onCreatePost }: PostsMainProps) {
  const selectedPosts = useAtomValue(selectedPostsAtom)
  const selectedUser = useAtomValue(selectedUserAtom)
  const handleDeletePost = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <Box
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--mantine-color-gray-0)',
      }}
    >
      <Box
        p="md"
        style={{
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Group justify="space-between">
          <Title order={3}>
            {selectedUserId
              ? `Posts by ${selectedUser?.name}`
              : 'All Posts'}
          </Title>
          <Button onClick={onCreatePost}>Create Post</Button>
        </Group>
      </Box>
      <ScrollArea p="md" style={{ flex: 1 }}>
        <Stack>
          {selectedPosts.map((post) => (          
            <Card key={post.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Group>
                  <Avatar color="blue" radius="xl">
                    {post.author?.name[0]}
                  </Avatar>
                  <Text fw={500}>{post.author?.name}</Text>
                </Group>
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  onClick={() => handleDeletePost(post.id)}
                >
                  Delete
                </Button>
              </Group>
              <Text size="sm" c="dimmed">
                {post.content}
              </Text>
            </Card>
          ))}
          {selectedPosts.length === 0 && (
            <Text c="dimmed" ta="center" mt="xl">
              No posts found.
            </Text>
          )}                   
        </Stack>
      </ScrollArea>
    </Box>
  )
}