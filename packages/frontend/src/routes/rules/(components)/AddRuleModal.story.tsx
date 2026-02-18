import { AddRuleModal, type AddRuleModalProps } from './AddRuleModal';

export default {
  title: 'Rules/AddRuleModal',
  tags: ['autodocs'],
};

const defaultRuleTypes = [
  { ruleTypeId: 1, name: 'Rule1', schemaIn: '[]', schemaOut: '[]' },
  { ruleTypeId: 2, name: 'Rule2', schemaIn: '[]', schemaOut: '[]' },
];

const baseProps: AddRuleModalProps = {
  opened: true,
  onClose: () => {},
  onCreateRule: () => {},
  ruleTypes: defaultRuleTypes,
};

export const Default = () => <AddRuleModal {...baseProps} />;

export const Closed = () => <AddRuleModal {...baseProps} opened={false} />;
