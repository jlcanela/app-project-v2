import { IconPlus } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Switch,
  Table,
  Text,
  Title,
} from '@mantine/core';

export const Route = createFileRoute('/governance/access')({
  component: AccessPage,
});

// Mock Users
const USERS = [
  {
    id: 'u1',
    name: 'Alice Johnson',
    email: 'alice@company.com',
    role: 'Senior BA',
    permissions: ['Manage Schemas', 'Publish Rules', 'Edit Logic'],
    active: true,
  },
  {
    id: 'u2',
    name: 'Bob Smith',
    email: 'bob@company.com',
    role: 'Junior BA',
    permissions: ['Edit Logic', 'Simulate'],
    active: true,
  },
  {
    id: 'u3',
    name: 'Charlie Dev',
    email: 'charlie@company.com',
    role: 'Developer',
    permissions: ['View All', 'Manage Infrastructure'],
    active: false,
  },
];

function AccessPage() {
  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Access Control</Title>
          <Text c="dimmed">Manage user roles and permissions.</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />}>Add User</Button>
      </Group>

      <Card withBorder padding="0">
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>User</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Permissions</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {USERS.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar color="initials" name={user.name} radius="xl" />
                    <div>
                      <Text size="sm" fw={500}>
                        {user.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {user.email}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={
                      user.role === 'Senior BA'
                        ? 'blue'
                        : user.role === 'Junior BA'
                          ? 'cyan'
                          : 'gray'
                    }
                  >
                    {user.role}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    {user.permissions.slice(0, 2).map((p) => (
                      <Badge key={p} size="xs" variant="outline">
                        {p}
                      </Badge>
                    ))}
                    {user.permissions.length > 2 && (
                      <Badge size="xs" variant="outline">
                        +{user.permissions.length - 2}
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Switch checked={user.active} onLabel="ON" offLabel="OFF" size="sm" />
                </Table.Td>
                <Table.Td>
                  <Button variant="subtle" size="xs">
                    Edit
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Container>
  );
}
