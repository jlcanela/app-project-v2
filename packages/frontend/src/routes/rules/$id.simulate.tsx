import { useState } from 'react';
import { IconBolt, IconDatabase, IconPlayerPlay } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Badge,
  Button,
  Card,
  Code,
  Container,
  Grid,
  Group,
  JsonInput,
  Paper,
  Select,
  Stack,
  Text,
  Timeline,
  Title,
} from '@mantine/core';

export const Route = createFileRoute('/rules/$id/simulate')({
  component: SimulatorPage,
});

// Mock Scenarios
const SCENARIOS = [
  {
    label: 'Scenario 1: High Value Cart (Premium)',
    value: 'scenario-1',
    data: {
      cart: { items: 5, total: 250.0 },
      user: { tier: 'premium', id: 'u-123' },
    },
  },
  {
    label: 'Scenario 2: Low Value Cart (Guest)',
    value: 'scenario-2',
    data: {
      cart: { items: 1, total: 25.0 },
      user: { tier: 'guest', id: 'u-999' },
    },
  },
];

function SimulatorPage() {
  const { id } = Route.useParams();
  const [inputJson, setInputJson] = useState(JSON.stringify(SCENARIOS[0].data, null, 2));
  const [selectedScenario, setSelectedScenario] = useState<string | null>(SCENARIOS[0].value);
  const [result, setResult] = useState<any>(null);

  const handleScenarioChange = (val: string | null) => {
    setSelectedScenario(val);
    const scenario = SCENARIOS.find((s) => s.value === val);
    if (scenario) {
      setInputJson(JSON.stringify(scenario.data, null, 2));
      setResult(null); // Reset result on input change
    }
  };

  const handleSimulate = () => {
    try {
      const input = JSON.parse(inputJson);
      // Mock Execution Logic
      const isEligible = input.cart.total > 100;

      const mockOutput = {
        result: {
          discount: isEligible ? 0.15 : 0,
          eligible: isEligible,
        },
        actions: isEligible
          ? [
              {
                type: 'UpdateState',
                target: 'CartState',
                payload: { discountApplied: true, newTotal: input.cart.total * 0.85 },
                timestamp: '10ms',
              },
              {
                type: 'TriggerEvent',
                target: 'DiscountApplied',
                payload: { amount: input.cart.total * 0.15 },
                timestamp: '15ms',
              },
            ]
          : [],
      };

      // Simulate network delay
      setTimeout(() => setResult(mockOutput), 300);
    } catch (e) {
      console.error('Invalid JSON Input:', e);
      //alert('Invalid JSON Input')
    }
  };

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Group gap="xs">
            <Title order={2}>Simulator</Title>
            <Badge variant="light" size="lg">
              {id}
            </Badge>
          </Group>
          <Text c="dimmed">Test rule logic with simulated inputs.</Text>
        </div>
        <Group>
          <Button variant="default" component={Link} to={`/rules/${id}`}>
            Back to Editor
          </Button>
          <Button leftSection={<IconPlayerPlay size={16} />} onClick={handleSimulate}>
            Run Simulation
          </Button>
        </Group>
      </Group>

      <Grid>
        {/* Left Column: Input */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder h="100%">
            <Title order={4} mb="md">
              Input Context
            </Title>
            <Stack>
              <Select
                label="Load Scenario"
                placeholder="Select a preset..."
                data={SCENARIOS}
                value={selectedScenario}
                onChange={handleScenarioChange}
              />

              <JsonInput
                label="Input Data (JSON)"
                description="Modify the input payload for the rule."
                value={inputJson}
                onChange={setInputJson}
                formatOnBlur
                autosize
                minRows={15}
                styles={{ input: { fontFamily: 'monospace' } }}
              />
            </Stack>
          </Card>
        </Grid.Col>

        {/* Right Column: Output */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack>
            {/* Pure Result */}
            <Card withBorder>
              <Group justify="space-between" mb="xs">
                <Title order={4}>Calculation Result</Title>
                {result && <Badge color="green">Success</Badge>}
              </Group>
              {result ? (
                <Code block>{JSON.stringify(result.result, null, 2)}</Code>
              ) : (
                <Text c="dimmed" size="sm" fs="italic">
                  Run simulation to see results...
                </Text>
              )}
            </Card>

            {/* Side Effects Timeline */}
            <Card withBorder title="Side Effects">
              <Title order={4} mb="md">
                Effects Timeline
              </Title>

              {!result ? (
                <Text c="dimmed" size="sm" fs="italic">
                  No effects generated yet.
                </Text>
              ) : result.actions.length === 0 ? (
                <Text c="dimmed">No side-effects produced by this run.</Text>
              ) : (
                <Timeline active={result.actions.length - 1} bulletSize={24} lineWidth={2}>
                  {result.actions.map((action: any, index: number) => (
                    <Timeline.Item
                      key={index}
                      bullet={
                        action.type === 'UpdateState' ? (
                          <IconDatabase size={12} />
                        ) : (
                          <IconBolt size={12} />
                        )
                      }
                      color={action.type === 'UpdateState' ? 'teal' : 'blue'}
                      title={action.type}
                    >
                      <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                        {action.target}
                      </Text>
                      <Text size="sm" mt={4}>
                        {action.type === 'UpdateState'
                          ? 'State updated with new values.'
                          : 'Event triggered to external system.'}
                      </Text>
                      <Paper withBorder p="xs" mt="xs" bg="var(--mantine-color-gray-0)">
                        <Code block fz="xs" bg="transparent">
                          {JSON.stringify(action.payload, null, 2)}
                        </Code>
                      </Paper>
                      <Text size="xs" mt={4} c="dimmed">
                        {action.timestamp}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              )}
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
