import {
  Badge,
  Card,
  Container,
  Group,
  Select,
  Text,
  Timeline,
  Title,
} from '@mantine/core'
import { IconGitCommit, IconUser } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/governance/history')({
  component: HistoryPage,
})

// Mock Audit Data
const AUDIT_LOGS = [
  {
    id: 'log-1',
    action: 'Rule Published',
    target: 'DiscountCalculation',
    targetType: 'Rule',
    user: 'Alice (Senior BA)',
    timestamp: '2023-10-25 14:30',
    version: 'v1.0.2',
    details: 'Promoted to Production',
  },
  {
    id: 'log-2',
    action: 'Schema Updated',
    target: 'CartState',
    targetType: 'Schema',
    user: 'Bob (Dev)',
    timestamp: '2023-10-24 09:15',
    version: 'v1.1.0',
    details: 'Added "loyaltyPoints" field',
  },
  {
    id: 'log-3',
    action: 'Rule Created',
    target: 'ShippingValidation',
    targetType: 'Rule',
    user: 'Alice (Senior BA)',
    timestamp: '2023-10-23 16:45',
    version: 'v0.0.1',
    details: 'Initial Draft',
  },
]

function HistoryPage() {
  const [filter, setFilter] = useState<string | null>('All')

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Version History & Audit</Title>
          <Text c="dimmed">Track changes across rules and schemas.</Text>
        </div>
        <Select
          placeholder="Filter by Type"
          data={['All', 'Rule', 'Schema', 'Access']}
          value={filter}
          onChange={setFilter}
        />
      </Group>

      <Card withBorder padding="lg">
        <Timeline active={AUDIT_LOGS.length} bulletSize={24} lineWidth={2}>
          {AUDIT_LOGS.map((log) => (
            <Timeline.Item
              key={log.id}
              bullet={<IconGitCommit size={12} />}
              title={
                <Group gap="xs">
                  <Text fw={500}>{log.action}</Text>
                  <Badge variant="light" color="gray">
                    {log.version}
                  </Badge>
                </Group>
              }
            >
              <Text c="dimmed" size="sm">
                {log.target} ({log.targetType})
              </Text>
              <Text size="xs" mt={4}>
                {log.details}
              </Text>
              <Group gap="xs" mt={4}>
                <IconUser size={12} style={{ opacity: 0.5 }} />
                <Text size="xs" c="dimmed">
                  {log.user} • {log.timestamp}
                </Text>
              </Group>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </Container>
  )
}