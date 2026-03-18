// FieldMappingEditor — Story 5.2 (Fields Adapter with Field Mapping Editor)
// Editable rows for field mappings: source path, target path, optional default value.
import type { FieldMapping } from '@app/domain';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Button, Group, Stack, Text, TextInput } from '@mantine/core';

export interface FieldMappingEditorProps {
  mappings: readonly FieldMapping[];
  /** Called when a mapping is added */
  onAdd?: (() => void) | undefined;
  /** Called when a mapping field is edited — receives index and partial patch */
  onEdit?:
    | ((
        index: number,
        patch: Partial<Pick<FieldMapping, 'source' | 'target' | 'defaultValue'>>
      ) => void)
    | undefined;
  /** Called when a mapping is removed by index */
  onRemove?: ((index: number) => void) | undefined;
}

/** Editable field mapping rows for a Fields adapter. */
export function FieldMappingEditor({ mappings, onAdd, onEdit, onRemove }: FieldMappingEditorProps) {
  return (
    <Stack gap="xs" data-testid="field-mapping-editor">
      {mappings.length === 0 && (
        <Text size="xs" c="dimmed" ta="center">
          No field mappings yet.
        </Text>
      )}
      {mappings.map((mapping, i) => (
        <Group
          key={i}
          gap="xs"
          wrap="nowrap"
          align="flex-end"
          data-testid={`field-mapping-row-${i}`}
        >
          <TextInput
            label={i === 0 ? 'Source' : undefined}
            placeholder="source.path"
            value={mapping.source}
            onChange={(e) => onEdit?.(i, { source: e.currentTarget.value })}
            size="xs"
            style={{ flex: 1 }}
            data-testid={`mapping-source-${i}`}
          />
          <TextInput
            label={i === 0 ? 'Target' : undefined}
            placeholder="target.path"
            value={mapping.target}
            onChange={(e) => onEdit?.(i, { target: e.currentTarget.value })}
            size="xs"
            style={{ flex: 1 }}
            data-testid={`mapping-target-${i}`}
          />
          <TextInput
            label={i === 0 ? 'Default' : undefined}
            placeholder="(optional)"
            value={mapping.defaultValue != null ? String(mapping.defaultValue) : ''}
            onChange={(e) => {
              const val = e.currentTarget.value;
              onEdit?.(i, { defaultValue: val || undefined });
            }}
            size="xs"
            style={{ flex: 1 }}
            data-testid={`mapping-default-${i}`}
          />
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={() => onRemove?.(i)}
            data-testid={`mapping-remove-${i}`}
            aria-label="Remove mapping"
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      ))}
      <Button
        variant="light"
        size="xs"
        leftSection={<IconPlus size={14} />}
        onClick={() => onAdd?.()}
        data-testid="add-mapping-button"
      >
        Add Mapping
      </Button>
    </Stack>
  );
}
