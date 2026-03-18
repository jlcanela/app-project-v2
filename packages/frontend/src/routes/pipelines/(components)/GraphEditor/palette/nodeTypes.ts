/** Node type IDs used in xyflow nodeTypes map and dataTransfer */
export const NODE_TYPES = {
  httpTrigger: 'httpTrigger',
  eventBusTrigger: 'eventBusTrigger',
  ruleStep: 'ruleStep',
  requestStep: 'requestStep',
} as const;

export type NodeTypeId = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

/** Human-readable labels for each node type */
export const NODE_TYPE_LABELS: Record<NodeTypeId, string> = {
  httpTrigger: 'HTTP Trigger',
  eventBusTrigger: 'Event Bus Trigger',
  ruleStep: 'Rule Step',
  requestStep: 'Request Step',
};

/** Category for grouping in the palette */
export type NodeCategory = 'trigger' | 'step';

export const NODE_TYPE_CATEGORIES: Record<NodeTypeId, NodeCategory> = {
  httpTrigger: 'trigger',
  eventBusTrigger: 'trigger',
  ruleStep: 'step',
  requestStep: 'step',
};
