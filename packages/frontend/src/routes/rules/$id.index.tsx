import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Code,
  Group,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconAlertCircle,
  IconCheck,
  IconDeviceFloppy,
  IconLayoutSidebarRight,
  IconLayoutSidebarRightCollapse,
  IconPlayerPlay,
} from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

// Mock Component for JDM Editor to simulate integration
const DecisionGraph = ({ value, onChange }: { value: any; onChange: (val: any) => void }) => (
  <div
    style={{
      height: '100%',
      width: '100%',
      backgroundColor: 'var(--mantine-color-gray-0)',
      backgroundImage: 'radial-gradient(var(--mantine-color-gray-3) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}
  >
    <Stack align="center" gap="xs">
      <Text fw={500} c="dimmed">
        GoRules JDM Editor Canvas
      </Text>
      <Text size="xs" c="dimmed">
        (Graph State: {Object.keys(value?.nodes || {}).length} nodes)
      </Text>
      <Button variant="subtle" size="xs" onClick={() => onChange({ nodes: { a: 1 } })}>
        Simulate Change
      </Button>
    </Stack>
  </div>
)

export const Route = createFileRoute('/rules/$id/')({
  component: RuleEditorPage,
})

function RuleEditorPage() {
  const { id } = Route.useParams()
  const [graph, setGraph] = useState({ nodes: [], edges: [] })
  const [asideOpen, { toggle: toggleAside }] = useDisclosure(true)

  // Mock Context Data derived from the Rule Type (IN/OUT Contract)
  const inputSchema = {
    cart: {
      items: [{ id: 'string', price: 'number' }],
      total: 'number',
    },
    user: {
      tier: 'string',
      points: 'number',
    },
  }

  const allowedActions = [
    { type: 'UpdateState', target: 'CartState' },
    { type: 'TriggerEvent', target: 'DiscountApplied' },
  ]

  return (
    <Stack h="calc(100vh - 100px)" gap={0}>
      {/* Top Toolbar */}
      <Group
        justify="space-between"
        px="md"
        py="sm"
        style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
      >
        <Group>
          <div>
            <Group gap="xs">
              <Title order={4}>DiscountCalculation</Title>
              <Badge variant="light">v1.0.2</Badge>
            </Group>
            <Text size="xs" c="dimmed">
              ID: {id} • Type: PricingRule
            </Text>
          </div>
        </Group>

        <Group>
          <Button variant="default" leftSection={<IconCheck size={16} />} color="green">
            Validate
          </Button>
          <Button
            component={Link}
            to={`/rules/${id}/simulate`}
            variant="default"
            leftSection={<IconPlayerPlay size={16} />}
          >
            Simulate
          </Button>
          <Button leftSection={<IconDeviceFloppy size={16} />}>Save</Button>
          <ActionIcon variant="subtle" color="gray" onClick={toggleAside} size="lg">
            {asideOpen ? (
              <IconLayoutSidebarRightCollapse size={20} />
            ) : (
              <IconLayoutSidebarRight size={20} />
            )}
          </ActionIcon>
        </Group>
      </Group>

      {/* Main Editor Layout */}
      <Group align="flex-start" gap={0} style={{ flex: 1, overflow: 'hidden' }}>
        {/* Canvas Area */}
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
          <DecisionGraph value={graph} onChange={setGraph} />
        </div>

        {/* Right Sidebar (Context Helper) */}
        {asideOpen && (
          <Stack
            w={320}
            h="100%"
            style={{ borderLeft: '1px solid var(--mantine-color-gray-3)' }}
            bg="white"
            gap={0}
          >
            <Tabs defaultValue="inputs" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Tabs.List>
                <Tabs.Tab value="inputs">Inputs</Tabs.Tab>
                <Tabs.Tab value="actions">Actions</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="inputs" style={{ flex: 1, overflow: 'hidden' }}>
                <ScrollArea h="100%" p="md">
                  <Text size="sm" fw={500} mb="xs">
                    Available Inputs
                  </Text>
                  <Text size="xs" c="dimmed" mb="md">
                    Drag fields into expression nodes.
                  </Text>
                  <Stack gap="xs">
                    {Object.entries(inputSchema).map(([key, value]) => (
                      <Card key={key} withBorder padding="xs" radius="sm">
                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            {key}
                          </Text>
                          <Badge size="xs" variant="outline">
                            Object
                          </Badge>
                        </Group>
                        <Stack gap={4} mt="xs" ml="xs">
                          {Object.keys(value).map((field) => (
                            <Group key={field} gap="xs">
                              <Code fz="xs">{field}</Code>
                              <Text size="xs" c="dimmed">
                                {typeof (value as any)[field]}
                              </Text>
                            </Group>
                          ))}
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </ScrollArea>
              </Tabs.Panel>

              <Tabs.Panel value="actions" style={{ flex: 1, overflow: 'hidden' }}>
                <ScrollArea h="100%" p="md">
                  <Text size="sm" fw={500} mb="xs">
                    Allowed Actions
                  </Text>
                  <Text size="xs" c="dimmed" mb="md">
                    This rule is restricted to these side-effects.
                  </Text>
                  <Stack gap="xs">
                    {allowedActions.map((action, i) => (
                      <Card
                        key={i}
                        withBorder
                        padding="xs"
                        radius="sm"
                        bg="var(--mantine-color-gray-0)"
                      >
                        <Group gap="xs" mb={4}>
                          <IconAlertCircle size={14} color="var(--mantine-color-blue-6)" />
                          <Text size="sm" fw={500}>
                            {action.type}
                          </Text>
                        </Group>
                        <Text size="xs">Target: {action.target}</Text>
                      </Card>
                    ))}
                  </Stack>
                </ScrollArea>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        )}
      </Group>
    </Stack>
  )
}