// Canvas derived atoms for Story 2.2 + 2.4 (selection) + 2.5 (reorder/removal)
// Transforms pipelineAtom into xyflow Node[] and Edge[]
import type { PipelineStepConfig, TriggerConfig } from '@app/domain';
import type { Edge, Node } from '@xyflow/react';
import { Atom } from 'effect/unstable/reactivity';
import { NODE_TYPES } from '../palette/nodeTypes';
import { pipelineAtom } from './pipeline';
import { selectedNodeIdAtom } from './ui';

/** Horizontal spacing between nodes on the canvas */
const NODE_X_SPACING = 280;
const NODE_Y_CENTER = 100;
const TRIGGER_NODE_ID = 'trigger-0';

/** Map a TriggerConfig to its xyflow node type ID */
function triggerNodeType(trigger: TriggerConfig): string {
  return trigger.type === 'http' ? NODE_TYPES.httpTrigger : NODE_TYPES.eventBusTrigger;
}

/** Map a PipelineStepConfig to its xyflow node type ID */
function stepNodeType(step: PipelineStepConfig): string {
  return step.operation.type === 'Rule' ? NODE_TYPES.ruleStep : NODE_TYPES.requestStep;
}

/**
 * Derives xyflow Node[] from the pipeline atom.
 * Trigger node + one node per step, laid out left-to-right.
 * Each node includes `selected` derived from selectedNodeIdAtom (Story 2.4).
 */
export const canvasNodesAtom = Atom.make((get: Atom.Context) => {
  const pipeline = get(pipelineAtom);
  const selectedId = get(selectedNodeIdAtom);
  const nodes: Node[] = [];

  // Trigger node always at position 0 — non-draggable, non-deletable (pipeline requires a trigger)
  nodes.push({
    id: TRIGGER_NODE_ID,
    type: triggerNodeType(pipeline.trigger),
    position: { x: 0, y: NODE_Y_CENTER },
    data: { trigger: pipeline.trigger },
    selected: selectedId === TRIGGER_NODE_ID,
    draggable: false,
    deletable: false,
  });

  // Step nodes in sequential order — draggable for reordering (Story 2.5)
  pipeline.steps.forEach((step, index) => {
    const stepId = `step-${index}`;
    nodes.push({
      id: stepId,
      type: stepNodeType(step),
      position: { x: (index + 1) * NODE_X_SPACING, y: NODE_Y_CENTER },
      data: { step, index },
      selected: selectedId === stepId,
      draggable: true,
    });
  });

  return nodes;
});

/**
 * Derives xyflow Edge[] from the pipeline atom.
 * Sequential edges: trigger → step-0 → step-1 → ...
 */
export const canvasEdgesAtom = Atom.make((get: Atom.Context) => {
  const pipeline = get(pipelineAtom);
  const edges: Edge[] = [];

  if (pipeline.steps.length === 0) {
    return edges;
  }

  // Trigger → first step
  edges.push({
    id: `edge-trigger-step-0`,
    source: TRIGGER_NODE_ID,
    target: 'step-0',
    animated: true,
  });

  // Step → next step
  for (let i = 0; i < pipeline.steps.length - 1; i++) {
    edges.push({
      id: `edge-step-${i}-step-${i + 1}`,
      source: `step-${i}`,
      target: `step-${i + 1}`,
      animated: true,
    });
  }

  return edges;
});
