import { Key } from 'react';
import { Result } from '@effect-atom/atom-react';
import { Box, Button, Group, NavLink, ScrollArea, Stack, Title } from '@mantine/core';

export interface SidebarProps<T, K> {
  /** Header title (e.g. "Users") */
  title: string;
  /** Label for the top "all items" NavLink (e.g. "All Users") */
  allLabel: string;
  /** Currently selected item key, or null when "all" is selected */
  selectedId: K | null | undefined;
  /** Called when the user selects an item (key) or null (all) */
  onSelect: (value: K | ((value: K | null) => K | null) | null) => void;
  /** Called when the "+ Add" button is clicked */
  onAdd: () => void;
  /** Items wrapped in Result */
  items: Result.Result<T[], string>;
  /** Extract a unique key from an item */
  getKey: (item: T) => K | null;
  /** Extract a display label from an item */
  getLabel: (item: T) => string;
}

export function Sidebar<T, K>({
  title,
  allLabel,
  selectedId,
  onSelect,
  onAdd,
  items,
  getKey,
  getLabel,
}: SidebarProps<T, K>) {
  return (
    <Box
      w={300}
      style={{
        borderRight: '1px solid var(--mantine-color-gray-3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {Result.builder(items)
        .onSuccess((items) => (
          <>
            <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
              <Group justify="space-between">
                <Title order={4}>{title}</Title>
                <Button size="xs" onClick={onAdd}>
                  + Add
                </Button>
              </Group>
            </Box>
            <ScrollArea style={{ flex: 1 }}>
              <Stack gap={0}>
                <NavLink
                  label={allLabel}
                  active={selectedId === null}
                  onClick={() => onSelect(null)}
                  variant="filled"
                />
                {items.map((item) => (
                  <NavLink
                    key={getKey(item) as Key | null}
                    label={getLabel(item)}
                    active={selectedId === getKey(item)}
                    onClick={() => {
                      onSelect(getKey(item));
                    }}
                    variant="filled"
                  />
                ))}
              </Stack>
            </ScrollArea>
          </>
        ))
        .onError((error) => <span>Error: {error}</span>)
        .onInitialOrWaiting(() => <span>Loading...</span>)
        .render()}
    </Box>
  );
}
