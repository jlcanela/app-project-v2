import { Atom, useAtom } from '@effect-atom/atom-react';
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { graphql } from '@/graphql';
import { SelectRuleTypeItemFragment } from '@/graphql/graphql';

export interface AddRuleModalProps {
  opened: boolean;
  ruleTypes: SelectRuleTypeItemFragment[];
  onCreateRule: (values: { name: string; description: string; content: string }) => void;
  onClose: () => void;
}

export const SelectRuleTypeItem = graphql(`
  fragment SelectRuleTypeItem on RuleTypesSelectItem {
    ruleTypeId
    name
  }
`);

const newRuleNameAtom = Atom.make('');
const newDescriptionNameAtom = Atom.make('');

export function AddRuleModal({ opened, onClose, onCreateRule, ruleTypes }: AddRuleModalProps) {
  const [newRuleName, setNewRuleName] = useAtom(newRuleNameAtom);
  const [newDescriptionName, setNewDescriptionName] = useAtom(newDescriptionNameAtom);

  const handleAddRule = () => {
    if (!newRuleName.trim()) {
      return;
    }
    onCreateRule({
      name: newRuleName,
      description: newDescriptionName,
      content: '{ nodes: [], edges: []}',
    });
    setNewRuleName('');
    setNewDescriptionName('');
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add Rule">
      <Stack>
        <TextInput
          label="Name"
          placeholder="Enter rule name"
          value={newRuleName}
          onChange={(e) => setNewRuleName(e.currentTarget.value)}
          data-autofocus
        />
        <TextInput
          label="Description"
          placeholder="Enter rule description"
          value={newDescriptionName}
          onChange={(e) => setNewDescriptionName(e.currentTarget.value)}
          data-autofocus
        />
        <Select
          label="Rule Type"
          placeholder="Select rule type"
          data={ruleTypes.map((u) => ({
            value: u.ruleTypeId.toString(),
            label: u.name!,
          }))}
          //value={newPostAuthorId}
          //onChange={setNewPostAuthorId}
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddRule}>Save</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
