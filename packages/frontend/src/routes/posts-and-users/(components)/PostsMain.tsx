import { Result, useAtomSet, useAtomValue } from '@effect-atom/atom-react'
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
import { deletePostAtom, selectedPostsAtom, selectedUserAtom } from './store'
import { PostItemFragment, SelectedUserItemFragment } from '@/graphql/graphql'

export const PostItem = graphql(/* GraphQL */ `
  fragment PostItem on PostsSelectItem {
    id
    content
    authorId
    author {
      name
    }
  }
`)

export const SelectedUserItem = graphql(/* GraphQL */ `
  fragment SelectedUserItem on UsersSelectItem {
    id
    name
  }
`)


interface PostsMainProps {
  selectedUserId: number | null
  onCreatePost: () => void
}

export function PostsMain({ selectedUserId, onCreatePost }: PostsMainProps) {
  const selectedPosts = useAtomValue(selectedPostsAtom) as Result.Result<PostItemFragment[]>
  const selectedUser = useAtomValue(selectedUserAtom) as Result.Result<SelectedUserItemFragment>
  const deletePost = useAtomSet(deletePostAtom)

  const handleDeletePost = (id: number) => {
    deletePost(id)
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
            {selectedUserId ?
              Result.match(selectedUser, {
                onInitial: () => 'Posts',
                onFailure: () => 'Posts',
                onSuccess: ({ value }) => `Posts by ${value?.name}`
              }) : 'All Posts'
            }
          </Title>
          <Button onClick={onCreatePost}>Create Post</Button>
        </Group>
      </Box>
      <ScrollArea p="md" style={{ flex: 1 }}>
        <Stack>
          {Result.match(selectedPosts, {
            onInitial: () => (
              <Text c="dimmed" ta="center" mt="xl">
                Loading...
              </Text>
            ),
            onFailure: () => (
              <Text c="dimmed" ta="center" mt="xl">
                Error loading posts.
              </Text>
            ),
            onSuccess: ({ value }) => value.length === 0 ? (<Text c="dimmed" ta="center" mt="xl">
              No posts found.
            </Text>) : value.map((post) => (
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
            ))
          })}
        </Stack>
      </ScrollArea>
    </Box>
  )
}