import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { EventBusTriggerConfig, HttpTriggerConfig } from '@app/domain';
import { TriggerNode } from './TriggerNode';

const nodeTypes = {
  httpTrigger: TriggerNode,
  eventBusTrigger: TriggerNode,
};

/** Helper to render a single trigger node inside a minimal ReactFlow canvas */
function TriggerNodeStory({
  trigger,
  nodeType,
  selected = false,
}: {
  trigger: HttpTriggerConfig | EventBusTriggerConfig;
  nodeType: string;
  selected?: boolean;
}) {
  const nodes = [
    {
      id: 'trigger-0',
      type: nodeType,
      position: { x: 50, y: 40 },
      data: { trigger },
      selected,
    },
  ];

  return (
    <div style={{ width: 400, height: 250 }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={[]}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        />
      </ReactFlowProvider>
    </div>
  );
}

const meta: Meta<typeof TriggerNodeStory> = {
  title: 'Canvas/TriggerNode',
  component: TriggerNodeStory,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TriggerNodeStory>;

export const HttpTrigger: Story = {
  args: {
    trigger: new HttpTriggerConfig({
      type: 'http',
      method: 'POST',
      path: '/project-request/status',
    }),
    nodeType: 'httpTrigger',
  },
};

export const HttpTriggerSelected: Story = {
  name: 'HTTP Trigger (Selected)',
  args: {
    trigger: new HttpTriggerConfig({
      type: 'http',
      method: 'GET',
      path: '/api/projects',
    }),
    nodeType: 'httpTrigger',
    selected: true,
  },
};

export const EventBusTrigger: Story = {
  args: {
    trigger: new EventBusTriggerConfig({
      type: 'event_bus',
      channel: 'project.validation.events',
    }),
    nodeType: 'eventBusTrigger',
  },
};

export const EventBusTriggerSelected: Story = {
  name: 'Event Bus Trigger (Selected)',
  args: {
    trigger: new EventBusTriggerConfig({
      type: 'event_bus',
      channel: 'orders.created',
      filterExpression: "_tag == 'OrderCreated'",
    }),
    nodeType: 'eventBusTrigger',
    selected: true,
  },
};
