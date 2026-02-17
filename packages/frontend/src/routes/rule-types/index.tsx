// src/pages/rule-types/RuleTypePage.tsx
import React, { useEffect, useState } from 'react';
import {
  AppShell,
  Container,
  Stack,
  Text,

  Group,
  Button,
  Divider,
  LoadingOverlay,
} from '@mantine/core';

import { useForm } from '@mantine/form';

// Adapt this to your router
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SchemaFieldsEditor } from './(components)/JsonSchemaEditor';
import { RuleField, RuleFieldType, RuleTypeFormValues } from './(components)/types';
// import { GovernanceSection } from './(components)/GovernanceSection';
import { GeneralSection } from './(components)/SimplifiedGeneralSection';

// Backend / JDM schema types (adapt to your actual types)
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

type RuleTypeDto = {
  ruleTypeId: number;
  description: string;
  schemaIn: string;
  schemaOut: string;
  // You can extend with more fields if your backend has them
};

// ---------- helpers ----------

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

// ---------- sections ----------


export const RuleTypePage: React.FC = () => {
  //const params = useParams({ from: '/rule-types/$ruleTypeId' }); // adjust to your router
  const navigate = useNavigate();
  //const isNew = params.ruleTypeId === 'new';
  const isNew = true;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<RuleTypeFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      description: '',
      schemaInFields: [],
      schemaOutFields: [],
    },
    validate: {
      description: (value) => (!value ? 'Description is required' : null),
      schemaInFields: (value) =>
        value.length === 0 ? 'At least one input field is required' : null,
      schemaOutFields: (value) =>
        value.length === 0 ? 'At least one output field is required' : null,
    },
  });

  // load existing rule type
  useEffect(() => {
    if (isNew) {
      return;
    }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
       // const res = await fetch(`/api/rule-types/${params.ruleTypeId}`);
        const res = await fetch(`/api/rule-type}`);
        if (!res.ok) {
          throw new Error('Failed to load rule type');
        }
        const data = (await res.json()) as RuleTypeDto;

        let schemaInJson: unknown = [];
        let schemaOutJson: unknown = [];

        try {
          schemaInJson = JSON.parse(data.schemaIn || '[]');
        } catch {
          schemaInJson = [];
        }
        try {
          schemaOutJson = JSON.parse(data.schemaOut || '[]');
        } catch {
          schemaOutJson = [];
        }

        if (!cancelled) {
          form.setValues({
            ruleTypeId: data.ruleTypeId,
            description: data.description,
            schemaInFields: parseSchemaIn(schemaInJson),
            schemaOutFields: parseSchemaOut(schemaOutJson),
          });
        }
      } catch (e) {
        if (!cancelled) {
          // eslint-disable-next-line no-alert
          alert('Error loading rule type');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isNew, 1 /*params.ruleTypeId*/, form]);

  const handleSubmit = form.onSubmit(async (values) => {
    setSaving(true);
    try {
      const payload: Partial<RuleTypeDto> & {
        schemaIn: string;
        schemaOut: string;
      } = {
        description: values.description,
        schemaIn: JSON.stringify(buildSchemaIn(values.schemaInFields)),
        schemaOut: JSON.stringify(buildSchemaOut(values.schemaOutFields)),
      };

      const res = await fetch(
        isNew ? '/api/rule-types' : `/api/rule-types/${values.ruleTypeId}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      // eslint-disable-next-line no-alert
      alert('Rule type saved');
      navigate({ to: '/rule-types' }); // adjust route
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Error saving rule type');
    } finally {
      setSaving(false);
    }
  });

  const handleDelete = async () => {
    if (!form.values.ruleTypeId) {
      return;
    }
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete this rule type? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/rule-types/${form.values.ruleTypeId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete');
      }
      // eslint-disable-next-line no-alert
      alert('Rule type deleted');
      navigate({ to: '/rule-types' });
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Error deleting rule type');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell /*header={null}*/>
      <Container size="lg" py="md" style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading || saving || deleting} />
        <Stack>
          <Group justify="space-between" mb="xs">
            <div>
              <Text size="lg" fw={600}>
                {isNew ? 'New rule type' : 'Edit rule type'}
              </Text>
              <Text c="dimmed" size="sm">
                Define the decision, input/output schemas, and governance for this rule type.
              </Text>
            </div>
          </Group>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
               <GeneralSection form={form} isEdit={!isNew} />

              <SchemaFieldsEditor
                kind="in"
                title="Input schema (schemaIn)"
                fields={form.values.schemaInFields}
                onChange={(fields) => form.setFieldValue('schemaInFields', fields)}
              />

              <SchemaFieldsEditor
                kind="out"
                title="Output schema (schemaOut)"
                fields={form.values.schemaOutFields}
                onChange={(fields) => form.setFieldValue('schemaOutFields', fields)}
              />

{/*               <GovernanceSection form={form} /> */}

              <Divider />

              <Group justify="space-between" mt="md">
                <Text size="sm" c="dimmed">
                  {/* You can inject last-updated metadata here */}
                </Text>
                <Group>
                  {!isNew && (
                    <Button
                      color="red"
                      variant="light"
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    variant="default"
                    type="button"
                    onClick={() => navigate({ to: '/rule-types' })}
                  >
                    Cancel
                  </Button>
                  <Button disabled type="submit">
                    Save
                  </Button>
                </Group>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Container>
    </AppShell>
  );
};

export const Route = createFileRoute('/rule-types/')({
  component: RuleTypePage,
})
