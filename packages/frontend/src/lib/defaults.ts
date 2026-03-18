import {
  EventBusTriggerConfig,
  HttpTriggerConfig,
  PassthroughAdapter,
  PipelineConfig,
  PipelineStepConfig,
  RequestOperationConfig,
  RuleOperationConfig,
} from '@app/domain';

// Default pipeline configuration
export const defaultPipeline = new PipelineConfig({
  id: 'default-pipeline',
  name: 'Default Pipeline',
  description: 'A default pipeline for testing',
  trigger: new HttpTriggerConfig({
    type: 'http',
    method: 'POST',
    path: '/webhook',
  }),
  steps: [],
  enabled: true,
  version: 1,
});

// Default trigger configurations
export const defaultHttpTrigger = new HttpTriggerConfig({
  type: 'http',
  method: 'POST',
  path: '/webhook',
});

export const defaultEventBusTrigger = new EventBusTriggerConfig({
  type: 'event_bus',
  channel: 'events',
});

// Default step configurations
export const defaultRuleStep = new PipelineStepConfig({
  name: 'New Rule Step',
  operation: new RuleOperationConfig({
    type: 'Rule',
    ruleName: 'default-rule',
  }),
  inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
});

export const defaultRequestStep = new PipelineStepConfig({
  name: 'New Request Step',
  operation: new RequestOperationConfig({
    type: 'Request',
    requestTag: 'DefaultRequest',
  }),
  inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
});
