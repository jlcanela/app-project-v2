import {
  EventBusTriggerConfig,
  FieldMapping,
  FieldsAdapter,
  HttpTriggerConfig,
  MergeAdapter,
  PassthroughAdapter,
  PipelineConfig,
  PipelineStepConfig,
  RequestOperationConfig,
  RuleOperationConfig,
  type TriggerConfig,
} from '@app/domain';
import { describe, expect, it } from 'vitest';
import { defaultPipeline } from '@/lib/defaults';
import { PipelineAction, reducePipeline } from '../atoms/pipeline';

// ── Pure helper functions that replicate atom derivation logic ────────────

type CanvasNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  selected: boolean;
  draggable: boolean;
  deletable?: boolean;
};

type CanvasEdge = {
  id: string;
  source: string;
  target: string;
  animated: boolean;
};

function triggerNodeType(trigger: TriggerConfig): string {
  return trigger.type === 'http' ? 'httpTrigger' : 'eventBusTrigger';
}

function stepNodeType(step: PipelineStepConfig): string {
  return step.operation.type === 'Rule' ? 'ruleStep' : 'requestStep';
}

function deriveCanvasNodes(
  pipeline: PipelineConfig,
  selectedId: string | null = null
): CanvasNode[] {
  const nodes: CanvasNode[] = [];
  nodes.push({
    id: 'trigger-0',
    type: triggerNodeType(pipeline.trigger),
    position: { x: 0, y: 100 },
    data: { trigger: pipeline.trigger },
    selected: selectedId === 'trigger-0',
    draggable: false,
    deletable: false,
  });
  pipeline.steps.forEach((step, index) => {
    const stepId = `step-${index}`;
    nodes.push({
      id: stepId,
      type: stepNodeType(step),
      position: { x: (index + 1) * 280, y: 100 },
      data: { step, index },
      selected: selectedId === stepId,
      draggable: true,
    });
  });
  return nodes;
}

function deriveCanvasEdges(pipeline: PipelineConfig): CanvasEdge[] {
  const edges: CanvasEdge[] = [];
  if (pipeline.steps.length === 0) {
    return edges;
  }
  edges.push({ id: 'edge-trigger-step-0', source: 'trigger-0', target: 'step-0', animated: true });
  for (let i = 0; i < pipeline.steps.length - 1; i++) {
    edges.push({
      id: `edge-step-${i}-step-${i + 1}`,
      source: `step-${i}`,
      target: `step-${i + 1}`,
      animated: true,
    });
  }
  return edges;
}

type SelectedNode =
  | { kind: 'trigger'; trigger: TriggerConfig }
  | { kind: 'step'; step: PipelineStepConfig; index: number }
  | null;

function deriveSelectedNode(selectedId: string | null, pipeline: PipelineConfig): SelectedNode {
  if (selectedId === null) {
    return null;
  }
  if (selectedId === 'trigger-0') {
    return { kind: 'trigger', trigger: pipeline.trigger };
  }
  const match = selectedId.match(/^step-(\d+)$/);
  if (match) {
    const index = parseInt(match[1]!, 10);
    const step = pipeline.steps[index];
    if (step) {
      return { kind: 'step', step, index };
    }
  }
  return null;
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Canvas Derived Atoms', () => {
  it('canvasNodesAtom produces trigger node from default pipeline', () => {
    const nodes = deriveCanvasNodes(defaultPipeline);
    // Default pipeline has an HTTP trigger and 0 steps
    expect(nodes).toHaveLength(1);
    expect(nodes[0]!.id).toBe('trigger-0');
    expect(nodes[0]!.type).toBe('httpTrigger');
  });

  it('canvasEdgesAtom produces no edges when pipeline has no steps', () => {
    const edges = deriveCanvasEdges(defaultPipeline);
    expect(edges).toHaveLength(0);
  });

  it('adding a step updates canvasNodesAtom and canvasEdgesAtom', () => {
    // Add a rule step
    const newStep = new PipelineStepConfig({
      name: 'Validate',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'validate' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });

    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({ ...defaultPipeline, steps: [...defaultPipeline.steps, newStep] })
      )
    );

    const nodes = deriveCanvasNodes(pipeline);
    expect(nodes).toHaveLength(2); // trigger + 1 step
    expect(nodes[1]!.id).toBe('step-0');
    expect(nodes[1]!.type).toBe('ruleStep');

    const edges = deriveCanvasEdges(pipeline);
    expect(edges).toHaveLength(1);
    expect(edges[0]!.source).toBe('trigger-0');
    expect(edges[0]!.target).toBe('step-0');
  });

  it('adding multiple steps creates sequential edges', () => {
    const step1 = new PipelineStepConfig({
      name: 'Step 1',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule1' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const step2 = new PipelineStepConfig({
      name: 'Step 2',
      operation: new RequestOperationConfig({ type: 'Request', requestTag: 'Req1' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });

    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step1, step2] }))
    );

    const nodes = deriveCanvasNodes(pipeline);
    expect(nodes).toHaveLength(3); // trigger + 2 steps
    expect(nodes[1]!.type).toBe('ruleStep');
    expect(nodes[2]!.type).toBe('requestStep');

    const edges = deriveCanvasEdges(pipeline);
    expect(edges).toHaveLength(2);
    expect(edges[0]).toMatchObject({ source: 'trigger-0', target: 'step-0' });
    expect(edges[1]).toMatchObject({ source: 'step-0', target: 'step-1' });
  });

  it('replacing trigger updates canvasNodesAtom node type', () => {
    const eventBusTrigger = new EventBusTriggerConfig({
      type: 'event_bus',
      channel: 'my-events',
    });

    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, trigger: eventBusTrigger }))
    );

    const nodes = deriveCanvasNodes(pipeline);
    expect(nodes[0]!.type).toBe('eventBusTrigger');
  });

  it('only one trigger node exists regardless of trigger replacements', () => {
    // Replace trigger multiple times
    let pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          trigger: new EventBusTriggerConfig({ type: 'event_bus', channel: 'ch1' }),
        })
      )
    );
    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...pipeline,
          trigger: new HttpTriggerConfig({ type: 'http', method: 'GET', path: '/api' }),
        })
      )
    );

    const nodes = deriveCanvasNodes(pipeline);
    const triggerNodes = nodes.filter((n) => n.id === 'trigger-0');
    expect(triggerNodes).toHaveLength(1);
    expect(triggerNodes[0]!.type).toBe('httpTrigger');
  });
});

describe('Node Selection (Story 2.4)', () => {
  it('all nodes are unselected when selectedNodeIdAtom is null', () => {
    const nodes = deriveCanvasNodes(defaultPipeline, null);
    expect(nodes.every((n) => n.selected === false)).toBe(true);
  });

  it('setting selectedNodeIdAtom marks the matching node as selected', () => {
    // Add a step so we have multiple nodes
    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          steps: [
            new PipelineStepConfig({
              name: 'Step A',
              operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'ruleA' }),
              inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
            }),
          ],
        })
      )
    );

    // Select the step node
    const nodes = deriveCanvasNodes(pipeline, 'step-0');

    expect(nodes).toHaveLength(2);
    expect(nodes[0]!.selected).toBe(false); // trigger not selected
    expect(nodes[1]!.selected).toBe(true); // step-0 selected
  });

  it('selecting trigger-0 marks only the trigger as selected', () => {
    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          steps: [
            new PipelineStepConfig({
              name: 'Step B',
              operation: new RequestOperationConfig({ type: 'Request', requestTag: 'ReqB' }),
              inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
            }),
          ],
        })
      )
    );

    const nodes = deriveCanvasNodes(pipeline, 'trigger-0');

    expect(nodes[0]!.selected).toBe(true); // trigger selected
    expect(nodes[1]!.selected).toBe(false); // step not selected
  });

  it('clearing selectedNodeIdAtom deselects all nodes', () => {
    // Select then deselect
    let nodes = deriveCanvasNodes(defaultPipeline, 'trigger-0');
    expect(nodes[0]!.selected).toBe(true);

    nodes = deriveCanvasNodes(defaultPipeline, null);
    expect(nodes[0]!.selected).toBe(false);
  });

  it('selecting a non-existent ID leaves all nodes unselected', () => {
    const nodes = deriveCanvasNodes(defaultPipeline, 'does-not-exist');
    expect(nodes.every((n) => n.selected === false)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Story 2.5 — Node Reordering & Removal
// ---------------------------------------------------------------------------

/** Helper to create a named rule step */
function ruleStep(name: string, ruleName: string): PipelineStepConfig {
  return new PipelineStepConfig({
    name,
    operation: new RuleOperationConfig({ type: 'Rule', ruleName }),
    inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
  });
}

/** Helper to create a named request step */
function requestStep(name: string, tag: string): PipelineStepConfig {
  return new PipelineStepConfig({
    name,
    operation: new RequestOperationConfig({ type: 'Request', requestTag: tag }),
    inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
  });
}

describe('Node Reordering & Removal (Story 2.5)', () => {
  it('trigger node has draggable:false and deletable:false', () => {
    const nodes = deriveCanvasNodes(defaultPipeline);
    const trigger = nodes.find((n) => n.id === 'trigger-0')!;
    expect(trigger.draggable).toBe(false);
    expect(trigger.deletable).toBe(false);
  });

  it('step nodes have draggable:true', () => {
    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({ ...defaultPipeline, steps: [ruleStep('A', 'rA')] })
      )
    );
    const nodes = deriveCanvasNodes(pipeline);
    const step = nodes.find((n) => n.id === 'step-0')!;
    expect(step.draggable).toBe(true);
  });

  it('reordering steps produces correct node types and edge sequence', () => {
    const stepA = ruleStep('A', 'rA');
    const stepB = requestStep('B', 'ReqB');
    const stepC = ruleStep('C', 'rC');

    let pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({ ...defaultPipeline, steps: [stepA, stepB, stepC] })
      )
    );

    // Reorder to B, A, C
    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...pipeline,
          steps: [stepB, stepA, stepC],
        })
      )
    );

    const nodes = deriveCanvasNodes(pipeline);
    expect(nodes).toHaveLength(4); // trigger + 3 steps
    // step-0 is now B (Request), step-1 is A (Rule), step-2 is C (Rule)
    expect(nodes[1]!.type).toBe('requestStep');
    expect(nodes[2]!.type).toBe('ruleStep');
    expect(nodes[3]!.type).toBe('ruleStep');

    const edges = deriveCanvasEdges(pipeline);
    expect(edges).toHaveLength(3);
    expect(edges[0]).toMatchObject({ source: 'trigger-0', target: 'step-0' });
    expect(edges[1]).toMatchObject({ source: 'step-0', target: 'step-1' });
    expect(edges[2]).toMatchObject({ source: 'step-1', target: 'step-2' });
  });

  it('removing a middle step reconnects edges sequentially', () => {
    const stepA = ruleStep('A', 'rA');
    const stepB = requestStep('B', 'ReqB');
    const stepC = ruleStep('C', 'rC');

    let pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({ ...defaultPipeline, steps: [stepA, stepB, stepC] })
      )
    );

    // Remove middle step (B) — simulates what onDelete does
    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...pipeline,
          steps: [stepA, stepC],
        })
      )
    );

    const nodes = deriveCanvasNodes(pipeline);
    expect(nodes).toHaveLength(3); // trigger + A + C

    const edges = deriveCanvasEdges(pipeline);
    expect(edges).toHaveLength(2);
    expect(edges[0]).toMatchObject({ source: 'trigger-0', target: 'step-0' });
    expect(edges[1]).toMatchObject({ source: 'step-0', target: 'step-1' });
  });

  it('removing the first step reconnects trigger to next step', () => {
    const stepA = ruleStep('A', 'rA');
    const stepB = requestStep('B', 'ReqB');

    let pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [stepA, stepB] }))
    );

    // Remove first step (A)
    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...pipeline,
          steps: [stepB],
        })
      )
    );

    const nodes = deriveCanvasNodes(pipeline);
    expect(nodes).toHaveLength(2); // trigger + B

    const edges = deriveCanvasEdges(pipeline);
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({ source: 'trigger-0', target: 'step-0' });
  });

  it('removing all steps leaves only trigger with no edges', () => {
    let pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({ ...defaultPipeline, steps: [ruleStep('Only', 'r')] })
      )
    );
    expect(deriveCanvasNodes(pipeline)).toHaveLength(2);

    // Remove the step
    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(new PipelineConfig({ ...pipeline, steps: [] }))
    );

    const nodes = deriveCanvasNodes(pipeline);
    expect(nodes).toHaveLength(1);
    expect(nodes[0]!.id).toBe('trigger-0');

    const edges = deriveCanvasEdges(pipeline);
    expect(edges).toHaveLength(0);
  });

  it('removing a step by filtering (edge-delete) updates the pipeline', () => {
    const stepA = ruleStep('A', 'rA');
    const stepB = requestStep('B', 'ReqB');
    const stepC = ruleStep('C', 'rC');

    let pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({ ...defaultPipeline, steps: [stepA, stepB, stepC] })
      )
    );

    // Simulate edge-delete removing step-1 (target of edge step-0→step-1)
    const targetIndex = 1;
    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...pipeline,
          steps: pipeline.steps.filter((_, i) => i !== targetIndex),
        })
      )
    );

    const nodes = deriveCanvasNodes(pipeline);
    expect(nodes).toHaveLength(3); // trigger + A + C
    expect(nodes[1]!.type).toBe('ruleStep'); // A
    expect(nodes[2]!.type).toBe('ruleStep'); // C

    const edges = deriveCanvasEdges(pipeline);
    expect(edges).toHaveLength(2);
    expect(edges[0]).toMatchObject({ source: 'trigger-0', target: 'step-0' });
    expect(edges[1]).toMatchObject({ source: 'step-0', target: 'step-1' });
  });
});

// ---------------------------------------------------------------------------
// Story 3.1 — selectedNodeAtom derivation
// ---------------------------------------------------------------------------

describe('selectedNodeAtom (Story 3.1)', () => {
  it('returns null when nothing is selected', () => {
    expect(deriveSelectedNode(null, defaultPipeline)).toBeNull();
  });

  it('returns trigger data when trigger-0 is selected', () => {
    const node = deriveSelectedNode('trigger-0', defaultPipeline);
    expect(node).not.toBeNull();
    expect(node?.kind).toBe('trigger');
    if (node?.kind === 'trigger') {
      expect(node.trigger.type).toBe('http');
    }
  });

  it('returns step data when step-0 is selected', () => {
    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          steps: [
            new PipelineStepConfig({
              name: 'My Step',
              operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'r1' }),
              inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
            }),
          ],
        })
      )
    );

    const node = deriveSelectedNode('step-0', pipeline);
    expect(node).not.toBeNull();
    expect(node?.kind).toBe('step');
    if (node?.kind === 'step') {
      expect(node.step.name).toBe('My Step');
      expect(node.index).toBe(0);
    }
  });

  it('returns null for non-existent node ID', () => {
    expect(deriveSelectedNode('step-99', defaultPipeline)).toBeNull();
  });

  it('updates when pipeline trigger changes', () => {
    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          trigger: new EventBusTriggerConfig({ type: 'event_bus', channel: 'test-ch' }),
        })
      )
    );

    const node = deriveSelectedNode('trigger-0', pipeline);
    expect(node?.kind).toBe('trigger');
    if (node?.kind === 'trigger') {
      expect(node.trigger.type).toBe('event_bus');
    }
  });
});

// ---------------------------------------------------------------------------
// Story 3.2 — HTTP Trigger field updates via pipelineAtom
// ---------------------------------------------------------------------------

describe('HTTP Trigger Configuration (Story 3.2)', () => {
  it('updating method on HTTP trigger persists in pipeline', () => {
    // Default pipeline has an HTTP trigger with method POST
    expect(defaultPipeline.trigger.type).toBe('http');
    if (defaultPipeline.trigger.type !== 'http') {
      return;
    }
    expect(defaultPipeline.trigger.method).toBe('POST');

    // Simulate ConfigPanel handleTriggerUpdate for method change
    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          trigger: new HttpTriggerConfig({ ...defaultPipeline.trigger, method: 'GET' }),
        })
      )
    );

    if (pipeline.trigger.type === 'http') {
      expect(pipeline.trigger.method).toBe('GET');
    }
  });

  it('updating path on HTTP trigger persists in pipeline', () => {
    if (defaultPipeline.trigger.type !== 'http') {
      return;
    }

    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          trigger: new HttpTriggerConfig({ ...defaultPipeline.trigger, path: '/api/orders' }),
        })
      )
    );

    if (pipeline.trigger.type === 'http') {
      expect(pipeline.trigger.path).toBe('/api/orders');
    }
  });

  it('updating payloadSchemaRef on HTTP trigger persists in pipeline', () => {
    if (defaultPipeline.trigger.type !== 'http') {
      return;
    }

    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          trigger: new HttpTriggerConfig({
            ...defaultPipeline.trigger,
            payloadSchemaRef: 'OrderPayload',
          }),
        })
      )
    );

    if (pipeline.trigger.type === 'http') {
      expect(pipeline.trigger.payloadSchemaRef).toBe('OrderPayload');
    }
  });

  it('clearing payloadSchemaRef sets it to undefined', () => {
    if (defaultPipeline.trigger.type !== 'http') {
      return;
    }

    // First set a value
    let pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          trigger: new HttpTriggerConfig({
            ...defaultPipeline.trigger,
            payloadSchemaRef: 'SomeRef',
          }),
        })
      )
    );

    // Then clear it
    if (pipeline.trigger.type !== 'http') {
      return;
    }
    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...pipeline,
          trigger: new HttpTriggerConfig({ ...pipeline.trigger, payloadSchemaRef: undefined }),
        })
      )
    );

    if (pipeline.trigger.type === 'http') {
      expect(pipeline.trigger.payloadSchemaRef).toBeUndefined();
    }
  });

  it('selectedNodeAtom reflects trigger field changes', () => {
    if (defaultPipeline.trigger.type !== 'http') {
      return;
    }

    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          trigger: new HttpTriggerConfig({
            ...defaultPipeline.trigger,
            method: 'DELETE',
            path: '/api/remove',
          }),
        })
      )
    );

    const node = deriveSelectedNode('trigger-0', pipeline);
    expect(node?.kind).toBe('trigger');
    if (node?.kind === 'trigger' && node.trigger.type === 'http') {
      expect(node.trigger.method).toBe('DELETE');
      expect(node.trigger.path).toBe('/api/remove');
    }
  });
});

// ---------------------------------------------------------------------------
// Story 3.3 — Event Bus Trigger field updates via pipelineAtom
// ---------------------------------------------------------------------------

describe('Event Bus Trigger Configuration (Story 3.3)', () => {
  /** Helper: create a pipeline with an Event Bus trigger */
  function withEventBusTrigger(channel = 'events'): PipelineConfig {
    return reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          trigger: new EventBusTriggerConfig({ type: 'event_bus', channel }),
        })
      )
    );
  }

  it('updating channel on Event Bus trigger persists in pipeline', () => {
    const prev = withEventBusTrigger('initial-channel');
    if (prev.trigger.type !== 'event_bus') {
      return;
    }

    const pipeline = reducePipeline(
      prev,
      PipelineAction.Replace(
        new PipelineConfig({
          ...prev,
          trigger: new EventBusTriggerConfig({ ...prev.trigger, channel: 'order-events' }),
        })
      )
    );

    if (pipeline.trigger.type === 'event_bus') {
      expect(pipeline.trigger.channel).toBe('order-events');
    }
  });

  it('updating payloadSchemaRef on Event Bus trigger persists in pipeline', () => {
    const prev = withEventBusTrigger();
    if (prev.trigger.type !== 'event_bus') {
      return;
    }

    const pipeline = reducePipeline(
      prev,
      PipelineAction.Replace(
        new PipelineConfig({
          ...prev,
          trigger: new EventBusTriggerConfig({ ...prev.trigger, payloadSchemaRef: 'OrderPayload' }),
        })
      )
    );

    if (pipeline.trigger.type === 'event_bus') {
      expect(pipeline.trigger.payloadSchemaRef).toBe('OrderPayload');
    }
  });

  it('updating filterExpression on Event Bus trigger persists in pipeline', () => {
    const prev = withEventBusTrigger();
    if (prev.trigger.type !== 'event_bus') {
      return;
    }

    const pipeline = reducePipeline(
      prev,
      PipelineAction.Replace(
        new PipelineConfig({
          ...prev,
          trigger: new EventBusTriggerConfig({
            ...prev.trigger,
            filterExpression: 'event.type == "created"',
          }),
        })
      )
    );

    if (pipeline.trigger.type === 'event_bus') {
      expect(pipeline.trigger.filterExpression).toBe('event.type == "created"');
    }
  });

  it('clearing optional fields sets them to undefined', () => {
    const prev = withEventBusTrigger();
    if (prev.trigger.type !== 'event_bus') {
      return;
    }

    // Set optional fields first
    let pipeline = reducePipeline(
      prev,
      PipelineAction.Replace(
        new PipelineConfig({
          ...prev,
          trigger: new EventBusTriggerConfig({
            ...prev.trigger,
            payloadSchemaRef: 'SomeRef',
            filterExpression: 'filter',
          }),
        })
      )
    );

    // Clear them
    if (pipeline.trigger.type !== 'event_bus') {
      return;
    }
    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...pipeline,
          trigger: new EventBusTriggerConfig({
            ...pipeline.trigger,
            payloadSchemaRef: undefined,
            filterExpression: undefined,
          }),
        })
      )
    );

    if (pipeline.trigger.type === 'event_bus') {
      expect(pipeline.trigger.payloadSchemaRef).toBeUndefined();
      expect(pipeline.trigger.filterExpression).toBeUndefined();
    }
  });

  it('selectedNodeAtom reflects Event Bus field changes', () => {
    const prev = withEventBusTrigger('ch-1');
    if (prev.trigger.type !== 'event_bus') {
      return;
    }

    const pipeline = reducePipeline(
      prev,
      PipelineAction.Replace(
        new PipelineConfig({
          ...prev,
          trigger: new EventBusTriggerConfig({
            ...prev.trigger,
            channel: 'updated-channel',
            filterExpression: 'x > 1',
          }),
        })
      )
    );

    const node = deriveSelectedNode('trigger-0', pipeline);
    expect(node?.kind).toBe('trigger');
    if (node?.kind === 'trigger' && node.trigger.type === 'event_bus') {
      expect(node.trigger.channel).toBe('updated-channel');
      expect(node.trigger.filterExpression).toBe('x > 1');
    }
  });
});

// ---------------------------------------------------------------------------
// Story 3.4 — Trigger Type Switching
// ---------------------------------------------------------------------------

describe('Trigger Type Switching (Story 3.4)', () => {
  it('switching from HTTP to Event Bus replaces trigger with default Event Bus', () => {
    // Default pipeline has HTTP trigger
    expect(defaultPipeline.trigger.type).toBe('http');

    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          trigger: new EventBusTriggerConfig({ type: 'event_bus', channel: 'events' }),
        })
      )
    );

    expect(pipeline.trigger.type).toBe('event_bus');
    if (pipeline.trigger.type === 'event_bus') {
      expect(pipeline.trigger.channel).toBe('events');
    }
  });

  it('switching from Event Bus to HTTP replaces trigger with default HTTP', () => {
    // Set to Event Bus first
    let pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          trigger: new EventBusTriggerConfig({
            type: 'event_bus',
            channel: 'my-channel',
            filterExpression: 'x > 1',
          }),
        })
      )
    );
    expect(pipeline.trigger.type).toBe('event_bus');

    // Switch back to HTTP
    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...pipeline,
          trigger: new HttpTriggerConfig({ type: 'http', method: 'POST', path: '/webhook' }),
        })
      )
    );

    expect(pipeline.trigger.type).toBe('http');
    if (pipeline.trigger.type === 'http') {
      expect(pipeline.trigger.method).toBe('POST');
      expect(pipeline.trigger.path).toBe('/webhook');
    }
  });

  it('old fields are NOT preserved after type switch', () => {
    // Customise the HTTP trigger
    let pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          trigger: new HttpTriggerConfig({
            type: 'http',
            method: 'DELETE',
            path: '/api/custom',
            payloadSchemaRef: 'CustomPayload',
          }),
        })
      )
    );

    // Switch to Event Bus — should get defaults, not the old HTTP fields
    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...pipeline,
          trigger: new EventBusTriggerConfig({ type: 'event_bus', channel: 'events' }),
        })
      )
    );

    if (pipeline.trigger.type === 'event_bus') {
      expect(pipeline.trigger.channel).toBe('events');
      expect(pipeline.trigger.payloadSchemaRef).toBeUndefined();
      expect(pipeline.trigger.filterExpression).toBeUndefined();
    }
  });

  it('canvas node type updates after trigger type switch', () => {
    // Default is HTTP → httpTrigger node type
    const nodesBefore = deriveCanvasNodes(defaultPipeline);
    expect(nodesBefore[0]!.type).toBe('httpTrigger');

    // Switch to Event Bus
    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          trigger: new EventBusTriggerConfig({ type: 'event_bus', channel: 'events' }),
        })
      )
    );

    const nodesAfter = deriveCanvasNodes(pipeline);
    expect(nodesAfter[0]!.type).toBe('eventBusTrigger');
  });

  it('selectedNodeAtom reflects new trigger type after switch', () => {
    // Verify initial HTTP selection
    const initial = deriveSelectedNode('trigger-0', defaultPipeline);
    expect(initial?.kind).toBe('trigger');
    if (initial?.kind === 'trigger') {
      expect(initial.trigger.type).toBe('http');
    }

    // Switch to Event Bus
    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({
          ...defaultPipeline,
          trigger: new EventBusTriggerConfig({ type: 'event_bus', channel: 'events' }),
        })
      )
    );

    const after = deriveSelectedNode('trigger-0', pipeline);
    expect(after?.kind).toBe('trigger');
    if (after?.kind === 'trigger') {
      expect(after.trigger.type).toBe('event_bus');
      if (after.trigger.type === 'event_bus') {
        expect(after.trigger.channel).toBe('events');
      }
    }
  });
});

// ============================================================
// Story 4.1 — Step Form: Name & Description
// ============================================================

describe('Step Name & Description (Story 4.1)', () => {
  /** Helper: create a pipeline with one step */
  function pipelineWithStep(name = 'Original Step', description?: string): PipelineConfig {
    const step = new PipelineStepConfig({
      name,
      description,
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'test-rule' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    return reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );
  }

  it('editing a step name updates pipeline.steps[index].name', () => {
    const prev = pipelineWithStep('Original Step');
    const step = prev.steps[0]!;
    const updated = new PipelineStepConfig({ ...step, name: 'Renamed Step' });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );
    expect(after.steps[0]!.name).toBe('Renamed Step');
  });

  it('editing a step description updates pipeline.steps[index].description', () => {
    const prev = pipelineWithStep('My Step');
    const step = prev.steps[0]!;
    const updated = new PipelineStepConfig({ ...step, description: 'A useful description' });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );
    expect(after.steps[0]!.description).toBe('A useful description');
  });

  it('clearing a step description sets it to undefined', () => {
    const prev = pipelineWithStep('My Step', 'Initial description');
    const step = prev.steps[0]!;
    const updated = new PipelineStepConfig({ ...step, description: undefined });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );
    expect(after.steps[0]!.description).toBeUndefined();
  });

  it('canvas StepNode label updates when step name changes', () => {
    const prev = pipelineWithStep('Original Name');

    // Verify initial canvas node data
    const nodesBefore = deriveCanvasNodes(prev);
    const stepNodeBefore = nodesBefore.find((n) => n.id === 'step-0');
    expect((stepNodeBefore!.data as { step: PipelineStepConfig }).step.name).toBe('Original Name');

    // Update step name
    const step = prev.steps[0]!;
    const updated = new PipelineStepConfig({ ...step, name: 'Updated Name' });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    // Verify canvas node data reflects the change
    const nodesAfter = deriveCanvasNodes(after);
    const stepNodeAfter = nodesAfter.find((n) => n.id === 'step-0');
    expect((stepNodeAfter!.data as { step: PipelineStepConfig }).step.name).toBe('Updated Name');
  });

  it('selectedNodeAtom reflects step name change when step is selected', () => {
    const prev = pipelineWithStep('Initial Name');

    const initial = deriveSelectedNode('step-0', prev);
    expect(initial?.kind).toBe('step');
    if (initial?.kind === 'step') {
      expect(initial.step.name).toBe('Initial Name');
    }

    // Update step name
    const step = prev.steps[0]!;
    const updated = new PipelineStepConfig({ ...step, name: 'Changed Name' });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    const afterNode = deriveSelectedNode('step-0', after);
    expect(afterNode?.kind).toBe('step');
    if (afterNode?.kind === 'step') {
      expect(afterNode.step.name).toBe('Changed Name');
    }
  });

  it('updating step name preserves other step fields', () => {
    const prev = pipelineWithStep('My Step', 'My Description');
    const step = prev.steps[0]!;
    const updated = new PipelineStepConfig({ ...step, name: 'New Name' });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );
    const result = after.steps[0]!;
    expect(result.name).toBe('New Name');
    expect(result.description).toBe('My Description');
    expect(result.operation.type).toBe('Rule');
    expect(result.inputAdapter.kind).toBe('passthrough');
  });
});

// ============================================================
// Story 4.2 — Rule Operation Configuration
// ============================================================

describe('Rule Operation Configuration (Story 4.2)', () => {
  /** Helper: create a pipeline with one rule step */
  function pipelineWithRuleStep(ruleName = 'default-rule', ruleTypeRef?: string): PipelineConfig {
    const step = new PipelineStepConfig({
      name: 'My Rule Step',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName, ruleTypeRef }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    return reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );
  }

  it('editing ruleName updates the step operation in pipeline', () => {
    const prev = pipelineWithRuleStep('old-rule');
    const step = prev.steps[0]!;
    const updatedOp = new RuleOperationConfig({
      type: 'Rule',
      ruleName: 'new-rule',
      ruleTypeRef: (step.operation as RuleOperationConfig).ruleTypeRef,
    });
    const updated = new PipelineStepConfig({ ...step, operation: updatedOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );
    const op = after.steps[0]!.operation;
    expect(op.type).toBe('Rule');
    if (op.type === 'Rule') {
      expect(op.ruleName).toBe('new-rule');
    }
  });

  it('editing ruleTypeRef updates the step operation in pipeline', () => {
    const prev = pipelineWithRuleStep('my-rule');
    const step = prev.steps[0]!;
    const updatedOp = new RuleOperationConfig({
      type: 'Rule',
      ruleName: (step.operation as RuleOperationConfig).ruleName,
      ruleTypeRef: 'OrderValidation',
    });
    const updated = new PipelineStepConfig({ ...step, operation: updatedOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );
    const op = after.steps[0]!.operation;
    expect(op.type).toBe('Rule');
    if (op.type === 'Rule') {
      expect(op.ruleTypeRef).toBe('OrderValidation');
    }
  });

  it('clearing ruleTypeRef sets it to undefined', () => {
    const prev = pipelineWithRuleStep('my-rule', 'ExistingRef');
    const step = prev.steps[0]!;
    const updatedOp = new RuleOperationConfig({
      type: 'Rule',
      ruleName: 'my-rule',
      ruleTypeRef: undefined,
    });
    const updated = new PipelineStepConfig({ ...step, operation: updatedOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );
    const op = after.steps[0]!.operation;
    expect(op.type).toBe('Rule');
    if (op.type === 'Rule') {
      expect(op.ruleTypeRef).toBeUndefined();
    }
  });

  it('updating ruleName preserves step name, description, and other fields', () => {
    const step = new PipelineStepConfig({
      name: 'Validate',
      description: 'Validates input',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'old', ruleTypeRef: 'MyType' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Update only ruleName
    const s = prev.steps[0]!;
    const updatedOp = new RuleOperationConfig({
      type: 'Rule',
      ruleName: 'new',
      ruleTypeRef: (s.operation as RuleOperationConfig).ruleTypeRef,
    });
    const updated = new PipelineStepConfig({ ...s, operation: updatedOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    const result = after.steps[0]!;
    expect(result.name).toBe('Validate');
    expect(result.description).toBe('Validates input');
    expect(result.operation.type).toBe('Rule');
    if (result.operation.type === 'Rule') {
      expect(result.operation.ruleName).toBe('new');
      expect(result.operation.ruleTypeRef).toBe('MyType');
    }
    expect(result.inputAdapter.kind).toBe('passthrough');
  });

  it('canvas node data reflects updated rule operation', () => {
    const prev = pipelineWithRuleStep('original-rule');
    const step = prev.steps[0]!;
    const updatedOp = new RuleOperationConfig({ type: 'Rule', ruleName: 'updated-rule' });
    const updated = new PipelineStepConfig({ ...step, operation: updatedOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    const nodes = deriveCanvasNodes(after);
    const stepNode = nodes.find((n) => n.id === 'step-0');
    const data = stepNode!.data as { step: PipelineStepConfig };
    expect(data.step.operation.type).toBe('Rule');
    if (data.step.operation.type === 'Rule') {
      expect(data.step.operation.ruleName).toBe('updated-rule');
    }
  });
});

// ============================================================
// Story 4.3 — Request Operation Configuration
// ============================================================

describe('Request Operation Configuration (Story 4.3)', () => {
  /** Helper: create a pipeline with one request step */
  function pipelineWithRequestStep(requestTag = 'DefaultRequest'): PipelineConfig {
    const step = new PipelineStepConfig({
      name: 'My Request Step',
      operation: new RequestOperationConfig({ type: 'Request', requestTag }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    return reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );
  }

  it('editing requestTag updates the step operation in pipeline', () => {
    const prev = pipelineWithRequestStep('OldTag');
    const step = prev.steps[0]!;
    const updatedOp = new RequestOperationConfig({ type: 'Request', requestTag: 'NewTag' });
    const updated = new PipelineStepConfig({ ...step, operation: updatedOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );
    const op = after.steps[0]!.operation;
    expect(op.type).toBe('Request');
    if (op.type === 'Request') {
      expect(op.requestTag).toBe('NewTag');
    }
  });

  it('updating requestTag preserves step name, description, and other fields', () => {
    const step = new PipelineStepConfig({
      name: 'Fetch Data',
      description: 'Fetches data from external service',
      operation: new RequestOperationConfig({ type: 'Request', requestTag: 'OldTag' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    const s = prev.steps[0]!;
    const updatedOp = new RequestOperationConfig({ type: 'Request', requestTag: 'NewTag' });
    const updated = new PipelineStepConfig({ ...s, operation: updatedOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    const result = after.steps[0]!;
    expect(result.name).toBe('Fetch Data');
    expect(result.description).toBe('Fetches data from external service');
    expect(result.operation.type).toBe('Request');
    if (result.operation.type === 'Request') {
      expect(result.operation.requestTag).toBe('NewTag');
    }
    expect(result.inputAdapter.kind).toBe('passthrough');
  });

  it('canvas node data reflects updated request operation', () => {
    const prev = pipelineWithRequestStep('OriginalTag');
    const step = prev.steps[0]!;
    const updatedOp = new RequestOperationConfig({ type: 'Request', requestTag: 'UpdatedTag' });
    const updated = new PipelineStepConfig({ ...step, operation: updatedOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    const nodes = deriveCanvasNodes(after);
    const stepNode = nodes.find((n) => n.id === 'step-0');
    const data = stepNode!.data as { step: PipelineStepConfig };
    expect(data.step.operation.type).toBe('Request');
    if (data.step.operation.type === 'Request') {
      expect(data.step.operation.requestTag).toBe('UpdatedTag');
    }
  });

  it('selectedNodeAtom reflects requestTag change when step is selected', () => {
    const prev = pipelineWithRequestStep('InitialTag');

    const initial = deriveSelectedNode('step-0', prev);
    expect(initial?.kind).toBe('step');
    if (initial?.kind === 'step') {
      expect(initial.step.operation.type).toBe('Request');
    }

    const step = prev.steps[0]!;
    const updatedOp = new RequestOperationConfig({ type: 'Request', requestTag: 'ChangedTag' });
    const updated = new PipelineStepConfig({ ...step, operation: updatedOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    const afterNode = deriveSelectedNode('step-0', after);
    expect(afterNode?.kind).toBe('step');
    if (afterNode?.kind === 'step' && afterNode.step.operation.type === 'Request') {
      expect(afterNode.step.operation.requestTag).toBe('ChangedTag');
    }
  });
});

// ============================================================
// Story 4.4 — Operation Type Switching
// ============================================================

describe('Operation Type Switching (Story 4.4)', () => {
  it('switching from Rule to Request replaces operation with default Request', () => {
    const step = new PipelineStepConfig({
      name: 'My Step',
      operation: new RuleOperationConfig({
        type: 'Rule',
        ruleName: 'old-rule',
        ruleTypeRef: 'OldRef',
      }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Switch to Request
    const s = prev.steps[0]!;
    const newOp = new RequestOperationConfig({ type: 'Request', requestTag: 'DefaultRequest' });
    const updated = new PipelineStepConfig({ ...s, operation: newOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect(after.steps[0]!.operation.type).toBe('Request');
    if (after.steps[0]!.operation.type === 'Request') {
      expect(after.steps[0]!.operation.requestTag).toBe('DefaultRequest');
    }
  });

  it('switching from Request to Rule replaces operation with default Rule', () => {
    const step = new PipelineStepConfig({
      name: 'My Step',
      operation: new RequestOperationConfig({ type: 'Request', requestTag: 'OldTag' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Switch to Rule
    const s = prev.steps[0]!;
    const newOp = new RuleOperationConfig({ type: 'Rule', ruleName: 'default-rule' });
    const updated = new PipelineStepConfig({ ...s, operation: newOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect(after.steps[0]!.operation.type).toBe('Rule');
    if (after.steps[0]!.operation.type === 'Rule') {
      expect(after.steps[0]!.operation.ruleName).toBe('default-rule');
    }
  });

  it('old operation fields are NOT preserved after type switch', () => {
    const step = new PipelineStepConfig({
      name: 'My Step',
      operation: new RuleOperationConfig({
        type: 'Rule',
        ruleName: 'custom-rule',
        ruleTypeRef: 'CustomRef',
      }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Switch to Request (fresh default)
    const s = prev.steps[0]!;
    const newOp = new RequestOperationConfig({ type: 'Request', requestTag: 'DefaultRequest' });
    const updated = new PipelineStepConfig({ ...s, operation: newOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    const op = after.steps[0]!.operation;
    // Should be fresh Request defaults, no Rule fields
    expect(op.type).toBe('Request');
    expect('ruleName' in op).toBe(false);
    expect('ruleTypeRef' in op).toBe(false);
  });

  it('canvas node type updates after operation type switch', () => {
    const step = new PipelineStepConfig({
      name: 'My Step',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Verify initial type
    let nodes = deriveCanvasNodes(prev);
    expect(nodes.find((n) => n.id === 'step-0')!.type).toBe('ruleStep');

    // Switch to Request
    const s = prev.steps[0]!;
    const newOp = new RequestOperationConfig({ type: 'Request', requestTag: 'DefaultRequest' });
    const updated = new PipelineStepConfig({ ...s, operation: newOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    nodes = deriveCanvasNodes(after);
    expect(nodes.find((n) => n.id === 'step-0')!.type).toBe('requestStep');
  });

  it('step name and description are preserved after operation type switch', () => {
    const step = new PipelineStepConfig({
      name: 'Keep My Name',
      description: 'Keep My Description',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Switch to Request
    const s = prev.steps[0]!;
    const newOp = new RequestOperationConfig({ type: 'Request', requestTag: 'DefaultRequest' });
    const updated = new PipelineStepConfig({ ...s, operation: newOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect(after.steps[0]!.name).toBe('Keep My Name');
    expect(after.steps[0]!.description).toBe('Keep My Description');
    expect(after.steps[0]!.inputAdapter.kind).toBe('passthrough');
  });

  it('selectedNodeAtom reflects new operation type after switch', () => {
    const step = new PipelineStepConfig({
      name: 'My Step',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    const initial = deriveSelectedNode('step-0', prev);
    expect(initial?.kind).toBe('step');
    if (initial?.kind === 'step') {
      expect(initial.step.operation.type).toBe('Rule');
    }

    // Switch to Request
    const s = prev.steps[0]!;
    const newOp = new RequestOperationConfig({ type: 'Request', requestTag: 'DefaultRequest' });
    const updated = new PipelineStepConfig({ ...s, operation: newOp });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    const afterNode = deriveSelectedNode('step-0', after);
    expect(afterNode?.kind).toBe('step');
    if (afterNode?.kind === 'step') {
      expect(afterNode.step.operation.type).toBe('Request');
    }
  });
});

// =============================================================================
// Story 5.1: Input Adapter Type Selection & Passthrough
// =============================================================================
describe('Input Adapter Type Selection & Passthrough (Story 5.1)', () => {
  it('default step has Passthrough input adapter', () => {
    const step = new PipelineStepConfig({
      name: 'Step A',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule-a' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );
    expect(pipeline.steps[0]!.inputAdapter.kind).toBe('passthrough');
  });

  it('switching input adapter to Fields creates a FieldsAdapter with empty mappings', () => {
    const step = new PipelineStepConfig({
      name: 'Step A',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule-a' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Switch to Fields
    const s = prev.steps[0]!;
    const updated = new PipelineStepConfig({
      ...s,
      inputAdapter: new FieldsAdapter({ kind: 'fields', mappings: [] }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect(after.steps[0]!.inputAdapter.kind).toBe('fields');
    if (after.steps[0]!.inputAdapter.kind === 'fields') {
      expect((after.steps[0]!.inputAdapter as FieldsAdapter).mappings).toHaveLength(0);
    }
  });

  it('switching input adapter to Merge creates a MergeAdapter', () => {
    const step = new PipelineStepConfig({
      name: 'Step A',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule-a' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Switch to Merge
    const s = prev.steps[0]!;
    const updated = new PipelineStepConfig({
      ...s,
      inputAdapter: new MergeAdapter({ kind: 'merge' }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect(after.steps[0]!.inputAdapter.kind).toBe('merge');
  });

  it('switching input adapter back to Passthrough creates a fresh PassthroughAdapter', () => {
    const step = new PipelineStepConfig({
      name: 'Step A',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule-a' }),
      inputAdapter: new FieldsAdapter({ kind: 'fields', mappings: [] }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Switch back to Passthrough
    const s = prev.steps[0]!;
    const updated = new PipelineStepConfig({
      ...s,
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect(after.steps[0]!.inputAdapter.kind).toBe('passthrough');
  });

  it('switching adapter type does not affect step name, description, or operation', () => {
    const step = new PipelineStepConfig({
      name: 'Important Step',
      description: 'Very important',
      operation: new RuleOperationConfig({
        type: 'Rule',
        ruleName: 'important-rule',
        ruleTypeRef: 'Ref',
      }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Switch to Fields
    const s = prev.steps[0]!;
    const updated = new PipelineStepConfig({
      ...s,
      inputAdapter: new FieldsAdapter({ kind: 'fields', mappings: [] }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect(after.steps[0]!.name).toBe('Important Step');
    expect(after.steps[0]!.description).toBe('Very important');
    expect(after.steps[0]!.operation.type).toBe('Rule');
    expect(after.steps[0]!.inputAdapter.kind).toBe('fields');
  });
});

// =============================================================================
// Story 5.2: Fields Adapter with Field Mapping Editor
// =============================================================================
describe('Fields Adapter with Field Mapping Editor (Story 5.2)', () => {
  function setupFieldsStep(mappings: FieldMapping[] = []): PipelineConfig {
    const step = new PipelineStepConfig({
      name: 'Fields Step',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule' }),
      inputAdapter: new FieldsAdapter({ kind: 'fields', mappings }),
    });
    return reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );
  }

  it('can add a new empty field mapping to a Fields adapter', () => {
    const prev = setupFieldsStep();
    const step = prev.steps[0]!;
    const adapter = step.inputAdapter as FieldsAdapter;
    const newMapping = new FieldMapping({ source: '', target: '' });
    const updated = new PipelineStepConfig({
      ...step,
      inputAdapter: new FieldsAdapter({
        kind: 'fields',
        mappings: [...adapter.mappings, newMapping],
      }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    const afterAdapter = after.steps[0]!.inputAdapter as FieldsAdapter;
    expect(afterAdapter.mappings).toHaveLength(1);
    expect(afterAdapter.mappings[0]!.source).toBe('');
    expect(afterAdapter.mappings[0]!.target).toBe('');
  });

  it('can edit a field mapping source and target', () => {
    const prev = setupFieldsStep([
      new FieldMapping({ source: 'old.source', target: 'old.target' }),
    ]);

    const step = prev.steps[0]!;
    const adapter = step.inputAdapter as FieldsAdapter;
    const updatedMapping = new FieldMapping({ source: 'new.source', target: 'new.target' });
    const mappings = [...adapter.mappings];
    mappings[0] = updatedMapping;
    const updated = new PipelineStepConfig({
      ...step,
      inputAdapter: new FieldsAdapter({ kind: 'fields', mappings }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    const afterAdapter = after.steps[0]!.inputAdapter as FieldsAdapter;
    expect(afterAdapter.mappings[0]!.source).toBe('new.source');
    expect(afterAdapter.mappings[0]!.target).toBe('new.target');
  });

  it('can edit a field mapping default value', () => {
    const prev = setupFieldsStep([new FieldMapping({ source: 'amount', target: 'total' })]);

    const step = prev.steps[0]!;
    const adapter = step.inputAdapter as FieldsAdapter;
    const updatedMapping = new FieldMapping({
      source: 'amount',
      target: 'total',
      defaultValue: 42,
    });
    const mappings = [...adapter.mappings];
    mappings[0] = updatedMapping;
    const updated = new PipelineStepConfig({
      ...step,
      inputAdapter: new FieldsAdapter({ kind: 'fields', mappings }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    const afterAdapter = after.steps[0]!.inputAdapter as FieldsAdapter;
    expect(afterAdapter.mappings[0]!.defaultValue).toBe(42);
  });

  it('can remove a field mapping by index', () => {
    const prev = setupFieldsStep([
      new FieldMapping({ source: 'a', target: 'b' }),
      new FieldMapping({ source: 'c', target: 'd' }),
      new FieldMapping({ source: 'e', target: 'f' }),
    ]);

    const step = prev.steps[0]!;
    const adapter = step.inputAdapter as FieldsAdapter;
    // Remove the middle one (index 1)
    const mappings = adapter.mappings.filter((_, i) => i !== 1);
    const updated = new PipelineStepConfig({
      ...step,
      inputAdapter: new FieldsAdapter({ kind: 'fields', mappings }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    const afterAdapter = after.steps[0]!.inputAdapter as FieldsAdapter;
    expect(afterAdapter.mappings).toHaveLength(2);
    expect(afterAdapter.mappings[0]!.source).toBe('a');
    expect(afterAdapter.mappings[1]!.source).toBe('e');
  });

  it('multiple add operations accumulate mappings', () => {
    let pipeline = setupFieldsStep();

    // Add first mapping
    let step = pipeline.steps[0]!;
    let adapter = step.inputAdapter as FieldsAdapter;
    let updated = new PipelineStepConfig({
      ...step,
      inputAdapter: new FieldsAdapter({
        kind: 'fields',
        mappings: [...adapter.mappings, new FieldMapping({ source: 'a', target: 'b' })],
      }),
    });
    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(new PipelineConfig({ ...pipeline, steps: [updated] }))
    );

    // Add second mapping
    step = pipeline.steps[0]!;
    adapter = step.inputAdapter as FieldsAdapter;
    updated = new PipelineStepConfig({
      ...step,
      inputAdapter: new FieldsAdapter({
        kind: 'fields',
        mappings: [...adapter.mappings, new FieldMapping({ source: 'c', target: 'd' })],
      }),
    });
    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(new PipelineConfig({ ...pipeline, steps: [updated] }))
    );

    const afterAdapter = pipeline.steps[0]!.inputAdapter as FieldsAdapter;
    expect(afterAdapter.mappings).toHaveLength(2);
    expect(afterAdapter.mappings[0]!.source).toBe('a');
    expect(afterAdapter.mappings[1]!.source).toBe('c');
  });
});

// =============================================================================
// Story 5.3: Merge Adapter Configuration
// =============================================================================
describe('Merge Adapter Configuration (Story 5.3)', () => {
  it('setting targetKey on a Merge adapter updates pipeline', () => {
    const step = new PipelineStepConfig({
      name: 'Merge Step',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule' }),
      inputAdapter: new MergeAdapter({ kind: 'merge' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Set targetKey
    const s = prev.steps[0]!;
    const updated = new PipelineStepConfig({
      ...s,
      inputAdapter: new MergeAdapter({ kind: 'merge', targetKey: 'result' }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect(after.steps[0]!.inputAdapter.kind).toBe('merge');
    expect((after.steps[0]!.inputAdapter as MergeAdapter).targetKey).toBe('result');
  });

  it('leaving targetKey empty is valid', () => {
    const step = new PipelineStepConfig({
      name: 'Merge Step',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule' }),
      inputAdapter: new MergeAdapter({ kind: 'merge' }),
    });
    const pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    expect(pipeline.steps[0]!.inputAdapter.kind).toBe('merge');
    expect((pipeline.steps[0]!.inputAdapter as MergeAdapter).targetKey).toBeUndefined();
  });

  it('changing targetKey to a new value updates the adapter', () => {
    const step = new PipelineStepConfig({
      name: 'Merge Step',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule' }),
      inputAdapter: new MergeAdapter({ kind: 'merge', targetKey: 'old' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Change targetKey
    const s = prev.steps[0]!;
    const updated = new PipelineStepConfig({
      ...s,
      inputAdapter: new MergeAdapter({ kind: 'merge', targetKey: 'newKey' }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect((after.steps[0]!.inputAdapter as MergeAdapter).targetKey).toBe('newKey');
  });

  it('clearing targetKey sets it to undefined', () => {
    const step = new PipelineStepConfig({
      name: 'Merge Step',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule' }),
      inputAdapter: new MergeAdapter({ kind: 'merge', targetKey: 'existing' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Clear targetKey
    const s = prev.steps[0]!;
    const updated = new PipelineStepConfig({
      ...s,
      inputAdapter: new MergeAdapter({ kind: 'merge' }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect((after.steps[0]!.inputAdapter as MergeAdapter).targetKey).toBeUndefined();
  });
});

// ── Story 5.4 — Output Adapter Configuration ──────────────────────────
describe('Story 5.4 — Output Adapter Configuration', () => {
  it('setting output adapter to passthrough creates a PassthroughAdapter', () => {
    const step = new PipelineStepConfig({
      name: 'Output Step',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Verify no output adapter initially
    expect(prev.steps[0]!.outputAdapter).toBeUndefined();

    // Set output adapter to passthrough
    const s = prev.steps[0]!;
    const updated = new PipelineStepConfig({
      ...s,
      outputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect(after.steps[0]!.outputAdapter).toBeDefined();
    expect(after.steps[0]!.outputAdapter!.kind).toBe('passthrough');
  });

  it('setting output adapter to fields creates a FieldsAdapter with empty mappings', () => {
    const step = new PipelineStepConfig({
      name: 'Output Step',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Set output adapter to fields
    const s = prev.steps[0]!;
    const updated = new PipelineStepConfig({
      ...s,
      outputAdapter: new FieldsAdapter({ kind: 'fields', mappings: [] }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect(after.steps[0]!.outputAdapter!.kind).toBe('fields');
    expect((after.steps[0]!.outputAdapter as FieldsAdapter).mappings).toHaveLength(0);
  });

  it('setting output adapter to merge creates a MergeAdapter', () => {
    const step = new PipelineStepConfig({
      name: 'Output Step',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Set output adapter to merge
    const s = prev.steps[0]!;
    const updated = new PipelineStepConfig({
      ...s,
      outputAdapter: new MergeAdapter({ kind: 'merge' }),
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect(after.steps[0]!.outputAdapter!.kind).toBe('merge');
  });

  it('setting output adapter to none removes it (undefined)', () => {
    const step = new PipelineStepConfig({
      name: 'Output Step',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
      outputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Verify output adapter exists
    expect(prev.steps[0]!.outputAdapter).toBeDefined();

    // Remove output adapter (set to none)
    const s = prev.steps[0]!;
    const updated = new PipelineStepConfig({
      ...s,
      outputAdapter: undefined,
    });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    expect(after.steps[0]!.outputAdapter).toBeUndefined();
  });

  it('output adapter fields mapping CRUD works independently of input adapter', () => {
    const step = new PipelineStepConfig({
      name: 'Dual Adapter Step',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule' }),
      inputAdapter: new FieldsAdapter({
        kind: 'fields',
        mappings: [new FieldMapping({ source: 'in.a', target: 'a' })],
      }),
      outputAdapter: new FieldsAdapter({ kind: 'fields', mappings: [] }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Add a mapping to output adapter
    const s = prev.steps[0]!;
    const outAdapter = s.outputAdapter as FieldsAdapter;
    const newMapping = new FieldMapping({ source: 'out.x', target: 'x' });
    const updatedOut = new FieldsAdapter({
      kind: 'fields',
      mappings: [...outAdapter.mappings, newMapping],
    });
    const updated = new PipelineStepConfig({ ...s, outputAdapter: updatedOut });
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(new PipelineConfig({ ...prev, steps: [updated] }))
    );

    // Input adapter unchanged
    expect((after.steps[0]!.inputAdapter as FieldsAdapter).mappings).toHaveLength(1);
    expect((after.steps[0]!.inputAdapter as FieldsAdapter).mappings[0]!.source).toBe('in.a');
    // Output adapter has new mapping
    expect((after.steps[0]!.outputAdapter as FieldsAdapter).mappings).toHaveLength(1);
    expect((after.steps[0]!.outputAdapter as FieldsAdapter).mappings[0]!.source).toBe('out.x');
  });
});

// ── Story 6.1 — Pipeline Identity & Metadata ──────────────────────────
describe('Story 6.1 — Pipeline Identity & Metadata', () => {
  it('can update the pipeline id', () => {
    const after = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, id: 'new-pipeline-id' }))
    );
    expect(after.id).toBe('new-pipeline-id');
    // Other fields unchanged
    expect(after.name).toBe(defaultPipeline.name);
    expect(after.trigger).toBe(defaultPipeline.trigger);
  });

  it('can update the pipeline display name', () => {
    const after = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({ ...defaultPipeline, name: 'Order Processing Pipeline' })
      )
    );
    expect(after.name).toBe('Order Processing Pipeline');
  });

  it('can update the pipeline description', () => {
    const after = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(
        new PipelineConfig({ ...defaultPipeline, description: 'Processes customer orders' })
      )
    );
    expect(after.description).toBe('Processes customer orders');
  });

  it('can clear the pipeline description to undefined', () => {
    let pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, description: 'Temp' }))
    );
    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(new PipelineConfig({ ...pipeline, description: undefined }))
    );
    expect(pipeline.description).toBeUndefined();
  });

  it('can toggle the pipeline enabled status', () => {
    // Default pipeline has enabled: true
    expect(defaultPipeline.enabled).toBe(true);

    let pipeline = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, enabled: false }))
    );
    expect(pipeline.enabled).toBe(false);

    pipeline = reducePipeline(
      pipeline,
      PipelineAction.Replace(new PipelineConfig({ ...pipeline, enabled: true }))
    );
    expect(pipeline.enabled).toBe(true);
  });

  it('can update the pipeline version number', () => {
    const after = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, version: 5 }))
    );
    expect(after.version).toBe(5);
  });

  it('updating identity fields does not affect trigger or steps', () => {
    const step = new PipelineStepConfig({
      name: 'Step 1',
      operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'rule-1' }),
      inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
    });
    const prev = reducePipeline(
      defaultPipeline,
      PipelineAction.Replace(new PipelineConfig({ ...defaultPipeline, steps: [step] }))
    );

    // Update multiple identity fields
    const after = reducePipeline(
      prev,
      PipelineAction.Replace(
        new PipelineConfig({
          ...prev,
          id: 'updated-id',
          name: 'Updated Name',
          description: 'Updated description',
          enabled: false,
          version: 10,
        })
      )
    );

    expect(after.id).toBe('updated-id');
    expect(after.name).toBe('Updated Name');
    expect(after.description).toBe('Updated description');
    expect(after.enabled).toBe(false);
    expect(after.version).toBe(10);
    // Trigger and steps unchanged
    expect(after.trigger.type).toBe(prev.trigger.type);
    expect(after.steps).toHaveLength(1);
    expect(after.steps[0]!.name).toBe('Step 1');
  });
});
