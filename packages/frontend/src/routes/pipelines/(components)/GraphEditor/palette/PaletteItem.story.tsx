import type { Meta, StoryObj } from '@storybook/react';
import { NODE_TYPES } from './nodeTypes';
import { PaletteItem } from './PaletteItem';

const meta: Meta<typeof PaletteItem> = {
  title: 'GraphEditor/Palette/PaletteItem',
  component: PaletteItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 200 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PaletteItem>;

export const HttpTrigger: Story = {
  args: { nodeType: NODE_TYPES.httpTrigger },
};

export const EventBusTrigger: Story = {
  args: { nodeType: NODE_TYPES.eventBusTrigger },
};

export const RuleStep: Story = {
  args: { nodeType: NODE_TYPES.ruleStep },
};

export const RequestStep: Story = {
  args: { nodeType: NODE_TYPES.requestStep },
};
