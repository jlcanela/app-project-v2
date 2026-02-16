// src/pages/rule-types/RuleTypePage.tsx
import React, { useMemo, useState } from 'react';
import {
  Paper,
  Text,
  TextInput,
  Textarea,
  Group,
  Button,
  ActionIcon,
  Table,
  Select,
  Checkbox,
  TagsInput,
  JsonInput,
  Modal,
  Collapse,

} from '@mantine/core';

import { IconPlus, IconTrash, IconCode, IconDownload, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
// Adapt this to your router

type RuleFieldType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';

type RuleField = {
  id: string;
  pathOrId: string;
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


const createEmptyField = (kind: 'in' | 'out'): RuleField => ({
  id: `${kind}-${Math.random().toString(36).slice(2)}`,
  pathOrId: '',
  label: '',
  type: 'string',
  required: kind === 'in',
  allowedValues: [],
  description: '',
  primaryOutcome: false,
});

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

// parse backend JSON into table-friendly fields
function parseSchemaIn(json: unknown): RuleField[] {
  if (!json || typeof json !== 'object') {
    return [];
  }
  const arr = Array.isArray(json) ? json : [];
  return arr.map((item, index) => {
    const f = item as InputSchemaField;
    return {
      id: `in-${index}-${Math.random().toString(36).slice(2)}`,
      pathOrId: f.path ?? '',
      label: f.label ?? '',
      type: (f.type as RuleFieldType) ?? 'string',
      required: !!f.required,
      allowedValues: f.allowedValues ?? [],
      description: f.description ?? '',
    };
  });
}

function parseSchemaOut(json: unknown): RuleField[] {
  if (!json || typeof json !== 'object') {
    return [];
  }
  const arr = Array.isArray(json) ? json : [];
  return arr.map((item, index) => {
    const f = item as OutputSchemaField;
    return {
      id: `out-${index}-${Math.random().toString(36).slice(2)}`,
      pathOrId: f.id ?? '',
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
  return fields.map((f) => ({
    path: f.pathOrId,
    label: f.label,
    type: f.type,
    required: f.required,
    allowedValues: f.allowedValues.length ? f.allowedValues : undefined,
    description: f.description || undefined,
  }));
}

function buildSchemaOut(fields: RuleField[]): OutputSchemaField[] {
  return fields.map((f) => ({
    id: f.pathOrId,
    label: f.label,
    type: f.type,
    allowedValues: f.allowedValues.length ? f.allowedValues : undefined,
    description: f.description || undefined,
    primary: f.primaryOutcome || undefined,
  }));
}

export const SchemaFieldsEditor: React.FC<SchemaFieldsEditorProps> = ({ kind, fields, onChange, title }) => {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const [rawOpen, setRawOpen] = useState(false);

  const handleFieldChange = (id: string, key: keyof RuleField, value: any) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  const handleAdd = () => {
    onChange([...fields, createEmptyField(kind)]);
  };

  const handleDelete = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  const handlePasteApply = () => {
    try {
      const parsed = JSON.parse(pasteValue);
      const next = kind === 'in' ? parseSchemaIn(parsed) : parseSchemaOut(parsed);
      onChange(next);
      setPasteOpen(false);
    } catch (e) {
      // replace with your notification system
      // showNotification({ color: 'red', message: 'Invalid JSON' });
      // eslint-disable-next-line no-alert
      alert('Invalid JSON');
    }
  };

  const rawJson = useMemo(
    () => JSON.stringify(kind === 'in' ? buildSchemaIn(fields) : buildSchemaOut(fields), null, 2),
    [fields, kind],
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
          <Button
            variant="light"
            leftSection={<IconCode size={16} />}
            onClick={() => setPasteOpen(true)}
          >
            Paste JSON
          </Button>
          <Button
            variant="subtle"
            leftSection={<IconDownload size={16} />}
            onClick={downloadJson}
          >
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
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {fields.map((field) => (
            <Table.Tr key={field.id}>
              <Table.Td style={{ minWidth: 180 }}>
                <TextInput
                  placeholder={kind === 'in' ? 'customer.tier' : 'discount'}
                  value={field.pathOrId}
                  onChange={(e) => handleFieldChange(field.id, 'pathOrId', e.currentTarget.value)}
                />
              </Table.Td>
              <Table.Td style={{ minWidth: 160 }}>
                <TextInput
                  placeholder="Label"
                  value={field.label}
                  onChange={(e) => handleFieldChange(field.id, 'label', e.currentTarget.value)}
                />
              </Table.Td>
              <Table.Td style={{ minWidth: 140 }}>
                <Select
                  data={['string', 'number', 'boolean', 'date', 'object', 'array']}
                  value={field.type}
                  onChange={(value) => handleFieldChange(field.id, 'type', value ?? 'string')}
                />
              </Table.Td>
              {kind === 'in' && (
                <Table.Td>
                  <Checkbox
                    checked={field.required}
                    onChange={(e) => handleFieldChange(field.id, 'required', e.currentTarget.checked)}
                  />
                </Table.Td>
              )}
              <Table.Td style={{ minWidth: 200 }}>
                <TagsInput
                  placeholder="Optional enum values"
                  value={field.allowedValues}
                  onChange={(values) => handleFieldChange(field.id, 'allowedValues', values)}
                />
              </Table.Td>
              <Table.Td style={{ minWidth: 220 }}>
                <Textarea
                  autosize
                  minRows={1}
                  maxRows={3}
                  placeholder="Business meaning"
                  value={field.description}
                  onChange={(e) =>
                    handleFieldChange(field.id, 'description', e.currentTarget.value)
                  }
                />
              </Table.Td>
              {kind === 'out' && (
                <Table.Td>
                  <Checkbox
                    checked={field.primaryOutcome}
                    onChange={(e) =>
                      handleFieldChange(field.id, 'primaryOutcome', e.currentTarget.checked)
                    }
                  />
                </Table.Td>
              )}
              <Table.Td width={40}>
                <ActionIcon color="red" variant="light" onClick={() => handleDelete(field.id)}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
          <Table.Tr>
            <Table.Td colSpan={kind === 'in' ? 7 : 7}>
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={handleAdd}
              >
                Add field
              </Button>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
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

      <Modal
        opened={pasteOpen}
        onClose={() => setPasteOpen(false)}
        title="Paste schema JSON"
        size="lg"
      >
        <JsonInput
          autosize
          minRows={8}
          placeholder="Paste schema JSON here"
          value={pasteValue}
          onChange={setPasteValue}
          validationError="Invalid JSON"
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setPasteOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handlePasteApply}>Apply</Button>
        </Group>
      </Modal>
    </Paper>
  );
};
