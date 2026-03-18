import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import {
  FieldMapping,
  FieldsAdapter,
  MergeAdapter,
  PassthroughAdapter,
  PipelineStepConfig,
  RequestOperationConfig,
  RuleOperationConfig,
} from '@app/domain';
import { StepNode } from './StepNode';

const nodeTypes = {
  ruleStep: StepNode,
  requestStep: StepNode,
};

/** Helper to render a single step node inside a minimal ReactFlow canvas */
function StepNodeStory({
  step,
  nodeType,
  selected = false,
}: {
  step: PipelineStepConfig;
  nodeType: string;
  selected?: boolean;
}) {
  const nodes = [
    {
      id: 'step-0',
      type: nodeType,
      position: { x: 50, y: 40 },
      data: { step, index: 0 },
      selected,
    },
  ];

  return (
    <div style={{ width: 400, height: 280 }}>
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

const meta: Meta<typeof StepNodeStory> = {
  title: 'GraphEditor/Canvas/StepNode',
  component: StepNodeStory,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StepNodeStory>;

export const RuleStepPassthrough: Story = {
  name: 'Rule Step (Passthrough)',
  args: {
    step: new PipelineStepConfig({
      name: 'validateProject',
      operation: new RuleOperationConfig({
        type: 'Rule',
        ruleName: 'validateProject',
        ruleTypeRef: 'Project Validation',
      }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    }),
    nodeType: 'ruleStep',
  },
};

export const RuleStepSelected: Story = {
  name: 'Rule Step (Selected)',
  args: {
    step: new PipelineStepConfig({
      name: 'validateProject',
      operation: new RuleOperationConfig({
        type: 'Rule',
        ruleName: 'validateProject',
      }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    }),
    nodeType: 'ruleStep',
    selected: true,
  },
};

export const RequestStepFields: Story = {
  name: 'Request Step (Fields adapter)',
  args: {
    step: new PipelineStepConfig({
      name: 'publishValidation',
      operation: new RequestOperationConfig({
        type: 'Request',
        requestTag: 'PublishEvent',
      }),
      inputAdapter: new FieldsAdapter({
        kind: 'fields',
        mappings: [
          new FieldMapping({ source: 'status', target: 'payload' }),
          new FieldMapping({ source: 'project.id', target: 'entityId' }),
        ],
      }),
    }),
    nodeType: 'requestStep',
  },
};

export const RequestStepSelected: Story = {
  name: 'Request Step (Selected)',
  args: {
    step: new PipelineStepConfig({
      name: 'createProjectEntity',
      operation: new RequestOperationConfig({
        type: 'Request',
        requestTag: 'CreateProject',
      }),
      inputAdapter: new FieldsAdapter({
        kind: 'fields',
        mappings: [new FieldMapping({ source: 'form', target: 'projectForm' })],
      }),
    }),
    nodeType: 'requestStep',
    selected: true,
  },
};

export const StepWithMergeAdapter: Story = {
  name: 'Rule Step (Merge adapter)',
  args: {
    step: new PipelineStepConfig({
      name: 'prepareProject',
      operation: new RuleOperationConfig({
        type: 'Rule',
        ruleName: 'prepareProject',
        ruleTypeRef: 'Project Preparation',
      }),
      inputAdapter: new MergeAdapter({ kind: 'merge', targetKey: 'form' }),
    }),
    nodeType: 'ruleStep',
  },
};
