// src/pages/rule-types/RuleTypePage.tsx
import React, { useMemo, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconDownload } from '@tabler/icons-react';
import { Badge, Button, Collapse, Group, JsonInput, Paper, Table, Text } from '@mantine/core';

// Adapt this to your router

type RuleFieldType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';

type RuleField = {
  id: string;
  path: string;
  label: string;
  type: RuleFieldType;
  required: boolean;
  allowedValues: string[];
  description: string;
  primaryOutcome?: boolean;
};

type SchemaFieldsEditorProps = {
  kind: 'in' | 'out';
  fields: RuleField[];
  onChange: (fields: RuleField[]) => void;
  title: string;
};

// const createEmptyField = (kind: 'in' | 'out'): RuleField => ({
//   id: `${kind}-${Math.random().toString(36).slice(2)}`,
//   path: '',
//   label: '',
//   type: 'string',
//   required: kind === 'in',
//   allowedValues: [],
//   description: '',
//   primaryOutcome: false,
// });

type InputSchemaField = {
  path: string;
  label: string;
  type: RuleFieldType | string;
  required?: boolean;
  allowedValues?: string[];
  description?: string;
};

type OutputSchemaField = {
  id: string;
  label: string;
  type: RuleFieldType | string;
  allowedValues?: string[];
  description?: string;
  primary?: boolean;
};

// parse backend JSON into table-friendly fields (kept for future edit mode)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseSchemaIn(json: unknown): RuleField[] {
  if (!json || typeof json !== 'object') {
    return [];
  }
  const arr = Array.isArray(json) ? json : [];
  return arr.map((item, index) => {
    const f = item as InputSchemaField;
    return {
      id: `in-${index}`,
      path: f.path ?? '',
      label: f.label ?? '',
      type: (f.type as RuleFieldType) ?? 'string',
      required: !!f.required,
      allowedValues: f.allowedValues ?? [],
      description: f.description ?? '',
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseSchemaOut(json: unknown): RuleField[] {
  if (!json || typeof json !== 'object') {
    return [];
  }
  const arr = Array.isArray(json) ? json : [];
  return arr.map((item, index) => {
    const f = item as OutputSchemaField;
    return {
      id: `out-${index}`,
      path: f.id ?? '',
      label: f.label ?? '',
      type: (f.type as RuleFieldType) ?? 'string',
      required: true,
      allowedValues: f.allowedValues ?? [],
      description: f.description ?? '',
      primaryOutcome: !!f.primary,
    };
  });
}

// build backend JSON from table fields
function buildSchemaIn(fields: RuleField[]): InputSchemaField[] {
  if (fields === undefined) {
    return [];
  }
  return fields.map((f) => ({
    path: f.path,
    label: f.label,
    type: f.type,
    required: f.required,
    allowedValues: f.allowedValues?.length ? f.allowedValues : undefined,
    description: f.description || undefined,
  }));
}

function buildSchemaOut(fields: RuleField[]): OutputSchemaField[] {
  if (fields === undefined) {
    return [];
  }
  return fields.map((f) => ({
    id: f.path,
    label: f.label,
    type: f.type,
    allowedValues: f.allowedValues?.length ? f.allowedValues : undefined,
    description: f.description || undefined,
    primary: f.primaryOutcome || undefined,
  }));
}

export const SchemaFieldsEditor: React.FC<SchemaFieldsEditorProps> = ({
  kind,
  fields,
  onChange: _onChange,
  title,
}) => {
  const [rawOpen, setRawOpen] = useState(false);

  const rawJson = useMemo(
    () => JSON.stringify(kind === 'in' ? buildSchemaIn(fields) : buildSchemaOut(fields), null, 2),
    [fields, kind]
  );

  const downloadJson = () => {
    const blob = new Blob([rawJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${kind === 'in' ? 'schemaIn' : 'schemaOut'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" mb="sm">
        <Text fw={500}>{title}</Text>
        <Group gap="xs">
          <Button variant="subtle" leftSection={<IconDownload size={16} />} onClick={downloadJson}>
            Download JSON
          </Button>
          <Button
            variant="subtle"
            onClick={() => setRawOpen((o) => !o)}
            leftSection={rawOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          >
            Raw JSON
          </Button>
        </Group>
      </Group>

      <Table striped highlightOnHover withRowBorders={false}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{kind === 'in' ? 'Path' : 'Field id'}</Table.Th>
            <Table.Th>Label</Table.Th>
            <Table.Th>Type</Table.Th>
            {kind === 'in' && <Table.Th>Required</Table.Th>}
            <Table.Th>Allowed values / range</Table.Th>
            <Table.Th>Description</Table.Th>
            {kind === 'out' && <Table.Th>Primary</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        {fields && (
          <Table.Tbody>
            {fields.map((field) => (
              <Table.Tr key={field.id}>
                <Table.Td>
                  <Text size="sm" c={field.path ? undefined : 'dimmed'}>
                    {field.path || (kind === 'in' ? 'customer.tier' : 'discount')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c={field.label ? undefined : 'dimmed'}>
                    {field.label || '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" size="sm">
                    {field.type}
                  </Badge>
                </Table.Td>
                {kind === 'in' && (
                  <Table.Td>
                    <Text size="sm">{field.required ? 'Yes' : 'No'}</Text>
                  </Table.Td>
                )}
                <Table.Td>
                  <Group gap={4}>
                    {field.allowedValues?.length ? (
                      field.allowedValues.map((v) => (
                        <Badge key={v} variant="outline" size="xs">
                          {v}
                        </Badge>
                      ))
                    ) : (
                      <Text size="sm" c="dimmed">
                        —
                      </Text>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c={field.description ? undefined : 'dimmed'}>
                    {field.description || '—'}
                  </Text>
                </Table.Td>
                {kind === 'out' && (
                  <Table.Td>
                    <Text size="sm">{field.primaryOutcome ? 'Yes' : 'No'}</Text>
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        )}
      </Table>

      <Collapse in={rawOpen}>
        <JsonInput
          mt="md"
          autosize
          minRows={6}
          value={rawJson}
          readOnly
          label="Raw JSON"
          validationError="Invalid JSON"
        />
      </Collapse>
    </Paper>
  );
};
