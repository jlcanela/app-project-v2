import React, { useMemo, useState } from 'react';
import {
  type AdapterConfig,
  type ConditionConfig,
  type PipelineConfig,
  type PipelineStepConfig,
} from '@app/domain';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Code,
  Collapse,
  Container,
  Divider,
  Group,
  JsonInput,
  Paper,
  Stack,
  Text,
  TextInput,
  Timeline,
  Title,
} from '@mantine/core';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function adapterLabel(adapter: AdapterConfig): string {
  switch (adapter.kind) {
    case 'passthrough':
      return 'Passthrough';
    case 'merge':
      return adapter.targetKey ? `Merge → ctx.${adapter.targetKey}` : 'Merge → ctx';
    case 'fields':
      return adapter.mappings.map((m) => `${m.source} → ${m.target}`).join(', ');
  }
}

function adapterBadgeColor(adapter: AdapterConfig): string {
  switch (adapter.kind) {
    case 'passthrough':
      return 'gray';
    case 'merge':
      return 'teal';
    case 'fields':
      return 'violet';
  }
}

function conditionLabel(cond: ConditionConfig): string {
  if (cond.operator === 'exists' || cond.operator === 'not_exists') {
    return `${cond.field} ${cond.operator.replace('_', ' ')}`;
  }
  return `${cond.field} ${cond.operator} ${JSON.stringify(cond.value)}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const TriggerSection: React.FC<{ trigger: PipelineConfig['trigger'] }> = ({ trigger }) => (
  <Paper withBorder radius="md" p="md">
    <Group justify="space-between" mb="sm">
      <Text fw={500}>Trigger</Text>
      <Badge variant="light" size="lg">
        {trigger.type === 'http' ? 'HTTP' : 'Event Bus'}
      </Badge>
    </Group>
    {trigger.type === 'http' ? (
      <Group gap="sm">
        <Badge color="blue" variant="filled" size="sm">
          {trigger.method}
        </Badge>
        <Code>{trigger.path}</Code>
        {trigger.payloadSchemaRef && (
          <Text size="sm" c="dimmed">
            Schema: {trigger.payloadSchemaRef}
          </Text>
        )}
      </Group>
    ) : (
      <Stack gap="xs">
        <Group gap="sm">
          <Text size="sm" fw={500}>
            Channel:
          </Text>
          <Code>{trigger.channel}</Code>
        </Group>
        {trigger.filterExpression && (
          <Group gap="sm">
            <Text size="sm" fw={500}>
              Filter:
            </Text>
            <Code>{trigger.filterExpression}</Code>
          </Group>
        )}
        {trigger.payloadSchemaRef && (
          <Group gap="sm">
            <Text size="sm" fw={500}>
              Schema:
            </Text>
            <Text size="sm">{trigger.payloadSchemaRef}</Text>
          </Group>
        )}
      </Stack>
    )}
  </Paper>
);

const AdapterBadge: React.FC<{ adapter: AdapterConfig; label?: string }> = ({ adapter, label }) => (
  <Group gap={4}>
    {label && (
      <Text size="xs" c="dimmed">
        {label}
      </Text>
    )}
    <Badge variant="outline" color={adapterBadgeColor(adapter)} size="sm">
      {adapter.kind}
    </Badge>
    <Text size="xs">{adapterLabel(adapter)}</Text>
  </Group>
);

const StepRow: React.FC<{ step: PipelineStepConfig; index: number }> = ({ step, index }) => {
  const op = step.operation;
  const isRule = op.type === 'Rule';

  return (
    <Timeline.Item
      title={
        <Group gap="xs">
          <Text fw={500}>{step.name}</Text>
          <Badge size="xs" color={isRule ? 'orange' : 'cyan'} variant="light">
            {op.type}
          </Badge>
          {step.condition && (
            <Badge size="xs" color="yellow" variant="light">
              if {conditionLabel(step.condition)}
            </Badge>
          )}
        </Group>
      }
      bullet={
        <Text size="xs" fw={700}>
          {index + 1}
        </Text>
      }
    >
      {step.description && (
        <Text size="sm" c="dimmed" mb={4}>
          {step.description}
        </Text>
      )}

      <Stack gap={4}>
        {isRule ? (
          <Group gap="sm">
            <Text size="xs" c="dimmed">
              Rule:
            </Text>
            <Code>{op.ruleName}</Code>
            {op.ruleTypeRef && (
              <>
                <Text size="xs" c="dimmed">
                  Type:
                </Text>
                <Text size="xs">{op.ruleTypeRef}</Text>
              </>
            )}
          </Group>
        ) : (
          <Group gap="sm">
            <Text size="xs" c="dimmed">
              Request:
            </Text>
            <Code>{op.requestTag}</Code>
          </Group>
        )}

        <AdapterBadge adapter={step.inputAdapter} label="In:" />
        {step.outputAdapter && <AdapterBadge adapter={step.outputAdapter} label="Out:" />}
      </Stack>
    </Timeline.Item>
  );
};

const StepsSection: React.FC<{ steps: readonly PipelineStepConfig[] }> = ({ steps }) => (
  <Paper withBorder radius="md" p="md">
    <Text fw={500} mb="sm">
      Steps ({steps.length})
    </Text>
    <Timeline active={steps.length - 1} bulletSize={24} lineWidth={2}>
      {steps.map((step, i) => (
        <StepRow key={step.name} step={step} index={i} />
      ))}
    </Timeline>
  </Paper>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const PipelineDetail: React.FC<{ pipeline: PipelineConfig }> = ({ pipeline }) => {
  const [rawOpen, setRawOpen] = useState(false);

  const rawJson = useMemo(() => JSON.stringify(pipeline, null, 2), [pipeline]);

  return (
    <Container size="lg" py="md" style={{ overflow: 'auto', flex: 1 }}>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={3}>{pipeline.name}</Title>
            {pipeline.description && (
              <Text c="dimmed" size="sm">
                {pipeline.description}
              </Text>
            )}
          </div>
          <Group gap="xs">
            <Badge color={pipeline.enabled !== false ? 'green' : 'red'} variant="light">
              {pipeline.enabled !== false ? 'Enabled' : 'Disabled'}
            </Badge>
            {pipeline.version != null && (
              <Badge variant="default" size="sm">
                v{pipeline.version}
              </Badge>
            )}
          </Group>
        </Group>

        {/* General info */}
        <Paper withBorder radius="md" p="md">
          <Stack gap="xs">
            <TextInput label="Pipeline ID" readOnly value={pipeline.id} />
            <TextInput label="Name" readOnly value={pipeline.name} />
            {pipeline.description && (
              <TextInput label="Description" readOnly value={pipeline.description} />
            )}
          </Stack>
        </Paper>

        {/* Trigger */}
        <TriggerSection trigger={pipeline.trigger} />

        {/* Steps */}
        <StepsSection steps={pipeline.steps} />

        <Divider />

        {/* Raw JSON */}
        <Group>
          <Button
            variant="subtle"
            size="xs"
            onClick={() => setRawOpen((o) => !o)}
            leftSection={rawOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          >
            Raw JSON
          </Button>
        </Group>
        <Collapse in={rawOpen}>
          <JsonInput autosize minRows={6} value={rawJson} readOnly label="Pipeline JSON" />
        </Collapse>
      </Stack>
    </Container>
  );
};
