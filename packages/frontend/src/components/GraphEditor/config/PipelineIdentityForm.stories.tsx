import { HttpTriggerConfig, PipelineConfig } from '@app/domain';
import type { Meta, StoryObj } from '@storybook/react';
import { PipelineIdentityForm } from './PipelineIdentityForm';

/** Wrapper to render PipelineIdentityForm at config panel width */
function PipelineIdentityFormStory(props: React.ComponentProps<typeof PipelineIdentityForm>) {
  return (
    <div style={{ width: 340, padding: 16, border: '1px solid #eee' }}>
      <PipelineIdentityForm {...props} />
    </div>
  );
}

const meta: Meta<typeof PipelineIdentityFormStory> = {
  title: 'Config/PipelineIdentityForm',
  component: PipelineIdentityFormStory,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PipelineIdentityFormStory>;

const defaultTrigger = new HttpTriggerConfig({ type: 'http', method: 'POST', path: '/webhook' });

/** Default values — freshly created pipeline (Story 6.1) */
export const DefaultValues: Story = {
  args: {
    pipeline: new PipelineConfig({
      id: 'default-pipeline',
      name: 'Default Pipeline',
      trigger: defaultTrigger,
      steps: [],
      enabled: true,
      version: 1,
    }),
    onUpdate: () => {},
  },
};

/** Populated values — pipeline with all metadata filled (Story 6.1) */
export const PopulatedValues: Story = {
  args: {
    pipeline: new PipelineConfig({
      id: 'order-processing-pipeline',
      name: 'Order Processing',
      description: 'Validates and processes incoming orders through multiple business rules',
      trigger: defaultTrigger,
      steps: [],
      enabled: false,
      version: 3,
    }),
    onUpdate: () => {},
  },
};
