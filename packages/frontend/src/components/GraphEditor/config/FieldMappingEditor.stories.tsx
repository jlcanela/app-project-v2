import { FieldMapping } from '@app/domain';
import type { Meta, StoryObj } from '@storybook/react';
import { FieldMappingEditor } from './FieldMappingEditor';

/** Wrapper to render FieldMappingEditor at config panel width */
function FieldMappingEditorStory(props: React.ComponentProps<typeof FieldMappingEditor>) {
  return (
    <div style={{ width: 340, padding: 16, border: '1px solid #eee' }}>
      <FieldMappingEditor {...props} />
    </div>
  );
}

const meta: Meta<typeof FieldMappingEditorStory> = {
  title: 'Config/FieldMappingEditor',
  component: FieldMappingEditorStory,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FieldMappingEditorStory>;

/** Empty state — no mappings yet (Story 5.2) */
export const Empty: Story = {
  args: {
    mappings: [],
  },
};

/** Single mapping row (Story 5.2) */
export const SingleMapping: Story = {
  args: {
    mappings: [new FieldMapping({ source: 'order.id', target: 'orderId' })],
  },
};

/** Multiple mappings with default values (Story 5.2) */
export const MultipleMappings: Story = {
  args: {
    mappings: [
      new FieldMapping({ source: 'order.id', target: 'orderId' }),
      new FieldMapping({ source: 'order.total', target: 'amount', defaultValue: 0 }),
      new FieldMapping({
        source: 'customer.email',
        target: 'email',
        defaultValue: 'unknown@example.com',
      }),
    ],
  },
};
