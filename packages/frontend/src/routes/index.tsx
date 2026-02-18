import {
  IconArrowRight,
  IconBulb,
  IconDatabase,
  IconGitPullRequest,
  IconPlus,
} from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Overlay,
  SimpleGrid,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  const stats = [
    { title: 'Total Rules', value: '124', icon: IconBulb, color: 'blue' },
    { title: 'Domain Schemas', value: '32', icon: IconDatabase, color: 'teal' },
    { title: 'Pending Reviews', value: '5', icon: IconGitPullRequest, color: 'orange' },
  ];

  const recentActivity = [
    { id: 1, action: 'Rule Updated', target: 'DiscountCalculation', time: '2 hours ago' },
    { id: 2, action: 'Schema Modified', target: 'CartState', time: '5 hours ago' },
    { id: 3, action: 'New Rule Created', target: 'ShippingValidation', time: '1 day ago' },
  ];

  return (
    <Box pos="relative">
      <Container size="xl" py="md">
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2}>Dashboard</Title>
            <Text c="dimmed">Welcome back to Rule Studio.</Text>
          </div>
          <Button
            component={Link}
            to="/rules/instances"
            leftSection={<IconPlus size={16} />}
            variant="filled"
          >
            New Rule
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
          {stats.map((stat) => (
            <Card key={stat.title} withBorder padding="lg" radius="md">
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                    {stat.title}
                  </Text>
                  <Text fw={700} size="xl">
                    {stat.value}
                  </Text>
                </div>
                <ThemeIcon color={stat.color} variant="light" size="xl" radius="md">
                  <stat.icon size={24} />
                </ThemeIcon>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Card withBorder radius="md" padding="lg">
            <Group justify="space-between" mb="md">
              <Title order={4}>Recent Activity</Title>
              <Button variant="subtle" size="xs" rightSection={<IconArrowRight size={14} />}>
                View all
              </Button>
            </Group>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Target</Table.Th>
                  <Table.Th>Time</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentActivity.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Badge variant="light" size="sm">
                        {item.action}
                      </Badge>
                    </Table.Td>
                    <Table.Td fw={500}>{item.target}</Table.Td>
                    <Table.Td c="dimmed">{item.time}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>

          <Card withBorder radius="md" padding="lg">
            <Title order={4} mb="md">
              Quick Links
            </Title>
            <SimpleGrid cols={2}>
              <Button component={Link} to="/catalog/states" variant="default" h={60} fullWidth>
                Manage States
              </Button>
              <Button component={Link} to="/catalog/events" variant="default" h={60} fullWidth>
                Manage Events
              </Button>
              <Button component={Link} to="/rules/types" variant="default" h={60} fullWidth>
                Rule Types
              </Button>
              <Button component={Link} to="/governance/history" variant="default" h={60} fullWidth>
                Audit Logs
              </Button>
            </SimpleGrid>
          </Card>
        </SimpleGrid>
        <Overlay
          color="#FFFFFF"
          backgroundOpacity={0.2}
          blur={0.1}
          zIndex={10}
          // optional: flex center your text
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Text
            fw={900}
            c="gray"
            style={{
              // Huge, responsive font size
              fontSize: 'clamp(5rem, 15vw, 12rem)',
              opacity: 0.08,
              letterSpacing: 12,
              textTransform: 'uppercase',
            }}
          >
            FAKE
          </Text>
        </Overlay>
      </Container>
    </Box>
  );
}
