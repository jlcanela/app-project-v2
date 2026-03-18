// TriggerForm — Story 3.1 + 3.2 (HTTP) + 3.3 (Event Bus) + 3.4 (Type Switching)
// Fully editable trigger configuration form with type switching.
import type { HttpMethod, TriggerConfig } from '@app/domain';
import { IconRouter, IconWorld } from '@tabler/icons-react';
import { Divider, Group, Select, Stack, Text, TextInput, ThemeIcon } from '@mantine/core';

const HTTP_METHODS: { value: string; label: string }[] = [
  { value: 'POST', label: 'POST' },
  { value: 'GET', label: 'GET' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
];

const TRIGGER_TYPES: { value: string; label: string }[] = [
  { value: 'http', label: 'HTTP' },
  { value: 'event_bus', label: 'Event Bus' },
];

export interface TriggerFormProps {
  trigger: TriggerConfig;
  /** Called when any field changes — receives a partial update to merge into the trigger */
  onUpdate?: ((patch: Partial<TriggerConfig>) => void) | undefined;
  /** Called when the trigger type is switched — replaces trigger with a fresh default */
  onTypeChange?: ((type: 'http' | 'event_bus') => void) | undefined;
}

/** Editable trigger configuration form with type switching. */
export function TriggerForm({ trigger, onUpdate, onTypeChange }: TriggerFormProps) {
  const isHttp = trigger.type === 'http';
  const Icon = isHttp ? IconWorld : IconRouter;
  const typeLabel = isHttp ? 'HTTP Trigger' : 'Event Bus Trigger';

  return (
    <Stack gap="sm" data-testid="trigger-form">
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon variant="light" color="blue" size="md" radius="sm">
          <Icon size={16} stroke={1.5} />
        </ThemeIcon>
        <Text size="md" fw={600}>
          {typeLabel}
        </Text>
      </Group>

      <Select
        label="Trigger Type"
        data={TRIGGER_TYPES}
        value={trigger.type}
        onChange={(value) => {
          if (value && value !== trigger.type && onTypeChange) {
            onTypeChange(value as 'http' | 'event_bus');
          }
        }}
        allowDeselect={false}
        data-testid="trigger-type-select"
      />

      <Divider />

      {isHttp ? (
        <Stack gap="xs">
          <Select
            label="Method"
            data={HTTP_METHODS}
            value={trigger.method}
            onChange={(value) => {
              if (value && onUpdate) {
                onUpdate({ method: value as HttpMethod });
              }
            }}
            allowDeselect={false}
            data-testid="trigger-method-select"
          />
          <TextInput
            label="Path"
            value={trigger.path}
            onChange={(e) => onUpdate?.({ path: e.currentTarget.value })}
            placeholder="/api/endpoint"
            data-testid="trigger-path-input"
          />
          <TextInput
            label="Payload Schema Ref"
            description="Optional schema reference for payload validation"
            value={trigger.payloadSchemaRef ?? ''}
            onChange={(e) => {
              const val = e.currentTarget.value;
              onUpdate?.({ payloadSchemaRef: val || undefined });
            }}
            placeholder="e.g. OrderPayload"
            data-testid="trigger-schema-ref-input"
          />
        </Stack>
      ) : (
        <Stack gap="xs">
          <TextInput
            label="Channel"
            value={trigger.channel}
            onChange={(e) => onUpdate?.({ channel: e.currentTarget.value })}
            placeholder="e.g. order-events"
            data-testid="trigger-channel-input"
          />
          <TextInput
            label="Payload Schema Ref"
            description="Optional schema reference for payload validation"
            value={trigger.payloadSchemaRef ?? ''}
            onChange={(e) => {
              const val = e.currentTarget.value;
              onUpdate?.({ payloadSchemaRef: val || undefined });
            }}
            placeholder="e.g. OrderPayload"
            data-testid="trigger-eb-schema-ref-input"
          />
          <TextInput
            label="Filter Expression"
            description="Optional filter — only trigger when this evaluates to true"
            value={trigger.filterExpression ?? ''}
            onChange={(e) => {
              const val = e.currentTarget.value;
              onUpdate?.({ filterExpression: val || undefined });
            }}
            placeholder='e.g. event.type == "created"'
            data-testid="trigger-filter-input"
          />
        </Stack>
      )}
    </Stack>
  );
}
