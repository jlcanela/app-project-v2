import { Stack, Text } from '@mantine/core';
import { NODE_TYPES } from './nodeTypes';
import { PaletteItem } from './PaletteItem';
import classes from './Palette.module.css';

const TRIGGER_TYPES = [NODE_TYPES.httpTrigger, NODE_TYPES.eventBusTrigger] as const;
const STEP_TYPES = [NODE_TYPES.ruleStep, NODE_TYPES.requestStep] as const;

export function Palette() {
  return (
    <div className={classes.root} data-testid="palette">
      <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4}>
        Triggers
      </Text>
      <Stack gap="xs" mb="md">
        {TRIGGER_TYPES.map((type) => (
          <PaletteItem key={type} nodeType={type} />
        ))}
      </Stack>

      <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4}>
        Steps
      </Text>
      <Stack gap="xs">
        {STEP_TYPES.map((type) => (
          <PaletteItem key={type} nodeType={type} />
        ))}
      </Stack>
    </div>
  );
}
