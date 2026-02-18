import { Result } from '@effect-atom/atom-react';
import { Option } from 'effect';
import { Avatar, Box, Button, Card, Group, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { graphql } from '@/graphql';
import { PostItemFragment, SelectedUserItemFragment } from '@/graphql/graphql';

export const PostItem = graphql(/* GraphQL */ `
  fragment PostItem on PostsSelectItem {
    id
    content
    authorId
    author {
      name
    }
  }
`);

export const SelectedUserItem = graphql(/* GraphQL */ `
  fragment SelectedUserItem on UsersSelectItem {
    id
    name
  }
`);

export interface PostsMainProps {
  onCreatePost: () => void;
  onDeletePost: (id: number) => void;
  selectedPosts: Result.Result<PostItemFragment[], string>;
  selectedUser: Result.Result<Option.Option<SelectedUserItemFragment>, string>;
}

export function PostsMain({
  selectedUser,
  selectedPosts,
  onCreatePost,
  onDeletePost,
}: PostsMainProps) {
  const handleDeletePost = (id: number) => {
    onDeletePost(id);
  };

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
            {Result.match(selectedUser, {
              onInitial: () => 'Posts',
              onFailure: () => 'Posts',
              onSuccess: ({ value }) =>
                Option.match(value, {
                  onNone: () => 'All Posts',
                  onSome: (value) => `Posts by ${value?.name}`,
                }),
            })}
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
            onSuccess: ({ value }) =>
              value.length === 0 ? (
                <Text c="dimmed" ta="center" mt="xl">
                  No posts found.
                </Text>
              ) : (
                value.map((post) => (
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
              ),
          })}
        </Stack>
      </ScrollArea>
    </Box>
  );
}
