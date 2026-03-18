import {
  EventBusTriggerConfig,
  HttpTriggerConfig,
  PassthroughAdapter,
  PipelineStepConfig,
  RequestOperationConfig,
  RuleOperationConfig,
} from '@app/domain';
import type { Meta, StoryObj } from '@storybook/react';
import { defaultPipeline } from '@/lib/defaults';
import type { SelectedNode } from '../pipeline-selectors';
import { ConfigPanel } from './ConfigPanel';

/** Wrapper that passes a static selection to ConfigPanel (no atom needed) */
function ConfigPanelStory({ selection }: { selection?: SelectedNode }) {
  return (
    <div style={{ width: 340, height: 500, border: '1px solid #eee' }}>
      <ConfigPanel pipeline={defaultPipeline} selection={selection ?? null} dispatch={() => {}} />
    </div>
  );
}

const meta: Meta<typeof ConfigPanelStory> = {
  title: 'Config/ConfigPanel',
  component: ConfigPanelStory,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConfigPanelStory>;

/** Empty state — no node selected */
export const Empty: Story = {
  args: { selection: null },
};

/** HTTP Trigger selected */
export const HttpTriggerSelected: Story = {
  args: {
    selection: {
      kind: 'trigger',
      trigger: new HttpTriggerConfig({
        type: 'http',
        method: 'POST',
        path: '/api/webhook',
      }),
    },
  },
};

/** Event Bus Trigger selected (with optional fields populated) */
export const EventBusTriggerSelected: Story = {
  args: {
    selection: {
      kind: 'trigger',
      trigger: new EventBusTriggerConfig({
        type: 'event_bus',
        channel: 'order-events',
        payloadSchemaRef: 'OrderPayload',
        filterExpression: 'event.type == "created"',
      }),
    },
  },
};

/** Step selected — Rule operation (Story 4.1) */
export const StepSelected: Story = {
  args: {
    selection: {
      kind: 'step',
      step: new PipelineStepConfig({
        name: 'Validate Order',
        operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'validate-order' }),
        inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
      }),
      index: 0,
    },
  },
};

/** Request step selected */
export const RequestStepSelected: Story = {
  args: {
    selection: {
      kind: 'step',
      step: new PipelineStepConfig({
        name: 'Fetch Customer',
        operation: new RequestOperationConfig({ type: 'Request', requestTag: 'GetCustomer' }),
        inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
      }),
      index: 1,
    },
  },
};
