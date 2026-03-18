import { type DragEvent } from 'react';
import { IconGavel, IconRouter, IconSend, IconWorld } from '@tabler/icons-react';
import { Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { NODE_TYPE_CATEGORIES, NODE_TYPE_LABELS, type NodeTypeId } from './nodeTypes';
import classes from './PaletteItem.module.css';

/** Color mapping per node category — GoRules-inspired subdued palette */
const CATEGORY_COLORS: Record<string, string> = {
  trigger: 'blue',
  step: 'teal',
};

/** Icon mapping per node type */
const NODE_TYPE_ICONS: Record<NodeTypeId, typeof IconWorld> = {
  httpTrigger: IconWorld,
  eventBusTrigger: IconRouter,
  ruleStep: IconGavel,
  requestStep: IconSend,
};

export interface PaletteItemProps {
  /** The node type ID set on dataTransfer when dragging */
  nodeType: NodeTypeId;
}

export function PaletteItem({ nodeType }: PaletteItemProps) {
  const label = NODE_TYPE_LABELS[nodeType];
  const category = NODE_TYPE_CATEGORIES[nodeType];
  const color = CATEGORY_COLORS[category] ?? 'gray';
  const Icon = NODE_TYPE_ICONS[nodeType];

  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Paper
      className={classes.root ?? ''}
      draggable
      onDragStart={onDragStart}
      shadow="xs"
      p="xs"
      withBorder
      data-testid={`palette-item-${nodeType}`}
    >
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon variant="light" color={color} size="md">
          <Icon size={16} stroke={1.5} />
        </ThemeIcon>
        <Text size="sm" fw={500} truncate>
          {label}
        </Text>
      </Group>
    </Paper>
  );
}
