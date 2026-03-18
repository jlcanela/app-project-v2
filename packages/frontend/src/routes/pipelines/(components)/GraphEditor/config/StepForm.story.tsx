import {
  PassthroughAdapter,
  PipelineStepConfig,
  RequestOperationConfig,
  RuleOperationConfig,
} from '@app/domain';
import type { Meta, StoryObj } from '@storybook/react';
import { StepForm } from './StepForm';

/** Wrapper to render StepForm at config panel width */
function StepFormStory(props: React.ComponentProps<typeof StepForm>) {
  return (
    <div style={{ width: 340, padding: 16, border: '1px solid #eee' }}>
      <StepForm {...props} />
    </div>
  );
}

const meta: Meta<typeof StepFormStory> = {
  title: 'GraphEditor/Config/StepForm',
  component: StepFormStory,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StepFormStory>;

/** Rule step with name only — shows Rule Operation fields (Story 4.2) */
export const RuleStepBasic: Story = {
  args: {
    step: new PipelineStepConfig({
      name: 'Validate Order',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'validate-order' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    }),
    index: 0,
  },
};

/** Rule step with description and ruleTypeRef populated (Story 4.2) */
export const RuleStepWithDescription: Story = {
  args: {
    step: new PipelineStepConfig({
      name: 'Validate Order',
      description: 'Runs business validation rules on the incoming order request',
      operation: new RuleOperationConfig({
        type: 'Rule',
        ruleName: 'validate-order',
        ruleTypeRef: 'OrderValidation',
      }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    }),
    index: 0,
  },
};

/** Rule step with empty ruleTypeRef — shows optional field is blank (Story 4.2) */
export const RuleStepEmptyOptionals: Story = {
  args: {
    step: new PipelineStepConfig({
      name: 'Check Eligibility',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'check-eligibility' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    }),
    index: 2,
  },
};

/** Request step with name only — shows Request Operation fields (Story 4.3) */
export const RequestStepBasic: Story = {
  args: {
    step: new PipelineStepConfig({
      name: 'Fetch Customer',
      operation: new RequestOperationConfig({ type: 'Request', requestTag: 'GetCustomer' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    }),
    index: 1,
  },
};

/** Request step with description — shows requestTag field (Story 4.3) */
export const RequestStepWithDescription: Story = {
  args: {
    step: new PipelineStepConfig({
      name: 'Publish Event',
      description: 'Publishes validation result to the event bus for downstream consumers',
      operation: new RequestOperationConfig({ type: 'Request', requestTag: 'PublishEvent' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    }),
    index: 2,
  },
};

/** Request step with empty tag — blank state (Story 4.3) */
export const RequestStepEmpty: Story = {
  args: {
    step: new PipelineStepConfig({
      name: 'New Request Step',
      operation: new RequestOperationConfig({ type: 'Request', requestTag: '' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    }),
    index: 0,
  },
};

/** Step with empty name — demonstrates blank state */
export const EmptyStep: Story = {
  args: {
    step: new PipelineStepConfig({
      name: '',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: '' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    }),
    index: 0,
  },
};

/** Rule step with type switcher visible (Story 4.4) */
export const RuleWithTypeSwitcher: Story = {
  args: {
    step: new PipelineStepConfig({
      name: 'Validate Order',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'validate-order' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    }),
    index: 0,
    onOperationTypeChange: () => {},
  },
};

/** Request step with type switcher visible (Story 4.4) */
export const RequestWithTypeSwitcher: Story = {
  args: {
    step: new PipelineStepConfig({
      name: 'Fetch Customer',
      operation: new RequestOperationConfig({ type: 'Request', requestTag: 'GetCustomer' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    }),
    index: 1,
    onOperationTypeChange: () => {},
  },
};
