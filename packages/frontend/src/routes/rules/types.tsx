import { useMemo, useState } from 'react';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  JsonInput,
  MultiSelect,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';

export const Route = createFileRoute('/rules/types')({
  component: RuleTypesPage,
});

// Mock Catalog Data
const CATALOG = {
  states: ['CartState', 'UserState', 'SessionState'],
  events: ['ItemAdded', 'OrderPlaced', 'PaymentFailed'],
  entities: ['Product', 'Order', 'Customer'],
};

function RuleTypesPage() {
  // State for the Rule Type Definition
  const [name, setName] = useState('DiscountCalculationType');
  const [selectedInputs, setSelectedInputs] = useState<string[]>([]);

  // Output Configuration
  const [resultType, setResultType] = useState('number');
  const [allowedStateUpdates, setAllowedStateUpdates] = useState<string[]>([]);
  const [allowedEvents, setAllowedEvents] = useState<string[]>([]);

  // Computed Preview of the Input Schema
  const inputSchemaPreview = useMemo(() => {
    const properties = selectedInputs.reduce(
      (acc, item) => {
        acc[item.toLowerCase()] = { $ref: `#/definitions/${item}` };
        return acc;
      },
      {} as Record<string, any>
    );

    return JSON.stringify(
      {
        type: 'object',
        properties,
      },
      null,
      2
    );
  }, [selectedInputs]);

  // Computed Preview of the Output Schema (Capability Contract)
  const outputSchemaPreview = useMemo(() => {
    const actions = [];

    if (allowedStateUpdates.length > 0) {
      actions.push({
        type: 'UpdateState',
        oneOf: allowedStateUpdates.map((s) => ({ $ref: `#/definitions/${s}` })),
      });
    }

    if (allowedEvents.length > 0) {
      actions.push({
        type: 'TriggerEvent',
        oneOf: allowedEvents.map((e) => ({ $ref: `#/definitions/${e}` })),
      });
    }

    return JSON.stringify(
      {
        result: { type: resultType },
        allowedActions: actions,
      },
      null,
      2
    );
  }, [resultType, allowedStateUpdates, allowedEvents]);

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Rule Type Configuration</Title>
          <Text c="dimmed">Define the Input/Output contract for business rules.</Text>
        </div>
        <Button leftSection={<IconDeviceFloppy size={16} />}>Save Contract</Button>
      </Group>

      <Stack gap="md">
        <Card withBorder padding="md">
          <TextInput
            label="Rule Type Name"
            description="Unique identifier for this contract (e.g., PricingRule, ValidationRule)"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
        </Card>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder h="100%">
              <Title order={4} mb="md">
                Input Context
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                Select the domain objects available to the rule logic.
              </Text>

              <Stack>
                <MultiSelect
                  label="Domain States & Entities"
                  placeholder="Select inputs..."
                  data={[
                    { group: 'States', items: CATALOG.states },
                    { group: 'Entities', items: CATALOG.entities },
                  ]}
                  value={selectedInputs}
                  onChange={setSelectedInputs}
                  searchable
                />

                <JsonInput
                  label="Generated Input Schema"
                  value={inputSchemaPreview}
                  readOnly
                  minRows={10}
                  formatOnBlur
                  styles={{ input: { fontFamily: 'monospace', fontSize: '12px' } }}
                />
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder h="100%">
              <Title order={4} mb="md">
                Output Capabilities
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                Define the return type and allowed side-effects.
              </Text>

              <Stack>
                <TextInput
                  label="Pure Result Type"
                  placeholder="e.g. number, boolean, DiscountObject"
                  value={resultType}
                  onChange={(e) => setResultType(e.currentTarget.value)}
                />

                <Divider label="Side Effects" labelPosition="center" />

                <Card withBorder bg="var(--mantine-color-gray-0)">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Update State</Text>
                    <Badge color={allowedStateUpdates.length ? 'blue' : 'gray'}>
                      {allowedStateUpdates.length ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </Group>
                  <MultiSelect
                    placeholder="Select allowed states to update..."
                    data={CATALOG.states}
                    value={allowedStateUpdates}
                    onChange={setAllowedStateUpdates}
                    clearable
                  />
                </Card>

                <Card withBorder bg="var(--mantine-color-gray-0)">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Trigger Events</Text>
                    <Badge color={allowedEvents.length ? 'green' : 'gray'}>
                      {allowedEvents.length ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </Group>
                  <MultiSelect
                    placeholder="Select allowed events to trigger..."
                    data={CATALOG.events}
                    value={allowedEvents}
                    onChange={setAllowedEvents}
                    clearable
                  />
                </Card>

                <JsonInput
                  label="Generated Output Contract"
                  value={outputSchemaPreview}
                  readOnly
                  minRows={8}
                  formatOnBlur
                  styles={{ input: { fontFamily: 'monospace', fontSize: '12px' } }}
                />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
