// StepForm — Story 4.1–4.4 (Step & Operation Config) + Story 5.1–5.4 (Input & Output Adapter)
// Editable form for a step's name, description, operation fields, and adapter config.
import type {
  FieldMapping,
  PipelineStepConfig,
  RequestOperationConfig,
  RuleOperationConfig,
} from '@app/domain';
import { IconGavel, IconSend } from '@tabler/icons-react';
import {
  Badge,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { AdapterForm } from './AdapterForm';

const OPERATION_TYPES: { value: string; label: string }[] = [
  { value: 'Rule', label: 'Rule' },
  { value: 'Request', label: 'Request' },
];

const OUTPUT_ADAPTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'passthrough', label: 'Passthrough' },
  { value: 'fields', label: 'Fields' },
  { value: 'merge', label: 'Merge' },
];

export interface StepFormProps {
  step: PipelineStepConfig;
  index: number;
  /** Called when name or description changes */
  onUpdate?:
    | ((patch: Partial<Pick<PipelineStepConfig, 'name' | 'description'>>) => void)
    | undefined;
  /** Called when operation fields change — receives a partial patch for the current operation */
  onOperationUpdate?:
    | ((patch: Partial<RuleOperationConfig | RequestOperationConfig>) => void)
    | undefined;
  /** Called when the operation type is switched — replaces operation with a fresh default */
  onOperationTypeChange?: ((type: 'Rule' | 'Request') => void) | undefined;
  /** Called when the input adapter type is switched */
  onInputAdapterTypeChange?: ((kind: 'passthrough' | 'fields' | 'merge') => void) | undefined;
  /** Called when a field mapping is added to the input adapter */
  onInputMappingAdd?: (() => void) | undefined;
  /** Called when a field mapping is edited in the input adapter */
  onInputMappingEdit?:
    | ((
        index: number,
        patch: Partial<Pick<FieldMapping, 'source' | 'target' | 'defaultValue'>>
      ) => void)
    | undefined;
  /** Called when a field mapping is removed from the input adapter */
  onInputMappingRemove?: ((index: number) => void) | undefined;
  /** Called when the Merge adapter's targetKey changes on the input adapter */
  onInputMergeTargetKeyChange?: ((targetKey: string | undefined) => void) | undefined;
  /** Called when the output adapter type is switched (including 'none' to remove) */
  onOutputAdapterTypeChange?:
    | ((kind: 'passthrough' | 'fields' | 'merge' | 'none') => void)
    | undefined;
  /** Called when a field mapping is added to the output adapter */
  onOutputMappingAdd?: (() => void) | undefined;
  /** Called when a field mapping is edited in the output adapter */
  onOutputMappingEdit?:
    | ((
        index: number,
        patch: Partial<Pick<FieldMapping, 'source' | 'target' | 'defaultValue'>>
      ) => void)
    | undefined;
  /** Called when a field mapping is removed from the output adapter */
  onOutputMappingRemove?: ((index: number) => void) | undefined;
  /** Called when the Merge adapter's targetKey changes on the output adapter */
  onOutputMergeTargetKeyChange?: ((targetKey: string | undefined) => void) | undefined;
}

/** Editable step configuration form — name, description, operation fields, and adapter config. */
export function StepForm({
  step,
  index,
  onUpdate,
  onOperationUpdate,
  onOperationTypeChange,
  onInputAdapterTypeChange,
  onInputMappingAdd,
  onInputMappingEdit,
  onInputMappingRemove,
  onInputMergeTargetKeyChange,
  onOutputAdapterTypeChange,
  onOutputMappingAdd,
  onOutputMappingEdit,
  onOutputMappingRemove,
  onOutputMergeTargetKeyChange,
}: StepFormProps) {
  const isRule = step.operation.type === 'Rule';
  const Icon = isRule ? IconGavel : IconSend;
  const operationLabel = isRule ? 'Rule' : 'Request';

  return (
    <Stack gap="sm" data-testid="step-form">
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon variant="light" color="teal" size="md" radius="sm">
          <Icon size={16} stroke={1.5} />
        </ThemeIcon>
        <Text size="md" fw={600}>
          Step {index + 1}
        </Text>
        <Badge size="sm" variant="light" color="teal" radius="sm">
          {operationLabel}
        </Badge>
      </Group>

      <Select
        label="Operation Type"
        data={OPERATION_TYPES}
        value={step.operation.type}
        onChange={(value) => {
          if (value && value !== step.operation.type && onOperationTypeChange) {
            onOperationTypeChange(value as 'Rule' | 'Request');
          }
        }}
        allowDeselect={false}
        data-testid="step-operation-type-select"
      />

      <Divider />

      <TextInput
        label="Name"
        value={step.name}
        onChange={(e) => onUpdate?.({ name: e.currentTarget.value })}
        placeholder="e.g. Validate Order"
        data-testid="step-name-input"
      />

      <Textarea
        label="Description"
        description="Optional — describes what this step does"
        value={step.description ?? ''}
        onChange={(e) => {
          const val = e.currentTarget.value;
          onUpdate?.({ description: val || undefined });
        }}
        placeholder="e.g. Runs business validation rules on the incoming order"
        autosize
        minRows={2}
        maxRows={5}
        data-testid="step-description-input"
      />

      {isRule && (
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Rule Operation
          </Text>
          <TextInput
            label="Rule Name"
            value={step.operation.ruleName}
            onChange={(e) => onOperationUpdate?.({ ruleName: e.currentTarget.value })}
            placeholder="e.g. validate-order"
            data-testid="step-rule-name-input"
          />
          <TextInput
            label="Rule Type Ref"
            description="Optional rule type reference for schema validation"
            value={(step.operation as RuleOperationConfig).ruleTypeRef ?? ''}
            onChange={(e) => {
              const val = e.currentTarget.value;
              onOperationUpdate?.({ ruleTypeRef: val || undefined });
            }}
            placeholder="e.g. OrderValidation"
            data-testid="step-rule-type-ref-input"
          />
        </Stack>
      )}

      {!isRule && (
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Request Operation
          </Text>
          <TextInput
            label="Request Tag"
            value={(step.operation as RequestOperationConfig).requestTag}
            onChange={(e) => onOperationUpdate?.({ requestTag: e.currentTarget.value })}
            placeholder="e.g. GetCustomer"
            data-testid="step-request-tag-input"
          />
        </Stack>
      )}

      <Divider />

      <AdapterForm
        adapter={step.inputAdapter}
        label="Input Adapter"
        onTypeChange={onInputAdapterTypeChange}
        onMappingAdd={onInputMappingAdd}
        onMappingEdit={onInputMappingEdit}
        onMappingRemove={onInputMappingRemove}
        onMergeTargetKeyChange={onInputMergeTargetKeyChange}
      />

      <Divider />

      <Stack gap="xs">
        <Text size="sm" fw={500}>
          Output Adapter
        </Text>
        <Select
          label="Output Adapter Type"
          data={OUTPUT_ADAPTER_OPTIONS}
          value={step.outputAdapter?.kind ?? 'none'}
          onChange={(value) => {
            if (value && onOutputAdapterTypeChange) {
              const current = step.outputAdapter?.kind ?? 'none';
              if (value !== current) {
                onOutputAdapterTypeChange(value as 'passthrough' | 'fields' | 'merge' | 'none');
              }
            }
          }}
          allowDeselect={false}
          data-testid="output-adapter-type-select"
        />
        {step.outputAdapter && (
          <AdapterForm
            adapter={step.outputAdapter}
            label=""
            hideTypeSelect
            onTypeChange={(kind) => onOutputAdapterTypeChange?.(kind)}
            onMappingAdd={onOutputMappingAdd}
            onMappingEdit={onOutputMappingEdit}
            onMappingRemove={onOutputMappingRemove}
            onMergeTargetKeyChange={onOutputMergeTargetKeyChange}
          />
        )}
      </Stack>
    </Stack>
  );
}
