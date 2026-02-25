import {
  ConditionConfig,
  EventBusTriggerConfig,
  FieldMapping,
  FieldsAdapter,
  HttpTriggerConfig,
  MergeAdapter,
  PassthroughAdapter,
  PipelineConfig,
  PipelineStepConfig,
  projectCreationPipelineConfig,
  projectValidationPipelineConfig,
  RequestOperationConfig,
  RuleOperationConfig,
} from '@app/domain';
import type { Meta, StoryObj } from '@storybook/react';
import { PipelineDetail } from './PipelineDetail';

const meta: Meta<typeof PipelineDetail> = {
  title: 'Pipelines/PipelineDetail',
  component: PipelineDetail,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PipelineDetail>;

// ---------------------------------------------------------------------------
// Stories using real example configs
// ---------------------------------------------------------------------------

export const ValidationPipeline: Story = {
  name: 'HTTP Trigger — Project Validation',
  args: {
    pipeline: projectValidationPipelineConfig,
  },
};

export const CreationPipeline: Story = {
  name: 'Event Bus Trigger — Project Creation',
  args: {
    pipeline: projectCreationPipelineConfig,
  },
};

// ---------------------------------------------------------------------------
// Edge-case stories
// ---------------------------------------------------------------------------

const minimalPipeline = new PipelineConfig({
  id: 'minimal-pipeline',
  name: 'Minimal Pipeline',
  trigger: new HttpTriggerConfig({
    type: 'http',
    method: 'GET',
    path: '/health',
  }),
  steps: [
    new PipelineStepConfig({
      name: 'healthCheck',
      operation: new RequestOperationConfig({
        type: 'Request',
        requestTag: 'HealthCheck',
      }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    }),
  ],
});

export const Minimal: Story = {
  name: 'Minimal — Single Step, No Description',
  args: {
    pipeline: minimalPipeline,
  },
};

const disabledPipeline = new PipelineConfig({
  id: 'disabled-pipeline',
  name: 'Disabled Pipeline',
  description: 'This pipeline is currently disabled for maintenance.',
  enabled: false,
  version: 3,
  trigger: new EventBusTriggerConfig({
    type: 'event_bus',
    channel: 'system.maintenance',
    payloadSchemaRef: 'MaintenanceEvent',
    filterExpression: "severity == 'critical'",
  }),
  steps: [
    new PipelineStepConfig({
      name: 'notifyAdmin',
      description: 'Send notification to administrators',
      operation: new RequestOperationConfig({
        type: 'Request',
        requestTag: 'SendNotification',
      }),
      inputAdapter: new FieldsAdapter({
        kind: 'fields',
        mappings: [
          new FieldMapping({ source: 'message', target: 'body' }),
          new FieldMapping({ source: 'severity', target: 'priority' }),
        ],
      }),
      outputAdapter: new MergeAdapter({ kind: 'merge', targetKey: 'notification' }),
      condition: new ConditionConfig({
        field: 'severity',
        operator: 'eq',
        value: 'critical',
      }),
    }),
  ],
});

export const Disabled: Story = {
  name: 'Disabled Pipeline with Condition',
  args: {
    pipeline: disabledPipeline,
  },
};

const manyStepsPipeline = new PipelineConfig({
  id: 'complex-pipeline',
  name: 'Complex Multi-Step Pipeline',
  description: 'A pipeline with many steps demonstrating all adapter types and operations.',
  version: 5,
  trigger: new HttpTriggerConfig({
    type: 'http',
    method: 'POST',
    path: '/orders/process',
    payloadSchemaRef: 'OrderRequest',
  }),
  steps: [
    new PipelineStepConfig({
      name: 'validateOrder',
      description: 'Validate order against business rules',
      operation: new RuleOperationConfig({
        type: 'Rule',
        ruleName: 'validateOrder',
        ruleTypeRef: 'Order Validation',
      }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
      outputAdapter: new MergeAdapter({ kind: 'merge', targetKey: 'validation' }),
    }),
    new PipelineStepConfig({
      name: 'enrichCustomer',
      description: 'Fetch customer details from CRM',
      operation: new RequestOperationConfig({
        type: 'Request',
        requestTag: 'GetCustomerById',
      }),
      inputAdapter: new FieldsAdapter({
        kind: 'fields',
        mappings: [new FieldMapping({ source: 'customerId', target: 'id' })],
      }),
      outputAdapter: new MergeAdapter({ kind: 'merge', targetKey: 'customer' }),
    }),
    new PipelineStepConfig({
      name: 'calculatePricing',
      description: 'Apply pricing rules based on customer tier',
      operation: new RuleOperationConfig({
        type: 'Rule',
        ruleName: 'calculatePricing',
        ruleTypeRef: 'Pricing Rules',
      }),
      inputAdapter: new FieldsAdapter({
        kind: 'fields',
        mappings: [
          new FieldMapping({ source: 'items', target: 'lineItems' }),
          new FieldMapping({ source: 'customer.tier', target: 'customerTier' }),
        ],
      }),
      outputAdapter: new MergeAdapter({ kind: 'merge', targetKey: 'pricing' }),
    }),
    new PipelineStepConfig({
      name: 'createOrder',
      description: 'Persist the order entity',
      operation: new RequestOperationConfig({
        type: 'Request',
        requestTag: 'CreateOrder',
      }),
      inputAdapter: new FieldsAdapter({
        kind: 'fields',
        mappings: [
          new FieldMapping({ source: 'items', target: 'lineItems' }),
          new FieldMapping({ source: 'pricing', target: 'pricing' }),
          new FieldMapping({ source: 'customer', target: 'customer' }),
        ],
      }),
      outputAdapter: new MergeAdapter({ kind: 'merge', targetKey: 'order' }),
      condition: new ConditionConfig({ field: 'validation', operator: 'exists' }),
    }),
    new PipelineStepConfig({
      name: 'publishOrderCreated',
      description: 'Notify downstream systems',
      operation: new RequestOperationConfig({
        type: 'Request',
        requestTag: 'PublishEvent',
      }),
      inputAdapter: new FieldsAdapter({
        kind: 'fields',
        mappings: [new FieldMapping({ source: 'order', target: 'payload' })],
      }),
    }),
  ],
});

export const ManySteps: Story = {
  name: 'Complex — 5 Steps, Mixed Operations',
  args: {
    pipeline: manyStepsPipeline,
  },
};
