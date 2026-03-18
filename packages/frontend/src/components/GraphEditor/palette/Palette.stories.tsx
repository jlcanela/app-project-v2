import type { Meta, StoryObj } from '@storybook/react';
import { Palette } from './Palette';

const meta: Meta<typeof Palette> = {
  title: 'Palette/Palette',
  component: Palette,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 220, height: 400, border: '1px solid #dee2e6', borderRadius: 4 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Palette>;

export const Default: Story = {};
