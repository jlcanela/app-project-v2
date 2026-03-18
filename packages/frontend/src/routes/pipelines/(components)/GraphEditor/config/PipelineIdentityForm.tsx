// PipelineIdentityForm — Story 6.1 (Pipeline Identity & Metadata)
// Editable form for pipeline id, name, description, enabled status, and version.
import type { PipelineConfig } from '@app/domain';
import { IconSettings } from '@tabler/icons-react';
import {
  Group,
  NumberInput,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from '@mantine/core';

export interface PipelineIdentityFormProps {
  pipeline: PipelineConfig;
  /** Called when any identity field changes */
  onUpdate?:
    | ((
        patch: Partial<Pick<PipelineConfig, 'id' | 'name' | 'description' | 'enabled' | 'version'>>
      ) => void)
    | undefined;
}

/** Pipeline identity and metadata form — id, name, description, enabled, version. */
export function PipelineIdentityForm({ pipeline, onUpdate }: PipelineIdentityFormProps) {
  return (
    <Stack gap="sm" data-testid="pipeline-identity-form">
      <Group gap="xs">
        <ThemeIcon size="sm" variant="light" color="gray">
          <IconSettings size={14} />
        </ThemeIcon>
        <Text size="sm" fw={600}>
          Pipeline Identity
        </Text>
      </Group>

      <TextInput
        label="Pipeline ID"
        value={pipeline.id}
        onChange={(e) => onUpdate?.({ id: e.currentTarget.value })}
        placeholder="e.g. my-pipeline"
        data-testid="pipeline-id-input"
      />

      <TextInput
        label="Display Name"
        value={pipeline.name}
        onChange={(e) => onUpdate?.({ name: e.currentTarget.value })}
        placeholder="e.g. My Pipeline"
        data-testid="pipeline-name-input"
      />

      <Textarea
        label="Description"
        value={pipeline.description ?? ''}
        onChange={(e) => onUpdate?.({ description: e.currentTarget.value || undefined })}
        placeholder="Optional pipeline description"
        autosize
        minRows={2}
        data-testid="pipeline-description-input"
      />

      <Switch
        label="Enabled"
        checked={pipeline.enabled ?? false}
        onChange={(e) => onUpdate?.({ enabled: e.currentTarget.checked })}
        data-testid="pipeline-enabled-switch"
      />

      <NumberInput
        label="Version"
        value={pipeline.version ?? 1}
        onChange={(value) => onUpdate?.({ version: typeof value === 'number' ? value : undefined })}
        min={0}
        data-testid="pipeline-version-input"
      />
    </Stack>
  );
}
