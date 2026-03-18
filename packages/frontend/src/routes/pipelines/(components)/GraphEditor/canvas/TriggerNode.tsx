import { memo } from 'react';
import type { TriggerConfig } from '@app/domain';
import { IconRouter, IconWorld } from '@tabler/icons-react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Badge, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';

export interface TriggerNodeData {
  trigger: TriggerConfig;
}

/** Custom xyflow node for HTTP and EventBus triggers. */
export const TriggerNode = memo(({ data, selected }: NodeProps) => {
  const triggerData = data as unknown as TriggerNodeData;
  const trigger = triggerData.trigger;
  const isHttp = trigger.type === 'http';
  const Icon = isHttp ? IconWorld : IconRouter;
  const typeLabel = isHttp ? 'HTTP Trigger' : 'Event Bus Trigger';

  const summary = isHttp ? `${trigger.method} ${trigger.path}` : trigger.channel;

  return (
    <Paper
      shadow={selected ? 'md' : 'xs'}
      p="sm"
      withBorder
      style={{
        borderColor: selected ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-blue-3)',
        borderWidth: selected ? 2 : 1,
        borderLeft: `4px solid var(--mantine-color-blue-${selected ? '6' : '4'})`,
        minWidth: 210,
        maxWidth: 260,
        background: selected ? 'var(--mantine-color-blue-0)' : 'var(--mantine-color-white)',
      }}
      data-testid="trigger-node"
    >
      <Stack gap={6}>
        {/* Category label — distinguishes triggers from steps by text, not just color */}
        <Badge
          size="xs"
          variant="filled"
          color="blue"
          radius="sm"
          style={{ alignSelf: 'flex-start' }}
        >
          TRIGGER
        </Badge>

        <Group gap="xs" wrap="nowrap">
          <ThemeIcon variant="light" color="blue" size="md" radius="sm">
            <Icon size={16} stroke={1.5} />
          </ThemeIcon>
          <Text size="sm" fw={600} truncate>
            {typeLabel}
          </Text>
        </Group>

        {/* Key configuration summary — visible at screen-share resolution */}
        <Badge
          size="sm"
          variant="light"
          color="blue"
          radius="sm"
          fullWidth
          styles={{ label: { textTransform: 'none', fontFamily: 'monospace' } }}
        >
          {summary}
        </Badge>
      </Stack>

      <Handle type="source" position={Position.Right} />
    </Paper>
  );
});
