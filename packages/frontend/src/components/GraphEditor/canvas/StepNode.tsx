import { memo } from 'react';
import type { AdapterConfig, PipelineStepConfig } from '@app/domain';
import { IconGavel, IconSend } from '@tabler/icons-react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Badge, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';

export interface StepNodeData {
  step: PipelineStepConfig;
  index: number;
}

/** Format a human-readable adapter summary */
function adapterSummary(adapter: AdapterConfig): string {
  switch (adapter.kind) {
    case 'passthrough':
      return 'Passthrough';
    case 'fields':
      return `Fields (${adapter.mappings.length})`;
    case 'merge':
      return adapter.targetKey ? `Merge → ${adapter.targetKey}` : 'Merge';
  }
}

/** Custom xyflow node for Rule and Request steps. */
export const StepNode = memo(({ data, selected }: NodeProps) => {
  const stepData = data as unknown as StepNodeData;
  const step = stepData.step;
  const isRule = step.operation.type === 'Rule';
  const Icon = isRule ? IconGavel : IconSend;

  const operationSummary = isRule
    ? `Rule: ${step.operation.ruleName}`
    : `Request: ${step.operation.requestTag}`;

  return (
    <Paper
      shadow={selected ? 'md' : 'xs'}
      p="sm"
      withBorder
      style={{
        borderColor: selected ? 'var(--mantine-color-teal-5)' : 'var(--mantine-color-teal-3)',
        borderWidth: selected ? 2 : 1,
        borderLeft: `4px solid var(--mantine-color-teal-${selected ? '6' : '4'})`,
        minWidth: 210,
        maxWidth: 260,
        background: selected ? 'var(--mantine-color-teal-0)' : 'var(--mantine-color-white)',
      }}
      data-testid="step-node"
    >
      <Stack gap={6}>
        {/* Category label — distinguishes steps from triggers by text, not just color */}
        <Badge
          size="xs"
          variant="filled"
          color="teal"
          radius="sm"
          style={{ alignSelf: 'flex-start' }}
        >
          STEP
        </Badge>

        <Group gap="xs" wrap="nowrap">
          <ThemeIcon variant="light" color="teal" size="md" radius="sm">
            <Icon size={16} stroke={1.5} />
          </ThemeIcon>
          <Text size="sm" fw={600} truncate>
            {step.name}
          </Text>
        </Group>

        {/* Operation summary */}
        <Badge
          size="sm"
          variant="light"
          color="teal"
          radius="sm"
          fullWidth
          styles={{ label: { textTransform: 'none', fontFamily: 'monospace' } }}
        >
          {operationSummary}
        </Badge>

        {/* Input adapter badge */}
        <Badge
          size="xs"
          variant="outline"
          color="gray"
          radius="sm"
          style={{ alignSelf: 'flex-start' }}
        >
          In ⇥ {adapterSummary(step.inputAdapter)}
        </Badge>

        {/* Input adapter badge */}
        {step.outputAdapter && (
          <Badge
            size="xs"
            variant="outline"
            color="gray"
            radius="sm"
            style={{ alignSelf: 'flex-start' }}
          >
            Out ⇥ {adapterSummary(step.outputAdapter)}
          </Badge>
        )}
      </Stack>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Paper>
  );
});
