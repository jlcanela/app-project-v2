import { Paper, Stack, Textarea, TextInput } from '@mantine/core';
// import { UseFormReturnType } from '@mantine/form';
// import { RuleTypeFormValues } from "@/routes/rule-types/(components)/types";
// import { Result, useAtomValue } from '@effect-atom/atom-react';
// import { selectedRuleTypeAtom } from './atoms';
import { graphql } from '@/graphql';
import { RuleTypeGeneralItemFragment } from '@/graphql/graphql';

type RuleTypeGeneralSectionProps = {
  //form: UseFormReturnType<RuleTypeFormValues>;
  ruleType: RuleTypeGeneralItemFragment;
  isEdit: boolean;
};

export const RuleTypeGeneralItem = graphql(/* GraphQL */ `
  fragment RuleTypeGeneralItem on RuleTypesSelectItem {
    ruleTypeId
    name
    description
  }
`);

export const GeneralSection: React.FC<RuleTypeGeneralSectionProps> = ({ ruleType, isEdit }) => {
  return (
    <Paper withBorder radius="md" p="md">
      <Stack>
        {isEdit && (
          <TextInput label="Rule type ID" readOnly value={ruleType?.ruleTypeId?.toString() ?? ''} />
        )}
        <TextInput
          label="Name"
          description='E.g. "Project Evaluation Rule Type"'
          withAsterisk
          value={ruleType?.name ?? ''}
        />
        <Textarea
          label="Description"
          description="Express the decision in business language"
          autosize
          withAsterisk
          value={ruleType?.description ?? ''}
        />
      </Stack>
    </Paper>
  );
};
