import {
  Stack,
  Paper,
  TextInput,
  Textarea,
  MultiSelect, 
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { RuleTypeFormValues } from "./types";

type RuleTypeGeneralSectionProps = {
  form: UseFormReturnType<RuleTypeFormValues>;
  isEdit: boolean;
};

export const GeneralSection: React.FC<RuleTypeGeneralSectionProps> = ({ form, isEdit }) => {
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
          label="Business decision"
          description='E.g. "Customer discount decision"'
          withAsterisk
          {...form.getInputProps('businessDecision')}
        />
        <Textarea
          label="Description"
          description="Express the decision in business language"
          autosize
          withAsterisk
          {...form.getInputProps('description')}
        />
        <MultiSelect
          label="Calling systems"
          description="Systems that will call this rule type"
          searchable
          clearable
          data={[] /* TODO: inject actual systems list */}
          {...form.getInputProps('callingSystems')}
        />
        <Textarea
          label="Input contract"
          description="What callers can provide as input"
          autosize
          {...form.getInputProps('inputContractDescription')}
        />
        <Textarea
          label="Output contract"
          description="What callers can expect as output"
          autosize
          {...form.getInputProps('outputContractDescription')}
        />
      </Stack>
    </Paper>
  );
};
