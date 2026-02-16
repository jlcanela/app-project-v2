// src/pages/rule-types/RuleTypePage.tsx

import {
  Stack,
  Paper,
  TextInput,
  Textarea,
  Group,
  TagsInput,
  Switch,
 
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { UseFormReturnType } from '@mantine/form';
import { RuleTypeFormValues } from './types';


type RuleTypeGovernanceSectionProps = {
  form: UseFormReturnType<RuleTypeFormValues>;
};

export const GovernanceSection: React.FC<RuleTypeGovernanceSectionProps> = ({ form }) => {
  return (
    <Paper withBorder radius="md" p="md">
      <Stack>
        <Group grow>
          <TextInput
            label="Version"
            description="Semantic version for this rule type"
            {...form.getInputProps('governance.version')}
          />
          <DateInput
            label="Effective from"
            {...form.getInputProps('governance.effectiveFrom')}
          />
        </Group>
        <Switch
          label="This version introduces breaking schema changes"
          {...form.getInputProps('governance.breakingChange', { type: 'checkbox' })}
        />
        <Textarea
          label="Change notes"
          description="Impact on existing rules/tests and required updates"
          autosize
          {...form.getInputProps('governance.changeNotes')}
        />
        <TagsInput
          label="Notified teams"
          {...form.getInputProps('governance.notifiedTeams')}
        />
        <Textarea
          label="Communication summary"
          autosize
          {...form.getInputProps('governance.communicationSummary')}
        />
      </Stack>
    </Paper>
  );
};
