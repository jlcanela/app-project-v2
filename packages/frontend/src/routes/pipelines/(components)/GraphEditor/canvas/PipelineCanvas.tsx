// PipelineCanvas — Story 2.2 + 2.4 + 2.5
// Drop handler creates nodes; drag reorder & keyboard delete manage the pipeline.
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import type { PipelineStepConfig, TriggerConfig } from '@app/domain';
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import {
  defaultEventBusTrigger,
  defaultHttpTrigger,
  defaultRequestStep,
  defaultRuleStep,
} from '@/lib/defaults';
import { PipelineAction, type PipelineAction as PipelineActionType } from '../atoms/pipeline';
import { NODE_TYPE_CATEGORIES, NODE_TYPES, type NodeTypeId } from '../palette/nodeTypes';
import { StepNode } from './StepNode';
import { TriggerNode } from './TriggerNode';

export interface PipelineCanvasProps {
  nodes: Node[];
  edges: Edge[];
  dispatch: (action: PipelineActionType) => void;
  setSelectedNodeId: (id: string | null) => void;
}

/** Create a default trigger for the given node type */
function createDefaultTrigger(nodeType: NodeTypeId): TriggerConfig {
  switch (nodeType) {
    case NODE_TYPES.httpTrigger:
      return defaultHttpTrigger;
    case NODE_TYPES.eventBusTrigger:
      return defaultEventBusTrigger;
    default:
      return defaultHttpTrigger;
  }
}

/** Create a default step for the given node type */
function createDefaultStep(nodeType: NodeTypeId): PipelineStepConfig {
  switch (nodeType) {
    case NODE_TYPES.ruleStep:
      return defaultRuleStep;
    case NODE_TYPES.requestStep:
      return defaultRequestStep;
    default:
      return defaultRuleStep;
  }
}

/** xyflow custom node type mapping */
const nodeTypes: NodeTypes = {
  [NODE_TYPES.httpTrigger]: TriggerNode,
  [NODE_TYPES.eventBusTrigger]: TriggerNode,
  [NODE_TYPES.ruleStep]: StepNode,
  [NODE_TYPES.requestStep]: StepNode,
};

/** Parse the step index from a node ID like "step-2". Returns null for non-step IDs. */
function parseStepIndex(nodeId: string): number | null {
  const match = nodeId.match(/^step-(\d+)$/);
  return match ? parseInt(match[1]!, 10) : null;
}

export const PipelineCanvas = ({
  nodes: atomNodes,
  edges: atomEdges,
  dispatch,
  setSelectedNodeId,
}: PipelineCanvasProps) => {
  // ── Local display state (synced from atoms, allows drag & edge selection) ──
  const [displayNodes, setDisplayNodes] = useState<Node[]>(atomNodes);
  const [displayEdges, setDisplayEdges] = useState<Edge[]>(atomEdges);
  const draggingRef = useRef(false);
  const atomNodesRef = useRef(atomNodes);
  atomNodesRef.current = atomNodes;

  useEffect(() => {
    if (!draggingRef.current) {
      setDisplayNodes(atomNodes);
    }
  }, [atomNodes]);

  useEffect(() => {
    setDisplayEdges(atomEdges);
  }, [atomEdges]);

  const stableNodeTypes = useMemo(() => nodeTypes, []);

  // ── Node changes (position + selection during drag) ──
  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setDisplayNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  // ── Edge changes (selection state for keyboard delete) ──
  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setDisplayEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // ── Drag reordering (Story 2.5 — FR5) ──
  const onNodeDragStart = useCallback(() => {
    draggingRef.current = true;
  }, []);

  const onNodeDragStop = useCallback((_event: React.MouseEvent, draggedNode: Node) => {
    draggingRef.current = false;

    const draggedIndex = parseStepIndex(draggedNode.id);
    if (draggedIndex === null) {
      // Trigger or unknown — snap back to atom positions
      setDisplayNodes(atomNodesRef.current);
      return;
    }

    // Build step positions: dragged node uses drop position, others use atom positions
    const stepPositions: { originalIndex: number; x: number }[] = [];
    for (const n of atomNodesRef.current) {
      const idx = parseStepIndex(n.id);
      if (idx !== null) {
        stepPositions.push({
          originalIndex: idx,
          x: idx === draggedIndex ? draggedNode.position.x : n.position.x,
        });
      }
    }

    // Sort by x-position to determine new sequential order
    stepPositions.sort((a, b) => a.x - b.x);
    const newOrder = stepPositions.map((sp) => sp.originalIndex);
    const isReordered = newOrder.some((origIdx, pos) => origIdx !== pos);

    if (isReordered) {
      dispatch(PipelineAction.ReorderSteps(newOrder));
    } else {
      // No reorder — snap back to atom positions
      setDisplayNodes(atomNodesRef.current);
    }
  }, []);

  // ── Unified delete handler (Story 2.5 — FR6 + FR7) ──
  const onDelete = useCallback(({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
    const deletedNodeIds = new Set(nodes.map((n) => n.id));
    const indicesToRemove = new Set<number>();

    // Collect step indices from deleted nodes
    for (const node of nodes) {
      const idx = parseStepIndex(node.id);
      if (idx !== null) {
        indicesToRemove.add(idx);
      }
    }

    // Collect step indices from explicitly deleted edges.
    // Skip edges auto-removed because a connected node was deleted.
    for (const edge of edges) {
      if (deletedNodeIds.has(edge.source) || deletedNodeIds.has(edge.target)) {
        continue;
      }
      const idx = parseStepIndex(edge.target);
      if (idx !== null) {
        indicesToRemove.add(idx);
      }
    }

    if (indicesToRemove.size === 0) {
      return;
    }

    dispatch(PipelineAction.DeleteSteps(indicesToRemove));
    setSelectedNodeId(null);
  }, []);

  // ── Palette drop handler (Story 2.2) ──
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const nodeType = event.dataTransfer.getData('application/reactflow') as NodeTypeId;
    if (!nodeType) {
      return;
    }

    const category = NODE_TYPE_CATEGORIES[nodeType];
    if (!category) {
      return;
    }

    if (category === 'trigger') {
      dispatch(PipelineAction.SetTrigger(createDefaultTrigger(nodeType)));
    } else {
      dispatch(PipelineAction.AddStep(createDefaultStep(nodeType)));
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }} data-testid="pipeline-canvas">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        nodeTypes={stableNodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onDelete={onDelete}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};
