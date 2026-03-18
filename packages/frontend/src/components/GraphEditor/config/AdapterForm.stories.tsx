import { FieldMapping, FieldsAdapter, MergeAdapter, PassthroughAdapter } from '@app/domain';
import type { Meta, StoryObj } from '@storybook/react';
import { AdapterForm } from './AdapterForm';

/** Wrapper to render AdapterForm at config panel width */
function AdapterFormStory(props: React.ComponentProps<typeof AdapterForm>) {
  return (
    <div style={{ width: 340, padding: 16, border: '1px solid #eee' }}>
      <AdapterForm {...props} />
    </div>
  );
}

const meta: Meta<typeof AdapterFormStory> = {
  title: 'Config/AdapterForm',
  component: AdapterFormStory,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdapterFormStory>;

/** Passthrough adapter — no extra fields (Story 5.1) */
export const Passthrough: Story = {
  args: {
    adapter: new PassthroughAdapter({ kind: 'passthrough' }),
    label: 'Input Adapter',
  },
};

/** Fields adapter — shows FieldMappingEditor with mappings (Story 5.2) */
export const Fields: Story = {
  args: {
    adapter: new FieldsAdapter({
      kind: 'fields',
      mappings: [
        new FieldMapping({ source: 'order.id', target: 'orderId' }),
        new FieldMapping({ source: 'order.total', target: 'amount', defaultValue: 0 }),
      ],
    }),
    label: 'Input Adapter',
    onMappingAdd: () => {},
    onMappingEdit: () => {},
    onMappingRemove: () => {},
  },
};

/** Merge adapter — shows targetKey TextInput (Story 5.3) */
export const Merge: Story = {
  args: {
    adapter: new MergeAdapter({ kind: 'merge', targetKey: 'result' }),
    label: 'Input Adapter',
    onMergeTargetKeyChange: () => {},
  },
};

/** Merge adapter with empty targetKey (Story 5.3) */
export const MergeEmpty: Story = {
  args: {
    adapter: new MergeAdapter({ kind: 'merge' }),
    label: 'Input Adapter',
    onMergeTargetKeyChange: () => {},
  },
};

/** Passthrough as output adapter label (Story 5.1) */
export const OutputAdapter: Story = {
  args: {
    adapter: new PassthroughAdapter({ kind: 'passthrough' }),
    label: 'Output Adapter',
  },
};

/** Output adapter with hideTypeSelect — type-specific fields only (Story 5.4) */
export const OutputFieldsHiddenSelect: Story = {
  args: {
    adapter: new FieldsAdapter({
      kind: 'fields',
      mappings: [new FieldMapping({ source: 'ctx.value', target: 'output' })],
    }),
    label: '',
    hideTypeSelect: true,
    onMappingAdd: () => {},
    onMappingEdit: () => {},
    onMappingRemove: () => {},
  },
};
