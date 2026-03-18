// Pure selector functions for deriving canvas data from PipelineConfig.
// Extracted from atoms/canvas.ts and atoms/ui.ts so components can compute
// these values from props instead of global atoms.

import type { PipelineConfig, PipelineStepConfig, TriggerConfig } from '@app/domain';
import type { Edge, Node } from '@xyflow/react';
import { NODE_TYPES } from './palette/nodeTypes';

export const NODE_X_SPACING = 280;
export const NODE_Y_CENTER = 100;
export const TRIGGER_NODE_ID = 'trigger-0';

function triggerNodeType(trigger: TriggerConfig): string {
  return trigger.type === 'http' ? NODE_TYPES.httpTrigger : NODE_TYPES.eventBusTrigger;
}

function stepNodeType(step: PipelineStepConfig): string {
  return step.operation.type === 'Rule' ? NODE_TYPES.ruleStep : NODE_TYPES.requestStep;
}

/** Derive xyflow Node[] from pipeline + selectedNodeId */
export function computeCanvasNodes(
  pipeline: PipelineConfig,
  selectedNodeId: string | null
): Node[] {
  const nodes: Node[] = [];

  nodes.push({
    id: TRIGGER_NODE_ID,
    type: triggerNodeType(pipeline.trigger),
    position: { x: 0, y: NODE_Y_CENTER },
    data: { trigger: pipeline.trigger },
    selected: selectedNodeId === TRIGGER_NODE_ID,
    draggable: false,
    deletable: false,
  });

  pipeline.steps.forEach((step, index) => {
    const stepId = `step-${index}`;
    nodes.push({
      id: stepId,
      type: stepNodeType(step),
      position: { x: (index + 1) * NODE_X_SPACING, y: NODE_Y_CENTER },
      data: { step, index },
      selected: selectedNodeId === stepId,
      draggable: true,
    });
  });

  return nodes;
}

/** Derive xyflow Edge[] from pipeline */
export function computeCanvasEdges(pipeline: PipelineConfig): Edge[] {
  const edges: Edge[] = [];
  if (pipeline.steps.length === 0) {
    return edges;
  }

  edges.push({
    id: `edge-trigger-step-0`,
    source: TRIGGER_NODE_ID,
    target: 'step-0',
    animated: true,
  });

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

/** Discriminated union describing what is currently selected */
export type SelectedNode =
  | { kind: 'trigger'; trigger: TriggerConfig }
  | { kind: 'step'; step: PipelineStepConfig; index: number }
  | null;

/** Derive selected node data from pipeline + selectedNodeId */
export function computeSelectedNode(
  pipeline: PipelineConfig,
  selectedNodeId: string | null
): SelectedNode {
  if (selectedNodeId === null) {
    return null;
  }

  if (selectedNodeId === 'trigger-0') {
    return { kind: 'trigger', trigger: pipeline.trigger };
  }

  const match = selectedNodeId.match(/^step-(\d+)$/);
  if (match) {
    const index = parseInt(match[1]!, 10);
    const step = pipeline.steps[index];
    if (step) {
      return { kind: 'step', step, index };
    }
  }

  return null;
}
