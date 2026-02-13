import { Result, useAtomValue } from '@effect-atom/atom-react'
import { Box, Button, Group, NavLink, ScrollArea, Stack, Title } from '@mantine/core'
import { usersAtom } from './store'

import { graphql } from '@/graphql'

export const GetUsers = graphql(`
  query GetUsers {
    users(orderBy: { name: { direction: asc, priority: 1 } }) {
      id
      name
    }
  }
`)

interface UsersSidebarProps {
  selectedUserId: number | null
  setSelectedUserId: (id: number | null) => void
  onAddUser: () => void
}

export function UsersSidebar({
  selectedUserId,
  setSelectedUserId,
  onAddUser,
}: UsersSidebarProps) {
  const users = useAtomValue(usersAtom)

  return (
    <Box
      w={300}
      style={{
        borderRight: '1px solid var(--mantine-color-gray-3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Group justify="space-between">
          <Title order={4}>Users</Title>
          <Button size="xs" onClick={onAddUser}>
            + Add
          </Button>
        </Group>
      </Box>
      <ScrollArea style={{ flex: 1 }}>
        <Stack gap={0}>
          <NavLink
            label="All Users"
            active={selectedUserId === null}
            onClick={() => setSelectedUserId(null)}
            variant="filled"
          />
          {Result.builder(users).onSuccess((users) => users.map((user) => (
            <NavLink
              key={user.id}
              label={user.name}
              active={selectedUserId === user.id}
              onClick={() => {
                setSelectedUserId(user.id)
              }}
              variant="filled"
            />
          ))).render()}
        </Stack>
      </ScrollArea>
    </Box>
  )
}