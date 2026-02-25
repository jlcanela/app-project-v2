import { useState } from 'react';
import { PipelineConfig } from '@app/domain';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button, Group, NavLink, ScrollArea, Stack, Title } from '@mantine/core';
import { pipelines } from '@/lib/pipelineConfig';
import { PipelineDetail } from './PipelineDetail';

// ---------------------------------------------------------------------------
// Standalone page wrapper (no atoms/router dependency)
// ---------------------------------------------------------------------------

function PipelinesPage({ items }: { items: PipelineConfig[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((p) => p.id === selectedId);

  return (
    <Box style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Box
        w={300}
        style={{
          borderRight: '1px solid var(--mantine-color-gray-3)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
          <Group justify="space-between">
            <Title order={4}>Pipelines</Title>
            <Button size="xs" disabled>
              + Add
            </Button>
          </Group>
        </Box>
        <ScrollArea style={{ flex: 1 }}>
          <Stack gap={0}>
            <NavLink
              label="All Pipelines"
              active={selectedId === null}
              onClick={() => setSelectedId(null)}
              variant="filled"
            />
            {items.map((p) => (
              <NavLink
                key={p.id}
                label={p.name}
                active={selectedId === p.id}
                onClick={() => setSelectedId(p.id)}
                variant="filled"
              />
            ))}
          </Stack>
        </ScrollArea>
      </Box>

      {/* Detail */}
      {selected ? (
        <PipelineDetail pipeline={selected} />
      ) : (
        <Box
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--mantine-color-dimmed)',
          }}
        >
          Select a pipeline from the sidebar
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof PipelinesPage> = {
  title: 'Pipelines/PipelinesPage',
  component: PipelinesPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PipelinesPage>;

export const Default: Story = {
  name: 'Sidebar + Detail',
  args: {
    items: pipelines,
  },
};
