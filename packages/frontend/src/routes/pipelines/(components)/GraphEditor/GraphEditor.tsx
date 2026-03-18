import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PipelineConfig } from '@app/domain';
import { useAtomSet, useAtomValue } from '@effect/atom-react';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarRightCollapse } from '@tabler/icons-react';
import { Atom } from 'effect/unstable/reactivity';
import { ActionIcon, Box, Group, Paper, ScrollArea, Text } from '@mantine/core';
import { PipelineAction, reducePipeline } from './atoms/pipeline';
import { PipelineCanvas } from './canvas';
import { ConfigPanel } from './config';
import { downloadPipelineJson } from './export';
import { Palette } from './palette';
import { computeCanvasEdges, computeCanvasNodes, computeSelectedNode } from './pipeline-selectors';
import { StatusBar } from './statusbar';

type Props = {
  //graphId: string
  /** Controlled pipeline value */
  value: PipelineConfig;
  /** Change handler similar to input's onChange */
  onChange?: (value: PipelineConfig) => void;
};

export const GraphEditor = ({ value, onChange }: Props) => {
  const pipeAtom = useMemo(
    () => Atom.make(value),
    [value] // re-create if value changes
  );

  const pipeline = useAtomValue(pipeAtom);
  const setPipeline = useAtomSet(pipeAtom);

  useEffect(() => {
    onChange?.(pipeline);
  }, [pipeline]);

  const [paletteOpened, setPaletteOpened] = useState(true);
  const [configOpened, setConfigOpened] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const dispatch = useCallback(
    (action: PipelineAction) => {
      setPipeline((prev) => reducePipeline(prev as PipelineConfig, action));
    },
    [setPipeline]
  );

  const canvasNodes = useMemo(
    () => computeCanvasNodes(pipeline, selectedNodeId),
    [pipeline, selectedNodeId]
  );
  const canvasEdges = useMemo(() => computeCanvasEdges(pipeline), [pipeline]);
  const selectedNode = useMemo(
    () => computeSelectedNode(pipeline, selectedNodeId),
    [pipeline, selectedNodeId]
  );

  const togglePalette = () => setPaletteOpened((p) => !p);
  const toggleConfig = () => setConfigOpened((c) => !c);

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* ── Main row: palette + canvas + config ── */}
      <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left panel — Node Palette */}
        {paletteOpened && (
          <Paper
            withBorder
            radius={0}
            w={220}
            style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}
          >
            <Group
              px="sm"
              h={40}
              justify="space-between"
              style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
            >
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                Palette
              </Text>
              <ActionIcon variant="subtle" size="sm" onClick={togglePalette}>
                <IconLayoutSidebarLeftCollapse size={14} />
              </ActionIcon>
            </Group>
            <ScrollArea style={{ flex: 1 }} p="xs">
              <Palette />
            </ScrollArea>
          </Paper>
        )}

        {/* Center — Canvas with floating controls */}
        <Box style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Box style={{ width: '100%', height: '100%' }}>
            <PipelineCanvas
              nodes={canvasNodes}
              edges={canvasEdges}
              dispatch={dispatch}
              setSelectedNodeId={setSelectedNodeId}
            />
          </Box>

          {/* Collapsed panel toggles — shown when panels are hidden */}
          {!paletteOpened && (
            <ActionIcon
              variant="default"
              size="md"
              style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}
              onClick={togglePalette}
            >
              <IconLayoutSidebarLeftCollapse size={16} style={{ transform: 'scaleX(-1)' }} />
            </ActionIcon>
          )}
          {!configOpened && (
            <ActionIcon
              variant="default"
              size="md"
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
              onClick={toggleConfig}
            >
              <IconLayoutSidebarRightCollapse size={16} style={{ transform: 'scaleX(-1)' }} />
            </ActionIcon>
          )}
        </Box>

        {/* Right panel — Config / Inspector */}
        {configOpened && (
          <Paper
            withBorder
            radius={0}
            w={280}
            style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}
          >
            <Group
              px="sm"
              h={40}
              justify="space-between"
              style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
            >
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                Inspector
              </Text>
              <ActionIcon variant="subtle" size="sm" onClick={toggleConfig}>
                <IconLayoutSidebarRightCollapse size={14} />
              </ActionIcon>
            </Group>
            <ScrollArea style={{ flex: 1 }} p="xs">
              <ConfigPanel pipeline={pipeline} selection={selectedNode} dispatch={dispatch} />
            </ScrollArea>
          </Paper>
        )}
      </Box>

      {/* ── Bottom — Status Bar ── */}
      <Box
        style={{
          height: 28,
          flexShrink: 0,
          borderTop: '1px solid var(--mantine-color-default-border)',
          backgroundColor: 'var(--mantine-color-default)',
          display: 'flex',
          alignItems: 'center',
          paddingInline: 'var(--mantine-spacing-sm)',
        }}
      >
        <StatusBar
          onDownload={() => downloadPipelineJson(pipeline)}
          onUpload={(p) => dispatch(PipelineAction.Replace(p))}
        />
      </Box>
    </Box>
  );
};
