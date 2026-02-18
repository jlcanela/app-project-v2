// src/pages/rule-types/RuleTypePage.tsx
import React from 'react';
// Adapt this to your router
import { useNavigate } from '@tanstack/react-router';
import {
  AppShell,
  Button,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  // LoadingOverlay,
} from '@mantine/core';
import { RuleTypeGeneralItemFragment, RuleTypeItemFragment } from '@/graphql/graphql';
import { SchemaFieldsEditor } from './JsonSchemaEditor';
import { GeneralSection } from './SimplifiedGeneralSection';

interface RuleTypeDetailProps {
  ruleType: RuleTypeItemFragment;
}

export const RuleTypeDetail: React.FC<RuleTypeDetailProps> = ({ ruleType }) => {
  const navigate = useNavigate();
  const isNew = true;

  return (
    <AppShell /*header={null}*/>
      <Container size="lg" py="md" style={{ position: 'relative' }}>
        {/*         <LoadingOverlay visible={loading || saving || deleting} /> */}
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
          {
            <form /*onSubmit={handleSubmit}*/>
              <Stack gap="md">
                <GeneralSection
                  ruleType={ruleType as unknown as RuleTypeGeneralItemFragment}
                  isEdit={!isNew}
                />

                <SchemaFieldsEditor
                  kind="in"
                  title="Input schema (schemaIn)"
                  fields={JSON.parse(ruleType?.schemaIn ?? '[]')}
                  onChange={() => {}}
                  //onChange={(fields) => form.setFieldValue('schemaIn', fields)}
                />

                <SchemaFieldsEditor
                  kind="out"
                  title="Output schema (schemaOut)"
                  onChange={() => {}}
                  fields={JSON.parse(ruleType?.schemaOut ?? '[]')}
                  //onChange={(fields) => form.setFieldValue('schemaOut', fields)}
                />

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
                        //onClick={handleDelete}
                      >
                        Delete
                      </Button>
                    )}
                    <Button
                      variant="default"
                      type="button"
                      onClick={() => navigate({ to: '/types' })}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </Group>
                </Group>
              </Stack>
            </form>
          }
        </Stack>
      </Container>
    </AppShell>
  );
};
