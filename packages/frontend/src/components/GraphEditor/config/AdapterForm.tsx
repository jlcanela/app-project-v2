// AdapterForm — Story 5.1 (Type Selection & Passthrough) + Story 5.2 (Fields) + Story 5.3 (Merge targetKey)
// Shows adapter type selector and type-specific fields.
import type { AdapterConfig, FieldMapping, FieldsAdapter, MergeAdapter } from '@app/domain';
import { Select, Stack, Text, TextInput } from '@mantine/core';
import { FieldMappingEditor } from './FieldMappingEditor';

const ADAPTER_TYPES: { value: string; label: string }[] = [
  { value: 'passthrough', label: 'Passthrough' },
  { value: 'fields', label: 'Fields' },
  { value: 'merge', label: 'Merge' },
];

export interface AdapterFormProps {
  adapter: AdapterConfig;
  label: string;
  /** When true, the adapter type Select is hidden (used when parent provides its own type selector) */
  hideTypeSelect?: boolean | undefined;
  /** Called when the adapter type is switched — replaces adapter with a fresh default */
  onTypeChange?: ((kind: 'passthrough' | 'fields' | 'merge') => void) | undefined;
  /** Called when a field mapping is added */
  onMappingAdd?: (() => void) | undefined;
  /** Called when a field mapping is edited */
  onMappingEdit?:
    | ((
        index: number,
        patch: Partial<Pick<FieldMapping, 'source' | 'target' | 'defaultValue'>>
      ) => void)
    | undefined;
  /** Called when a field mapping is removed */
  onMappingRemove?: ((index: number) => void) | undefined;
  /** Called when the Merge adapter's targetKey changes */
  onMergeTargetKeyChange?: ((targetKey: string | undefined) => void) | undefined;
}

/** Adapter configuration form — type selector and type-specific fields. */
export function AdapterForm({
  adapter,
  label,
  hideTypeSelect,
  onTypeChange,
  onMappingAdd,
  onMappingEdit,
  onMappingRemove,
  onMergeTargetKeyChange,
}: AdapterFormProps) {
  return (
    <Stack gap="xs" data-testid="adapter-form">
      {label && (
        <Text size="sm" fw={500}>
          {label}
        </Text>
      )}
      {!hideTypeSelect && (
        <Select
          label="Adapter Type"
          data={ADAPTER_TYPES}
          value={adapter.kind}
          onChange={(value) => {
            if (value && value !== adapter.kind && onTypeChange) {
              onTypeChange(value as 'passthrough' | 'fields' | 'merge');
            }
          }}
          allowDeselect={false}
          data-testid="adapter-type-select"
        />
      )}
      {adapter.kind === 'passthrough' && (
        <Text size="xs" c="dimmed">
          Data passes through without transformation.
        </Text>
      )}
      {adapter.kind === 'fields' && (
        <FieldMappingEditor
          mappings={(adapter as FieldsAdapter).mappings}
          onAdd={onMappingAdd}
          onEdit={onMappingEdit}
          onRemove={onMappingRemove}
        />
      )}
      {adapter.kind === 'merge' && (
        <TextInput
          label="Target Key"
          description="Optional — merges output under this key in context"
          value={(adapter as MergeAdapter).targetKey ?? ''}
          onChange={(e) => {
            const val = e.currentTarget.value;
            onMergeTargetKeyChange?.(val || undefined);
          }}
          placeholder="e.g. result"
          data-testid="merge-target-key-input"
        />
      )}
    </Stack>
  );
}
