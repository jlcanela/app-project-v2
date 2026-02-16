import {
  Stack,
  Paper,
  TextInput,
  Textarea,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { RuleTypeFormValues } from "@/routes/rule-types/(components)/types";
import { Result, useAtomValue } from '@effect-atom/atom-react';
import { selectedRuleTypeAtom } from './atoms';
import { graphql } from '@/graphql';
import { RuleTypeGeneralItemFragment } from '@/graphql/graphql';


type RuleTypeGeneralSectionProps = {
  form: UseFormReturnType<RuleTypeFormValues>;
  isEdit: boolean;
};

export const RuleTypeGeneralItem = graphql(/* GraphQL */ `
  fragment RuleTypeGeneralItem on RuleTypesSelectItem {
    ruleTypeId
    name
    description
  }
`)

export const GeneralSection: React.FC<RuleTypeGeneralSectionProps> = ({ form, isEdit }) => {
    const ruleTypeResult = useAtomValue(selectedRuleTypeAtom) as Result.Result<RuleTypeGeneralItemFragment>
    const ruleType = Result.getOrElse(ruleTypeResult,() => ({
        name: '',
        description: '',
        schemaInFields: [],
        schemaOutFields: [],
        //governance: emptyGovernance,
        }))

  return (
    <Paper withBorder radius="md" p="md">
      <Stack>
        {isEdit && (
          <TextInput
            label="Rule type ID"
            readOnly
            {...form.getInputProps('ruleTypeId')}
          />
        )}
        <TextInput
          label="Name"
          description='E.g. "Project Evaluation Rule Type"'
          withAsterisk
          value={ruleType?.name ?? ''}
          {...form.getInputProps('businessDecision')}
        />
        <Textarea
          label="Description"
          description="Express the decision in business language"
          autosize
          withAsterisk
          value={ruleType?.description ?? ''}
          {...form.getInputProps('description')}
        />
      </Stack>
    </Paper>
  );
};
